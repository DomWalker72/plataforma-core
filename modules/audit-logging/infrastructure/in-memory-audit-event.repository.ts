import { AuditEvent } from "../domain/audit-event";
import { AuditEventRepository } from "../domain/repositories";

export class InMemoryAuditEventRepository implements AuditEventRepository {
  private readonly events: AuditEvent[] = [];

  async persist(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  async findByUser(userId: string, limit = 50): Promise<AuditEvent[]> {
    return this.events
      .filter((event) => event.userId === userId)
      .sort((a, b) => b.context.timestamp.getTime() - a.context.timestamp.getTime())
      .slice(0, limit);
  }

  async findRecent(limit: number): Promise<AuditEvent[]> {
    return [...this.events]
      .sort((a, b) => b.context.timestamp.getTime() - a.context.timestamp.getTime())
      .slice(0, limit);
  }
}
