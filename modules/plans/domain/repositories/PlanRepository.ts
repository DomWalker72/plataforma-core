import { Plan } from "../entities/Plan";

export interface PlanRepository {
  save(plan: Plan): Promise<void>;
  findById(planId: string): Promise<Plan | null>;
  findActiveById(planId: string): Promise<Plan | null>;
  listActive(): Promise<Plan[]>;
}
