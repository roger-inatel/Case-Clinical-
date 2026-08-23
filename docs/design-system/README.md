# Design System — decisões

Documento curto e operacional. As fundações (regras R1–R5, racional de cor, acessibilidade) estão em
[../04-ux/design-system.md](../04-ux/design-system.md). A decisão de biblioteca está em
[ADR-0011](../03-architecture/adr/ADR-0011-shadcn-ui-como-design-system.md).

> **Revisão de 2026-08-23.** A versão anterior deste documento decidia *manter as primitivas
> próprias*. Essa decisão foi **revogada** pelo responsável pelo produto: o critério não era custo de
> migração, era resultado visual. O histórico está preservado no ADR-0011 — nada foi apagado.

---

## 1. A regra, em uma linha

> **shadcn/ui é o sistema de componentes oficial.**

```
componente shadcn/ui  →  variante/token do tema  →  componente de domínio
```

Componente próprio existe apenas quando não há equivalente — e ainda assim compõe primitivas
shadcn por dentro. Não existe segunda biblioteca de UI; `tests/quality/dependencies.test.ts`
reprova o build se uma aparecer.

## 2. O que foi instalado

`button` · `card` · `badge` · `input` · `textarea` · `label` · `separator` · `alert` · `checkbox` ·
`radio-group` · `breadcrumb` — em `src/ui/shadcn/`, com `cn()` em `src/ui/cn.ts`.

**Não instalados, com motivo:** `command` e `popover` (o `DiagnosisCombobox` não pode despejar o
vocabulário — ADR-0008 — e o cmdk não tem o caminho de "termo fora da lista"); `progress` (barra
percentual é gamificação — R5); `dialog`, `tooltip`, `toast`, `tabs`, `form` (recusados por razão
pedagógica em [design-system.md §8.3](../04-ux/design-system.md)).

## 3. Inventário — o que aconteceu com cada componente

| Antes | Destino | Agora |
|---|---|---|
| `Button`, `ButtonLink` | **REPLACE / COMPOSE** | shadcn `Button`; `ButtonLink` usa `asChild` + `next/link` |
| `Badge` | **REPLACE** | shadcn `Badge`, variante `destructive` → `danger` |
| `Card` | **REPLACE** | shadcn `Card` |
| `InlineNotice` | **DELETE** | substituído por shadcn `Alert` |
| `Separator` | **REPLACE** | shadcn `Separator` (Radix) |
| `Breadcrumb` | **COMPOSE** | shadcn `Breadcrumb` + rótulo pt-BR + alvo de 44px |
| `SelectableOption` | **COMPOSE** | virou quatro formas explícitas sobre Radix Checkbox/RadioGroup: `OptionPill`, `OptionRow`, `OptionRadioRow`, `OptionToggle` |
| `<textarea>` cru, `<input>` cru | **REPLACE** | shadcn `Textarea`, `Input`, `Label` |
| `DocumentBlock`, `CommentaryBlock` | **KEEP** | não são cartões: são as duas vozes do produto (R1) |
| `StepIndicator` | **KEEP** | progresso por etapas, nunca percentual (R5) |
| `DiagnosisCombobox` | **KEEP + COMPOSE** | lógica e contrato ARIA intactos; apresentação passa a usar `Input`, `Label`, `Button` e superfície de popover |
| `CaseCard`, `EmptyState`, `ActionBar` | **COMPOSE** | shadcn por dentro |
| — | **NOVOS** | `PageHeader`/`SectionHeading` (topo de página e hierarquia de seção), `Bullet` (marcador de lista alinhado) |

`ActionBar` **permanece** como componente de layout do domínio: ela resolve um problema que nenhuma
biblioteca resolve — o botão de submeter do último ponto de decisão fica abaixo de ~17 achados e
sairia da tela no mobile. Fixa no rodapé abaixo de `sm`, no fluxo a partir daí, com
`env(safe-area-inset-bottom)`.

## 4. Tokens

Duas camadas em [`globals.css`](../../src/app/globals.css):

**Contrato shadcn** — `--background` `--foreground` `--card` `--popover` `--primary` `--secondary`
`--muted` `--accent` `--destructive` `--border` `--input` `--ring` `--radius`.

**Domínio** — `--paper` (o registro clínico), `--commentary` (a voz do autor), `--evidence-*`,
`--verdict-*`, `--danger-*`. Regras que não mudam:

- **vermelho = perigo clínico**, nunca "você errou";
- **não existe `--success`** — acabaria aplicado a um veredito;
- eixo de evidência é **teal ↔ laranja**, não verde/vermelho;
- `--destructive` do shadcn existe por contrato, mas **nenhuma variante de botão o usa** (R2).

