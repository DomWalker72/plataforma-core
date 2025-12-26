# Módulo de Autenticação

Responsável por validar credenciais e emitir sessões/tokens.

## Escopo
- Login via Google OAuth.
- Login via e-mail e senha.
- Gestão de sessões, tokens e refresh tokens.
- Rotinas de segurança (rate limiting de login, lockout, MFA futura).

## Estrutura
- `domain/`: modelos e políticas de autenticação.
- `application/`: fluxos de login, logout e rotação de credenciais.
- `infrastructure/`: adaptadores para provedores OAuth, armazenamento de sessões e hashing.
- `interfaces/`: APIs de autenticação, webhooks e emissão de tokens.

## Dependências
- Consome dados do módulo de Identidade via interfaces públicas.
- Emite eventos para Autorização e Observabilidade.
