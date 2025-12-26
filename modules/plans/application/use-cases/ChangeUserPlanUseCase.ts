import crypto from "crypto";
import { PlanRepository } from "../../domain/repositories/PlanRepository";
import { PlanAssignmentRepository } from "../../domain/repositories/PlanAssignmentRepository";
import { PlanAssignment } from "../../domain/entities/PlanAssignment";
import { PlanStatus } from "../../domain/entities/Plan";

type Input = {
  userId: string;
  newPlanId: string;
  reason?: string;
  context?: Record<string, unknown>;
};

type Output = {
  assignment: PlanAssignment;
  previous?: PlanAssignment | null;
};

export class ChangeUserPlanUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly assignmentRepository: PlanAssignmentRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const plan = await this.planRepository.findById(input.newPlanId);
    if (!plan || plan.status !== PlanStatus.ACTIVE) {
      throw new Error("plan_not_active");
    }

    const previous = await this.assignmentRepository.findCurrentByUser(input.userId);

    const assignment = new PlanAssignment(
      crypto.randomUUID(),
      input.userId,
      plan.planId,
      new Date(),
      plan.mappedRoles(),
      {
        ...input.context,
        changeReason: input.reason,
        previousAssignmentId: previous?.assignmentId,
      }
    );

    await this.assignmentRepository.changePlan(input.userId, assignment);

    return { assignment, previous };
  }
}
