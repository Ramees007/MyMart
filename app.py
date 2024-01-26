import os
from flask import Flask
from application.config import LocalDevConfig
from application.database import db
from flask_jwt_extended import JWTManager
from flask_restful import Api
from application.api.common import init_api, init_jwt
from application.db_helper import create_users_if_required
from application.jobs import workers
import flask_excel as excel
from application.instances import cache



app = None


def create_app():
    app = Flask(__name__, template_folder="templates")
    if os.getenv("ENV", "development") == "production":
        raise Exception("Prod not setup")
    else:
        app.config.from_object(LocalDevConfig)
    db.init_app(app)
    app.app_context().push()
    return app


app = create_app()
jwt = JWTManager(app)
api = Api(app)
init_api(api)
init_jwt(jwt)
celery = workers.celery
celery.conf.update(
    broker_url=app.config["CELERY_BROKER_URL"],
    result_backend=app.config["CELERY_RESULT_BACKEND"],
    timezone=app.config["CELERY_TIMEZONE"],
)
celery.Task = workers.ContextTask
excel.init_excel(app)

cache.init_app(app)


from application.controllers import *

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        create_users_if_required()
    app.run(host="0.0.0.0", port=8080)

