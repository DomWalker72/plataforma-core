from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Literal

from .statuses import InvoiceStatus, SubscriptionStatus

AuditEventType = Literal[
    "billing.subscription.created",
    "billing.subscription.status_changed",
    "billing.invoice.created",
    "billing.invoice.status_changed",
]


def _timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"


@dataclass
class AuditEvent:
    event_type: AuditEventType
    payload: Dict[str, Any]
    occurred_at: str = _timestamp()

    def as_record(self) -> Dict[str, Any]:
        return {
            "event_type": self.event_type,
            "payload": self.payload,
            "occurred_at": self.occurred_at,
        }


@dataclass
class SubscriptionCreated(AuditEvent):
    @classmethod
    def build(cls, subscription_id: str, user_id: str, plan_id: str, status: SubscriptionStatus) -> "SubscriptionCreated":
        return cls(
            event_type="billing.subscription.created",
            payload={
                "subscription_id": subscription_id,
                "user_id": user_id,
                "plan_id": plan_id,
                "status": status.value,
            },
        )


@dataclass
class SubscriptionStatusChanged(AuditEvent):
    @classmethod
    def build(
        cls, subscription_id: str, user_id: str, plan_id: str, old_status: SubscriptionStatus, new_status: SubscriptionStatus
    ) -> "SubscriptionStatusChanged":
        return cls(
            event_type="billing.subscription.status_changed",
            payload={
                "subscription_id": subscription_id,
                "user_id": user_id,
                "plan_id": plan_id,
                "old_status": old_status.value,
                "new_status": new_status.value,
            },
        )


@dataclass
class InvoiceCreated(AuditEvent):
    @classmethod
    def build(
        cls, invoice_id: str, user_id: str, plan_id: str, period_start: str, period_end: str, amount: str
    ) -> "InvoiceCreated":
        return cls(
            event_type="billing.invoice.created",
            payload={
                "invoice_id": invoice_id,
                "user_id": user_id,
                "plan_id": plan_id,
                "billing_period": {"start": period_start, "end": period_end},
                "amount": amount,
            },
        )


@dataclass
class InvoiceStatusChanged(AuditEvent):
    @classmethod
    def build(
        cls, invoice_id: str, user_id: str, plan_id: str, old_status: InvoiceStatus, new_status: InvoiceStatus
    ) -> "InvoiceStatusChanged":
        return cls(
            event_type="billing.invoice.status_changed",
            payload={
                "invoice_id": invoice_id,
                "user_id": user_id,
                "plan_id": plan_id,
                "old_status": old_status.value,
                "new_status": new_status.value,
            },
        )
