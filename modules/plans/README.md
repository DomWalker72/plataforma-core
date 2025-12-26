# Módulo de Planos (Governança de Acesso)

Módulo responsável por definir e aplicar políticas de planos que funcionam como uma camada de restrição sobre o RBAC existente. Nenhuma lógica de billing ou cobrança é tratada aqui; o foco é garantir que cada plano descreva o que um usuário pode acessar e quanto pode consumir.

## Escopo
- Modelo de plano com regras de acesso a módulos e funcionalidades.
- Mapeamento de papéis do plano para papéis RBAC existentes (autoridade de permissão permanece no RBAC).
- Limites de uso por módulo/funcionalidade e emissão de eventos de auditoria para cada decisão de acesso baseada em plano.
- Atribuição de plano a usuários e mudanças de plano sem perda de dados (histórico de atribuições).

## Integrações
- **Autorização/RBAC**: o RBAC continua sendo a autoridade de permissão; o plano só restringe. As integrações acontecem via contratos públicos (nenhuma alteração no módulo de autorização).
- **Observabilidade**: decisões de acesso baseadas em plano emitem eventos de auditoria através de uma porta explícita.
- **Billing/Assinaturas**: fora do escopo; este módulo é independente de preços, cobrança ou UI.

## Estrutura
- `domain/`: modelos de plano, regras de acesso, limites de uso, eventos e contratos de repositório.
- `application/`: casos de uso para atribuição/alteração de plano e avaliação de acesso combinando RBAC + plano.
- `interfaces/`: contratos públicos (DTOs/eventos) consumíveis por outros módulos.
- `infrastructure/`: adaptadores de persistência e de auditoria de referência (ex.: repositório em memória).

## Contratos e garantias
- Toda decisão de acesso baseada em plano deve gerar um evento de auditoria (permitido ou negado).
- Se o plano não permitir um módulo/feature ou estiver inativo, o acesso é negado mesmo se o RBAC permitir.
- Mudanças de plano preservam histórico de atribuições para permitir restauração e trilha de auditoria.

