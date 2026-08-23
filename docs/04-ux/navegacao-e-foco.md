# Navegação, rolagem e foco após cada avanço

**Status: ESPECIFICAÇÃO. Nada implementado.** Escopo: comportamento de UI em `src/features/`,
`src/ui/` e `src/app/globals.css`. Não toca domínio, avaliação, schema nem conteúdo.

> **Não exige ADR.** Pelo [CLAUDE.md §8](../../CLAUDE.md), ADR é exigido para dependência nova,
> mudança de schema, mudança nas regras do motor, mudança no que é exibido **como avaliação** ou
> chamada de rede. Nada disso ocorre aqui: muda *onde a tela para* e *onde o foco cai*, não o que é
> dito nem o que é avaliado. Nenhuma dependência nova — `scrollIntoView`, `scroll-margin-top` e
> `matchMedia` são plataforma.

---

## 1. O defeito

> "quando clica em continuar o site não redireciona para a pergunta ou próximo passo" — relato do
> usuário.

O diagnóstico é literal. Em quatro dos cinco momentos de avanço, o conteúdo novo é **inserido acima
do botão que o revelou**. O botão desce, a viewport não se move, e o estudante fica olhando para o
mesmo pixel enquanto a informação que ele pediu nasceu fora do campo de visão — ou pior, nasceu no
lugar onde ele estava olhando e empurrou o resto para baixo, o que dá a sensação de que *nada*
aconteceu.

Isso reprova dois dos cinco critérios de avaliação de tela do produto: "o estudante sabe o que fazer
sem instrução?" e "um estudante cansado leria o feedback até o fim?". Um estudante cansado que
clica e não vê nada mudar clica de novo, e depois desiste.

E há um segundo defeito, invisível para quem enxerga: **rolar não move o foco**. Hoje, nenhum dos
cinco momentos move o foco. Quem navega por teclado submete uma resposta e continua com o foco em um
botão que acabou de ser removido do DOM — o navegador devolve o foco para `<body>`, e a próxima
tecla `Tab` recomeça do topo da página, passando pelo cabeçalho, pelo breadcrumb e por tudo o que
ele já leu. Quem usa leitor de tela simplesmente não é informado de que algo mudou.

---

## 2. As três regras

**N1 — Toda ação de avanço termina com a viewport no início do que há de novo para ler.**
Não no botão, não no fim da página, não onde estava. No começo do conteúdo novo.

