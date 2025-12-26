# Módulo de Planos e Assinaturas

Responsável por definir ofertas comerciais e ciclos de assinatura.

## Escopo
- Catálogo de planos, add-ons e upgrades/downgrades.
- Ciclo de vida de assinaturas (criação, alteração, cancelamento, trial).
- Regras de faturamento recorrente e alinhamento pró-rata.

## Estrutura
- `domain/`: modelos de plano, assinatura e regras de cobrança.
- `application/`: casos de uso de gestão de plano/assinatura e orquestração com billing.
- `infrastructure/`: persistência, agendamentos e integrações com sistemas de billing.
- `interfaces/`: APIs de catálogo e gestão de assinaturas, eventos e webhooks.

## Dependências
- Interage com Billing/Pagamentos e Autorização via contratos públicos.
- Emite eventos para Observabilidade.
