# Contratos Públicos de Planos

> Estes contratos são consumíveis por outros módulos via interface REST/GraphQL ou mensagens assíncronas. Não há UI nem lógica de billing.

## DTOs

### PlanDTO
- `plan_id: string`
- `name: string`
- `description: string`
- `status: "active" | "inactive"`
- `role_mappings: { plan_role: string; rbac_roles: string[] }[]`
- `module_rules: { module: string; allowed: boolean; usage_limit?: UsageLimitDTO; feature_rules?: FeatureAccessDTO[] }[]`
- `feature_rules: FeatureAccessDTO[]` (regras explícitas por feature)
- `usage_limits: UsageLimitDTO[]`

### FeatureAccessDTO
- `module: string`
- `feature: string`
- `allowed: boolean`
- `usage_limit?: UsageLimitDTO`

### UsageLimitDTO
- `scope: { module?: string; feature?: string }`
- `limit: number`
- `period: "daily" | "weekly" | "monthly" | "yearly" | "lifetime"`

### PlanAssignmentDTO
- `assignment_id: string`
- `user_id: string`
- `plan_id: string`
- `applied_at: string (ISO 8601)`
- `effective_roles: string[]`
- `metadata: object`

## Operações

- **POST /plans/{plan_id}/assign**  
  Atribui um plano ativo a um usuário. Retorna `PlanAssignmentDTO`.

- **POST /plans/{plan_id}/change**  
  Troca o plano de um usuário preservando histórico. Retorna o novo `PlanAssignmentDTO` e referencia o anterior.

- **POST /plans/access/evaluate**  
  Entrada: `{ user_id, module, feature?, rbac_allowed, usage_context? }`  
  Saída: `{ allowed: boolean; reason: string; audit_event_id: string }`

## Eventos

- **plan.access.decided.v1**  
  Emissão obrigatória para cada decisão de acesso baseada em plano. Payload baseado em `PlanAuditEvent` (com motivo e uso).

## Considerações de Segurança
- O RBAC continua como fonte de verdade; `rbac_allowed` deve ser obtido antes de chamar o uso de caso de avaliação de plano.
- Limites de uso devem ser validados com uma fonte de consumo confiável (ex.: contador de requisições por módulo/feature).
- Alterações de plano devem ser auditadas externamente via módulo de Observabilidade.
