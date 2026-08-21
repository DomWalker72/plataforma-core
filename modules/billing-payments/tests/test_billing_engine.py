from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Dict, List, Optional
import sys

import pytest

PACKAGE_ROOT = Path(__file__).resolve().parents[1] / "billing_payments"
if str(PACKAGE_ROOT.parent) not in sys.path:
    sys.path.append(str(PACKAGE_ROOT.parent))

from billing_payments.application.billing_engine import (  # noqa: E402
    AccessDecision,
    BillingEngine,
    InvoiceRepository,
    SubscriptionRepository,
)
from billing_payments.domain.entities import Invoice, Subscription  # noqa: E402
from billing_payments.domain.events import AuditEvent  # noqa: E402
from billing_payments.domain.statuses import InvoiceStatus, SubscriptionStatus  # noqa: E402


class InMemorySubscriptionRepository(SubscriptionRepository):
    def __init__(self) -> None:
        self._by_id: Dict[str, Subscription] = {}

    def add(self, subscription: Subscription) -> None:
        self._by_id[subscription.subscription_id] = subscription

    def get(self, subscription_id: str) -> Subscription:
        return self._by_id[subscription_id]

    def update(self, subscription: Subscription) -> None:
        self._by_id[subscription.subscription_id] = subscription

    def find_by_user(self, user_id: str) -> Optional[Subscription]:
        for sub in self._by_id.values():
            if sub.user_id == user_id:
                return sub
        return None

    def get_by_user_and_plan(self, user_id: str, plan_id: str) -> Optional[Subscription]:
        for sub in self._by_id.values():
            if sub.user_id == user_id and sub.plan_id == plan_id:
                return sub
        return None


class InMemoryInvoiceRepository(InvoiceRepository):
    def __init__(self) -> None:
        self._by_id: Dict[str, Invoice] = {}

    def add(self, invoice: Invoice) -> None:
        self._by_id[invoice.invoice_id] = invoice

    def get(self, invoice_id: str) -> Invoice:
        return self._by_id[invoice_id]

    def update(self, invoice: Invoice) -> None:
        self._by_id[invoice.invoice_id] = invoice


class InMemoryAuditPublisher:
    def __init__(self) -> None:
        self.events: List[AuditEvent] = []

    def publish(self, event: AuditEvent) -> None:
        self.events.append(event)


@pytest.fixture()
def engine() -> BillingEngine:
    return BillingEngine(
        subscription_repo=InMemorySubscriptionRepository(),
        invoice_repo=InMemoryInvoiceRepository(),
        audit_publisher=InMemoryAuditPublisher(),
    )


def test_create_subscription_and_invoice(engine: BillingEngine) -> None:
    start = datetime(2024, 1, 1)
    subscription = engine.create_subscription(
        user_id="user-1",
        plan_id="plan-basic",
        start_date=start,
        cycle_duration=timedelta(days=30),
    )

    assert subscription.status == SubscriptionStatus.PENDING_PAYMENT

    invoice = engine.create_invoice(subscription.subscription_id, amount=Decimal("29.90"))
    assert invoice.status == InvoiceStatus.AWAITING_PAYMENT

    fetched_sub = engine.subscription_repo.get(subscription.subscription_id)
    assert fetched_sub.status == SubscriptionStatus.PENDING_PAYMENT


def test_invoice_paid_moves_subscription_to_active(engine: BillingEngine) -> None:
    start = datetime(2024, 1, 1)
    subscription = engine.create_subscription(
        user_id="user-2",
        plan_id="plan-pro",
        start_date=start,
        cycle_duration=timedelta(days=30),
    )
    invoice = engine.create_invoice(subscription.subscription_id, amount=Decimal("49.00"))

    engine.update_invoice_status(invoice.invoice_id, InvoiceStatus.PAID)

    updated_sub = engine.subscription_repo.get(subscription.subscription_id)
    assert updated_sub.status == SubscriptionStatus.ACTIVE
    assert updated_sub.current_cycle_start == invoice.billing_period.end
    assert updated_sub.grace_period_end is None


def test_failed_invoice_uses_grace_period(engine: BillingEngine) -> None:
    start = datetime(2024, 1, 1)
    grace_end = start + timedelta(days=35)
    subscription = engine.create_subscription(
        user_id="user-3",
        plan_id="plan-basic",
        start_date=start,
        cycle_duration=timedelta(days=30),
        grace_period_end=grace_end,
    )
    invoice = engine.create_invoice(subscription.subscription_id, amount=Decimal("29.90"))

    engine.update_invoice_status(invoice.invoice_id, InvoiceStatus.FAILED)

    updated_sub = engine.subscription_repo.get(subscription.subscription_id)
    assert updated_sub.status == SubscriptionStatus.IN_GRACE_PERIOD


def test_access_decision_respects_statuses(engine: BillingEngine) -> None:
    now = datetime(2024, 2, 1)
    subscription = engine.create_subscription(
        user_id="user-4",
        plan_id="plan-basic",
        start_date=now - timedelta(days=60),
        cycle_duration=timedelta(days=30),
    )
    decision = engine.access_decision(subscription.user_id, now)
    assert decision == AccessDecision(subscription.subscription_id, subscription.plan_id, True, "awaiting_payment")

    subscription.status = SubscriptionStatus.SUSPENDED
    engine.subscription_repo.update(subscription)
    decision = engine.access_decision(subscription.user_id, now)
    assert decision.allowed is False
    assert decision.reason == SubscriptionStatus.SUSPENDED.value


def test_evaluate_subscription_cycle_creates_invoice_and_updates_state(engine: BillingEngine) -> None:
    start = datetime(2024, 1, 1)
    subscription = engine.create_subscription(
        user_id="user-5",
        plan_id="plan-basic",
        start_date=start,
        cycle_duration=timedelta(days=30),
    )

    invoice = engine.evaluate_subscription_cycle(subscription.subscription_id, now=start + timedelta(days=31), amount=Decimal("10.00"))
    assert invoice is not None
    assert invoice.status == InvoiceStatus.AWAITING_PAYMENT

    sub_after = engine.subscription_repo.get(subscription.subscription_id)
    assert sub_after.status == SubscriptionStatus.PENDING_PAYMENT
    assert sub_after.current_cycle_start == start
