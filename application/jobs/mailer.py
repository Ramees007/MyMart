from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app


def send_email(to, subject, content_body):
    msg = MIMEMultipart()
    msg["To"] = to
    msg["Subject"] = subject
    msg["From"] = current_app.config["SENDER_EMAIL"]
    msg.attach(MIMEText(content_body, "html"))
    client = SMTP(
        host=current_app.config["SMTP_SERVER"], port=current_app.config["SMTP_PORT"]
    )
    client.send_message(msg=msg)
    client.quit()
