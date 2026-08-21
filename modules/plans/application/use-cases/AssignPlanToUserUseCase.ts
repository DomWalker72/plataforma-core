import crypto from "crypto";
import { PlanRepository } from "../../domain/repositories/PlanRepository";
import { PlanAssignmentRepository } from "../../domain/repositories/PlanAssignmentRepository";
import { PlanAssignment } from "../../domain/entities/PlanAssignment";
import { PlanStatus } from "../../domain/entities/Plan";

type Input = {
  userId: string;
  planId: string;
  context?: Record<string, unknown>;
};

type Output = {
  assignment: PlanAssignment;
};

export class AssignPlanToUserUseCase {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly assignmentRepository: PlanAssignmentRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const plan = await this.planRepository.findById(input.planId);
    if (!plan || plan.status !== PlanStatus.ACTIVE) {
      throw new Error("plan_not_active");
    }

    const assignment = new PlanAssignment(
      crypto.randomUUID(),
      input.userId,
      plan.planId,
      new Date(),
      plan.mappedRoles(),
      input.context ?? {}
    );

    await this.assignmentRepository.assign(assignment);

    return { assignment };
  }
}
