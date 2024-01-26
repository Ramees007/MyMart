from flask_restful import Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from application.api.utils import success_message
from flask import request, abort
from application.model import Product, Basket, BasketProduct
from application.constants import *
from application.database import db
from application.api.Product import product_fields

basket_product_fields = {
    "product": fields.Nested(product_fields),
    "qty": fields.Integer,
}

basket_fields = {
    "id": fields.Integer,
    "products": fields.List(fields.Nested(basket_product_fields)),
    "total": fields.Float,
}

ADD_ACTION = "add"
REMOVE_ACTION = "remove"

class BasketApi(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()

        user_id = get_jwt_identity()
        product_id = data.get("product_id")
        action = data.get("action", ADD_ACTION)
        basket = Basket.query.filter(Basket.user_id == user_id).first()
        if not basket:
            basket = Basket(user_id)
            db.session.add(basket)
            db.session.commit()

        try:
            product = Product.query.filter(Product.id == product_id).first()

            if not product:
                abort(STATUS_VALIDATION_ERROR, "No product found")
            elif action == "add" and product.current_stock <= 0:
                abort(STATUS_VALIDATION_ERROR, "Product out of stock, please try later")


            basket_product = BasketProduct.query.filter(
                BasketProduct.basket_id == basket.id,
                BasketProduct.product_id == product.id,
            ).first()
            if basket_product and action == ADD_ACTION:
                if product.current_stock <= basket_product.quantity:
                    abort(STATUS_VALIDATION_ERROR, "Requested quantity not in stock")
                basket_product.quantity += 1
                db.session.add(basket_product)
            elif action == ADD_ACTION:
                basket_product = BasketProduct(
                    basket_id=basket.id, product_id=product_id, quantity=1
                )
                db.session.add(basket_product)
            elif basket_product and action == REMOVE_ACTION:
                if basket_product.quantity > 0:
                    basket_product.quantity -= 1
                    if basket_product.quantity == 0:
                        db.session.delete(basket_product)
                    else:
                        db.session.add(basket_product)   
                else:
                    abort(STATUS_VALIDATION_ERROR, "Remove not permitted, quantity is zero")
            else:
                abort(STATUS_VALIDATION_ERROR, "Product not found in basket")

            db.session.commit()

            message = "Product added to basket successfully"
            if action == REMOVE_ACTION:
                message = "Product removed from basket successfully"

            return success_message(message)

        except Exception as e:
            db.session.rollback()
            abort(STATUS_SERVER_ERROR, str(e))

    @jwt_required()
    @marshal_with(basket_fields)
    def get(self):
        user_id = get_jwt_identity()
        result = (
            db.session.query(Basket, Product, BasketProduct.quantity)
            .join(BasketProduct, BasketProduct.basket_id == Basket.id)
            .join(Product, Product.id == BasketProduct.product_id)
            .filter(Basket.user_id == user_id)
            .all()
        )

        basketId = 0
        products = []
        total = 0
        for basket, product, quantity in result:
            basketId = basket.id
            total += quantity * product.price
            products.append({"product": product, "qty": quantity})
        return {"id": basketId, "products": products, "total": total}
