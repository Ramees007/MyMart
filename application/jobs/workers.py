from celery import Celery
from flask import current_app as app

celery = Celery("MyMart Jobs")


class ContextTask(celery.Task):
    def call(self, *args, **kwargs):
        with app.app_context():
            return self.run(*args, ** kwargs)