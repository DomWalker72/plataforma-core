# Módulo de Billing e Pagamentos

Responsável por faturamento, emissão de cobranças e reconciliação de pagamentos.

## Escopo
- Geração de faturas e cobranças recorrentes.
- Integração com gateways de pagamento (ex.: Stripe, Adyen, PayPal).
- Reembolsos, notas de crédito e conciliação.

## Estrutura
- `domain/`: modelos de fatura, cobrança e transações.
- `application/`: orquestração de cobranças, reconciliação e notificações.
- `infrastructure/`: adaptadores de gateways, filas e persistência financeira.
- `interfaces/`: APIs de cobrança, webhooks de gateway e eventos de billing.

## Dependências
- Recebe ordens do módulo de Planos/Assinaturas.
- Envia sinalizações para Observabilidade e Auditoria.
