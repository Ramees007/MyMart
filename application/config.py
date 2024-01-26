from datetime import timedelta


class Config:
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = None
    JWT_SECRET_KEY = None
    JWT_ACCESS_TOKEN_EXPIRES = None
    CELERY_BROKER_URL = None
    CELERY_RESULT_BACKEND = None
    CELERY_TIMEZONE = None
    SMTP_SERVER = None
    SMTP_PORT = None
    SENDER_EMAIL = None
    SENDER_PASSWORD = None
    CACHE_TYPE = None
    CACHE_REDIS_HOST = None
    CACHE_REDIS_PORT = None
    CACHE_REDIS_DB = None


class LocalDevConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///Shopper.sqlite3"
    SECRET_KEY = "test_secret"
    JWT_SECRET_KEY = "jwt_secret_test_key"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
    CELERY_BROKER_URL = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
    CELERY_TIMEZONE = "Asia/Kolkata"
    SMTP_SERVER = "localhost"
    SMTP_PORT = 1025
    SENDER_EMAIL = "mymart@yopmail.io"
    SENDER_PASSWORD = ""
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3
