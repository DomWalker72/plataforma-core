import { PlanAuditLogger } from "../../domain/services/PlanAccessEvaluator";
import { PlanAuditEvent } from "../../domain/events/PlanAuditEvent";

/**
 * Adaptador de referência: delega emissão de eventos para o módulo de Observabilidade.
 * A implementação real deve publicar em um barramento/event bus configurado pela plataforma.
 */
export class ObservabilityPlanAuditLogger implements PlanAuditLogger {
  constructor(private readonly publish: (event: PlanAuditEvent) => Promise<void>) {}

  async emit(event: PlanAuditEvent): Promise<void> {
    await this.publish(event);
  }
}
