# Módulo de Logs, Auditoria e Métricas

Responsável por consolidar observabilidade e trilhas de auditoria da plataforma.

## Escopo
- Coleta e centralização de logs estruturados.
- Métricas de produto e técnicas (SLIs/SLOs) para os domínios.
- Auditoria de ações de usuários e serviços.

## Estrutura
- `domain/`: modelos e contratos de eventos, logs e métricas.
- `application/`: pipelines de coleta, normalização e roteamento.
- `infrastructure/`: armazenamento de logs/telemetria, exporters e integrações com APM.
- `interfaces/`: APIs/SDKs para ingestão, webhooks e conectores de dados.

## Dependências
- Consome eventos dos demais módulos via interfaces e filas.
- Fornece trilhas e dashboards para todas as áreas do produto.

## Métricas administrativas
- `domain/audit`: contratos de leitura de trilhas (apenas leitura).
- `domain/metrics`: modelos para métricas derivadas exclusivamente de eventos de auditoria.
- `application/AdminMetricsService`: serviço que agrega usuários ativos (login_success), razão de sucesso/falha de login, uso de módulos, status de bloqueio/ativo e contagem de eventos financeiros.
- `infrastructure/InMemoryAuditLogReadRepository`: adaptador de exemplo que calcula métricas apenas a partir de eventos auditados, mantendo o módulo de logs como fonte de verdade.
