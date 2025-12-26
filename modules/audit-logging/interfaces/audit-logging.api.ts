import {
  AuditLoggingService,
  FinancialEventInput,
  InvoiceEventInput,
  LoginAttemptInput,
  ModuleAccessInput,
  UserBlockInput,
} from "../application/audit-logging.service";
import { AuditEventRepository, MetricsRepository } from "../domain/repositories";

export interface AuditLoggingPort {
  logLoginAttempt(input: LoginAttemptInput): Promise<void>;
  logModuleAccess(input: ModuleAccessInput): Promise<void>;
  logUserBlock(input: UserBlockInput): Promise<void>;
  logInvoiceEvent(input: InvoiceEventInput): Promise<void>;
  logFinancialEvent(input: FinancialEventInput): Promise<void>;
}

export class AuditLoggingFacade implements AuditLoggingPort {
  constructor(private readonly service: AuditLoggingService) {}

  static usingRepositories(dependencies: {
    auditEvents: AuditEventRepository;
    metrics?: MetricsRepository;
  }): AuditLoggingFacade {
    return new AuditLoggingFacade(
      new AuditLoggingService(dependencies.auditEvents, dependencies.metrics),
    );
  }

  async logLoginAttempt(input: LoginAttemptInput): Promise<void> {
    return this.service.recordLoginAttempt(input);
  }

  async logModuleAccess(input: ModuleAccessInput): Promise<void> {
    return this.service.recordModuleAccess(input);
  }

  async logUserBlock(input: UserBlockInput): Promise<void> {
    return this.service.recordUserBlock(input);
  }

  async logInvoiceEvent(input: InvoiceEventInput): Promise<void> {
    return this.service.recordInvoiceEvent(input);
  }

  async logFinancialEvent(input: FinancialEventInput): Promise<void> {
    return this.service.recordFinancialEvent(input);
  }
}
