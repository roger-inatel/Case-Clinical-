# PROJECT STATUS — Case Clinical AI

Memória operacional da execução. Atualizado a cada entrega.

**Última atualização:** 2026-08-23 · **Fase atual:** G2 (Padronização visual em shadcn/ui) — concluída

---

## Estado

| | |
|---|---|
| Stack | Next.js 15 · React 19 · TypeScript strict · Tailwind 3 · **shadcn/ui** · Zod · Vitest |
| Design system | **shadcn/ui** ([ADR-0011](03-architecture/adr/ADR-0011-shadcn-ui-como-design-system.md)) — 11 primitivas em `src/ui/shadcn/` |
| Dependências de runtime | **14** — 4 de framework/schema + 10 do design system. Lista **fechada** por teste |
| Dependências de teste | jsdom + @testing-library (dev only) |
| Build | `output: 'export'` — **12 rotas estáticas**, zero rotas de API |
| Testes | **217 passando** (21 conteúdo · 25 motor · 7 fluxo · 21 busca · 15 combobox · 11 runner · 12 resultado · 20 microcópia · 21 design tokens · 58 contraste · 6 dependências) |
| Typecheck | limpo |
| QA visual | Chrome real: 1440 · 1280 · 430 · 390 · 200% de zoom, claro e escuro — **zero violação axe, zero overflow, zero erro de console** |
| Casos publicados | **2** — `cardio-001` (cardiologia, intermediário) e `pneumo-001` (pneumologia, fácil). Os dois em `pending_human_review` |
| IA em runtime | **nenhuma** — verificado por teste, não por disciplina |

## Fases

| Fase | Estado |
|---|---|
| A — Foundation | ✅ stack instalada, conteúdo movido para `content/` |
| B — Domain | ✅ schemas Zod, registry com descoberta automática, tipos |
| C — Simulation Engine | ✅ `src/domain/simulation.ts` — puro, sem React |
| D — UI | ✅ home, catálogo, especialidade, overview, runner, resultado |
| E — Piloto | ✅ fluxo completo validado por teste de domínio |
| F — Qualidade | ✅ typecheck + 53 testes + build de produção |
| G — Polimento | ✅ design system padronizado, contraste medido e corrigido, alvos de toque, estados vazios |
| G2 — Padronização visual | ✅ shadcn/ui como sistema oficial; primitivas próprias substituídas; identidade *Medical Academic*; QA visual em navegador real |
| H — Expansão | ⏸ depois de G2 |

## Arquitetura entregue

```
Case JSON  →  registry (fs, build)  →  StudentCaseView  →  CaseRunner (client)
                                                              ↓
                                              simulation.ts (puro)
                                                              ↓
                                              evaluate.ts (puro) → ResultView
```

- `src/domain/` e `src/evaluation/` são **puros**: sem React, sem I/O, sem relógio interno.
  É o que permite testá-los por exaustão e o que mantém reversível a decisão de *onde* a avaliação roda.
- Nenhum conteúdo médico dentro de componentes React. Tudo vem do JSON.

## Objetivo técnico: adicionar um caso

Estado atual — **funciona**:

1. criar `content/cases/<especialidade>/<id>.case.json` e `<id>.key.json`;
2. adicionar conceitos novos em `content/vocabulary/diagnoses.json`, se houver;
3. `npm test` valida schema, integridade, regra temporal e regressão B1;
4. o caso aparece sozinho no catálogo — **nenhum código de UI muda**.

O `registry` varre `content/cases/**` por `*.case.json`. Não existe lista manual.

## Decisões tomadas na implementação

| # | Decisão | Justificativa |
|---|---|---|
| **D-IMPL-01** | O veredito **não** é rebaixado por red flag ignorado; o perigo é sinalizado em campo próprio (`criticalRedFlagMissed`), exibido **acima** do veredito | `evaluation-engine.md` §9 previa rebaixar. Implementar isso diria "parcialmente compatível" a quem **acertou a hipótese** e apenas não marcou um achado — conflate duas coisas distintas e ensina errado. **Corrigir o documento** |
| **D-IMPL-02** | Sem shadcn/ui e sem Radix. Primitivas escritas à mão | Os componentes centrais são de domínio e seriam reescritos; shadcn traria Radix + CVA + tailwind-merge para primitivas triviais. Desvia de `design-system.md` §8 — **atualizar o documento** |
| **D-IMPL-03** | A chave é entregue ao cliente como prop do componente servidor, não por `fetch` tardio | ADR-0007 já aceita que o gabarito chega ao navegador. O `fetch` era só anti-spoiler acidental e custaria um estado assíncrono no caminho crítico. Fronteira caso × chave preservada no tipo (`StudentCaseView` não carrega a chave — há teste) |
| **D-IMPL-04** | Casos com `reviewStatus: pending_human_review` aparecem no catálogo | Sem isso o MVP não roda. **Nenhum revisor foi inventado**: os campos `reviewedBy`/`redTeamPassedAt` continuam `null` |

