from flask_restful import Resource, fields, marshal_with
from application.jwt_utils import admin_required
from application.model import User
from application.api.utils import success_message
from flask import request, abort, jsonify
from application.constants import *
from application.validation_util import *
from application.database import db
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "role": fields.String,
    "create_date": fields.DateTime,
}


class InactiveUsers(Resource):
    @admin_required()
    @marshal_with(user_fields)
    def get(self):
        return User.query.filter(User.is_active == False).all()

    @admin_required()
    def post(self):
        data = request.get_json()
        email = data.get("email")
        approval_status = data.get("approval_status", False)
        user = User.query.filter(User.email == email).first()
        if not user:
            return abort(STATUS_VALIDATION_ERROR, "User not registered")
        if not approval_status:
            db.session.delete(user)
            message = "User removed successfully"
        else:
            user.is_active = True
            db.session.add(user)
            message = "User activated successfully"
        db.session.commit()
        return success_message(message)


class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter(User.email == email).first()
        if not user:
            abort(STATUS_VALIDATION_ERROR, "Invalid credentials")
        if not user.is_active:
            abort(
                STATUS_VALIDATION_ERROR,
                "This account is not enabled yet, contact admin",
            )

        if check_password_hash(user.password, password):
            access_token = create_access_token(
                identity=user.id,
                additional_claims={"role": user.role, "email": user.email},
            )
            return {"access_token": access_token}, STATUS_OK
        else:
            abort(STATUS_VALIDATION_ERROR, "Invalid credentials")


class UserRegister(Resource):
    def post(self):
        try:
            return register(UserRole.ROLE_USER)
        except Exception as e:
            abort(STATUS_VALIDATION_ERROR, str(e))


class ManagerRegister(Resource):
    def post(self):
        try:
            return register(UserRole.ROLE_STORE_MANAGER)
        except Exception as e:
            abort(STATUS_VALIDATION_ERROR, str(e))


def register(role):
    data = request.get_json()
    email = data.get("email")
    if not is_email_valid(email):
        raise Exception("Invalid email, please check")

    existing_user = User.query.filter(User.email == email).first()
    if existing_user:
        raise Exception("Email ID already registered")

    raw_pw = data.get("password")
    if not is_password_valid(raw_pw):
        raise Exception(
            "Password must contain atleast eight characters, one letter and one number"
        )

    password = generate_password_hash(raw_pw)

    user = User(email=email, password=password, role=role)
    db.session.add(user)
    db.session.commit()

    if not user.is_active:
        return {
            "message": "User registered and waiting for admin approval"
        }, STATUS_CREATED

    access_token = create_access_token(
        identity=user.id, additional_claims={"role": user.role, "email": user.email}
    )

    return {"access_token": access_token}, STATUS_CREATED
