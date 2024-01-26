from flask_restful import Resource, fields, marshal_with
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, abort
from application.constants import *
from application.database import db
from application.model import Product, Basket, BasketProduct, Purchase, PurchaseProduct
from application.api.utils import success_message
from decimal import *


class PurchaseApi(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        result = (
            db.session.query(Basket, Product, BasketProduct.quantity)
            .join(BasketProduct, BasketProduct.basket_id == Basket.id)
            .join(Product, Product.id == BasketProduct.product_id)
            .filter(Basket.user_id == user_id)
            .all()
        )

        if not result:
            abort(STATUS_VALIDATION_ERROR, "User does not have items in basket")

        try:
            purchase = Purchase(user_id)
            db.session.add(purchase)
            db.session.flush()
            orderTotal = Decimal(0.0)
            for basket, product, quantity in result:
                if product.current_stock < quantity:
                    abort(
                        STATUS_VALIDATION_ERROR,
                        "Some product does not have enough stock, please adjust your basket",
                    )
                else:
                    orderTotal += product.price * quantity
                    purchaseProduct = PurchaseProduct(
                        purchase_id=purchase.id,
                        product_id=product.id,
                        quantity=quantity,
                    )
                    db.session.add(purchaseProduct)
                    product.current_stock -= quantity
                    db.session.add(product)
            purchase.order_total = orderTotal
            db.session.add(purchase)
            BasketProduct.query.filter(BasketProduct.basket_id == basket.id).delete()

            db.session.commit()
            return success_message("Purchase successfull")

        except Exception as e:
            db.session.rollback()
            abort(STATUS_SERVER_ERROR, str(e))


orders_fields = {
    "id": fields.Integer,
    "create_date": fields.DateTime,
    "order_total": fields.Float,
}


class OrdersApi(Resource):
    @jwt_required()
    @marshal_with(orders_fields)
    def get(self):
        user_id = get_jwt_identity()
        return Purchase.query.filter(Purchase.user_id == user_id).all()