## Problemas conhecidos

| Prioridade | Item |
|---|---|
| **P2** | Falta validação em **navegador real**: leitor de tela e zoom 200%. Estrutura, contraste e alvos de toque já verificados por teste/medição |
| **P2** | `dp1` permite confirmar com 1 qualificador; não há mínimo declarado no schema |
| **P2** | Seletor de evidências com 17 itens no mobile — mitigado pela barra fixa, **não verificado em dispositivo** |
| **P3** | Seis achados clínicos do red team seguem abertos (R1, R4, R13, R14, R17, R21) |
| **P3** | 11 questões clínicas (H1–H11) sem resposta de revisor |
| **P3** | Simplificações S1–S3 não implementadas, economia `NOT MEASURED` |

Nenhum P0.

## Backlog imediato (Fase G)

1. ~~Testes de componente do `DiagnosisCombobox`~~ ✅ **15 testes** — teclado,
   `aria-activedescendant`, busca por sigla, termo fora do vocabulário, limite, remoção.
2. ~~Barra de ação fixa no rodapé no mobile~~ ✅ `ActionBar` nos 5 pontos de decisão,
   com `safe-area-inset`.
3. ~~Página 404 própria~~ ✅ neutra, não vermelha (erro de sistema não é perigo clínico).
4. ~~Testes de interface do `CaseRunner` e do `ResultView`~~ ✅ **23 testes** — revelação
   progressiva, trava de resposta, exames determinando o que se vê, contradiz antes de sustenta,
   aviso de perigo ignorado, perfil sem nota.
5. ~~Revisão de microcópia~~ ✅ **20 testes** — as regras do design system viraram varredura
   automática sobre código **e** conteúdo (`tests/quality/microcopy.test.ts`).
6. Auditoria de acessibilidade em navegador real: leitor de tela, zoom 200%, foco ponta a ponta.
   Estrutura já verificada por teste (`aria-current`, `fieldset`/`legend`, `h1` único, rótulos).

**Achado da Fase G:** o teste de "seguir sem solicitar exames" revelou que a etapa 4 nunca ficava
vazia (a nota de reavaliação é incondicional), então o aviso de "nenhum resultado" nunca aparecia.
Corrigido: o aviso agora depende de haver achado condicional não revelado, não de a etapa estar vazia.

## Critérios de conclusão do MVP

| Critério | Estado |
|---|---|
| Estudante entra, escolhe área e caso | ✅ |
| Inicia simulação | ✅ |
| Recebe informações progressivamente | ✅ |
| Responde aos pontos de decisão | ✅ |
| Recebe avaliação determinística | ✅ |
| Recebe feedback educacional | ✅ |
| Visualiza resultado | ✅ |
| Completa reflexão | ✅ |
| Funciona em desktop e mobile | ⏳ responsivo revisado, sem overflow ou largura fixa; **não verificado em dispositivo físico** |
| Aplicação builda | ✅ |
| Casos validados por schema | ✅ |
| Sem dependência de LLM em runtime | ✅ |
| Adicionar um caso é simples | ✅ |

---

## G2 — Padronização visual (2026-08-23)

Decisão do responsável pelo produto: a aparência era **baseline funcional**, não referência final.
A decisão anterior de manter primitivas próprias foi **revogada**. Registro em
[ADR-0011](03-architecture/adr/ADR-0011-shadcn-ui-como-design-system.md); inventário
componente a componente em [design-system/README.md](design-system/README.md).

**O que mudou**

- shadcn/ui é o sistema oficial. 11 primitivas em `src/ui/shadcn/`, adaptadas **uma vez** e por
  regra do produto — `Button` sem variante `destructive` (R2), todo `size` com ≥ 44px (A3),
  `Alert`/`Badge` com `danger` no lugar de `destructive`.
- `InlineNotice` e as primitivas próprias de `Button`/`Badge`/`Card`/`Separator` deletadas.
  `SelectableOption` virou quatro formas explícitas sobre Radix.
