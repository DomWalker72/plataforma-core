import { AuditLogReadRepository } from "../domain/audit/AuditLogReadRepository";
import { AuditEventType } from "../domain/audit/AuditEvent";
import {
  AdminMetricsSnapshot,
  LoginBreakdown,
  ModuleUsageCount,
  UserStatusBreakdown,
} from "../domain/metrics/AdminMetrics";
import { TimeRange } from "../domain/metrics/TimeRange";

export class AdminMetricsService {
  constructor(private readonly auditLogRepository: AuditLogReadRepository) {}

  async getSnapshot(range?: TimeRange): Promise<AdminMetricsSnapshot> {
    const [activeUsers, login, moduleUsage, userStatus, financialActivityCount] =
      await Promise.all([
        this.resolveActiveUsers(range),
        this.resolveLoginBreakdown(range),
        this.resolveModuleUsage(range),
        this.resolveUserStatus(range),
        this.auditLogRepository.countFinancialEvents(range),
      ]);

    return {
      generatedAt: new Date(),
      period: range,
      activeUsers,
      login,
      moduleUsage,
      userStatus,
      financialActivityCount,
    };
  }

  private async resolveActiveUsers(range?: TimeRange): Promise<number> {
    return this.auditLogRepository.countDistinctUsersByEventType(
      AuditEventType.LOGIN_SUCCESS,
      range
    );
  }

  private async resolveLoginBreakdown(range?: TimeRange): Promise<LoginBreakdown> {
    const [successes, failures] = await Promise.all([
      this.auditLogRepository.countEventsByType(AuditEventType.LOGIN_SUCCESS, range),
      this.auditLogRepository.countEventsByType(AuditEventType.LOGIN_FAILURE, range),
    ]);

    const total = successes + failures;
    const successRate = total === 0 ? 0 : successes / total;
    const failureRate = total === 0 ? 0 : failures / total;

    return { successes, failures, successRate, failureRate };
  }

  private async resolveModuleUsage(range?: TimeRange): Promise<ModuleUsageCount[]> {
    return this.auditLogRepository.aggregateModuleAccesses(range);
  }

  private async resolveUserStatus(range?: TimeRange): Promise<UserStatusBreakdown> {
    return this.auditLogRepository.aggregateUserStatus(range);
  }
}
