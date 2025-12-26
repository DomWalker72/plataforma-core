import { MetricsRepository, ModuleUsageSnapshot } from "../domain/repositories";

type ActivityRecord = {
  tenantId?: string;
  userId?: string;
  module: string;
  feature?: string;
  timestamp: Date;
};

export class InMemoryMetricsRepository implements MetricsRepository {
  private readonly activities: ActivityRecord[] = [];

  async recordUserActivity(record: ActivityRecord): Promise<void> {
    this.activities.push({
      ...record,
      timestamp: record.timestamp ?? new Date(),
    });
  }

  async getActiveUsers(params: { tenantId?: string; since: Date }): Promise<number> {
    const uniqueUsers = new Set<string>();

    this.activities.forEach((activity) => {
      if (activity.timestamp < params.since) {
        return;
      }

      if (params.tenantId && activity.tenantId !== params.tenantId) {
        return;
      }

      const key = `${activity.tenantId ?? "global"}::${
        activity.userId ?? "anonymous"
      }`;
      uniqueUsers.add(key);
    });

    return uniqueUsers.size;
  }

  async getUsagePerModule(params: {
    tenantId?: string;
    since: Date;
  }): Promise<ModuleUsageSnapshot[]> {
    const usageMap = new Map<string, ModuleUsageSnapshot>();

    this.activities.forEach((activity) => {
      if (activity.timestamp < params.since) {
        return;
      }

      if (params.tenantId && activity.tenantId !== params.tenantId) {
        return;
      }

      const key = `${activity.module}::${activity.feature ?? "any"}`;
      const existing = usageMap.get(key) ?? {
        module: activity.module,
        feature: activity.feature,
        count: 0,
      };

      usageMap.set(key, {
        ...existing,
        count: existing.count + 1,
      });
    });

    return Array.from(usageMap.values()).sort((a, b) => b.count - a.count);
  }
}
