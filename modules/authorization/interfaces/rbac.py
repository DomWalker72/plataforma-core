from modules.authorization.application import AuthorizationService, AuditLogger, PermissionProvider
from modules.authorization.domain import AccessDecision, AccessTarget, UserContext


class RBAC:
    """Public-facing RBAC interface consumable by other modules."""

    def __init__(self, permissions: PermissionProvider, audit_logger: AuditLogger) -> None:
        self._service = AuthorizationService(permissions=permissions, audit_logger=audit_logger)

    def authorize(self, user: UserContext, module: str, feature: str | None, action: str | None) -> AccessDecision:
        target = AccessTarget(module=module, feature=feature, action=action)
        return self._service.authorize(user=user, target=target)