**N2 — Onde a viewport para, o foco também para.** Sem exceção. Rolagem é para os olhos; foco é
para o teclado e para o leitor de tela. Entregar uma sem a outra é entregar a tela para metade dos
estudantes. ([WCAG 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
— `[BOA PRÁTICA]`)

**N3 — Rolagem e foco são consequência de uma ação do estudante, nunca de um render.**
Restaurar a sessão do `sessionStorage`, re-renderizar por mudança de estado interno ou hidratar não
movem nada. A única exceção deliberada é a montagem da `ResultView` (M4), porque ali a tela inteira
foi substituída.

---

## 3. A tabela dos cinco momentos

`goTo(alvo, block)` é o utilitário único definido em §6. Os `id` são normativos.

| # | Gatilho | Alvo da rolagem | `block` | Alvo do foco (`tabindex="-1"`) | Anúncio |
|---|---|---|---|---|---|
| **M1** | Submete um ponto de decisão e **há outro pendente na mesma etapa** | Cabeçalho do cartão de ponto de decisão — `#ponto-de-decisao` | `start` | O mesmo elemento: `<h2 id="ponto-de-decisao">` cujo nome acessível é **"Ponto de decisão 3 de 5"** | Nenhuma região viva. O foco no `h2` é o anúncio |
| **M2** | Submete o **último** ponto de decisão da etapa | O botão `#avancar-etapa`, **com movimento mínimo** | `nearest` | O próprio botão `#avancar-etapa` | Nenhuma. O botão anuncia a si mesmo |
| **M2b** | Idem M2, **mas a submissão revelou achados na etapa atual** (resposta `test-selection` que destrava `revealedBy` da própria etapa) | Cabeçalho da etapa atual — `#etapa-<stageId>` | `start` | O mesmo `<h2 id="etapa-<stageId>">` | Nenhuma |
| **M3** | Clica em "Avançar para a próxima etapa" | Cabeçalho da etapa recém-revelada — `#etapa-<novoStageId>` | `start` | O mesmo `<h2>` (nome acessível = rótulo da etapa, ex.: "História clínica") | Nenhuma |
| **M4** | Submete o último ponto de decisão do caso → `ResultView` monta | **Topo do documento** (`window.scrollTo({top: 0, behavior: 'instant'})`) — único momento que não usa `scrollIntoView` | — | `<h1 id="analise-titulo">Análise do seu raciocínio</h1>` | Nenhuma. Troca de tela: o `h1` é o anúncio |
| **M5** | Clica em "Continuar" na análise | Título da seção revelada — `#secao-<key>` | `start` | O mesmo `<h2>`, com nome acessível **"O que contradiz sua hipótese (seção 3 de 9)"** | Nenhuma — e o `aria-live="polite"` que hoje envolve **todas** as seções é **removido** (§7) |

Caso residual, fora da tabela porque não é avanço: quando não há mais ponto de decisão nem etapa a
revelar e o caso ainda não está completo, aparece o `Alert` **"Fim das etapas"**. Ele usa
`role="note"`, que **não é anunciado**. Dê a ele `id="fim-das-etapas"` e `tabIndex={-1}` e trate
como M2 (`block: 'nearest'`). Sem isso, o estudante nesse estado fica sem foco e sem aviso.

---

## 4. Por que cada alvo é esse alvo

### M1 — o topo do cartão, não o enunciado

O cartão tem cabeçalho ("Ponto de decisão · 3 de 5"), enunciado, campos e rodapé de trava. Parar no
enunciado esconderia o contador, que é a única coisa na tela que diz **onde no caso o estudante
está** naquele instante. Parar no topo do cartão entrega os dois numa olhada, e mantém a promessa de
que o cartão é uma unidade: ele se recompõe inteiro, no mesmo lugar, com a pergunta seguinte.

**Consistência de posição vence economia de movimento:** role mesmo quando o cartão já está visível.
A pergunta nova aparecer *sempre na mesma altura da tela* é o que ensina o estudante a olhar para lá
sem pensar. Um "às vezes rola, às vezes não" custa mais atenção do que os 200ms de rolagem.

O nome acessível precisa carregar o contador. Hoje o cabeçalho do cartão é um `<div>` com dois
`<p>`; a solução é promover o próprio `<div>` a `<h2>` mantendo os dois filhos como `<span>`:

```jsx
<h2
  id="ponto-de-decisao"
  tabIndex={-1}
  className="scroll-anchor flex items-center justify-between gap-3 rounded-t-lg border-b border-border bg-accent/60 px-4 py-2.5 sm:px-6"
>
  <span className="eyebrow text-accent-foreground">Ponto de decisão</span>
  <span className="text-xs tabular-nums text-muted-foreground">
    {decisionNumber} de {totalDecisions}
  </span>
</h2>
```

Visualmente idêntico. Nome acessível: **"Ponto de decisão 3 de 5"**. E de quebra corrige um defeito
de A5 que já existia: o componente central do produto não tinha heading nenhum.

### M2 — o único momento em que rolar demais é o erro

Aqui **nada de novo apareceu para ler**. O cartão sumiu, o botão de avançar tomou o lugar. Rolar o
botão para o topo da tela empurraria para fora da vista o registro clínico que o estudante talvez
ainda estivesse lendo — e que ele *deveria* reler antes de avançar. Por isso `block: 'nearest'`: se o
botão já está visível, o navegador não rola nada; se não está, rola o mínimo para trazê-lo.

O foco vai para o botão porque ele é a única ação restante na tela, e porque para quem usa leitor de
tela a frase "Avançar para a próxima etapa, botão" é a resposta exata para "e agora?".

### M2b — a exceção que existe por causa do conteúdo, não da UI

`recordAnswer` acrescenta os exames escolhidos a `session.testsRequested`, e o registro clínico
renderiza achados filtrados por `revealedBy ∈ testsRequested`. Se um caso colocar um achado
condicional **na mesma etapa** do ponto de decisão de seleção de exames, submeter injeta texto novo
no documento, acima do cartão — e M2 mandaria o estudante para o botão, passando por cima dele.

Nos 2 casos existentes isso não acontece (em `cardio-001` e `pneumo-001` os `revealedBy` estão todos
na etapa seguinte à do `test-selection`). A regra existe porque conteúdo muda sem que a UI mude, e
porque descobrir isso em produção custa mais do que a linha que a previne:

```ts
const stage = caseView.stages[stageIdx]!;
const revelouAqui =
  answer.type === 'test-selection' &&
  stage.findings.some((f) => f.revealedBy && answer.tests.includes(f.revealedBy));
```

### M3 — a etapa, nunca o ponto de decisão

Este é o momento que o usuário relatou. A etapa nova traz dado clínico; o ponto de decisão da etapa
nova aparece **abaixo** dela. Rolar até o ponto de decisão seria convidar a responder antes de ler —
exatamente o comportamento que o produto existe para combater. O alvo é o cabeçalho da etapa, e o
cartão de decisão fica fora da tela de propósito: o estudante chega nele rolando, isto é, lendo.

Foco no `<h2>` do bloco e não no `<article>` do `DocumentBlock`: focar um contêiner grande faz
alguns leitores de tela despejarem o conteúdo inteiro de uma vez, que é a versão sonora do muro de
texto. O `h2` anuncia "História clínica, título nível 2" e devolve o controle da leitura ao
estudante.

O `scroll-margin-top` do §5 já reserva 1,5rem além das barras fixas, o suficiente para a borda
superior e o `py-4`/`py-5` do bloco de papel continuarem visíveis — o bloco precisa ler como bloco.

### M4 — troca de tela é troca de tela

`ResultView` substitui `CaseRunner` na mesma rota, sem mudança de URL: é uma troca de página que o
navegador não conhece, e por isso ninguém reposiciona o foco por nós. É o padrão clássico de SPA, e
a correção é a clássica: rolar ao topo do documento (não a um elemento — o breadcrumb e o
`PageHeader` fazem parte do "você chegou em outro lugar") e mover o foco para o `h1`.

`behavior: 'instant'`, como já está. Rolagem suave de 3.000px não é continuidade, é um borrão.

Focar o `h1` **em toda montagem**, inclusive quando a sessão concluída foi restaurada do
`sessionStorage` num recarregamento: nesse caso o navegador pode restaurar uma posição de rolagem
arbitrária, e cair no `h1` é melhor do que cair no meio da seção 6.

### M5 — o título da seção, e o botão saindo da tela é a intenção

O estudante clicou para ler uma seção. O alvo é o começo dela. Que o botão "Continuar" saia da
viewport quando a seção é longa **não é defeito**: é a mecânica que torna a revelação por etapas
diferente de uma página rolável. Para clicar de novo ele precisa percorrer a seção. Se o botão
ficasse sempre debaixo do polegar, teríamos reconstruído o muro de texto com passos extras — e
desfeito a mitigação do risco N3 registrada em [ux-flow §4](ux-flow.md).

Paridade para quem ouve: o contador "3 de 9 seções" é visível apenas para quem enxerga. O `h2` da
seção recebe um sufixo invisível com a mesma informação:

```jsx
<h2 id={`secao-${key}`} tabIndex={-1} className="scroll-anchor text-xl font-semibold ...">
  {children}
  {position && <span className="sr-only"> (seção {position.current} de {position.total})</span>}
</h2>
```

`SectionHeading` ganha uma prop opcional `position?: { current: number; total: number }`. Só a
`ResultView` passa; as outras telas não mudam.

---

## 5. As barras fixas — resolvido em CSS, não em aritmética de JS

São duas, e uma delas só existe na simulação:

| Barra | Onde | Altura |
|---|---|---|
| Cabeçalho da aplicação | `app/layout.tsx`, `sticky top-0`, `h-14` | 56px |
| Barra de etapa | `CaseRunner`, `sticky top-14` | 44px no desktop; **56px** no pior caso (indicador quebrando em duas linhas em telas estreitas) + 2px de filete |

Rolar "até o topo do elemento" enfia o alvo debaixo delas. A correção **não** é calcular `scrollTo`
com um offset à mão — isso obriga a repetir a conta em cinco lugares e a lembrar de atualizá-la
quando o cabeçalho mudar. É `scroll-margin-top`, que o `scrollIntoView` honra por definição
([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top) — `[BOA PRÁTICA]`).

Em `globals.css`, no bloco de tokens:

```css
:root {
  /* Altura do cabeçalho fixo (h-14 em app/layout.tsx). */
  --app-header-h: 3.5rem;
  /* Quanto do topo está permanentemente coberto. A simulação sobrescreve. */
  --sticky-top: var(--app-header-h);
}
```

Em `@layer components`, ao lado de `.case-prose` e `.eyebrow`:

```css
/* A simulação tem uma SEGUNDA barra fixa (a barra de etapa, `sticky top-14`).
   3.5rem é o pior caso medido: rótulo em duas linhas em tela estreita. */
.with-stage-bar {
  --sticky-top: calc(var(--app-header-h) + 3.5rem);
}

/* Alvo de rolagem. `scroll-margin` só é honrado por scrollIntoView() e por
   navegação por âncora — é por isso que a navegação usa scrollIntoView, e nunca
   window.scrollTo() com uma coordenada calculada à mão.
   O 1.5rem extra deixa respirar a borda superior do bloco de papel. */
.scroll-anchor {
  scroll-margin-top: calc(var(--sticky-top) + 1.5rem);
  scroll-margin-bottom: 4rem;
}
```

`.with-stage-bar` vai no `<div>` raiz do `CaseRunner`. A `ResultView` não recebe (não tem segunda
barra) e herda o valor de `:root`.

`.scroll-anchor` entra em **todos** os alvos da tabela. Uma classe, um lugar para ajustar.

> Por que classes de CSS e não utilitários Tailwind: `scroll-mt-[112px]` é valor arbitrário e a
> escala de espaçamento do tema não tem o degrau necessário — `tests/quality/design-tokens.test.ts`
> reprova o arbitrário, e com razão. Este offset é uma propriedade do *layout da aplicação*, não uma
> decisão de espaçamento por componente. Ele pertence ao CSS, como `.case-prose`.
>
> **Limite conhecido:** o valor é fixo. Se um rótulo de etapa muito longo fizer a barra crescer além
> de 3,5rem, o alvo encosta nela. Medir com `ResizeObserver` resolveria e não vale a complexidade
> agora — [ADR-0006](../03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md) e o princípio 8
> do `CLAUDE.md` valem também para JavaScript de layout. Se acontecer, ajuste o número.

---

## 6. Movimento: rolagem suave conta?

**Conta como movimento, mas não é o movimento que o §6.3 proíbe.** O design system proíbe
*animação de entrada de conteúdo* — conteúdo que desliza, cresce, aparece com fade. A revelação
continua sendo um corte: a seção nova nasce pronta, opaca e imediata. O que se move é o **ponto de
vista**, e mover o ponto de vista de forma contínua é o que informa ao estudante *para onde* ele foi.
Um salto instantâneo de 800px e "nada mudou" são visualmente indistinguíveis. `[OPINIÃO]`

Três limites, todos obrigatórios:

1. **`prefers-reduced-motion: reduce` → sem rolagem suave.** Precisa ser verificado em JS: quando o
   argumento `behavior` é passado explicitamente como `'smooth'`, ele **vence** o
   `scroll-behavior: auto !important` que já existe no bloco de reduced-motion do `globals.css`
   ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) — `[BOA PRÁTICA]`).
   O CSS sozinho não protege ninguém aqui.
