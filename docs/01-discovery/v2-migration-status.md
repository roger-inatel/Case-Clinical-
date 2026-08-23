# Discovery V2 — Mapa de Migração

Decisão que motiva esta revisão: **nenhuma chamada a LLM em runtime**. A aplicação é estática;
toda avaliação é determinística; a IA passa a ser exclusivamente ferramenta de desenvolvimento.

Legenda: `KEPT` inalterado · `MODIFIED` sobrevive com ajuste · `REPLACED` substituído por outro
artefato · `OBSOLETE` não vale mais, mantido como registro histórico · `NEW` criado na V2.

---

## 1. O deslocamento do problema central

Este é o resumo honesto da V2 em uma linha:

> **V1:** o problema difícil era *conter uma IA probabilística no caminho crítico*.
> **V2:** o problema difícil é *autorar conteúdo clínico e pedagógico de qualidade*.

A infraestrutura ficou trivial. O trabalho não diminuiu — **mudou de lugar**. Tudo que a V1 fazia em
runtime (verificar citação, checar cobertura de red flag, calibrar incerteza) agora precisa ser
feito **na autoria e na revisão**, uma vez por caso, por gente. Quem ler a V2 como "ficou mais
fácil" vai produzir 8 casos ruins.

## 2. O que sobrevive intacto — e por quê

O núcleo pedagógico da V1 não dependia de LLM. Ele foi desenhado sobre evidência de educação
médica, não sobre capacidade de modelo:

| Decisão da V1 | Status | Observação |
|---|---|---|
| Inversão de papel: o estudante afirma, o sistema testa | `KEPT` | Agora quem "testa" é a lógica determinística sobre uma chave autoral |
| Hipótese capturada **antes** dos exames, com revisão depois | `KEPT` | Sinal anti-fechamento-prematuro; sempre foi determinístico |
| Apresentação progressiva (serial-cue) com "ver caso completo" | `KEPT` | Ganha importância: agora é o principal mecanismo de raciocínio |
| Separação `presentation` × chave de avaliação | `MODIFIED` | Sobrevive como conceito, mas **não é mais segredo garantido** (ver ADR-0007) |
| Distrator intencional marcado no caso | `KEPT` | Continua sendo o mecanismo pedagógico central |
| Achados com `id` citável | `KEPT` e **promovido** | Na V1 servia para verificar a IA; na V2 é a chave da avaliação por seleção de evidências |
| `dados_insuficientes` como veredito de primeira classe | `KEPT` | Requisito explícito do briefing V2 (§16) |
| Escala de compatibilidade em 6 níveis, sem nota agregada | `KEPT` | Agora definida pelo autor por hipótese |
| Regras de sourcing e rotulagem de evidência | `KEPT` | Ficam **mais** importantes: não há verificação em runtime |
| Disciplina de ADR | `KEPT` | — |
| Separação dado × interpretação na UI | `MODIFIED` | Vira dado do caso × **comentário do autor** (não mais "da IA") |

## 3. O que ficou obsoleto

| Artefato V1 | Status | Substituto |
|---|---|---|
| [ADR-0001 — proxy de chave](../03-architecture/adr/ADR-0001-proxy-de-chave.md) | `OBSOLETE` | [ADR-0006](../03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md) — app estática, zero servidor |
| [ai-strategy.md](../03-architecture/ai-strategy.md) (pipeline de runtime, prompt, schema de resposta, crítico condicional) | `OBSOLETE` | [authoring-pipeline.md](../03-architecture/authoring-pipeline.md) — a IA migra para build-time |
| [ADR-0003 — saída estruturada citável](../03-architecture/adr/ADR-0003-saida-estruturada-citavel.md) | `REPLACED` | O princípio "evidência precisa ser citável e ancorada" sobrevive em [ADR-0009](../03-architecture/adr/ADR-0009-justificativa-por-selecao-de-evidencias.md) — mas agora a citação é **autoral**, feita uma vez, e revisada por humano |
| [ADR-0004 — verificação em camadas / crítico condicional](../03-architecture/adr/ADR-0004-verificacao-em-camadas.md) | `MODIFIED` | Camadas migram inteiras para **CI + revisão**: o que era verificação de resposta vira validação de caso ([test-strategy](../06-quality/test-strategy.md)) e red team de conteúdo |
| [ai-eval-suite.md](../06-quality/ai-eval-suite.md) (12 arquétipos, sycophancy, groundedness, custo por rodada) | `OBSOLETE` | [content-review-protocol.md](../06-quality/content-review-protocol.md) |
| [grounding-strategies-comparison.md](../research/grounding-strategies-comparison.md) (opções A–F) | `OBSOLETE` como decisão, `KEPT` como registro | A conclusão da V1 já era "a rubrica do caso é a base de conhecimento". A V2 leva isso ao limite: **só existe a rubrica** |
| Agente `clinical-evaluator-designer` | `REPLACED` | Não há prompt de runtime para projetar. As partes úteis (taxonomia de compatibilidade, disciplina de citação) migram para `case-authoring` e `educational-design` |
| Métricas de avaliação da V1 (taxa de ancoragem, Δ sycophancy, custo/latência) | `OBSOLETE` | Novas métricas em [content-review-protocol.md](../06-quality/content-review-protocol.md): densidade de defeitos por caso, achados do red team, concordância entre revisores |
| Riscos R1, R2, R5, R6, R7, R10 (alucinação, sycophancy, injection, chave, custo, indisponibilidade) | `OBSOLETE` | **Eliminados por construção.** É o maior ganho da V2 |

## 4. O que muda de forma substantiva

