import { PlanAssignment } from "../entities/PlanAssignment";

export interface PlanAssignmentRepository {
  assign(assignment: PlanAssignment): Promise<void>;
  changePlan(userId: string, newAssignment: PlanAssignment): Promise<void>;
  findCurrentByUser(userId: string): Promise<PlanAssignment | null>;
  listHistory(userId: string): Promise<PlanAssignment[]>;
}
