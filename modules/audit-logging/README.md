# Módulo de Logs, Trilhas de Auditoria e Métricas Administrativas

Módulo autônomo para registrar eventos críticos da plataforma, mantendo trilhas de auditoria e gerando métricas administrativas. Ele opera desacoplado dos demais serviços e expõe contratos estáveis para publicação de eventos.

## Escopo
- Registro de tentativas de login (sucesso e falha).
- Registro de acessos a módulos e funcionalidades.
- Registro de bloqueios e desbloqueios de usuários.
- Registro de criação e atualização de faturas.
- Registro de eventos financeiros lógicos (agnósticos a gateways).
- Captura de IP, timestamp e informações de dispositivo para cada evento.
- Métricas administrativas básicas: usuários ativos e uso por módulo/feature.

## Estrutura
- `domain/`: modelos de eventos, contratos de persistência e políticas de métricas.
- `application/`: serviços centrais de logging, trilha de auditoria e coleta de métricas.
- `infrastructure/`: implementações de armazenamento (ex.: em memória) e agregadores de métricas.
- `interfaces/`: portas públicas para consumo de outros módulos, DTOs e validações leves.

## Dependências
- Não depende de outros módulos internos.
- Exige apenas implementações das interfaces de persistência/entrega definidas no domínio.
