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

## Dependências
- Consome identidade e autenticação via contratos públicos.
- Produz eventos para Observabilidade e Auditoria.
