# Eventos de Auditoria de Plano

Cada decisão de acesso baseada em plano deve emitir o evento `plan.access.decided.v1`.

```json
{
  "event_id": "uuid",
  "timestamp": "2024-01-01T12:00:00Z",
  "user_id": "user-123",
  "plan_id": "plan-pro",
  "module": "analytics",
  "feature": "export",
  "rbac_decision": true,
  "plan_decision": "denied",
  "reason": "usage_limit_exceeded",
  "usage": { "limit": 1000, "consumed": 1000, "period": "monthly" },
  "context": { "request_id": "abc" }
}
```

- `plan_decision`: `"allowed"` ou `"denied"`.
- `reason`: motivos padronizados (ex.: `plan_inactive`, `rbac_denied`, `module_not_allowed`, `feature_not_allowed`, `usage_limit_exceeded`, `allowed_within_limit`, `allowed_by_plan`).
- `usage`: opcional; presente quando um limite de uso foi avaliado.

> A emissão real deve ser conectada ao módulo de Observabilidade via adaptador.
