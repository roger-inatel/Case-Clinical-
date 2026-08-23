# Design System — Fundações

**Status: ESPECIFICAÇÃO. Aguardando aprovação. Nenhum código escrito, nenhuma dependência instalada.**

Base: Next.js + TypeScript + Tailwind + shadcn/ui.
Componentes em [design-system-components.md](design-system-components.md).

---

## 0. As cinco regras que governam tudo

Cada uma deriva de uma decisão registrada no Discovery V2, não de preferência estética. Se algo neste
documento conflitar com elas, **elas vencem**.

| # | Regra | Origem |
|---|---|---|
| **R1** | **A tela tem duas vozes.** Texto do caso e comentário do autor nunca compartilham fundo, tipografia ou rótulo | [ux-flow §1](ux-flow.md) |
| **R2** | **Vermelho significa perigo clínico, nunca "você errou".** Red flag e `cantMiss` monopolizam o vermelho | [ux-flow §7](ux-flow.md) microcópia |
| **R3** | **Cor nunca é o único portador de significado.** Toda relação de evidência leva ícone + rótulo textual | [ux-flow §7](ux-flow.md), critério de acessibilidade |
| **R4** | **`dados_insuficientes` não é estado de erro.** Tem o mesmo peso visual dos outros vereditos | [evaluation-engine §4](../03-architecture/evaluation-engine.md) |
| **R5** | **Zero gamificação.** Sem pontos, barras de progresso percentual, medalhas, placares ou celebração | [ADR-0010](../03-architecture/adr/ADR-0010-perfil-sem-nota-agregada.md) |

**Regra de tamanho:** o sistema é pequeno de propósito. Teto autoimposto: **~40 tokens semânticos,
14 primitivas, 6 componentes de domínio.** Passar disso exige justificativa, como qualquer
dependência nova ([architecture-guardian](../../.claude/agents/architecture-guardian.md)).

---

## 1. Tipografia

### 1.1 Duas famílias — e apenas duas

| Papel | Família | Fallback | Por quê |
|---|---|---|---|
| **Documento clínico** | **Source Serif 4** | Georgia, serif | Serifada desenhada para leitura em tela. É metade da execução da regra R1 |
| **Interface** | **Inter** | system-ui, sans-serif | Sans variável, boa em corpos pequenos e em rótulos |

Carregadas por `next/font/google` (auto-hospedadas, sem requisição a terceiros em runtime —
coerente com a aplicação estática do [ADR-0006](../03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md)).
Inter em quatro pesos (400/500/600/700 — 500 é o peso de rótulo do shadcn/ui), Source Serif 4
em dois (400/600). **Nenhuma terceira família.**

A distinção serif/sans **é funcional**: é como o estudante sabe, num relance, o que o paciente
apresenta e o que o autor comenta. Não é decoração e não pode ser removida por gosto.

### 1.2 Escala

Escala modesta (razão ~1,125–1,2). Nomes semânticos, não tamanhos:

| Token | Tamanho | Altura de linha | Uso |
|---|---|---|---|
| `text-3xl` | 36px | 1.12 | Título de página (≥sm). Um por tela |
| `text-2xl` | 28px | 1.22 | Título de página no mobile; veredito |
| `text-xl` | 22px | 1.30 | Título de seção |
| `text-lg` | 18px | 1.45 | Subtítulo, enunciado de ponto de decisão |
| `text-case` | **17px** | **1.70** | **Texto clínico (serif).** Único token serif |
| `text-base` | 16px | 1.60 | Corpo de interface |
| `text-sm` | 14px | 1.55 | Apoio, metadados |
| `text-xs` | 12px | 1.50 | Versalete, contadores, rótulo de badge |

Os nomes são os do Tailwind/shadcn de propósito: quem conhece o vocabulário lê o código sem
tradução. A escala **substitui** o tema — `text-4xl` e acima não existem, e `text-[...]` arbitrário
é reprovado por teste.

Regras:
- **Nunca abaixo de 12px.** Nem em badge, nem em rodapé, nem em disclaimer.
- **Pesos: 400, 500, 600 e 700.** Sem 300, sem 800, sem itálico para ênfase estrutural.
- **O título de página é serifado; os de seção, não.** É o que dá voz de artigo clínico sem gastar
  mais uma cor ou mais uma borda. A distinção de corpo — caso serifado sobre papel × comentário sans
  sobre superfície tingida — continua intacta, e é ela que R1 protege.
