# Estado de implementação e inventário

## Inventário recebido

O repositório continha somente a estrutura modular inicial e arquivos README. Não foram recebidos a Bíblia do Cliente, PDF visual, imagens avulsas, logotipo, fontes, lista de municípios ou lista de serviços.

## Mapa preliminar

| Rota | Tipo | Estado | Fonte |
| --- | --- | --- | --- |
| `/` | Página pública demonstrativa | Implementada como fundação acessível e responsiva | Conteúdo estritamente operacional do escopo; não institucional |
| `/admin` | Painel administrativo | Pendente | Depende de requisitos de identidade e conteúdo |
| `/municipios/[slug]` | Template de município | Planejado | Depende da lista e da Bíblia |
| `/servicos/[slug]` | Template de serviço | Planejado | Depende da lista e da Bíblia |
| `/municipios/[municipio]/[servico]` | Cruzamento dinâmico | Planejado | Publicação condicionada a evidência documental |

Nenhuma tela individual pôde ser detectada porque nenhum PDF visual foi anexado. Assim, também não é possível calcular honestamente o indicador de consistência visual.

## Decisões reversíveis adotadas

- A fundação pública usa componentes semânticos, área segura e tokens CSS responsivos.
- A ilustração provisória é construída em CSS, sem ativo externo ou risco de licença.
- O assistente aplica imediatamente a regra de ausência de evidência, sem inventar resposta.
- O servidor inclui cabeçalhos básicos de segurança; autenticação, persistência, uploads e proteção de APIs exigirão a camada de aplicação definitiva.

## Lacunas que alteram materialmente a construção

1. Bíblia do Cliente vigente, com título, versão, data e responsável.
2. PDF ou imagens de referência para identificação das telas e reconstrução visual.
3. Ativos originais e respectivas permissões de uso.
4. Listas aprovadas de municípios e serviços.
5. Provedor de infraestrutura desejado para banco relacional, armazenamento, e-mail e identidade.

Essas lacunas impedem declarar fidelidade visual, conteúdo oficial, páginas filhas e fluxos administrativos completos. A página atual deve ser tratada como fundação demonstrativa, não como entrega final.
