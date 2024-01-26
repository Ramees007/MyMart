import enum


STATUS_VALIDATION_ERROR = 403
STATUS_OK = 200
STATUS_CREATED = 201
STATUS_UNAUTHORIZED = 401
STATUS_NOT_FOUND = 404
STATUS_SERVER_ERROR = 500

class CategoryApprovalReqType(enum.Enum):
    CREATE = 1
    UPDATE = 2
    DELETE = 3

class UserRole(str, enum.Enum):
    ROLE_USER = "user"
    ROLE_STORE_MANAGER = "store_manager"
    ROLE_ADMIN = "admin"


INVALID_PRICE = -1.0