# Documentação — Case Clinical AI

**Estado: Discovery V2 concluído. Nenhum código de produto escrito.**

A V2 remove o LLM do runtime: a aplicação é estática e a avaliação é determinística.
O que mudou em relação à V1 está em
[01-discovery/v2-migration-status.md](01-discovery/v2-migration-status.md) — **comece por aí se
você leu a V1**.

Próximo passo obrigatório: responder D2 e D7–D12 em
[01-discovery/open-questions.md](01-discovery/open-questions.md).

## Por onde começar

| Se você quer… | Leia |
|---|---|
| Saber o que mudou da V1 para a V2 | [v2-migration-status.md](01-discovery/v2-migration-status.md) |
| Entender o produto em 5 minutos | [product-understanding.md](01-discovery/product-understanding.md) |
| Entender como a avaliação funciona sem IA | [evaluation-engine.md](03-architecture/evaluation-engine.md) |
| Saber onde a IA é usada | [authoring-pipeline.md](03-architecture/authoring-pipeline.md) |
| Saber o que precisa ser decidido | [open-questions.md](01-discovery/open-questions.md) |
| Ver as regras do projeto | [../CLAUDE.md](../CLAUDE.md) |
| Escrever o texto acadêmico | [academic-frame.md](00-project/academic-frame.md) |

## Índice

**00-project** — [charter](00-project/charter.md) · [enquadramento acadêmico](00-project/academic-frame.md)

**01-discovery** — [**mapa de migração V1→V2**](01-discovery/v2-migration-status.md) ·
[entendimento do produto](01-discovery/product-understanding.md) ·
[questões em aberto](01-discovery/open-questions.md) · [riscos](01-discovery/risk-register.md)

**research** — [regras de pesquisa](research/README.md) ·
[raciocínio clínico e educação](research/clinical-reasoning-education.md) ·
[**formatos de avaliação determinística**](research/assessment-formats.md) ·
[confiabilidade de LLMs em medicina](research/llm-reliability-in-medicine.md) *(justifica a V2)* ·
[estratégias de grounding](research/grounding-strategies-comparison.md) *(obsoleto)* ·
[bibliografia](research/sources.md)

**03-architecture** — [arquitetura técnica](03-architecture/technical-architecture.md) ·
[modelo de dados](03-architecture/data-model.md) ·
[**motor de avaliação**](03-architecture/evaluation-engine.md) ·
[**pipeline de autoria**](03-architecture/authoring-pipeline.md) ·
[arquitetura de agentes](03-architecture/agent-architecture.md) ·
[estratégia de IA em runtime](03-architecture/ai-strategy.md) *(obsoleto — registro da V1)*

**ADRs**
| # | Decisão | Status |
|---|---|---|
| [0001](03-architecture/adr/ADR-0001-proxy-de-chave.md) | Proxy de chave de API | ⚠️ obsoleto |
| [0002](03-architecture/adr/ADR-0002-sem-rag-no-mvp.md) | Sem RAG | válido |
| [0003](03-architecture/adr/ADR-0003-saida-estruturada-citavel.md) | Saída estruturada citável | ⚠️ substituído por 0009 |
| [0004](03-architecture/adr/ADR-0004-verificacao-em-camadas.md) | Verificação em camadas | ⚠️ migrou para build-time |
| [0005](03-architecture/adr/ADR-0005-sem-chain-of-thought-como-dado.md) | Sem chain-of-thought como dado | válido |
| [0006](03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md) | **Aplicação estática, sem LLM em runtime** | fundadora da V2 |
| [0007](03-architecture/adr/ADR-0007-gabarito-no-cliente.md) | Gabarito visível no cliente, aceito | nova |
| [0008](03-architecture/adr/ADR-0008-vocabulario-controlado-de-hipoteses.md) | Vocabulário controlado com autocomplete | nova |
| [0009](03-architecture/adr/ADR-0009-justificativa-por-selecao-de-evidencias.md) | Justificativa por seleção de evidências | nova |
| [0010](03-architecture/adr/ADR-0010-perfil-sem-nota-agregada.md) | Perfil de decisão, sem nota agregada | nova |
| [0011](03-architecture/adr/ADR-0011-shadcn-ui-como-design-system.md) | **shadcn/ui como sistema de componentes oficial** | nova |

**04-ux** — [fluxo e telas](04-ux/ux-flow.md) ·
[design system — fundações](04-ux/design-system.md) ·
[design system — componentes](04-ux/design-system-components.md) ·
[**design system — decisões operacionais**](design-system/README.md)

**05-roadmap** — [escopo do MVP](05-roadmap/mvp-scope.md) · [roadmap](05-roadmap/roadmap.md)

**06-quality** — [estratégia de testes](06-quality/test-strategy.md) ·
[**protocolo de revisão de conteúdo**](06-quality/content-review-protocol.md) ·
[suíte de avaliação de IA](06-quality/ai-eval-suite.md) *(obsoleto)*

## Convenções

Toda afirmação clínica ou empírica é rotulada `[EVIDÊNCIA]`, `[BOA PRÁTICA]`, `[HIPÓTESE]` ou
`[OPINIÃO]`; as duas primeiras exigem URL. Documentos obsoletos são **preservados** com aviso no
topo — o histórico de decisões abandonadas é parte do valor acadêmico do projeto.
