import { AdminMetricsService } from "../application/admin-metrics.service";
import { MetricsRepository } from "../domain/repositories";

export interface AdminMetricsPort {
  fetchActiveUsers(params: { tenantId?: string; since: Date }): Promise<{
    tenantId?: string;
    since: Date;
    activeUsers: number;
  }>;

  fetchUsagePerModule(params: {
    tenantId?: string;
    since: Date;
  }): Promise<{
    tenantId?: string;
    since: Date;
    usage: { module: string; feature?: string; count: number }[];
  }>;
}

export class AdminMetricsFacade implements AdminMetricsPort {
  constructor(private readonly service: AdminMetricsService) {}

  static usingRepository(metrics: MetricsRepository): AdminMetricsFacade {
    return new AdminMetricsFacade(new AdminMetricsService(metrics));
  }

  async fetchActiveUsers(params: {
    tenantId?: string;
    since: Date;
  }): Promise<{
    tenantId?: string;
    since: Date;
    activeUsers: number;
  }> {
    return this.service.getActiveUsers(params);
  }

  async fetchUsagePerModule(params: {
    tenantId?: string;
    since: Date;
  }): Promise<{
    tenantId?: string;
    since: Date;
    usage: { module: string; feature?: string; count: number }[];
  }> {
    return this.service.getUsagePerModule(params);
  }
}