2. **Salto maior que duas alturas de viewport → instantâneo.** Rolagem suave longa desorienta em vez
   de orientar, e é justamente o tipo de movimento amplo que
   [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
   trata como risco vestibular. `[BOA PRÁTICA]`
3. **M4 é sempre instantâneo**, por ser troca de tela.

O utilitário — um só, em `src/features/navigation.ts` (é composição de UI, não apresentação pura;
não pertence a `src/ui/`):

```ts
/**
 * Leva a viewport até `el` e coloca o FOCO nele.
 *
 * As duas coisas juntas, sempre: rolar sem mover o foco deixa quem usa teclado
 * ou leitor de tela preso no elemento que acabou de sair do DOM.
 */
export function goTo(el: HTMLElement | null, block: ScrollLogicalPosition = 'start') {
  if (!el) return;
  // jsdom não implementa rolagem. O produto não pode quebrar por isso, e o
  // teste não precisa saber que isto existe.
  if (typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ block, behavior: scrollBehavior(el) });
  }
  // preventScroll: quem decide a parada é o scroll-margin da classe .scroll-anchor,
  // não o scroll implícito do focus().
  el.focus({ preventScroll: true });
}

function scrollBehavior(el: HTMLElement): ScrollBehavior {
  const reduzido =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzido) return 'instant';
  const longe = Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 2;
  return longe ? 'instant' : 'smooth';
}
```

### Onde chamar

Em `useEffect`, **nunca** durante o render, e **nunca** em `useLayoutEffect` (o componente é
pré-renderizado estaticamente; `useLayoutEffect` emite aviso de SSR). O gatilho é uma *intenção*
registrada pelo handler, não um estado derivado — é assim que N3 se sustenta:

```ts
type Nav = { kind: 'dp' | 'advance' | 'stage' | 'end'; stageId?: string };
const nav = useRef<Nav | null>(null);   // ← ref, não state: não provoca render

// Handlers apenas registram a intenção:
//   submit():  nav.current = { kind: 'dp' }        // M1
//              nav.current = { kind: 'advance' }   // M2
//              nav.current = { kind: 'stage', stageId: stage.id }  // M2b
//              nav.current = null                  // caso completo → M4 é da ResultView
//   avançar(): nav.current = { kind: 'stage', stageId: proximaEtapa.id }  // M3

useEffect(() => {
  const alvo = nav.current;
  if (!alvo) return;              // restauração de sessão e re-render não navegam (N3)
  nav.current = null;
  switch (alvo.kind) {
    case 'dp':      return goTo(document.getElementById('ponto-de-decisao'));
    case 'stage':   return goTo(document.getElementById(`etapa-${alvo.stageId}`));
    case 'advance': return goTo(document.getElementById('avancar-etapa'), 'nearest');
    case 'end':     return goTo(document.getElementById('fim-das-etapas'), 'nearest');
  }
});
```

**Armadilha de ordem de hooks:** este `useEffect` precisa ser declarado **antes** do
`if (result) return <ResultView …>` que já existe no `CaseRunner`. Declarado depois, a quantidade de
hooks muda entre renders e o React quebra. Como `nav.current` é zerado quando o caso completa, o
efeito não faz nada no render em que a `ResultView` assume.

`document.getElementById` em vez de um mapa de refs: os `id` já precisam existir (são contrato desta
especificação e servem de âncora), a aplicação é um documento único e estático, e um `Map<stageId,
HTMLElement>` atravessando `CaseRunner → DocumentBlock → DocumentLabel` custa três props para
resolver o mesmo problema. `[OPINIÃO]`

Na `ResultView`, dois efeitos separados:

```ts
// M4 — montagem. Único window.scrollTo do produto.
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.getElementById('analise-titulo')?.focus({ preventScroll: true });
}, []);

// M5 — revelação. `revealed` começa em 1; não navega na montagem.
const primeira = useRef(true);
useEffect(() => {
  if (primeira.current) { primeira.current = false; return; }
  goTo(document.getElementById(`secao-${sections[revealed - 1]!.key}`));
}, [revealed]);
```

---

## 7. Anúncio: por que **nenhum** dos cinco momentos usa região viva

Hoje a `ResultView` envolve o contêiner de todas as seções em `aria-live="polite"`. A intenção era
boa e o efeito é ruim: ao revelar, o leitor de tela lê **a seção inteira recém-inserida de uma vez**
— centenas de palavras despejadas na fila de fala, sem título, sem pausa, sem controle. É o muro de
texto que a revelação por etapas existe para evitar, em áudio. E o estudante não pode navegar por
dentro do que está sendo lido: região viva fala, não posiciona.

Mover o foco resolve as duas coisas de uma vez: anuncia ("O que contradiz sua hipótese, seção 3 de
9, título nível 2") **e** coloca o cursor virtual no começo do texto, para ser lido no ritmo de quem
lê. É por isso que a coluna "anúncio" da tabela está vazia em todas as linhas — não por omissão, mas
porque o foco é o anúncio.

Somar as duas coisas seria pior que escolher uma: quando o foco se move, a maioria dos leitores de
tela **interrompe** a fala em curso. Região viva + foco no mesmo instante produz uma frase cortada
pela metade seguida do nome do elemento focado.

### Emenda ao requisito A8

[design-system.md §7](design-system.md) registra:

> A8 — `aria-live="polite"` ao revelar feedback e ao mudar contagem de resultados do combobox.
> Nunca `assertive`.

Proposta de redação:

> A8 — Toda mudança de conteúdo provocada por uma ação do estudante é anunciada. Quando o foco se
> move para o conteúdo novo (ver [navegacao-e-foco.md](navegacao-e-foco.md)), o foco **é** o
> anúncio, e região viva não se soma a ele. Região viva `polite` fica para as mudanças em que o foco
> **não** se move — hoje, exclusivamente a contagem de sugestões do combobox. Nunca `assertive`.

O `aria-live` do `DiagnosisCombobox` (contagem de sugestões) **fica como está**: ali o foco
permanece no campo de texto por definição, e é exatamente o caso que a região viva foi feita para
atender.

`[OPINIÃO]` — é julgamento de design de interação. A emenda vale para este produto, não é regra
geral de ARIA.

---

## 8. Foco: as regras que sustentam o resto

| Regra | Detalhe |
|---|---|
| `tabIndex={-1}` em todo alvo de foco não interativo | Torna focável por script sem entrar na ordem de `Tab`. Vale para os `h1`/`h2` e para o `Alert` de fim de etapas. **Não** para o botão de avançar, que já é focável |
| `focus({ preventScroll: true })` sempre | Sem isso o `focus()` rola por conta própria, ignorando o `scroll-margin`, e o alvo volta para debaixo do cabeçalho |
| **Nunca** `outline: none` no alvo | A regra `:focus-visible` global do `globals.css` já desenha o anel. `focus-visible` é requisito de release |
| O anel só aparece para quem navega por teclado | Comportamento nativo do `:focus-visible` em elemento focado por script: acende se a última interação foi de teclado, não acende após clique de mouse. Ninguém vai perguntar por que apareceu uma caixa em volta de um título |
| Nada de `autoFocus` | Atributo declarativo dispara na montagem, o que viola N3 |

---

## 9. Microcópia: nada novo

**Não** introduza "Nova etapa revelada", "Etapa 2 desbloqueada", banner, faixa ou aviso temporário.
Três motivos:

1. **É redundante.** O `h2` da etapa diz "História clínica" e o `StepIndicator` já mudou para
   "Etapa 2 de 4". Um terceiro elemento dizendo a mesma coisa é ruído que o estudante aprende a
   ignorar — e, uma vez aprendido a ignorar, ele ignora também o que importa ao lado.
2. **Aviso efêmero é proibido.** [design-system §8.3](design-system.md): `toast` não é instalado
   porque "notificação efêmera é o oposto de feedback que exige leitura". Um banner "nova etapa" com
   as mesmas características entraria pela janela.
3. **O problema não era de informação, era de posição.** O estudante não precisava ser *avisado* de
   que algo apareceu; ele precisava *estar olhando* para o que apareceu.

O único texto novo desta especificação é invisível: o sufixo `sr-only` "(seção 3 de 9)" no título de
seção da análise (§4, M5). Isso não é microcópia nova — é paridade de audio para um contador que já
existe na tela.

Nenhum termo desta especificação toca as regras de linguagem: nada de "correto/errado", nada de IA,
nada de gamificação.

---

## 10. `StepIndicator`: não muda

Avaliei três opções e descarto as três:

| Opção | Veredito |
|---|---|
| Adicionar `aria-live` ao indicador para anunciar "Etapa 2 de 4" | **Não.** Duplica o anúncio do foco no `h2` da etapa e cai na interrupção descrita em §7 |
| Animar a transição da etapa atual (pulso, brilho) | **Não.** É celebração de progresso, isto é, gamificação (R5). O `transition-all` que já existe (150ms, largura) é mudança de estado, não coreografia — está dentro do §6.3 e é desligado pelo bloco de `prefers-reduced-motion` |
| Rolar/focar o indicador quando a etapa muda | **Não.** Ele é `sticky`: nunca sai da tela. Focá-lo tiraria o estudante do conteúdo novo para levá-lo a um contador |

**Alerta de teste:** não mexa no `<ol aria-label="Etapa N de M">`. `tests/features/CaseRunner.test.tsx:179`
faz `getByRole('list', { name: /etapa 1 de 4/i })`. Marcá-lo `aria-hidden` (defensável em tese — são
quatro `<li>` sem texto) reprova o teste. Se algum dia for feito, é mudança combinada com
`quality-engineer`, não silenciosa.

---

## 11. Riscos: quando rolar automaticamente atrapalha

| # | Risco | Mitigação |
|---|---|---|
| **N-1** | **Rolar tira da tela algo que ainda não foi lido.** Único caso real: M2, em que nada novo apareceu e o estudante pode estar relendo o registro clínico | `block: 'nearest'` em M2 — se o botão já está visível, não rola nada. Nunca `start` num alvo que não é conteúdo novo |
| **N-2** | **Achado destravado dentro da própria etapa** passa despercebido porque a viewport foi para o botão | Regra M2b: quando a submissão de exames revela achado da etapa atual, o alvo passa a ser a etapa |
| **N-3** | **Navegar na restauração de sessão.** O `sessionStorage` repõe a sessão num `useEffect`; se a navegação derivasse do estado, recarregar a página jogaria o estudante para um lugar aleatório | Regra N3: só o handler registra a intenção. `nav` é `useRef`, e o efeito sai cedo quando está vazio |
| **N-4** | **Roubo de foco durante digitação.** O ponto de decisão final tem combobox e textarea; foco movido no meio da escrita perde texto e enfurece | Nenhum dos cinco momentos dispara durante preenchimento — todos são pós-submissão. O `inputRef.current?.focus()` que já existe no combobox continua sendo o único movimento de foco durante o preenchimento |
| **N-5** | **Repetição de tecla reativando o botão recém-focado** (M2): segurar `Enter` no "Confirmar" pode disparar o "Avançar" que acabou de receber foco | Aceito. A consequência é limitada: revela a etapa seguinte, não grava resposta nenhuma e não pula ponto de decisão (`canAdvance` exige etapa fechada). Se aparecer em teste com estudante, a correção é mudar o alvo de M2 para o bloco da etapa — **não** é remover o gerenciamento de foco |
| **N-6** | **Rolagem suave longa desorienta** | Corte automático acima de duas alturas de viewport + `prefers-reduced-motion` (§6) |
| **N-7** | **Alvo perto do fim do documento não alcança o topo** — o navegador não rola além do fim. Acontece com a última seção da análise, se curta | Aceito e inofensivo: se ela não chega ao topo é porque está inteira na tela. O `pb-24` do contêiner já dá folga |
| **N-8** | **Barra fixa mais alta que o offset** se um rótulo de etapa muito longo quebrar em três linhas | Conhecido, valor fixo em `--sticky-top` (§5). Ajustar o número, não adicionar medição em runtime |
| **N-9** | **Foco em heading confunde quem usa mouse** ("apareceu uma caixa no título") | Não acontece: `:focus-visible` não acende após clique de mouse (§8) |

---

## 12. Impacto nos 236 testes

Nenhum teste existente depende de rolagem, foco, `matchMedia` ou `aria-live` — verificado por busca
em `tests/`. Os pontos de atenção são estes, todos verificáveis antes de rodar:

| Onde | O que muda | Por que passa |
|---|---|---|
| `tests/setup.ts` | **Precisa ganhar** `Element.prototype.scrollIntoView = () => {};` ao lado do `window.scrollTo` que já está lá | jsdom não implementa `scrollIntoView`. O `goTo` já se protege com `typeof === 'function'`, então nada quebra sem o stub — mas o stub deixa o caminho real ser exercido em vez de pulado. **Arquivo de `quality-engineer`**: combinar antes de editar |
| `CaseRunner.test.tsx:46` `getByText(/Ponto de decisão/)` | O cabeçalho do cartão vira `<h2>` com dois `<span>` | `getByText` casa contra os nós de texto **diretos** do elemento. O `h2` não tem texto direto; o `<span>` tem. Continua havendo exatamente um resultado |
| `CaseRunner.test.tsx:66` `getByText(/Etapa 2 de 4/)` | — | **Não introduza** nenhum elemento novo contendo a string "Etapa N de M" (região viva, `sr-only` no título da etapa, o que for). Hoje há exatamente uma ocorrência; uma segunda faz o `getByText` lançar por múltiplos resultados. Este é o motivo concreto de §9 e §10 |
| `CaseRunner.test.tsx:179` `getByRole('list', { name: /etapa 1 de 4/i })` | — | O `<ol>` do `StepIndicator` fica intocado (§10) |
| `CaseRunner.test.tsx:192` `getAllByRole('heading', { level: 1 })` | Novo `h2` no cartão de decisão | Conta só nível 1. Sem efeito |
| `ResultView.test.tsx:79` `getByText(/1 de \d+ seções/)` | Sufixo `sr-only` "(seção N de M)" no `h2` | A string do sufixo não contém "seções". Sem colisão. **Se mudar a redação do sufixo, verifique isto** |
| `ResultView.test.tsx` — todos os `getByRole('heading', { name: /…/i })` | Nome acessível ganha " (seção N de M)" no fim | Os matchers são regex parciais e sem `$`. Continuam casando |
| `tests/quality/design-tokens.test.ts` | Classes novas `scroll-anchor`, `with-stage-bar` | Não casam com nenhum dos padrões de cor, radius, espaçamento, sombra ou tipografia. O offset vive no CSS justamente para não virar valor arbitrário |
| `tests/quality/microcopy.test.ts` | Nenhum texto visível novo | — |

---

## 13. Definition of Done

- [ ] `--app-header-h`, `--sticky-top`, `.with-stage-bar` e `.scroll-anchor` em `globals.css`.
- [ ] `src/features/navigation.ts` com `goTo` — e só ele fazendo rolagem no produto, exceto o
      `window.scrollTo` de M4.
- [ ] Os cinco `id` normativos no DOM: `ponto-de-decisao`, `etapa-<stageId>`, `avancar-etapa`,
      `analise-titulo`, `secao-<key>` (+ `fim-das-etapas`).
- [ ] Todo alvo com `.scroll-anchor` e, quando não interativo, `tabIndex={-1}`.
- [ ] O `useEffect` de navegação do `CaseRunner` declarado **acima** do `if (result) return`.
- [ ] `aria-live` removido do contêiner de seções da `ResultView`; o do combobox intacto.
- [ ] A8 emendada em `design-system.md` §7 com a redação de §7 deste documento.
- [ ] Verificação manual, só com teclado, do começo do caso ao fim da análise: em nenhum momento o
      `Tab` recomeça do cabeçalho da página.
- [ ] Verificação com `prefers-reduced-motion: reduce` ativo: nenhuma rolagem suave.
- [ ] Verificação em 360px de largura: o alvo de cada momento nasce abaixo das duas barras fixas.

---

## 14. Rastreabilidade

| Decisão | Origem |
|---|---|
| Foco acompanha a rolagem em todo avanço | [WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), A4 do [design-system §7](design-system.md) |
| Alvo é o conteúdo novo, não o botão | Critério de avaliação de tela 1 e 5 ([ux-designer](../../.claude/agents/ux-designer.md)) |
| M3 para na etapa, não no ponto de decisão | Apresentação progressiva — ler antes de responder ([ux-flow §2](ux-flow.md)) |
| M5 deixa o botão sair da tela | Feedback revelado por etapas com interação ([ux-flow §4](ux-flow.md)) |
| Sem microcópia nova de "etapa revelada" | Proibição de aviso efêmero ([design-system §8.3](design-system.md)) |
| Rolagem suave permitida, cortada em salto longo e sob reduced-motion | [design-system §6.3](design-system.md), [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) |
| Região viva substituída por foco na revelação da análise | Emenda a A8, §7 deste documento |
| Offset das barras fixas em `scroll-margin-top` | [MDN scroll-margin-top](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top) |
| `StepIndicator` inalterado | R5 (sem gamificação) + `tests/features/CaseRunner.test.tsx:179` |
