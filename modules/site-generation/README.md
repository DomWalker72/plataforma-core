# Módulo de Geração de Sites Premium

Responsável por orquestrar a criação automatizada de sites de alto padrão visual e técnico, com uso de IA e integrações com bancos de animações.

## Escopo
- Geração de páginas e seções a partir de briefing (segmento, público, tom de marca e objetivos de conversão).
- Sistema de design com componentes premium (hero, grids editoriais, cards, carrosséis, FAQ, pricing, depoimentos, CTA).
- Integração com bancos de animações e mídia (Lottie, Rive, bibliotecas de motion templates e vídeo backgrounds licenciados).
- Edição assistida por IA para copy, hierarquia visual, responsividade e acessibilidade.
- Presets de qualidade inspirados em marcas globais (padrão "streaming", "fintech", "luxo", "enterprise").
- Publicação em múltiplos canais (static hosting, CDN edge, CMS headless).

## Estrutura
- `domain/`: modelos de template, layout, tema, animação, assets e regras de qualidade.
- `application/`: pipeline de geração (briefing -> proposta -> render -> validação -> publicação).
- `infrastructure/`: conectores com provedores de animação, storage de assets, CDN, render farm e serviços de IA.
- `interfaces/`: API de geração, painel web, webhooks de publicação e SDK para extensões.

## Requisitos de Qualidade (Nível Top 10 Global)
- **Performance first**: meta de Core Web Vitals com LCP < 2.5s, INP < 200ms e CLS < 0.1.
- **Motion com propósito**: animações orientadas à narrativa e conversão, sem poluição visual.
- **Acessibilidade nativa**: conformidade WCAG 2.2 AA por padrão (contraste, navegação por teclado, leitura por screen readers).
- **Consistência de marca**: tokens de design para tipografia, cor, espaçamento, ícones e motion.
- **SEO e dados estruturados**: schema.org, metadata social e sitemap automáticos.
- **Observabilidade de UX**: funis de conversão, mapas de interação e alertas de regressão de performance.

## Fluxo de Geração Recomendado
1. **Briefing guiado**: captura de posicionamento, proposta de valor e referências visuais.
2. **Curadoria de assets**: seleção automática + validação humana de animações e mídia.
3. **Composição inteligente**: montagem de layout por objetivos (awareness, lead, venda, retenção).
4. **Validação automática**: score de performance, acessibilidade, SEO e consistência visual.
5. **Publicação e otimização contínua**: deploy em edge + experimentos A/B + aprendizado por métricas.

## Dependências
- Consome Identidade para gestão de times e permissões editoriais.
- Consome Autorização para controle de papéis (owner, designer, editor, reviewer).
- Consome Planos/Assinaturas para habilitar recursos premium por tier.
- Envia eventos para Observabilidade (telemetria de geração, publicação e conversão).

## MVP sugerido (90 dias)
- Gerador de landing pages com 6 templates premium e tema customizável.
- Integração inicial com 1 provedor de animação e 1 provedor de hospedagem.
- Validador automático de Core Web Vitals + checklist WCAG.
- Painel simples para editar textos, assets e ordem das seções.
- Publicação com preview, rollback e versionamento de páginas.
