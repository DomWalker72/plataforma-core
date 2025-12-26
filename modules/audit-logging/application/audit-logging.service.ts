import { AuditEventType } from "../domain/audit-event-type";
import {
  AuditEvent,
  AuditEventContext,
  InvoiceEvent,
  LoginAttemptEvent,
  ModuleAccessEvent,
  UserBlockEvent,
  FinancialEvent,
} from "../domain/audit-event";
import { AuditEventRepository, MetricsRepository } from "../domain/repositories";

export type CommonEventInput = {
  tenantId?: string;
  userId?: string;
  module: string;
  feature?: string;
  ipAddress: string;
  device?: AuditEventContext["device"];
  timestamp?: Date;
};

export type LoginAttemptInput = CommonEventInput & {
  success: boolean;
  method: LoginAttemptEvent["payload"]["method"];
  email?: string;
  reason?: string;
};

export type ModuleAccessInput = CommonEventInput & {
  path?: string;
  operation?: string;
};

export type UserBlockInput = CommonEventInput & {
  blocked: boolean;
  reason: string;
  expiresAt?: Date;
};

export type InvoiceEventInput = CommonEventInput & {
  invoiceId: string;
  amount: number;
  currency: string;
  status: InvoiceEvent["payload"]["status"];
  operation: "created" | "updated";
};

export type FinancialEventInput = CommonEventInput & {
  category: FinancialEvent["payload"]["category"];
  referenceId?: string;
  amount: number;
  currency: string;
  description?: string;
};

export class AuditLoggingService {
  constructor(
    private readonly auditEvents: AuditEventRepository,
    private readonly metrics?: MetricsRepository,
  ) {}

  async recordLoginAttempt(input: LoginAttemptInput): Promise<void> {
    const event: LoginAttemptEvent = {
      ...this.baseEvent({
        input,
        type: input.success
          ? AuditEventType.LOGIN_SUCCEEDED
          : AuditEventType.LOGIN_FAILED,
      }),
      payload: {
        method: input.method,
        email: input.email,
        reason: input.reason,
      },
    };

    await this.persistWithMetrics(event);
  }

  async recordModuleAccess(input: ModuleAccessInput): Promise<void> {
    const event: ModuleAccessEvent = {
      ...this.baseEvent({
        input,
        type: input.feature
          ? AuditEventType.FEATURE_ACCESSED
          : AuditEventType.MODULE_ACCESSED,
      }),
      payload: {
        path: input.path,
        operation: input.operation,
      },
    };

    await this.persistWithMetrics(event);
  }

  async recordUserBlock(input: UserBlockInput): Promise<void> {
    const event: UserBlockEvent = {
      ...this.baseEvent({
        input,
        type: input.blocked
          ? AuditEventType.USER_BLOCKED
          : AuditEventType.USER_UNBLOCKED,
      }),
      payload: {
        reason: input.reason,
        expiresAt: input.expiresAt,
      },
    };

    await this.persistWithMetrics(event);
  }

  async recordInvoiceEvent(input: InvoiceEventInput): Promise<void> {
    const event: InvoiceEvent = {
      ...this.baseEvent({
        input,
        type:
          input.operation === "created"
            ? AuditEventType.INVOICE_CREATED
            : AuditEventType.INVOICE_UPDATED,
      }),
      payload: {
        invoiceId: input.invoiceId,
        amount: input.amount,
        currency: input.currency,
        status: input.status,
      },
    };

    await this.persistWithMetrics(event);
  }

  async recordFinancialEvent(input: FinancialEventInput): Promise<void> {
    const event: FinancialEvent = {
      ...this.baseEvent({
        input,
        type: AuditEventType.FINANCIAL_EVENT,
      }),
      payload: {
        category: input.category,
        referenceId: input.referenceId,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
      },
    };

    await this.persistWithMetrics(event);
  }

  private async persistWithMetrics(event: AuditEvent): Promise<void> {
    await this.auditEvents.persist(event);

    if (this.metrics) {
      await this.metrics.recordUserActivity({
        tenantId: event.tenantId,
        userId: event.userId,
        module: event.module,
        feature: event.feature,
        timestamp: event.context.timestamp,
      });
    }
  }

  private baseEvent({
    input,
    type,
  }: {
    input: CommonEventInput;
    type: AuditEventType;
  }): AuditEvent {
    return {
      id: this.generateId(),
      tenantId: input.tenantId,
      userId: input.userId,
      module: input.module,
      feature: input.feature,
      type,
      context: this.buildContext(input),
      payload: {},
    };
  }

  private buildContext(input: CommonEventInput): AuditEventContext {
    return {
      ipAddress: input.ipAddress,
      device: input.device,
      timestamp: input.timestamp ?? new Date(),
    };
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}
