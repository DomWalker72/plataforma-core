export enum AuditEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  MODULE_ACCESS = "MODULE_ACCESS",
  USER_BLOCKED = "USER_BLOCKED",
  USER_UNBLOCKED = "USER_UNBLOCKED",
  FINANCIAL_EVENT = "FINANCIAL_EVENT",
}

export type AuditEventPayload = Record<string, unknown>;

export interface AuditLogEntry {
  id: string;
  type: AuditEventType;
  userId?: string;
  moduleName?: string;
  payload?: AuditEventPayload;
  occurredAt: Date;
  tags?: string[];
}
