from application.jobs.workers import celery
from datetime import datetime, timedelta
from celery.schedules import crontab
from application.model import User, Purchase, Product, Category
from app import db
from application.constants import *
from application.jobs.mailer import send_email
from jinja2 import Environment, FileSystemLoader
import os
import flask_excel as excel
from sqlalchemy import text
from dateutil import tz


@celery.task()
def emailUserDailyJob():
    time_24_hours_ago = datetime.now() - timedelta(days=1)
    users = (
        User.query.outerjoin(
            Purchase,
            (User.id == Purchase.user_id) & (Purchase.create_date >= time_24_hours_ago),
        )
        .filter(Purchase.user_id.is_(None) & (User.role == UserRole.ROLE_USER))
        .all()
    )
    templates_path = os.path.join(os.path.dirname(__file__), "..", "..", "templates")
    template_env = Environment(loader=FileSystemLoader(templates_path))
    template = template_env.get_template("user_daily_reminder.html")
    email_content = template.render()
    for user in users:
        send_email(user.email, "We haven't seen you in a while", email_content)


@celery.task()
def emailUserMonthlyJob():
    templates_path = os.path.join(os.path.dirname(__file__), "..", "..", "templates")
    template_env = Environment(loader=FileSystemLoader(templates_path))
    template = template_env.get_template("user_monthly_report.html")
    users = User.query.filter(User.role == UserRole.ROLE_USER)
    for user in users:
        shopping_data = Purchase.query.filter(Purchase.user_id == user.id).all()
        purchases = []
        for item in shopping_data:
            formatDate = "%d/%m/%Y"
            formatTime = "%I:%M%p"
            from_zone = tz.tzutc()
            to_zone = tz.tzlocal()
            utc = item.create_date.replace(tzinfo=from_zone)
            indian = utc.astimezone(to_zone)
            date = indian.strftime(formatDate)
            time = indian.strftime(formatTime)
            purchaseDict = {"date": date, "time": time, "order_total": item.order_total}
            purchases.append(purchaseDict)
        email_content = template.render(purchases=purchases)
        send_email(user.email, "MyMart Monthly Report", email_content)


@celery.task()
def exportProducts():
    sql = text(
        "SELECT product.*, category.name as 'Category Name' FROM product JOIN category ON product.category_id = category.id;"
    )
    products = db.session.execute(sql)

    column_names = [
        "id",
        "name",
        "description",
        "price",
        "unit_qty",
        "image_url",
        "current_stock",
        "Category Name",
    ]
    csv_output = excel.make_response_from_query_sets(products, column_names, "csv")
    file_name = "products.csv"
    prods_path = os.path.join(os.path.dirname(__file__), "exported", file_name)

    with open(prods_path, "wb") as f:
        f.write(csv_output.data)
    return prods_path


@celery.on_after_finalize.connect
def setup_daily_user_mail(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute=0, hour=19),
        emailUserDailyJob.s(),
        name="Daily user non-purchase email job",
    )


@celery.on_after_finalize.connect
def setup_monthly_user_mail(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute=0, hour=11, day_of_month=1),
        emailUserMonthlyJob.s(),
        name="Monthly user report job",
    )
