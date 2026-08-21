from enum import Enum


class Role(str, Enum):
    """Core platform roles used for RBAC decisions."""

    ADMIN = "ADMIN"
    USER = "USER"
    PREMIUM = "PREMIUM"
    SUSPENDED = "SUSPENDED"

