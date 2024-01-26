from flask_jwt_extended import jwt_required, current_user
from flask_restful import fields, marshal_with, Resource, reqparse
from flask import request, jsonify, abort
from application.model import Category, CategoryUnApproved
from application.database import db
from application.jwt_utils import *
from application.constants import *
from application.api.utils import success_message
from application.instances import cache


category_fields = {
    "name": fields.String,
    "description": fields.String,
    "id": fields.Integer,
}


class CategoryApi(Resource):
    @store_manager_required()
    def post(self):
        json_data = request.get_json(force=True)
        name = json_data["name"]
        if not name:
            abort(STATUS_VALIDATION_ERROR, "Category requires non empty name")
        description = json_data["description"]

        if is_admin():
            category = Category(name, description)
            db.session.add(category)
            db.session.commit()
            cache.clear()
            return {
                "id": category.id,
                "message": "Category created & approved successfully",
            }, STATUS_CREATED

        else:
            category = CategoryUnApproved(
                name, description, current_user.email, CategoryApprovalReqType.CREATE
            )
            db.session.add(category)
            db.session.commit()
            return {
                "message": "Category created & waiting for admin approval"
            }, STATUS_CREATED

    @store_manager_required()
    def put(self):
        json_data = request.get_json(force=True)
        if not "id" in json_data:
            abort(STATUS_VALIDATION_ERROR, "ID required")
        id = json_data["id"]
        category = Category.query.filter(Category.id == id).first()
        if not category:
            abort(STATUS_NOT_FOUND, "Category not found")
        name = json_data["name"]
        if not name:
            abort(STATUS_VALIDATION_ERROR, "Category requires non empty name")
        description = json_data["description"]

        if is_admin():
            category.name = name
            category.description = description
            db.session.commit()
            cache.clear()
            return success_message("Category update successful")
        else:
            alphaCategory = CategoryUnApproved(
                name,
                description,
                current_user.email,
                CategoryApprovalReqType.UPDATE,
                category.id
            )
            db.session.add(alphaCategory)
            db.session.commit()
            return success_message("Category update requested & waiting for admin approval")

    @store_manager_required()
    def delete(self, id):
        category = Category.query.filter(Category.id == id).first()
        if not category:
            abort(STATUS_NOT_FOUND, "Category not found")
        if is_admin():
            db.session.delete(category)
            db.session.commit()
            return success_message("Category deleted successfully")
        else:
            alphaCategory = CategoryUnApproved(
                category.name,
                None,
                current_user.email,
                CategoryApprovalReqType.DELETE,
                category.id,
            )
            db.session.add(alphaCategory)
            db.session.commit()
            return success_message("Category delete request sent") 

category_approval_fields = {
    "name": fields.String,
    "description": fields.String,
    "id": fields.Integer,
    "category_id": fields.Integer,
    "user_email": fields.String,
    "req_type": fields.String,
}


class CategoryApprovalApi(Resource):
    @marshal_with(category_approval_fields)
    @admin_required()
    def get(self):
        return CategoryUnApproved.query.all()

    @admin_required()
    def put(self):
        json_data = request.get_json(force=True)
        if not "id" in json_data:
            abort(STATUS_VALIDATION_ERROR, "ID required")
        elif not "is_approved" in json_data:
            abort(STATUS_VALIDATION_ERROR, "Approval status required")
        id = json_data["id"]
        if not id:
            abort(STATUS_VALIDATION_ERROR, "id required")
        is_approved = json_data["is_approved"]
        categoryReq = CategoryUnApproved.query.filter(
            CategoryUnApproved.id == id
        ).first()
        if not categoryReq:
            abort(STATUS_NOT_FOUND, "Request not found")
        message = ""
        if not is_approved:
            db.session.delete(categoryReq)
            message = "Request removed"
        elif categoryReq.req_type == CategoryApprovalReqType.CREATE:
            category = Category(categoryReq.name, categoryReq.description)
            db.session.add(category)
            db.session.delete(categoryReq)
            message = "Request to create accepted"
        elif categoryReq.req_type == CategoryApprovalReqType.UPDATE:
            category = Category.query.filter(Category.id == categoryReq.category_id).first()
            category.name = categoryReq.name
            category.description = categoryReq.description
            db.session.delete(categoryReq)
            message = "Request to update accepted"
        else:
            category = Category.query.filter(Category.id == categoryReq.category_id).first()
            if not category:
                abort(STATUS_NOT_FOUND, "Category not found")
            db.session.delete(category)
            db.session.delete(categoryReq)
            message = "Request to delete accepted"
        db.session.commit()
        cache.clear()
        return success_message(message)


class CategoryListApi(Resource):
    @marshal_with(category_fields)
    @jwt_required()
    def get(self):
        return Category.query.all(), STATUS_OK
