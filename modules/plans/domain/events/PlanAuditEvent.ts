export type PlanAuditDecision = "allowed" | "denied";

export type PlanAuditEvent = {
  eventId: string;
  timestamp: Date;
  userId: string;
  planId: string;
  module?: string;
  feature?: string;
  rbacDecision: boolean;
  planDecision: PlanAuditDecision;
  reason: string;
  usage?: {
    limit?: number;
    consumed?: number;
    period?: string;
  };
  context?: Record<string, unknown>;
};
