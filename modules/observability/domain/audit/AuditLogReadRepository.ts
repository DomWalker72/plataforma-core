import { AuditEventType } from "./AuditEvent";
import { ModuleUsageCount, UserStatusBreakdown } from "../metrics/AdminMetrics";
import { TimeRange } from "../metrics/TimeRange";

export interface AuditLogReadRepository {
  countDistinctUsersByEventType(
    eventType: AuditEventType,
    range?: TimeRange
  ): Promise<number>;

  countEventsByType(eventType: AuditEventType, range?: TimeRange): Promise<number>;

  aggregateModuleAccesses(range?: TimeRange): Promise<ModuleUsageCount[]>;

  aggregateUserStatus(range?: TimeRange): Promise<UserStatusBreakdown>;

  countFinancialEvents(range?: TimeRange): Promise<number>;
}
