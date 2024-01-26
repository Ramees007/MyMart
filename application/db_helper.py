from .database import db
from .model import User
from flask_bcrypt import generate_password_hash
from .constants import *

def create_users_if_required():
    create_user('admin@storeapp.com', 'Admin@123', UserRole.ROLE_ADMIN)


def create_user(email, password, role):
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return

    password = generate_password_hash(password)
    user = User(email=email, password=password, role=role)
    db.session.add(user)
    db.session.commit()

