from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Protocol
from uuid import uuid4

from ..domain.entities import BillingPeriod, Invoice, Subscription
from ..domain.events import InvoiceCreated, InvoiceStatusChanged, SubscriptionCreated, SubscriptionStatusChanged
from ..domain.statuses import InvoiceStatus, SubscriptionStatus


class AuditPublisher(Protocol):
    def publish(self, event) -> None:  # pragma: no cover - runtime enforcement only
        ...


class SubscriptionRepository(Protocol):
    def add(self, subscription: Subscription) -> None:
        ...

    def get(self, subscription_id: str) -> Subscription:
        ...

    def update(self, subscription: Subscription) -> None:
        ...

    def find_by_user(self, user_id: str) -> Optional[Subscription]:
        ...

    def get_by_user_and_plan(self, user_id: str, plan_id: str) -> Optional[Subscription]:
        ...


class InvoiceRepository(Protocol):
    def add(self, invoice: Invoice) -> None:
        ...

    def get(self, invoice_id: str) -> Invoice:
        ...

    def update(self, invoice: Invoice) -> None:
        ...


@dataclass
class AccessDecision:
    subscription_id: Optional[str]
    plan_id: Optional[str]
    allowed: bool
    reason: str


class BillingEngine:
    """Billing state machine that manages subscriptions and invoices without payment coupling."""

    def __init__(
        self,
        subscription_repo: SubscriptionRepository,
        invoice_repo: InvoiceRepository,
        audit_publisher: AuditPublisher,
    ) -> None:
        self.subscription_repo = subscription_repo
        self.invoice_repo = invoice_repo
        self.audit_publisher = audit_publisher

    def create_subscription(
        self,
        user_id: str,
        plan_id: str,
        start_date: datetime,
        cycle_duration: timedelta,
        initial_status: SubscriptionStatus = SubscriptionStatus.PENDING_PAYMENT,
        grace_period_end: Optional[datetime] = None,
    ) -> Subscription:
        subscription_id = str(uuid4())
        subscription = Subscription(
            subscription_id=subscription_id,
            user_id=user_id,
            plan_id=plan_id,
            status=initial_status,
            start_date=start_date,
            current_cycle_start=start_date,
            current_cycle_end=start_date + cycle_duration,
            grace_period_end=grace_period_end,
            cycle_duration=cycle_duration,
        )
        self.subscription_repo.add(subscription)
        self.audit_publisher.publish(SubscriptionCreated.build(subscription_id, user_id, plan_id, initial_status))
        return subscription

    def _transition_subscription(self, subscription: Subscription, new_status: SubscriptionStatus) -> None:
        if subscription.status == new_status:
            return
        allowed_transitions = {
            SubscriptionStatus.PENDING_PAYMENT: {
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.IN_GRACE_PERIOD,
                SubscriptionStatus.SUSPENDED,
                SubscriptionStatus.CANCELED,
                SubscriptionStatus.EXPIRED,
            },
            SubscriptionStatus.ACTIVE: {
                SubscriptionStatus.PENDING_PAYMENT,
                SubscriptionStatus.IN_GRACE_PERIOD,
                SubscriptionStatus.SUSPENDED,
                SubscriptionStatus.CANCELED,
                SubscriptionStatus.EXPIRED,
            },
            SubscriptionStatus.IN_GRACE_PERIOD: {
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.SUSPENDED,
                SubscriptionStatus.CANCELED,
                SubscriptionStatus.EXPIRED,
            },
            SubscriptionStatus.SUSPENDED: {
                SubscriptionStatus.PENDING_PAYMENT,
                SubscriptionStatus.CANCELED,
                SubscriptionStatus.EXPIRED,
            },
            SubscriptionStatus.CANCELED: set(),
            SubscriptionStatus.EXPIRED: set(),
        }
        if new_status not in allowed_transitions[subscription.status]:
            raise ValueError(f"Invalid subscription transition from {subscription.status} to {new_status}")
        old_status = subscription.status
        subscription.status = new_status
        self.subscription_repo.update(subscription)
        self.audit_publisher.publish(
            SubscriptionStatusChanged.build(subscription.subscription_id, subscription.user_id, subscription.plan_id, old_status, new_status)
        )

    def grant_grace_period(self, subscription_id: str, grace_period_end: datetime) -> Subscription:
        subscription = self.subscription_repo.get(subscription_id)
        subscription.grant_grace(grace_period_end)
        self._transition_subscription(subscription, SubscriptionStatus.IN_GRACE_PERIOD)
        return subscription

    def create_invoice(self, subscription_id: str, amount: Decimal) -> Invoice:
        subscription = self.subscription_repo.get(subscription_id)
        period = BillingPeriod(start=subscription.current_cycle_start, end=subscription.current_cycle_end)
        invoice_id = str(uuid4())
        invoice = Invoice(
            invoice_id=invoice_id,
            user_id=subscription.user_id,
            plan_id=subscription.plan_id,
            billing_period=period,
            amount=amount,
            status=InvoiceStatus.AWAITING_PAYMENT,
        )
        self.invoice_repo.add(invoice)
        self.audit_publisher.publish(
            InvoiceCreated.build(
                invoice_id=invoice_id,
                user_id=subscription.user_id,
                plan_id=subscription.plan_id,
                period_start=period.start.isoformat(),
                period_end=period.end.isoformat(),
                amount=str(amount),
            )
        )
        self._transition_subscription(subscription, SubscriptionStatus.PENDING_PAYMENT)
        return invoice

    def update_invoice_status(self, invoice_id: str, new_status: InvoiceStatus) -> Invoice:
        invoice = self.invoice_repo.get(invoice_id)
        old_status = invoice.status
        if new_status == old_status:
            return invoice
        invoice.transition_to(new_status)
        self.invoice_repo.update(invoice)
        self.audit_publisher.publish(InvoiceStatusChanged.build(invoice_id, invoice.user_id, invoice.plan_id, old_status, new_status))
        self._reconcile_subscription(invoice, old_status, new_status)
        return invoice

    def _reconcile_subscription(self, invoice: Invoice, old_status: InvoiceStatus, new_status: InvoiceStatus) -> None:
        subscription = self.subscription_repo.get_by_user_and_plan(invoice.user_id, invoice.plan_id)
        if subscription is None:
            return
        if new_status == InvoiceStatus.PAID:
            subscription.current_cycle_start = invoice.billing_period.end
            subscription.current_cycle_end = subscription.current_cycle_start + subscription.cycle_duration
            subscription.grace_period_end = None
            self._transition_subscription(subscription, SubscriptionStatus.ACTIVE)
        elif new_status in {InvoiceStatus.EXPIRED, InvoiceStatus.CANCELED}:
            self._transition_subscription(subscription, SubscriptionStatus.EXPIRED)
        elif new_status == InvoiceStatus.FAILED:
            if subscription.grace_period_end:
                self._transition_subscription(subscription, SubscriptionStatus.IN_GRACE_PERIOD)
            else:
                self._transition_subscription(subscription, SubscriptionStatus.SUSPENDED)
        elif new_status == InvoiceStatus.AWAITING_PAYMENT:
            if subscription.status != SubscriptionStatus.PENDING_PAYMENT:
                self._transition_subscription(subscription, SubscriptionStatus.PENDING_PAYMENT)

    def evaluate_subscription_cycle(self, subscription_id: str, now: datetime, amount: Optional[Decimal] = None) -> Optional[Invoice]:
        subscription = self.subscription_repo.get(subscription_id)
        if now < subscription.current_cycle_end:
            return None

        invoice_amount = amount if amount is not None else Decimal("0")
        invoice = self.create_invoice(subscription.subscription_id, invoice_amount)

        if subscription.grace_period_end and now <= subscription.grace_period_end:
            self._transition_subscription(subscription, SubscriptionStatus.IN_GRACE_PERIOD)
        elif subscription.grace_period_end and now > subscription.grace_period_end:
            self._transition_subscription(subscription, SubscriptionStatus.SUSPENDED)
        else:
            self._transition_subscription(subscription, SubscriptionStatus.PENDING_PAYMENT)
        return invoice

    def access_decision(self, user_id: str, now: datetime) -> AccessDecision:
        subscription = self.subscription_repo.find_by_user(user_id)
        if subscription is None:
            return AccessDecision(subscription_id=None, plan_id=None, allowed=False, reason="no_subscription")

        if subscription.status in {SubscriptionStatus.CANCELED, SubscriptionStatus.EXPIRED, SubscriptionStatus.SUSPENDED}:
            return AccessDecision(subscription.subscription_id, subscription.plan_id, False, subscription.status.value)

        if subscription.status == SubscriptionStatus.IN_GRACE_PERIOD:
            if subscription.is_within_grace(now):
                return AccessDecision(subscription.subscription_id, subscription.plan_id, True, "grace_period")
            return AccessDecision(subscription.subscription_id, subscription.plan_id, False, "grace_period_expired")

        if subscription.status == SubscriptionStatus.PENDING_PAYMENT:
            if subscription.grace_period_end and now > subscription.grace_period_end:
                return AccessDecision(subscription.subscription_id, subscription.plan_id, False, "grace_period_expired")
            return AccessDecision(subscription.subscription_id, subscription.plan_id, True, "awaiting_payment")

        return AccessDecision(subscription.subscription_id, subscription.plan_id, True, "active")
