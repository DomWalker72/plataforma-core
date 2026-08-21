from enum import Enum


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PENDING_PAYMENT = "pending_payment"
    IN_GRACE_PERIOD = "in_grace_period"
    SUSPENDED = "suspended"
    CANCELED = "canceled"
    EXPIRED = "expired"


class InvoiceStatus(str, Enum):
    CREATED = "created"
    AWAITING_PAYMENT = "awaiting_payment"
    PAID = "paid"
    FAILED = "failed"
    EXPIRED = "expired"
    CANCELED = "canceled"
