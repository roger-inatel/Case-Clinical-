# ADR-0011 — shadcn/ui como sistema de componentes oficial

**Status:** aceito
**Data:** 2026-08-23
**Substitui:** a decisão registrada em [docs/design-system/README.md §3](../../design-system/README.md)
("manter as primitivas próprias"), agora revogada pelo responsável pelo produto.

---

## Contexto

A aplicação funcionava e passava nos testes, mas o responsável pelo produto avaliou o resultado
visual como insuficiente: componentes próprios demais, linguagem visual não padronizada, aparência
de "conjunto de componentes funcionais" e não de produto.

O estado anterior era uma camada de primitivas escritas à mão sobre Tailwind — `Button`, `Badge`,
`Card`, `InlineNotice`, `SelectableOption`, `Breadcrumb` — com tokens semânticos próprios
(`--surface-*`, `--text-*`, `--border-strong`). A auditoria feita antes desta decisão havia
concluído que o custo de migrar não se pagava. Duas coisas mudaram esse cálculo:

1. **O critério não era o custo de migração, era o resultado visual.** A avaliação anterior comparou
   dependências e esforço; não comparou o que o estudante vê.
2. **A camada própria só cobria o trivial.** Cada componente novo trazia junto a decisão de como ele
   deveria parecer — e é exatamente esse acúmulo de microdecisões que produz inconsistência.

## Opções

### A. Manter as primitivas próprias e apenas refiná-las

Custo real: zero dependência nova, mas cada componente futuro continua sendo uma decisão visual
aberta. Acessibilidade permanece responsabilidade nossa em cada controle novo (o combobox já custou
15 testes para chegar a um contrato correto). Não resolve o problema levantado — que é justamente a
ausência de uma fundação que decida por nós.

### B. shadcn/ui

Custo real: **10 dependências de runtime** (5 primitivas Radix, `class-variance-authority`, `clsx`,
`tailwind-merge`, `lucide-react`, `tailwindcss-animate`) e um contrato de tokens a respeitar
(`--background`, `--foreground`, `--primary`, …). Em troca: comportamento acessível herdado do Radix
(foco, teclado, ARIA), um vocabulário de variantes que qualquer pessoa que conheça shadcn já lê, e o
componente como **código do repositório** — não uma caixa-preta versionada por terceiros.

Risco assumido: o padrão do shadcn tem aparência reconhecível. Mitigado pela camada de tokens e
pelas adaptações da seção "Consequências".

### C. HeroUI ou outra biblioteca com tema próprio

Custo real: um segundo sistema de tema sobre o nosso, com `framer-motion` no pacote. Descartada —
e a instrução do responsável foi explícita em não comparar bibliotecas de novo.

## Decisão

**shadcn/ui é o sistema de componentes oficial.** Ordem de preferência, sem exceção:

```
componente shadcn/ui  →  variante/token  →  componente de domínio
```

Instalados (11): `button` `card` `badge` `input` `textarea` `label` `separator` `alert`
`checkbox` `radio-group` `breadcrumb`.

**Não instalados, e por quê:**

| Componente | Motivo |
|---|---|
| `command` | O `cmdk` filtra e ordena por conta própria e exibe a lista inteira ao abrir. O `DiagnosisCombobox` **não pode** despejar o vocabulário (ADR-0008) e precisa do caminho "termo fora da lista, registrado assim mesmo". Regra pedagógica, não preferência de API |
| `popover` | Só haveria um uso — o painel do combobox, que é ancorado e de largura fixa. Radix Popover para isso é dependência sem trabalho |
| `progress` | Barra percentual é gamificação (R5). O indicador é de etapas |
| `dialog` `tooltip` `toast` `tabs` `form` | Já recusados em [design-system.md §8.3](../../04-ux/design-system.md), por razão pedagógica. Nada mudou |

**Localização:** `src/ui/shadcn/`, com `cn()` em `src/ui/cn.ts` e o barril público em
`src/ui/index.ts`. Não foi criado `src/components/` — a camada de apresentação do projeto é
`src/ui/`, e a regra de dependência do CLAUDE.md §5 continua valendo intacta.

## Consequências

**Adaptações deliberadas às primitivas** — feitas uma vez, na instalação, e registradas no
cabeçalho de cada arquivo:

- `Button`: variante `destructive` **removida**. Este produto não destrói nada, e uma variante
  vermelha acabaria usada como "resposta errada" — vermelho é perigo clínico (R2). Todo `size`
  tem altura ≥ 44px (A3), o que o padrão não garante.
- `Badge` e `Alert`: `destructive` virou `danger`, com o nome do que significa aqui — red flag e
  diferencial `cantMiss`. O padrão do `Alert` passou a ser **neutro**: aviso de sistema não é
  perigo clínico.
- `Alert`: layout em grade no lugar do ícone em `absolute`, eliminando os deslocamentos mágicos.
- Sombra, radius e tipografia normalizados para o tema restrito — `tailwind.config.ts` **substitui**
  (não estende) `fontSize`, `fontWeight`, `boxShadow` e `borderRadius`, de modo que a classe fora da
  escala simplesmente não existe.

**Contrato de tokens.** `globals.css` passa a declarar as duas camadas lado a lado: o contrato
shadcn e os tokens de domínio (`--paper`, `--commentary`, `--evidence-*`, `--verdict-*`,
`--danger-*`). Os antigos `--surface-*`, `--text-*` e `--border-strong` deixaram de existir.

**O que continua sendo de domínio** — porque não existe equivalente em biblioteca nenhuma:
`DiagnosisCombobox`, `DocumentBlock`, `CommentaryBlock`, `StepIndicator`, `CaseCard`,
`OptionPill/Row/RadioRow/Toggle`, `EmptyState`, `PageHeader`. Todos compõem primitivas shadcn por
dentro onde aplicável.

**Verificação.** `tests/quality/dependencies.test.ts` fecha a lista de dependências de runtime:
uma biblioteca nova quebra o build até que alguém a acrescente à lista — o que obriga a passar por
aqui. `tests/quality/design-tokens.test.ts` deriva as classes permitidas do próprio tema.

**Reversibilidade: alta.** Os componentes são arquivos do repositório, não uma API de terceiro. Sair
do shadcn significa editar `src/ui/shadcn/` e remover dependências — nenhuma reescrita de tela, e
nenhuma linha de `domain/` ou `evaluation/` foi tocada por esta decisão.

**Custo que fica.** Dez dependências a mais no `package.json` e sua superfície de atualização. É o
preço explícito de não decidir, componente a componente, como cada botão deve parecer.
