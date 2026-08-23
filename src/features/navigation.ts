/**
 * Navegação após um avanço — rolagem e foco, sempre juntos.
 *
 * Especificação: docs/04-ux/navegacao-e-foco.md
 *
 * As três regras que este módulo existe para cumprir:
 *  N1 — toda ação de avanço termina com a viewport no início do que há de novo;
 *  N2 — onde a viewport para, o foco também para. Rolar sem mover o foco deixa
 *       quem usa teclado preso num elemento que acabou de sair do DOM, e quem
 *       usa leitor de tela sem saber que algo mudou;
 *  N3 — quem navega é a AÇÃO do estudante, nunca um render. Por isso a intenção
 *       é registrada num `useRef` pelo handler, e não derivada de estado.
 */

/** A intenção de navegação registrada por um handler, consumida pelo efeito. */
export type NavIntent =
  | { kind: 'decision-point' }
  | { kind: 'advance-button' }
  | { kind: 'stage'; stageId: string }
  | { kind: 'end-of-stages' };

/**
 * Leva a viewport até `el` e coloca o foco nele.
 *
 * `preventScroll` no foco não é detalhe: sem ele o `focus()` rola por conta
 * própria, ignora o `scroll-margin` da classe `.scroll-anchor` e devolve o alvo
 * para debaixo do cabeçalho fixo.
 */
export function goTo(el: HTMLElement | null, block: ScrollLogicalPosition = 'start'): void {
  if (!el) return;
  // O jsdom não implementa rolagem. O produto não pode quebrar por causa disso.
  if (typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ block, behavior: scrollBehavior(el) });
  }
  el.focus({ preventScroll: true });
}

/**
 * Rolagem suave é permitida — o que se move é o ponto de vista, não o conteúdo,
 * e é isso que informa ao estudante PARA ONDE ele foi. Dois cortes obrigatórios:
 *
 *  - `prefers-reduced-motion` precisa ser verificado aqui, em JS: o argumento
 *    `behavior: 'smooth'` explícito vence o `scroll-behavior: auto !important`
 *    que o globals.css já declara. O CSS sozinho não protege ninguém;
 *  - salto acima de duas alturas de viewport vira instantâneo. Rolagem suave
 *    longa desorienta em vez de orientar.
 */
function scrollBehavior(el: HTMLElement): ScrollBehavior {
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return 'instant';

  const farAway = Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 2;
  return farAway ? 'instant' : 'smooth';
}

/** Alvos nomeados. Os `id` são contrato da especificação — não invente outros. */
export const ANCHOR = {
  decisionPoint: 'ponto-de-decisao',
  advanceButton: 'avancar-etapa',
  endOfStages: 'fim-das-etapas',
  analysisTitle: 'analise-titulo',
  stage: (stageId: string) => `etapa-${stageId}`,
  section: (key: string) => `secao-${key}`,
} as const;

/** Executa uma intenção registrada. Devolve `false` se o alvo não existia. */
export function runIntent(intent: NavIntent): boolean {
  const byId = (id: string) => document.getElementById(id);
  switch (intent.kind) {
    case 'decision-point':
      return found(byId(ANCHOR.decisionPoint), 'start');
    case 'stage':
      return found(byId(ANCHOR.stage(intent.stageId)), 'start');
    // Nada de novo apareceu: rolar o botão para o topo empurraria para fora da
    // tela o registro clínico que o estudante talvez esteja relendo.
    case 'advance-button':
      return found(byId(ANCHOR.advanceButton), 'nearest');
    case 'end-of-stages':
      return found(byId(ANCHOR.endOfStages), 'nearest');
  }
}

function found(el: HTMLElement | null, block: ScrollLogicalPosition): boolean {
  if (!el) return false;
  goTo(el, block);
  return true;
}