- **`tabular-nums` obrigatório** em sinais vitais e contagens ("3 de 4") — evita salto de largura.
- Ênfase dentro do texto clínico: **nunca negrito**. O caso é documento, não material de estudo
  grifado — grifar já é interpretar, e interpretação é a outra voz.

### 1.3 Medida de leitura

| Contexto | Medida |
|---|---|
| Texto clínico | **62–68ch** |
| Comentário do autor / feedback | 55–60ch |
| Rótulos e enunciados de ponto de decisão | 45–55ch |

Feedback é lido em estado de esforço cognitivo; medida mais curta é deliberada.

---

## 2. Espaçamento

Base 4px (padrão do Tailwind). **Subconjunto restrito** — só estes degraus:

| Token | px | Uso |
|---|---|---|
| `1` | 4 | Ícone ↔ rótulo |
| `2` | 8 | Interno de badge, gap de chips |
| `3` | 12 | Interno de campo |
| `4` | 16 | Padrão de bloco; gutter mobile |
| `5` | 20 | Interno de cartão no mobile |
| `6` | 24 | Entre blocos; gutter ≥sm; interno de cartão |
| `8` | 32 | Entre seções irmãs |
| `10` · `12` | 40 · 48 | Entre etapas do caso |
| `16` · `20` · `24` · `32` | 64 · 80 · 96 · 128 | Ritmo de página e respiro do rodapé |

Meios-degraus (`0.5` `1.5` `2.5` `3.5`) só **dentro** de um componente, para ajuste ótico.

Regras:
- **Ritmo vertical em múltiplos de 8** entre blocos. 4 e 12 só dentro de componentes.
- Separação entre etapas usa **espaço, não linha divisória**. Régua só onde muda a voz (R1).
- Densidade é uma só. Não existe "modo compacto" — leitura clínica não se beneficia dele.

---

## 3. Grid e larguras

**Não há grid de 12 colunas.** A aplicação é um documento com uma coluna. Um grid genérico seria
complexidade sem uso — e convidaria a espalhar cards.

| Token | Valor | Uso |
|---|---|---|
| `max-w-reading` | 68ch (~640px) | Coluna do caso e do feedback |
| `max-w-app` | 46rem (736px) | Contêiner do runner e da análise |
| `max-w-catalog` | 64rem (1024px) | Catálogo, home e visão geral do caso |
| `gutter` | 16px → 24px (≥sm) | Margem lateral |

Layouts multi-coluna existem em **exatamente dois lugares**:

1. **Catálogo:** 1 coluna < 768px, 2 colunas ≥ 768px. Nunca 3 — com 8 casos, três colunas produzem
   uma fileira órfã.
2. **Raciocínio lado a lado** (seu texto × o do autor): empilhado < 1024px, duas colunas ≥ 1024px.
   Empilhado é o padrão; lado a lado é o aprimoramento.

---

## 4. Responsividade

Mobile-first. **Três breakpoints, não cinco:**

| Nome | Largura | O que muda |
|---|---|---|
| base | < 640px | Coluna única; ação principal em barra fixa inferior; etapas em acordeão |
| `sm` | ≥ 640px | Gutter 24px; ação principal volta ao fluxo |
| `md` | ≥ 768px | Catálogo em 2 colunas |
| `lg` | ≥ 1024px | Raciocínio lado a lado; sumário de etapas fixo à esquerda (opcional) |

Comportamentos obrigatórios no mobile:
- **Barra de ação fixa inferior** com o botão de submeter o ponto de decisão, com `safe-area-inset`.
- **Textarea nunca coberta pelo teclado virtual** — o campo rola para a área visível ao receber foco.
- Chips e opções quebram em várias linhas; **nunca rolagem horizontal** de conteúdo textual.
- Tabela de sinais vitais vira lista rótulo/valor abaixo de `sm`.

---

## 5. Cores semânticas

### 5.1 Estratégia de tokens

Duas camadas:

