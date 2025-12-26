import { PlanAssignmentRepository } from "../../domain/repositories/PlanAssignmentRepository";
import { PlanAssignment } from "../../domain/entities/PlanAssignment";

export class InMemoryPlanAssignmentRepository implements PlanAssignmentRepository {
  private assignments = new Map<string, PlanAssignment[]>();

  async assign(assignment: PlanAssignment): Promise<void> {
    const history = this.assignments.get(assignment.userId) ?? [];
    history.push(assignment);
    this.assignments.set(assignment.userId, history);
  }

  async changePlan(userId: string, newAssignment: PlanAssignment): Promise<void> {
    const history = this.assignments.get(userId) ?? [];
    history.push(newAssignment);
    this.assignments.set(userId, history);
  }

  async findCurrentByUser(userId: string): Promise<PlanAssignment | null> {
    const history = this.assignments.get(userId) ?? [];
    return history.length ? history[history.length - 1] : null;
  }

  async listHistory(userId: string): Promise<PlanAssignment[]> {
    return [...(this.assignments.get(userId) ?? [])];
  }
}
