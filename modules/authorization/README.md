# Módulo de Controle de Acesso e Autorização

Responsável por avaliar permissões e papéis em recursos da plataforma.

## Escopo
- Modelagem de papéis, permissões e políticas (RBAC/ABAC).
- Avaliação de autorização para ações em recursos.
- Emissão de decisões e trilhas de auditoria.

## Estrutura
- `domain/`: modelos de papéis, políticas e decisões de acesso.
- `application/`: serviços de avaliação e consulta de autorização.
- `infrastructure/`: armazenamento de políticas, caches e adaptadores de decisão.
- `interfaces/`: APIs de autorização, middlewares e conectores de serviço.

## RBAC de referência
- Papéis centrais: `ADMIN`, `USER`, `PREMIUM`, `SUSPENDED`.
- Decisões dependem de `Role` e `UserStatus` (status interno vindo do módulo de identidade).
- Usuários suspensos têm acesso negado a tudo.
- Administradores ignoram restrições de módulo/feature/action (bypass).
- Permissões são expressas por `Permission(module, feature, action)` com curingas opcionais.
- Toda decisão emite `AuthorizationAuditEvent` para o módulo de Observabilidade/Logging.

## Dependências
- Consome identidade e autenticação via contratos públicos.
- Produz eventos para Observabilidade e Auditoria.