### Identidade

Azul-petróleo (`--primary`, `196 72% 22%`) como única cor de ação. Neutros frios. Título de página
em **serifada** e títulos de seção em sans — é a distinção que dá a voz de artigo clínico. Versalete
(`.eyebrow`) acima de cada seção. Muito espaço negativo. Sem gradiente, sem vidro, sem neon.

### Tipografia

`tailwind.config.ts` **substitui** a escala (não estende): `xs` 12 · `sm` 14 · `base` 16 ·
`case` 17 (serifada, texto clínico) · `lg` 18 · `xl` 22 · `2xl` 28 · `3xl` 36. Nada acima existe.
Pesos: 400 · 500 · 600 · 700.

### Espaçamento

`0.5 1 1.5 2 2.5 3 3.5 4 5 6 8 10 12 16 20 24 32`. Fora disso o teste reprova.

### Radius

Um token, `--radius: 0.625rem`, e cinco degraus derivados dele (`sm` `md` `lg` `xl` `full`).
`rounded-2xl` e afins **não são gerados**.

### Sombras

Três degraus e só três — `none`, `sm` (cartão), `md` (sobreposição e ênfase). O documento clínico
não tem sombra: é papel, não cartão.

## 5. O design system é verificado por teste

| Suíte | O que impede |
|---|---|
| `tests/quality/design-tokens.test.ts` | cor crua, paleta Tailwind direta, radius/espaçamento/tipografia fora da escala, alvo abaixo de 44px, botão recriado à mão, controle de formulário cru fora de `src/ui/` |
| `tests/quality/contrast.test.ts` | par de tokens abaixo de AA, nos **dois** temas — calculado, não estimado |
| `tests/quality/dependencies.test.ts` | SDK de LLM, segunda biblioteca de UI, dependência de runtime não declarada, Route Handler, middleware, `process.env` |
| `tests/quality/microcopy.test.ts` | linguagem proibida em código **e** conteúdo |

As classes permitidas são **derivadas do tema** dentro do próprio teste. O tema continua sendo a
fonte de verdade; o teste não é uma segunda cópia dela.

## 6. Contraste — medido, não estimado

Todos os pares são calculados em `contrast.test.ts` (WCAG 2.x, luminância relativa), nos dois temas.
A auditoria em navegador real (axe-core, `wcag2a`+`wcag2aa`+`wcag21a`+`wcag21aa`, oito telas)
retorna **zero violação**.

Três tokens foram corrigidos durante esta padronização, porque a medição os reprovou:

| Token | Antes | Depois | Regra |
|---|---|---|---|
| `--input` (borda que identifica campo, caixa e opção) | 1,83:1 | **3,17:1** | 1.4.11 |
| `--commentary-rule` (filete da voz do autor) | 2,11:1 | **3,34:1** | 1.4.11 |
| `--danger-rule` (borda do bloco de perigo) | 1,60:1 | **3,33:1** | 1.4.11 |

## 7. Alvos de toque

- Todo `size` do `Button` tem altura **≥ 44px** — `size` muda densidade horizontal e tipografia,
  nunca o alvo. É verificado por teste.
- Opções, chips e trilha: ≥ 44px.
- **Exceção documentada:** o botão de remover um chip tem 32px. Excede o mínimo AA de 24px
  (WCAG 2.5.8) e o chip inteiro, com 44px, serve de alvo alternativo. Um botão de 44px dentro de um
  chip o deformaria.

## 8. QA visual executado

Chrome real, `1440` · `1280` · `430` · `390` e `720` (equivalente a 200% de zoom em 1440), em todas
as telas e nos cinco pontos de decisão: **zero rolagem horizontal, zero erro de console, zero
violação de acessibilidade**. Tema escuro conferido nas mesmas telas.

Três defeitos encontrados no navegador e corrigidos — nenhum deles aparecia em teste unitário:

1. `focus-within` acendia o anel de foco ao **clicar com o mouse**; passou a `has-[:focus-visible]`;
2. o ícone de busca do combobox se centrava na altura do bloco inteiro, não do campo;
3. a análise nascia fora da tela, porque o navegador preservava a rolagem do último ponto de decisão.

## 9. Renderização estática do runner

A sessão nasce no primeiro render, inclusive no servidor. Consequência: o HTML exportado da
simulação já contém `h1`, a primeira etapa do caso e `aria-current` — antes vinha só um
"carregando". Vale para leitor de tela, para rastreador e para a primeira pintura.
