import { PlanUsageReader } from "../../domain/services/PlanAccessEvaluator";

export class InMemoryUsageReader implements PlanUsageReader {
  private usage = new Map<string, number>();

  recordUsage(userId: string, scope: { module?: string; feature?: string }, amount = 1) {
    const key = this.key(userId, scope);
    const current = this.usage.get(key) ?? 0;
    this.usage.set(key, current + amount);
  }

  async currentUsage(userId: string, scope: { module?: string; feature?: string }): Promise<number> {
    const key = this.key(userId, scope);
    return this.usage.get(key) ?? 0;
  }

  private key(userId: string, scope: { module?: string; feature?: string }) {
    return `${userId}:${scope.module ?? "*"}:${scope.feature ?? "*"}`;
  }
}
