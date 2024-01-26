from application.database import db
from application.constants import *
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import datetime
from sqlalchemy import desc, text


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role = db.Column("role", db.Enum(UserRole), nullable=False)
    create_date = db.Column("create_date", db.DateTime, default=func.now())
    last_modified = db.Column("last_modified", db.DateTime, onupdate=func.now())
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    def __init__(self, email, password, role):
        self.email = email
        self.password = password
        self.role = role
        if role == UserRole.ROLE_STORE_MANAGER:
            self.is_active = False


class Category(db.Model):
    __tablename__ = "category"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column("name", db.String, nullable=False)
    description = db.Column("description", db.String)
    create_date = db.Column("create_date", db.DateTime, default=func.now())
    last_modified = db.Column("last_modified", db.DateTime, onupdate=func.now())

    products = relationship(
        "Product",
        backref="category",
        lazy=True,
        order_by=desc(text("Product.create_date")),
        cascade="all,delete",
    )

    def __init__(self, name, description):
        self.name = name
        self.description = description


class CategoryUnApproved(db.Model):
    __tablename__ = "category_unapproved"
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column("category_id", db.Integer, nullable=True)
    name = db.Column("name", db.String, nullable=False)
    description = db.Column("description", db.String)
    user_email = db.Column("user_email", db.String, nullable=False)
    req_type = db.Column("req_type", db.Enum(CategoryApprovalReqType), nullable=False)
    create_date = db.Column("create_date", db.DateTime, default=func.now())
    last_modified = db.Column("last_modified", db.DateTime, onupdate=func.now())

    def __init__(self, name, description, user_email, req_type, category_id=None):
        self.name = name
        self.category_id = category_id
        self.description = description
        self.user_email = user_email
        self.req_type = req_type


class BasketProduct(db.Model):
    basket_id = db.Column(
        "basket_id", db.Integer, db.ForeignKey("basket.id"), primary_key=True
    )
    product_id = db.Column(
        "product_id", db.Integer, db.ForeignKey("product.id"), primary_key=True
    )
    quantity = db.Column("quantity", db.Integer, default=1)


class PurchaseProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column("purchase_id", db.Integer, db.ForeignKey("purchase.id"))
    product_id = db.Column("product_id", db.Integer, db.ForeignKey("product.id"))
    quantity = db.Column("quantity", db.Integer, default=1)


class Product(db.Model):
    __tablename__ = "product"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column("name", db.String, nullable=False)
    description = db.Column("description", db.String, nullable=True)
    create_date = db.Column("create_date", db.DateTime, default=func.now())
    last_modified = db.Column("last_modified", db.DateTime, onupdate=func.now())
    price = db.Column("price", db.Numeric(10, 2), nullable=False)
    unit_qty = db.Column("unit_qty", db.String, nullable=False)
    image_url = db.Column("image_url", db.String, nullable=True)
    current_stock = db.Column("current_stock", db.Integer, nullable=False)
    category_id = db.Column(
        "category_id", db.Integer, db.ForeignKey("category.id"), nullable=True
    )
    baskets = db.relationship(
        "Basket", secondary=BasketProduct.__table__, back_populates="products"
    )

    purchases = db.relationship(
        "Purchase", secondary=PurchaseProduct.__table__, back_populates="products"
    )

    def __init__(
        self, name, description, price, unit_qty, image_url, category_id, current_stock
    ):
        self.name = name
        self.price = price
        self.description = description
        self.unit_qty = unit_qty
        self.image_url = image_url
        self.category_id = category_id
        self.current_stock = current_stock


class Basket(db.Model):
    __tablename__ = "basket"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column("user_id", db.Integer, db.ForeignKey("user.id"), unique=True)
    create_date = db.Column("create_date", db.DateTime, default=func.now())
    last_modified = db.Column("last_modified", db.DateTime, onupdate=func.now())
    products = db.relationship(
        "Product", secondary=BasketProduct.__table__, back_populates="baskets"
    )

    def __init__(self, user_id):
        self.user_id = user_id


class Purchase(db.Model):
    __tablename__ = "purchase"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column("user_id", db.Integer, db.ForeignKey("user.id"))
    create_date = db.Column("create_date", db.DateTime, default=func.now())
    last_modified = db.Column("last_modified", db.DateTime, onupdate=func.now())
    order_total = db.Column("order_total", db.Numeric(10, 2))
    products = db.relationship(
        "Product", secondary=PurchaseProduct.__table__, back_populates="purchases"
    )

    def __init__(self, user_id):
        self.user_id = user_id
