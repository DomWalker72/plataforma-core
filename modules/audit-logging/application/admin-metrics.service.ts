import { MetricsRepository, ModuleUsageSnapshot } from "../domain/repositories";

export class AdminMetricsService {
  constructor(private readonly metrics: MetricsRepository) {}

  async getActiveUsers(params: { tenantId?: string; since: Date }): Promise<{
    tenantId?: string;
    since: Date;
    activeUsers: number;
  }> {
    const activeUsers = await this.metrics.getActiveUsers(params);

    return {
      tenantId: params.tenantId,
      since: params.since,
      activeUsers,
    };
  }

  async getUsagePerModule(params: {
    tenantId?: string;
    since: Date;
  }): Promise<{
    tenantId?: string;
    since: Date;
    usage: ModuleUsageSnapshot[];
  }> {
    const usage = await this.metrics.getUsagePerModule(params);

    return {
      tenantId: params.tenantId,
      since: params.since,
      usage,
    };
  }
}
