from flask_restful import Resource, fields, marshal_with
from flask import request, abort
from application.jwt_utils import store_manager_required
from application.constants import *
from application.model import Product, Category
from application.database import db
from flask_jwt_extended import jwt_required, current_user
from application.instances import cache
from sqlalchemy import desc

product_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "price": fields.Float,
    "image_url": fields.String,
    "description": fields.String,
    "unit_qty": fields.String,
    "category_id": fields.Integer,
    "current_stock": fields.Integer,
}

category_fields = {
    "name": fields.String,
    "id": fields.Integer,
    "products": fields.List(fields.Nested(product_fields)),
}


class ProductApi(Resource):
    @store_manager_required()
    def post(self):
        json_data = request.get_json(force=True)
        name = json_data.get("name", "")
        description = json_data.get("description", "")
        price = json_data.get("price", INVALID_PRICE)
        unit_qty = json_data.get("unit_qty", "")
        image_url = json_data.get("image_url", "")
        category_id = json_data.get("category_id", -1)
        current_stock = json_data.get("current_stock", -1)

        if not name.strip():
            abort(STATUS_VALIDATION_ERROR, "name required")
        if not float(price) > INVALID_PRICE:
            abort(STATUS_VALIDATION_ERROR, "Price required")
        if not unit_qty.strip():
            abort(STATUS_VALIDATION_ERROR, "Unit required")
        if category_id == -1:
            abort(STATUS_VALIDATION_ERROR, "Category required")
        if current_stock == -1:
            abort(STATUS_VALIDATION_ERROR, "Initial stock required")

        product = Product(
            name, description, price, unit_qty, image_url, category_id, current_stock
        )
        db.session.add(product)
        db.session.commit()
        cache.clear()
        return {"id": product.id}, STATUS_CREATED

    @store_manager_required()
    def put(self):
        json_data = request.get_json(force=True)
        name = json_data.get("name", "")
        description = json_data.get("description", "")
        price = json_data.get("price", INVALID_PRICE)
        unit_qty = json_data.get("unit_qty", "")
        image_url = json_data.get("image_url", "")
        category_id = json_data.get("category_id", -1)
        current_stock = json_data.get("current_stock", -1)
        id = json_data.get("id", -1)
        product = Product.query.filter(Product.id == id).first()
        if not product:
            abort(STATUS_VALIDATION_ERROR, "No such product found")
        if not name.strip():
            abort(STATUS_VALIDATION_ERROR, "name required")
        if not int(price) > INVALID_PRICE:
            abort(STATUS_VALIDATION_ERROR, "Price required")
        if not unit_qty.strip():
            abort(STATUS_VALIDATION_ERROR, "Unit required")
        if category_id == -1:
            abort(STATUS_VALIDATION_ERROR, "Category required")
        if current_stock == -1:
            abort(STATUS_VALIDATION_ERROR, "Initial stock required")

        product.name = name
        product.description = description
        product.price = price
        product.unit_qty = unit_qty
        product.image_url = image_url
        product.category_id = category_id
        product.current_stock = current_stock
        product.id = id
        db.session.add(product)
        db.session.commit()
        cache.clear()
        return {"message": "Product updated successfully"}, STATUS_OK

    @store_manager_required()
    def delete(self, id):
        product = Product.query.filter(Product.id == id).first()
        if not product:
            abort(STATUS_VALIDATION_ERROR, "No such product found")

        Product.query.filter(Product.id == id).delete()
        db.session.commit()
        cache.clear()
        return {"message": "Product deleted successfully"}, STATUS_OK

    @jwt_required()
    @marshal_with(product_fields)
    def get(self, id):
        product = Product.query.filter(Product.id == id).first()
        if not product:
            abort(STATUS_NOT_FOUND, "No such product found")
        return product


class ProductListApi(Resource):
    @cache.cached(timeout=60 * 60 * 24)
    @marshal_with(category_fields)
    @jwt_required()
    def get(self):
        return (
            Category.query.join(Product, Category.id == Product.category_id)
            .order_by(desc(Product.create_date))
            .all(),
            STATUS_OK,
        )


class ProductSearchApi(Resource):
    @jwt_required()
    @marshal_with(product_fields)
    def get(self):
        args = request.args
        nameQ = args.get("name", "")
        category = args.get("category", "")
        price = args.get("price", "")
        query = Product.query.filter(Product.name.contains(nameQ))
        if category and int(category) != -1:
            query = query.filter(Product.category_id == int(category))
        if price:
            prices = price.split(":")
            if len(prices) > 1:
                start = float(prices[0])
                query = query.filter(Product.price >= start)
                end = float(prices[1])
                if end != -1:
                    query = query.filter(Product.price <= end)
        return query.all()