| Tema | V1 | V2 |
|---|---|---|
| Justificativa do estudante | Texto livre analisado por LLM | **Seleção de evidências** (achados que sustentam/contradizem) + texto livre não avaliado, usado para autoexplicação ([ADR-0009](../03-architecture/adr/ADR-0009-justificativa-por-selecao-de-evidencias.md)) |
| Entrada da hipótese | Texto livre | **Vocabulário controlado com autocomplete** ([ADR-0008](../03-architecture/adr/ADR-0008-vocabulario-controlado-de-hipoteses.md)) |
| Estrutura do caso | Etapas + rubrica | Etapas + **pontos de decisão** no formato *key features* ([evaluation-engine.md](../03-architecture/evaluation-engine.md)) |
| Sigilo do gabarito | Garantido pelo servidor | **Não garantido** — carregamento tardio como mitigação de spoiler ([ADR-0007](../03-architecture/adr/ADR-0007-gabarito-no-cliente.md)) |
| Onde mora a qualidade | Verificação em runtime | **Autoria + red team + revisão humana** |
| Papel da IA | Componente do produto | Ferramenta de desenvolvimento ([authoring-pipeline.md](../03-architecture/authoring-pipeline.md)) |
| Contribuição acadêmica | Arquitetura de contenção de LLM | **Pipeline de autoria assistida por IA com revisão humana** — e ele é mensurável |
| Deploy | Vercel com função serverless | **Export estático** — qualquer host, inclusive GitHub Pages |

## 5. O que é novo na V2

| Artefato | Por quê |
|---|---|
| [research/assessment-formats.md](../research/assessment-formats.md) | A V1 não precisava: o LLM avaliava. Agora precisamos de **formatos de avaliação validados** — *key features*, script concordance, representação do problema |
| [03-architecture/evaluation-engine.md](../03-architecture/evaluation-engine.md) | O motor determinístico é o novo coração do sistema |
| [03-architecture/authoring-pipeline.md](../03-architecture/authoring-pipeline.md) | Pesquisa → proposta → red team → revisão humana → JSON aprovado |
| [06-quality/content-review-protocol.md](../06-quality/content-review-protocol.md) | Substitui a suíte adversarial de IA |
| Agente `educational-design` | Pedido no briefing V2 §8; na V1 estava diluído entre UX e case designer |
| ADRs 0006–0010 | Ver `docs/03-architecture/adr/` |
| Vocabulário controlado de diagnósticos (`content/vocabulary/`) | Novo artefato de conteúdo, exigido pela entrada determinística |

## 6. Riscos que **surgem** com a V2

Nenhuma arquitetura é de graça. O que a V2 ganha em confiabilidade de runtime, ela paga aqui:

| # | Risco novo | Por quê agora |
|---|---|---|
| N1 | **Gargalo e qualidade de autoria** | Toda a qualidade é antecipada para a autoria. Um caso ruim não tem rede de proteção em runtime |
| N2 | **Gabarito visível no cliente** | Sem servidor, o JSON chega ao navegador |
| N3 | **Feedback engessado / repetitivo** | Texto pré-escrito percebido como genérico depois de 2–3 casos |
| N4 | **Espaço de hipóteses fechado** | O estudante pensa em algo válido que o autor não previu, e o sistema não sabe responder |
| N5 | **Rigidez do vocabulário controlado** | Sinônimo faltando trava a interação |

Detalhamento e mitigação em [risk-register.md](risk-register.md).

## 7. Arquivos por status

```
KEPT (sem alteração de conteúdo)
  research/clinical-reasoning-education.md      ← ganha importância
  research/README.md
  research/sources.md                            ← ampliado, não reescrito
  .claude/skills/medical-sourcing/SKILL.md
  .claude/skills/adr/SKILL.md
  .claude/agents/medical-research.md

MODIFIED (reescritos nesta revisão, com seção "Mudanças desde a V1")
  CLAUDE.md · docs/README.md
  00-project/charter.md · 00-project/academic-frame.md
  01-discovery/product-understanding.md · open-questions.md · risk-register.md
  03-architecture/technical-architecture.md · data-model.md · agent-architecture.md
  04-ux/ux-flow.md
  05-roadmap/mvp-scope.md · roadmap.md
  06-quality/test-strategy.md
  .claude/agents/{ux-designer,architecture-guardian,quality-engineer}.md
  .claude/agents/case-designer.md → case-authoring.md
  .claude/agents/ai-safety-critic.md → medical-red-team.md

OBSOLETE (preservados com aviso no topo, como registro histórico)
  03-architecture/ai-strategy.md
  03-architecture/adr/ADR-0001-proxy-de-chave.md
  03-architecture/adr/ADR-0003-saida-estruturada-citavel.md
  03-architecture/adr/ADR-0004-verificacao-em-camadas.md
  06-quality/ai-eval-suite.md
  research/grounding-strategies-comparison.md

REMOVED
  .claude/agents/clinical-evaluator-designer.md   (conteúdo migrado; ver §3)

NEW
  01-discovery/v2-migration-status.md (este arquivo)
  03-architecture/evaluation-engine.md · authoring-pipeline.md
  03-architecture/adr/ADR-0006 … ADR-0010
  research/assessment-formats.md
  06-quality/content-review-protocol.md
  .claude/agents/educational-design.md
```

> **Nota:** o projeto ainda não é um repositório Git. Como esta revisão reescreve ~15 arquivos,
> vale rodar `git init` e commitar a V1 **antes** de continuar — a rastreabilidade de decisões é
> parte do valor acadêmico, e sem histórico ela depende de arquivos como este.
