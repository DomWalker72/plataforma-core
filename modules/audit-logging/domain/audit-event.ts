import { AuditEventType } from "./audit-event-type";

export type DeviceInfo = {
  userAgent?: string;
  deviceId?: string;
  os?: string;
  browser?: string;
};

export type AuditEventContext = {
  ipAddress: string;
  timestamp: Date;
  device?: DeviceInfo;
};

export type BaseAuditEvent = {
  id: string;
  tenantId?: string;
  userId?: string;
  module: string;
  feature?: string;
  type: AuditEventType;
  context: AuditEventContext;
  payload: Record<string, unknown>;
};

export type LoginAttemptEvent = BaseAuditEvent & {
  type: AuditEventType.LOGIN_SUCCEEDED | AuditEventType.LOGIN_FAILED;
  payload: {
    method: "password" | "oauth" | "magic_link" | "unknown";
    email?: string;
    reason?: string;
  };
};

export type ModuleAccessEvent = BaseAuditEvent & {
  type: AuditEventType.MODULE_ACCESSED | AuditEventType.FEATURE_ACCESSED;
  payload: {
    path?: string;
    operation?: string;
  };
};

export type UserBlockEvent = BaseAuditEvent & {
  type: AuditEventType.USER_BLOCKED | AuditEventType.USER_UNBLOCKED;
  payload: {
    reason: string;
    expiresAt?: Date;
  };
};

export type InvoiceEvent = BaseAuditEvent & {
  type: AuditEventType.INVOICE_CREATED | AuditEventType.INVOICE_UPDATED;
  payload: {
    invoiceId: string;
    amount: number;
    currency: string;
    status: "draft" | "open" | "paid" | "void" | "uncollectible";
  };
};

export type FinancialEvent = BaseAuditEvent & {
  type: AuditEventType.FINANCIAL_EVENT;
  payload: {
    category: "revenue" | "refund" | "adjustment" | "chargeback" | "credit";
    referenceId?: string;
    amount: number;
    currency: string;
    description?: string;
  };
};

export type AuditEvent =
  | LoginAttemptEvent
  | ModuleAccessEvent
  | UserBlockEvent
  | InvoiceEvent
  | FinancialEvent;
