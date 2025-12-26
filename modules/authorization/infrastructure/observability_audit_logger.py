from modules.authorization.application import AuditLogger
from modules.authorization.domain import AuthorizationAuditEvent


class ObservabilityAuditLogger(AuditLogger):
    """
    Adapter that forwards audit events to the observability/logging module.

    Concrete wiring should inject the logging client; kept abstract to avoid
    modifying logging or metrics internals.
    """

    def __init__(self, logger) -> None:
        self._logger = logger

    def log_authorization_event(self, event: AuthorizationAuditEvent) -> None:
        # Expect the injected logger to handle serialization and delivery.
        self._logger.info(
            "authorization.decision",
            extra={
                "user_id": event.user_id,
                "tenant_id": event.tenant_id,
                "role": event.role.value,
                "status": event.status.value,
                "target": {
                    "module": event.target.module,
                    "feature": event.target.feature,
                    "action": event.target.action,
                },
                "allowed": event.allowed,
                "reason": event.reason,
                "timestamp": event.timestamp.isoformat(),
            },
        )