1. **Camada shadcn** (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`…)
   — mantida como vem, para as primitivas funcionarem.
2. **Camada de domínio** (`--surface-*`, `--verdict-*`, `--evidence-*`, `--danger-*`) — nossa, porque
   o vocabulário do shadcn não tem nada equivalente a "veredito de compatibilidade".

**Regra dura:** `--destructive` do shadcn **não** é usado para conteúdo clínico. Ele fica para ações
destrutivas de interface (que este produto praticamente não tem). Perigo clínico usa `--danger-*`.
Misturar os dois faria "excluir rascunho" e "dissecção de aorta" terem a mesma cor.

Valores concretos vivem em `globals.css`, em triplas HSL. Todos os pares foram **calculados** e são
reverificados a cada execução de `tests/quality/contrast.test.ts`, nos dois temas — não são
assumidos aqui como corretos.

### 5.2 Superfícies — a execução da regra R1

| Token | Camada | Uso |
|---|---|---|
| `--background` | contrato shadcn | Fundo da página |
| `--paper` + `--paper-rule` | domínio | **Texto do caso.** Filete fino, **sem sombra**: é o papel |
| `--commentary` + `--commentary-rule` | domínio | **Comentário do autor.** Recuado, filete lateral de 3px |
| `--card` | contrato shadcn | Cartões de catálogo, ponto de decisão, blocos da análise |
| `--popover` | contrato shadcn | Painel de sugestões do combobox |

O registro clínico **não** é um `Card`: `Card` é superfície de interface, com elevação e ação. A
ausência de elevação é o que faz o documento ler como documento antes de qualquer palavra.

O comentário do autor **sempre** carrega borda lateral + rótulo textual. Nunca é só um fundo
levemente diferente — em tela ruim ou luz forte, diferença sutil de cinza desaparece e as duas vozes
se fundem.

### 5.3 Eixo de evidência — azul-esverdeado ↔ laranja

| Token | Cor base | Significado | Ícone obrigatório |
|---|---|---|---|
| `--evidence-support` | teal-700 / teal-400 | Sustenta a hipótese | seta/sinal de adição |
| `--evidence-contradict` | orange-700 / orange-400 | Contradiz a hipótese | seta/sinal de subtração |
| `--evidence-neutral` | slate-600 / slate-400 | Não discrimina | traço horizontal |

Três razões para **não** usar verde/vermelho:

1. **Verde/vermelho lê como certo/errado**, e a microcópia proíbe explicitamente esse enquadramento.
2. **Vermelho está reservado** para perigo clínico (R2).
3. Azul↔laranja é o par mais robusto para as formas comuns de daltonismo — verde/vermelho é o pior.

E ainda assim, por R3: **sempre ícone + rótulo**. Cor é reforço, nunca portador único.

### 5.4 Escala de veredito

| Veredito | Token | Cor base | Tratamento |
|---|---|---|---|
| `muito_compativel` | `--verdict-strong-support` | teal-800 | Faixa sólida |
| `compativel` | `--verdict-support` | teal-700 | Faixa sólida |
| `parcialmente_compativel` | `--verdict-partial` | teal-700 **+** orange-700 | **Faixa dividida** — os dois lados visíveis |
| `pouco_compativel` | `--verdict-weak` | orange-700 | Faixa sólida |
| `incompativel` | `--verdict-none` | orange-800 | Faixa sólida |
| `dados_insuficientes` | `--verdict-insufficient` | **indigo-700** | Faixa sólida, **matiz próprio** |

Duas decisões que carregam significado:

- **`parcialmente_compativel` é a única bicolor.** "Parte dos dados sustenta; outra parte não" é
  literalmente o que a faixa mostra. Uma cor intermediária esconderia a informação.
- **`dados_insuficientes` sai do eixo.** Índigo não é "menos teal" nem "mais laranja" — é outra
  coisa, que é exatamente o que R4 exige. Não é o pior resultado da escala; é um resultado de
  natureza diferente.

### 5.5 Perigo clínico — vermelho reservado

| Token | Cor base | Uso exclusivo |
|---|---|---|
| `--danger` | red-700 / red-400 | Red flag, diferencial `cantMiss` |
| `--danger-surface` | red-50 / red-950 | Fundo de bloco de red flag |

Se vermelho aparecer em qualquer outro lugar da aplicação, é bug de design.

### 5.6 Neutros de interface

Vêm do contrato shadcn: `--foreground` (texto primário) · `--muted-foreground` (apoio e metadados) ·
`--border` (divisória, decorativa) · `--input` (**a borda que identifica campo, caixa e opção** —
cai na regra de contraste de componente, 1.4.11, e é medida em `contrast.test.ts`) ·
`--ring` (foco) · `--accent` (superfície de hover e de opção selecionada).

`--primary` é azul-petróleo e é a **única** cor de ação da interface.

### 5.7 Tema escuro

Pelo `prefers-color-scheme`, sem alternador no MVP (menos superfície, menos estado). Requisitos:
todos os tokens têm par claro/escuro; **nenhuma cor definida só dentro do bloco escuro**; o eixo
teal↔laranja mantém a distinção em ambos; superfícies escuras usam slate-900/800, nunca preto puro.

---

## 6. Estados

### 6.1 Estados de interação

| Estado | Tratamento |
|---|---|
| `default` | — |
| `hover` | Mudança de superfície de 1 degrau. **Nunca** mudança de cor semântica |
| `focus-visible` | **Anel de 2px `--ring` + offset de 2px.** Obrigatório e nunca removido. `focus-within` NÃO serve: acende no clique de mouse |
| `active` | Escurece 1 degrau; sem deslocamento vertical |
| `disabled` | Opacidade 0.5, `cursor: not-allowed`, **`aria-disabled`** em vez de `disabled` quando o motivo precisa ser lido |
| `loading` | Skeleton para conteúdo, spinner só em botão. Sem tela de carregamento — os dados são locais |
| `read-only` | Superfície `--muted`, sem borda de campo, cadeado + rótulo "respondido" |

**`focus-visible` é requisito de release**, não polimento. O combobox e a seleção de evidências são
inteiramente navegáveis por teclado.

### 6.2 Estados do ponto de decisão

Máquina de estados própria — é o componente central do produto:

```
pendente ──▶ em-preenchimento ──▶ submetido (TRAVADO) ──▶ revelado
```

| Estado | Tratamento visual |
|---|---|
| `pendente` | Enunciado visível, campos ativos, botão primário habilitado ao atingir o mínimo |
| `em-preenchimento` | Contador de seleção ("2 de 3"), botão habilita/desabilita |
| `submetido` | **Trava.** Campos viram somente-leitura, resposta do estudante em destaque discreto |
| `revelado` | Comentário do autor aparece **abaixo**, em `--commentary` |

O aviso de que a submissão é irreversível aparece **antes** da primeira submissão do caso, uma vez,
inline — nunca como modal de confirmação a cada ponto.

### 6.3 Movimento

Transições ≤ 150ms, só em opacidade e transform. `prefers-reduced-motion: reduce` desliga tudo
exceto mudança instantânea de estado. **Sem** animação de entrada de conteúdo, sem parallax, sem
confete, sem pulsar. A revelação do feedback é um corte, não uma coreografia.

---

## 7. Acessibilidade — requisitos de release

| # | Requisito | Verificação |
|---|---|---|
| A1 | Contraste **AA**: 4.5:1 texto normal, 3:1 texto ≥18.66px e elementos gráficos | Auditoria por token, antes do merge |
| A2 | **Cor nunca é portador único** de significado (R3) | Revisão de cada componente com evidência/veredito |
| A3 | Alvos de toque **≥ 44×44px** | Botões `lg` no mobile; chips com padding suficiente |
| A4 | **Foco visível** em todo elemento interativo; ordem de foco = ordem visual; e o foco **acompanha** cada avanço, em vez de cair no `<body>` quando o elemento que o tinha sai do DOM ([navegacao-e-foco.md](navegacao-e-foco.md)) | Navegação só por teclado, ponta a ponta |
| A5 | Hierarquia real de headings, sem pular níveis | Um `h1` por página |
| A6 | HTML semântico: `<article>` para o caso, `<blockquote>` para citação, `<fieldset>/<legend>` para grupos | — |
| A7 | Todo campo com `<label>` associado; erro ligado por `aria-describedby` | — |
| A8 | Toda mudança de conteúdo provocada por uma ação do estudante é anunciada. Quando o foco **se move** para o conteúdo novo ([navegacao-e-foco.md](navegacao-e-foco.md)), o foco **é** o anúncio, e região viva não se soma a ele — foco interrompe fala em curso. Região viva `polite` fica para as mudanças em que o foco **não** se move: hoje, exclusivamente a contagem de sugestões do combobox | Nunca `assertive` |
| A9 | Zoom até **200%** sem rolagem horizontal nem perda de conteúdo | — |
| A10 | `prefers-reduced-motion` respeitado | — |
| A11 | Skip link para o conteúdo principal | — |
| A12 | Idioma declarado (`lang="pt-BR"`); termos clínicos sem `abbr` decorativo | — |

**O combobox é o componente de maior risco de acessibilidade do produto.** Recebe critérios próprios
em [design-system-components.md §4](design-system-components.md).

---

## 8. Estratégia shadcn/ui

shadcn é copy-in, não dependência: cada componente instalado é código nosso para manter.
**"Pequeno" significa instalar pouco.**

> Implementado. Decisão em [ADR-0011](../03-architecture/adr/ADR-0011-shadcn-ui-como-design-system.md).

### 8.1 Instalados (11)

`button` · `card` · `badge` · `input` · `textarea` · `label` · `separator` · `alert` · `checkbox` ·
`radio-group` · `breadcrumb`

Diferenças em relação ao plano original, com motivo:

| Componente | O que mudou |
|---|---|
| `command` + `popover` | **Não instalados.** O `cmdk` filtra e ordena sozinho e exibe a lista inteira ao abrir; o combobox **não pode** despejar o vocabulário (ADR-0008) e precisa do caminho "termo fora da lista, registrado assim mesmo". O painel é ancorado e de largura fixa — Radix Popover seria dependência sem trabalho |
| `accordion` | **Não instalado.** A análise revela seção por seção com botão explícito; não há nada a sanfonar |
| `alert` | **Instalado.** Substituiu o `InlineNotice` próprio. Variante padrão neutra; `destructive` virou `danger` |
| `input` · `label` · `breadcrumb` | **Instalados.** Eram HTML cru com classes soltas |
| `toggle-group` | **Não instalado.** As quatro formas de opção compõem Radix Checkbox/RadioGroup diretamente, porque o alvo de toque precisa ser a linha ou a pílula inteira |

### 8.3 **Não** instalar

`dialog`, `sheet`, `dropdown-menu`, `toast`, `tooltip`, `tabs`, `carousel`, `chart`, `progress`,
`slider`, `avatar`, `skeleton` genérico, `form` (+ react-hook-form + zod resolver),
`command`, `popover`, `accordion`, `toggle-group`, `scroll-area`.

Justificativas que importam:
- **`toast`** — notificação efêmera é o oposto de feedback que exige leitura. Se merece ser dito,
  merece ficar na tela.
- **`tooltip`** — conteúdo clínico não pode depender de hover; não existe no toque.
- **`dialog`** — o fluxo é linear; modal interrompe raciocínio.
- **`progress`** — barra percentual é gamificação (R5). Usamos indicador de etapas.
- **`form` + react-hook-form** — três dependências para formulários sem validação assíncrona,
  sem submissão remota e com estado que já vive na sessão. Estado local resolve.

### 8.4 Camada de tokens

`globals.css` define as duas camadas (§5.1). Componentes shadcn são editados **uma vez**, na
instalação, e cada edição fica registrada no cabeçalho do arquivo. Nenhum componente carrega cor
literal; tudo por variável CSS.

As adaptações feitas, todas por regra do produto e não por gosto:

| Componente | Adaptação | Regra |
|---|---|---|
| `Button` | variante `destructive` **removida** | R2 — ela acabaria usada como "resposta errada" |
| `Button` | todo `size` com altura ≥ 44px | A3 |
| `Badge`, `Alert` | `destructive` → `danger`; padrão do `Alert` é **neutro** | R2 — aviso de sistema não é perigo clínico |
| `Alert` | layout em grade no lugar do ícone em `absolute` | remove deslocamentos mágicos |
| todos | sombra, radius e tipografia normalizados ao tema restrito | §1.2, §2, §4 |

---

## 9. O que **não** entra neste Design System

Ícones ilustrativos ou mascote · ilustrações de fundo · gradientes · sombras acima de 1 nível ·
cantos totalmente arredondados (pílula) fora de badges e de chips de seleção múltipla · múltiplas densidades · múltiplos temas
além de claro/escuro · biblioteca de animação · storybook no MVP · design tokens em JSON com build
próprio · qualquer componente sem uso presente em uma tela especificada.

---

## 10. Rastreabilidade das decisões

| Decisão | Origem |
|---|---|
| Duas famílias tipográficas | R1 · [ux-flow §1](ux-flow.md) |
| Eixo teal↔laranja em vez de verde/vermelho | R2, R3 · microcópia "nunca correto/errado" |
| Vermelho reservado a perigo clínico | R2 · red flags e `cantMiss` |
| `dados_insuficientes` com matiz próprio | R4 · [evaluation-engine §4](../03-architecture/evaluation-engine.md) |
| `parcialmente_compativel` bicolor | [evaluation-engine §4](../03-architecture/evaluation-engine.md) |
| Sem `progress` percentual | R5 · [ADR-0010](../03-architecture/adr/ADR-0010-perfil-sem-nota-agregada.md) |
| Sem `toast`, `dialog`, `tooltip` | [ux-flow §4](ux-flow.md) — feedback exige leitura |
| Estado `submetido (travado)` | [ux-flow §2](ux-flow.md) — sinal de revisão de hipótese |
| Sem alternador de tema | superfície mínima |
