import { PlanAccessEvaluator, AccessDecision } from "../../domain/services/PlanAccessEvaluator";
import { PlanAssignmentRepository } from "../../domain/repositories/PlanAssignmentRepository";
import { PlanRepository } from "../../domain/repositories/PlanRepository";

type Input = {
  userId: string;
  module: string;
  feature?: string;
  rbacAllowed: boolean;
  usageContext?: {
    consumed: number;
  };
  context?: Record<string, unknown>;
};

export class EvaluateAccessWithPlanUseCase {
  constructor(
    private readonly assignmentRepository: PlanAssignmentRepository,
    private readonly planRepository: PlanRepository,
    private readonly evaluator: PlanAccessEvaluator
  ) {}

  async execute(input: Input): Promise<AccessDecision> {
    const assignment = await this.assignmentRepository.findCurrentByUser(input.userId);
    if (!assignment) {
      throw new Error("plan_not_assigned");
    }

    const plan = await this.planRepository.findById(assignment.planId);
    if (!plan) {
      throw new Error("plan_not_found");
    }

    return this.evaluator.evaluate({
      userId: input.userId,
      plan,
      module: input.module,
      feature: input.feature,
      rbacAllowed: input.rbacAllowed,
      usageContext: input.usageContext,
      context: input.context,
    });
  }
}
