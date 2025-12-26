from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from .statuses import InvoiceStatus, SubscriptionStatus


@dataclass(frozen=True)
class BillingPeriod:
    start: datetime
    end: datetime

    def contains(self, moment: datetime) -> bool:
        return self.start <= moment < self.end


@dataclass
class Subscription:
    subscription_id: str
    user_id: str
    plan_id: str
    status: SubscriptionStatus
    start_date: datetime
    current_cycle_start: datetime
    current_cycle_end: datetime
    grace_period_end: Optional[datetime] = None
    cycle_duration: timedelta = field(default=timedelta(days=30))

    def move_to_next_cycle(self) -> BillingPeriod:
        previous_period = BillingPeriod(start=self.current_cycle_start, end=self.current_cycle_end)
        self.current_cycle_start = self.current_cycle_end
        self.current_cycle_end = self.current_cycle_start + self.cycle_duration
        return previous_period

    def is_within_grace(self, moment: datetime) -> bool:
        return self.grace_period_end is not None and moment <= self.grace_period_end

    def grant_grace(self, end: datetime) -> None:
        self.grace_period_end = end


@dataclass
class Invoice:
    invoice_id: str
    user_id: str
    plan_id: str
    billing_period: BillingPeriod
    amount: Decimal
    status: InvoiceStatus

    def transition_to(self, new_status: InvoiceStatus) -> None:
        allowed = {
            InvoiceStatus.CREATED: {InvoiceStatus.AWAITING_PAYMENT, InvoiceStatus.CANCELED},
            InvoiceStatus.AWAITING_PAYMENT: {
                InvoiceStatus.PAID,
                InvoiceStatus.FAILED,
                InvoiceStatus.EXPIRED,
                InvoiceStatus.CANCELED,
            },
            InvoiceStatus.FAILED: {InvoiceStatus.AWAITING_PAYMENT, InvoiceStatus.CANCELED, InvoiceStatus.EXPIRED},
            InvoiceStatus.PAID: set(),
            InvoiceStatus.EXPIRED: set(),
            InvoiceStatus.CANCELED: set(),
        }
        if new_status not in allowed[self.status]:
            raise ValueError(f"Invalid invoice transition from {self.status} to {new_status}")
        self.status = new_status
