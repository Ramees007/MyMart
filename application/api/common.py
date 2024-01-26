from application.api.Category import CategoryApi, CategoryListApi, CategoryApprovalApi
from application.model import User
from application.api.Product import ProductApi, ProductListApi, ProductSearchApi
from application.api.Basket import BasketApi
from application.api.Purchase import PurchaseApi, OrdersApi
from application.api.User import InactiveUsers, UserRegister, ManagerRegister, Login


def init_api(api):
    api.add_resource(CategoryApi, "/category", endpoint="create_update")
    api.add_resource(CategoryApi, "/category/<id>", endpoint="delete")
    api.add_resource(CategoryListApi, "/categories")
    api.add_resource(CategoryApprovalApi, "/categoryapproval")
    api.add_resource(ProductApi, "/product", endpoint="product_update")
    api.add_resource(ProductApi, "/product/<id>", endpoint="product_delete")
    api.add_resource(ProductListApi, "/category_products")
    api.add_resource(BasketApi, "/basket")
    api.add_resource(PurchaseApi, "/purchase")
    api.add_resource(OrdersApi, "/orders")
    api.add_resource(InactiveUsers, "/user-activation")
    api.add_resource(UserRegister, "/user/register")
    api.add_resource(ManagerRegister, "/storemanager/register")
    api.add_resource(Login, "/login")
    api.add_resource(ProductSearchApi, "/product-search")


def init_jwt(jwt):
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()
