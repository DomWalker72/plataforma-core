import crypto from "crypto";
import { Plan } from "../entities/Plan";
import { PlanAuditEvent, PlanAuditDecision } from "../events/PlanAuditEvent";

export type AccessRequest = {
  userId: string;
  plan: Plan;
  module: string;
  feature?: string;
  rbacAllowed: boolean;
  usageContext?: {
    consumed: number;
  };
  context?: Record<string, unknown>;
};

export type AccessDecision = {
  allowed: boolean;
  reason: string;
  auditEvent: PlanAuditEvent;
};

export interface PlanUsageReader {
  currentUsage(userId: string, scope: { module?: string; feature?: string }): Promise<number>;
}

export interface PlanAuditLogger {
  emit(event: PlanAuditEvent): Promise<void>;
}

export class PlanAccessEvaluator {
  constructor(
    private readonly usageReader: PlanUsageReader,
    private readonly auditLogger: PlanAuditLogger
  ) {}

  async evaluate(request: AccessRequest): Promise<AccessDecision> {
    const { plan, module, feature, rbacAllowed, userId } = request;

    const auditBase: Omit<PlanAuditEvent, "eventId"> = {
      timestamp: new Date(),
      userId,
      planId: plan.planId,
      module,
      feature,
      rbacDecision: rbacAllowed,
      planDecision: "denied",
      reason: "",
      context: request.context,
    };

    if (!plan.isActive()) {
      return this.logDecision(auditBase, "denied", "plan_inactive");
    }

    if (!rbacAllowed) {
      return this.logDecision(auditBase, "denied", "rbac_denied");
    }

    if (!plan.allowsModule(module)) {
      return this.logDecision(auditBase, "denied", "module_not_allowed");
    }

    if (feature && !plan.allowsFeature(module, feature)) {
      return this.logDecision(auditBase, "denied", "feature_not_allowed");
    }

    const limitRule = plan.usageLimitFor({ module, feature });
    if (limitRule) {
      const consumed =
        request.usageContext?.consumed ??
        (await this.usageReader.currentUsage(userId, { module, feature }));
      if (consumed >= limitRule.limit) {
        return this.logDecision(auditBase, "denied", "usage_limit_exceeded", {
          limit: limitRule.limit,
          consumed,
          period: limitRule.period,
        });
      }

      return this.logDecision(auditBase, "allowed", "allowed_within_limit", {
        limit: limitRule.limit,
        consumed,
        period: limitRule.period,
      });
    }

    return this.logDecision(auditBase, "allowed", "allowed_by_plan");
  }

  private async logDecision(
    base: Omit<PlanAuditEvent, "eventId">,
    decision: PlanAuditDecision,
    reason: string,
    usage?: PlanAuditEvent["usage"]
  ): Promise<AccessDecision> {
    const auditEvent: PlanAuditEvent = {
      ...base,
      eventId: crypto.randomUUID(),
      planDecision: decision,
      reason,
      usage,
    };

    await this.auditLogger.emit(auditEvent);
    return {
      allowed: decision === "allowed",
      reason,
      auditEvent,
    };
  }
}
