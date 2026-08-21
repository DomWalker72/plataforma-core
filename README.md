# Plataforma Core SaaS (Estrutura Inicial)

Estrutura modular inicial para uma plataforma SaaS desacoplada por domínio. Cada módulo é organizado com camadas `domain`, `application`, `infrastructure` e `interfaces`, permitindo evolução independente e substituição de adaptadores sem quebrar contratos públicos.

## Módulos
- `modules/identity/`: identidade e cadastro de usuários.
- `modules/authentication/`: autenticação (Google OAuth e e-mail/senha).
- `modules/authorization/`: controle de acesso e autorização.
- `modules/plans/`: governança de planos (regras de acesso e limites sobre o RBAC, sem billing).
- `modules/plans-subscriptions/`: planos, ofertas e assinaturas recorrentes.
- `modules/billing-payments/`: faturamento, cobrança e pagamentos.
- `modules/observability/`: logs, auditoria e métricas.

## Convenções de arquitetura
- **Domain first**: regras e modelos de negócio vivem em `domain/`, livres de dependências técnicas.
- **Aplicação fina**: orquestração e casos de uso residem em `application/` consumindo contratos de domínio.
- **Adaptadores explícitos**: `infrastructure/` contém integrações externas (bancos, filas, provedores) e depende apenas de contratos públicos.
- **Interfaces claras**: `interfaces/` expõe APIs, eventos e conectores; comunicação entre módulos acontece por contratos ou mensagens, evitando acoplamento direto.
- **Eventos e DTOs versionados**: a evolução entre módulos deve ser feita via versionamento de payloads para manter compatibilidade.

## Próximos passos sugeridos
- Definir contratos de eventos e DTOs mínimos entre módulos.
- Escolher padrões de entrega (REST/GraphQL/Async) por interface.
- Configurar pipelines de CI/CD e instrumentação base (observabilidade).
- Adicionar testes de contrato entre módulos e contratos públicos.
