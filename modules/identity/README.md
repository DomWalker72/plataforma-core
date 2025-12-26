# Módulo de Identidade e Cadastro de Usuários

Responsável pelo ciclo de vida de usuários da plataforma.

## Escopo
- Modelagem de perfis e atributos de usuários.
- Fluxos de cadastro, convite e atualização de dados.
- Integração com diretórios externos de identidade (futuro).

## Estrutura
- `domain/`: entidades, agregados e contratos de repositório.
- `application/`: casos de uso, orquestração e validações.
- `infrastructure/`: persistência e integrações externas (adaptadores).
- `interfaces/`: entregas e entradas (APIs, eventos, filas, CLI).

## Dependências
- Deve ser consumido por autenticação, autorização e billing somente via interfaces públicas (APIs/eventos/DTOs).
- Não depende de módulos de negócio para manter o acoplamento baixo.
