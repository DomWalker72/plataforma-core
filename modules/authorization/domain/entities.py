from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from .roles import Role
from .user_status import UserStatus


@dataclass(frozen=True)
class UserContext:
    """
    Identity-aware user context used by RBAC.

    Decoupled from authentication transport (tokens, sessions, headers).
    """

    user_id: str
    role: Role
    status: UserStatus
    tenant_id: Optional[str] = None


@dataclass(frozen=True)
class AccessTarget:
    """Resource target expressed in modular coordinates."""

    module: str
    feature: Optional[str] = None
    action: Optional[str] = None


@dataclass(frozen=True)
class Permission:
    """Permission granting access to a module/feature/action combination."""

    module: str
    feature: Optional[str] = None
    action: Optional[str] = None


@dataclass(frozen=True)
class AccessDecision:
    """Outcome of an authorization evaluation."""

    allowed: bool
    reason: str
    role: Role
    target: AccessTarget
    user_status: UserStatus


@dataclass(frozen=True)
class AuthorizationAuditEvent:
    """Audit trail emitted for every access decision."""

    user_id: str
    tenant_id: Optional[str]
    role: Role
    status: UserStatus
    target: AccessTarget
    allowed: bool
    reason: str
    timestamp: datetime = datetime.now(timezone.utc)

