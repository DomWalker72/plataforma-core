from typing import Protocol, Sequence

from modules.authorization.domain import AuthorizationAuditEvent, Permission, Role


class PermissionProvider(Protocol):
    """Provides permissions for a given role."""

    def get_permissions_for_role(self, role: Role) -> Sequence[Permission]:
        ...


class AuditLogger(Protocol):
    """Sends authorization audit events to the observability module."""

    def log_authorization_event(self, event: AuthorizationAuditEvent) -> None:
        ...

