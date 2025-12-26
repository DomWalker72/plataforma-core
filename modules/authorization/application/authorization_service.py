from modules.authorization.application.contracts import AuditLogger, PermissionProvider
from modules.authorization.domain import (
    AccessDecision,
    AccessTarget,
    AuthorizationAuditEvent,
    Permission,
    Role,
    UserContext,
    UserStatus,
)


class AuthorizationService:
    """
    Core RBAC service for the platform.

    - Decoupled from authentication: only consumes user identity and role context.
    - Considers internal user status for every decision.
    - Emits audit events for every grant or denial.
    """

    def __init__(self, permissions: PermissionProvider, audit_logger: AuditLogger) -> None:
        self._permissions = permissions
        self._audit_logger = audit_logger

    def authorize(self, user: UserContext, target: AccessTarget) -> AccessDecision:
        """Evaluate access based on role, status, and target coordinates."""
        decision: AccessDecision

        if user.status == UserStatus.SUSPENDED or user.role == Role.SUSPENDED:
            decision = AccessDecision(
                allowed=False,
                reason="User suspended",
                role=user.role,
                target=target,
                user_status=user.status,
            )
            self._emit_audit(user, decision)
            return decision

        if user.role == Role.ADMIN:
            decision = AccessDecision(
                allowed=True,
                reason="Admin bypass",
                role=user.role,
                target=target,
                user_status=user.status,
            )
            self._emit_audit(user, decision)
            return decision

        permissions = self._permissions.get_permissions_for_role(user.role)
        allowed = self._is_allowed(target, permissions)
        reason = "Permission granted" if allowed else "Permission missing"

        decision = AccessDecision(
            allowed=allowed,
            reason=reason,
            role=user.role,
            target=target,
            user_status=user.status,
        )
        self._emit_audit(user, decision)
        return decision

    def _emit_audit(self, user: UserContext, decision: AccessDecision) -> None:
        event = AuthorizationAuditEvent(
            user_id=user.user_id,
            tenant_id=user.tenant_id,
            role=user.role,
            status=user.status,
            target=decision.target,
            allowed=decision.allowed,
            reason=decision.reason,
        )
        self._audit_logger.log_authorization_event(event)

    @staticmethod
    def _is_allowed(target: AccessTarget, permissions: tuple[Permission, ...] | list[Permission]) -> bool:
        for permission in permissions:
            if AuthorizationService._matches(permission, target):
                return True
        return False

    @staticmethod
    def _matches(permission: Permission, target: AccessTarget) -> bool:
        """Wildcard-friendly matching between permission and target."""
        if permission.module != target.module and permission.module != "*":
            return False

        if permission.feature not in (None, "*") and permission.feature != target.feature:
            return False

        if permission.action not in (None, "*") and permission.action != target.action:
            return False

        return True

