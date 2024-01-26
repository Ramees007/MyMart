from flask_jwt_extended import get_jwt, verify_jwt_in_request
from flask import abort
from functools import wraps
from application.constants import *


def store_manager_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["role"] != UserRole.ROLE_USER:
                return fn(*args, **kwargs)
            else:
                return abort(403, "Un authorized user")

        return decorator

    return wrapper


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["role"] == UserRole.ROLE_ADMIN:
                return fn(*args, **kwargs)
            else:
                return abort(403, "Un authorized user")

        return decorator

    return wrapper


def is_admin():
    verify_jwt_in_request()
    claims = get_jwt()
    return claims["role"] == UserRole.ROLE_ADMIN