- Tokens reescritos: contrato shadcn + camada de domínio (`--paper`, `--commentary`,
  `--evidence-*`, `--verdict-*`, `--danger-*`). Os antigos `--surface-*`/`--text-*` não existem.
- Tema **restrito**: `fontSize`, `fontWeight`, `boxShadow` e `borderRadius` **substituem** o tema do
  Tailwind. A classe fora da escala não é gerada.
- Identidade *Medical Academic*: azul-petróleo como única cor de ação, título de página serifado,
  versalete de seção, papel sem elevação para o registro clínico.

**O que NÃO mudou** — e era o risco principal: `content/`, `src/domain/`, `src/evaluation/`, o
schema, as regras de pontuação, a lógica B1 e o contrato ARIA do `DiagnosisCombobox`. Os 15 testes
de acessibilidade do combobox passam sem alteração.

**Defeitos encontrados no navegador** (nenhum aparecia em teste unitário) e corrigidos: anel de foco
acendendo no clique de mouse (`focus-within` → `has-[:focus-visible]`); ícone de busca centrado no
bloco em vez do campo; análise nascendo fora da tela por rolagem preservada; célula vazia da grade
de sinais vitais pintada com a cor do filete.

**Três tokens reprovados na medição de contraste e corrigidos:** `--input` (1,83 → 3,17),
`--commentary-rule` (2,11 → 3,34), `--danger-rule` (1,60 → 3,33) — todos pela regra 1.4.11.

**Guardas novas.** `tests/quality/contrast.test.ts` recalcula todos os pares nos dois temas.
`tests/quality/dependencies.test.ts` fecha a lista de dependências de runtime e implementa o
critério de release do CLAUDE.md §10.1, que até então era só texto.

## Segundo caso — `pneumo-001` (2026-08-23)

A área de Pneumologia já existia em `content/specialties.json` desde o Discovery; ela não aparecia
porque `getSpecialtiesWithCases()` esconde área sem caso publicado. O que faltava era o caso — e o
plano já dizia qual: **P1** de [mvp-scope.md §2](05-roadmap/mvp-scope.md).

**O que entrou**

- `content/cases/pneumologia/pneumo-001.case.json` — 4 etapas, 22 achados, 5 pontos de decisão,
  7 exames disponíveis, 3 distratores em camadas diferentes.
- `content/cases/pneumologia/pneumo-001.key.json` — matriz de evidência, 2 red flags, 3 armadilhas,
  2 diferenciais a considerar (TEP como `cantMiss`).
- 5 conceitos novos no vocabulário compartilhado (`dx.pac`, `dx.bronquite-aguda`, `dx.influenza`,
  `dx.tuberculose-pulmonar`, `dx.ic-descompensada`), revisão 3.
- **Nenhuma linha de código de produto mudou.** O objetivo técnico do projeto — "adicionar um caso
  deve ser adicionar um arquivo" — se sustentou na prática: o caso e a área apareceram sozinhos.

**O desenho que importa**

`dx.dados-insuficientes` tem veredito **invertido** por `requiresFindings`: quem não pediu a imagem e
respondeu "não há dados suficientes" recebe `compativel`; quem pediu a imagem e mesmo assim não
concluiu recebe `pouco_compativel`. É a mesma correção que o achado B1 forçou no C1 — o sistema não
premia quem afirma além dos dados nem pune quem reconhece o próprio limite.

**Verificado**

232 testes (36 de conteúdo, agora rodando sobre os dois casos). Percurso completo dirigido em Chrome
contra o build exportado, cobrindo os seis caminhos que mudam o veredito, além de axe/overflow em
390px — tudo limpo. Registro em
[reviews/pneumo-001/adversarial-review.md](reviews/pneumo-001/adversarial-review.md).

**Não verificado, e é o que bloqueia `approved`:** red team independente e revisão humana. A revisão
adversarial foi feita por quem escreveu o caso, o que viola a separação do CLAUDE.md §6 e vale menos.
`redTeamPassedAt` continua `null` nos dois casos do catálogo.

**Achado de teste que o segundo caso expôs.** A verificação de regressão B1 tinha vocabulário de
`cardio-001` embutido (`f16`, `f17`, "troponina") aplicado a *todo* caso. Passou a ser endereçada por
caso, e ganhou uma verificação nova no ramo `verdictWhenMissing` — que é exibido justamente a quem
não obteve o achado e, portanto, não pode afirmá-lo.
