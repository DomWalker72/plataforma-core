from enum import Enum


class UserStatus(str, Enum):
    """Lifecycle status of a user coming from the identity module."""

    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    INACTIVE = "INACTIVE"

