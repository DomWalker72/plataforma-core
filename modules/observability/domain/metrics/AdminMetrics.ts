import { AuditEventType } from "../audit/AuditEvent";
import { TimeRange } from "./TimeRange";

export interface ModuleUsageCount {
  moduleName: string;
  accessCount: number;
}

export interface UserStatusBreakdown {
  blocked: number;
  active: number;
}

export interface LoginBreakdown {
  successes: number;
  failures: number;
  successRate: number;
  failureRate: number;
}

export interface AdminMetricsSnapshot {
  generatedAt: Date;
  period?: TimeRange;
  activeUsers: number;
  login: LoginBreakdown;
  moduleUsage: ModuleUsageCount[];
  userStatus: UserStatusBreakdown;
  financialActivityCount: number;
}

export const EventTypesForLoginMetrics: ReadonlyArray<AuditEventType> = [
  AuditEventType.LOGIN_SUCCESS,
  AuditEventType.LOGIN_FAILURE,
];

export const EventTypesForUserStatus: ReadonlyArray<AuditEventType> = [
  AuditEventType.USER_BLOCKED,
  AuditEventType.USER_UNBLOCKED,
];
