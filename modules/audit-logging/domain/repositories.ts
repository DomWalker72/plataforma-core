import { AuditEvent } from "./audit-event";

export interface AuditEventRepository {
  persist(event: AuditEvent): Promise<void>;
  findByUser(userId: string, limit?: number): Promise<AuditEvent[]>;
  findRecent(limit: number): Promise<AuditEvent[]>;
}

export type ModuleUsageSnapshot = {
  module: string;
  feature?: string;
  count: number;
};

export interface MetricsRepository {
  recordUserActivity(params: {
    tenantId?: string;
    userId?: string;
    module: string;
    feature?: string;
    timestamp: Date;
  }): Promise<void>;

  getActiveUsers(params: {
    tenantId?: string;
    since: Date;
  }): Promise<number>;

  getUsagePerModule(params: {
    tenantId?: string;
    since: Date;
  }): Promise<ModuleUsageSnapshot[]>;
}
