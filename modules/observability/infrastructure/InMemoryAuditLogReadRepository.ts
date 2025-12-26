import { AuditLogReadRepository } from "../domain/audit/AuditLogReadRepository";
import { AuditEventType, AuditLogEntry } from "../domain/audit/AuditEvent";
import { ModuleUsageCount, UserStatusBreakdown } from "../domain/metrics/AdminMetrics";
import { TimeRange, isWithinRange } from "../domain/metrics/TimeRange";

export class InMemoryAuditLogReadRepository implements AuditLogReadRepository {
  constructor(private readonly auditLogEntries: ReadonlyArray<AuditLogEntry>) {}

  async countDistinctUsersByEventType(
    eventType: AuditEventType,
    range?: TimeRange
  ): Promise<number> {
    const users = new Set(
      this.filterByTypeAndRange(eventType, range)
        .map((entry) => entry.userId)
        .filter((userId): userId is string => Boolean(userId))
    );

    return users.size;
  }

  async countEventsByType(
    eventType: AuditEventType,
    range?: TimeRange
  ): Promise<number> {
    return this.filterByTypeAndRange(eventType, range).length;
  }

  async aggregateModuleAccesses(range?: TimeRange): Promise<ModuleUsageCount[]> {
    const counts = new Map<string, number>();

    this.filterByTypeAndRange(AuditEventType.MODULE_ACCESS, range).forEach((entry) => {
      const moduleName = entry.moduleName ?? "unknown";
      counts.set(moduleName, (counts.get(moduleName) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([moduleName, accessCount]) => ({
      moduleName,
      accessCount,
    }));
  }

  async aggregateUserStatus(range?: TimeRange): Promise<UserStatusBreakdown> {
    const statusByUser = new Map<string, "blocked" | "active">();

    this.auditLogEntries
      .filter((entry) =>
        [AuditEventType.USER_BLOCKED, AuditEventType.USER_UNBLOCKED].includes(entry.type)
      )
      .filter((entry) => isWithinRange(entry.occurredAt, range))
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
      .forEach((entry) => {
        const userId = entry.userId;
        if (!userId) return;
        if (entry.type === AuditEventType.USER_BLOCKED) {
          statusByUser.set(userId, "blocked");
        } else if (entry.type === AuditEventType.USER_UNBLOCKED) {
          statusByUser.set(userId, "active");
        }
      });

    let blocked = 0;
    let active = 0;
    statusByUser.forEach((status) => {
      if (status === "blocked") {
        blocked += 1;
      } else {
        active += 1;
      }
    });

    return { blocked, active };
  }

  async countFinancialEvents(range?: TimeRange): Promise<number> {
    return this.filterByTypeAndRange(AuditEventType.FINANCIAL_EVENT, range).length;
  }

  private filterByTypeAndRange(eventType: AuditEventType, range?: TimeRange) {
    return this.auditLogEntries.filter(
      (entry) => entry.type === eventType && isWithinRange(entry.occurredAt, range)
    );
  }
}
