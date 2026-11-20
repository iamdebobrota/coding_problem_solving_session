import enum


class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    OWNER = "OWNER"
    DELIVERY = "DELIVERY"


class OrderStatus(str, enum.Enum):
    PLACED = "PLACED"
    ACCEPTED = "ACCEPTED"
    PREPARING = "PREPARING"
    READY = "READY"
    ASSIGNED = "ASSIGNED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, enum.Enum):
    MOCK_PAID = "mock_paid"
    REFUND_PENDING = "refund_pending"
    REFUNDED = "refunded"


class ReturnStatus(str, enum.Enum):
    NONE = "none"
    REQUESTED = "requested"
    APPROVED = "approved"
    REJECTED = "rejected"


class LedgerEntryType(str, enum.Enum):
    MOCK_CHARGE = "mock_charge"
    REFUND_CREDIT = "refund_credit"
