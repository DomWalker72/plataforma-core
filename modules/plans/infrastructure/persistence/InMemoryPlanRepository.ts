import { Plan } from "../../domain/entities/Plan";
import { PlanRepository } from "../../domain/repositories/PlanRepository";

export class InMemoryPlanRepository implements PlanRepository {
  private plans = new Map<string, Plan>();

  async save(plan: Plan): Promise<void> {
    this.plans.set(plan.planId, plan);
  }

  async findById(planId: string): Promise<Plan | null> {
    return this.plans.get(planId) ?? null;
  }

  async findActiveById(planId: string): Promise<Plan | null> {
    const plan = this.plans.get(planId);
    if (!plan) return null;
    return plan.isActive() ? plan : null;
  }

  async listActive(): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter((plan) => plan.isActive());
  }
}
