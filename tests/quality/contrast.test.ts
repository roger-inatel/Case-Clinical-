import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Contraste medido, não estimado (design-system A1).
 *
 * Os tokens são lidos de globals.css e os pares são calculados pela fórmula de
 * luminância relativa da WCAG 2.x. É a diferença entre "escolhemos cores
 * acessíveis" e saber que continuam acessíveis depois do próximo ajuste de
 * paleta — trocar um degrau de `--muted-foreground` quebra este teste na hora.
 */

const css = readFileSync(join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8');

type Hsl = [number, number, number];

function parseTokens(text: string): Record<string, Hsl> {
  const out: Record<string, Hsl> = {};
  for (const m of text.matchAll(/--([a-z0-9-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%;/g)) {
    out[m[1]!] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

const darkAt = css.indexOf('prefers-color-scheme: dark');
const light = parseTokens(css.slice(0, darkAt));
/** O bloco escuro sobrescreve: o que ele não redeclara, herda do claro. */
const dark = { ...light, ...parseTokens(css.slice(darkAt)) };

function hslToRgb([h, s, l]: Hsl): [number, number, number] {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hsl: Hsl): number {
  const [r, g, b] = hslToRgb(hsl).map(linearize) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg: Hsl, bg: Hsl): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** [rótulo, token de frente, token de fundo] */
type Pair = [string, string, string];

/** 1.4.3 — texto. */
const TEXT_PAIRS: Pair[] = [
  ['texto primário sobre o fundo da página', 'foreground', 'background'],
  ['texto primário sobre cartão', 'foreground', 'card'],
  ['texto clínico sobre papel', 'foreground', 'paper'],
  ['texto primário sobre comentário', 'foreground', 'commentary'],
  ['texto secundário sobre o fundo da página', 'muted-foreground', 'background'],
  ['texto secundário sobre cartão', 'muted-foreground', 'card'],
  ['texto secundário sobre muted', 'muted-foreground', 'muted'],
  ['texto secundário sobre comentário', 'muted-foreground', 'commentary'],
  ['texto secundário sobre accent', 'muted-foreground', 'accent'],
  ['primária sobre cartão', 'primary', 'card'],
  ['rótulo do botão primário', 'primary-foreground', 'primary'],
  ['texto sobre accent', 'accent-foreground', 'accent'],
  ['texto sobre secondary', 'secondary-foreground', 'secondary'],
  ['evidência que sustenta', 'evidence-support', 'card'],
  ['evidência que contradiz', 'evidence-contradict', 'card'],
  ['evidência que não discrimina', 'evidence-neutral', 'card'],
  ['perigo sobre a superfície de perigo', 'danger', 'danger-surface'],
  ['veredito de dados insuficientes', 'verdict-insufficient', 'card'],
];

/** 1.4.11 — limite de componente, indicador de foco e objeto gráfico. */
const COMPONENT_PAIRS: Pair[] = [
  ['borda de campo sobre cartão', 'input', 'card'],
  ['filete do botão primário sobre o fundo', 'primary-rule', 'background'],
  ['filete do botão primário sobre cartão', 'primary-rule', 'card'],
  ['borda de campo sobre o fundo da página', 'input', 'background'],
  ['anel de foco sobre o fundo da página', 'ring', 'background'],
  ['anel de foco sobre cartão', 'ring', 'card'],
  ['faixa de veredito muito compatível', 'verdict-strong-support', 'card'],
  ['faixa de veredito compatível', 'verdict-support', 'card'],
  ['faixa de veredito pouco compatível', 'verdict-weak', 'card'],
  ['faixa de veredito incompatível', 'verdict-none', 'card'],
  ['filete do comentário do autor', 'commentary-rule', 'commentary'],
  ['borda do bloco de perigo', 'danger-rule', 'danger-surface'],
];

describe.each([
  ['claro', light],
  ['escuro', dark],
] as const)('tema %s', (_theme, tokens) => {
  it.each(TEXT_PAIRS)('texto AA (4.5:1) — %s', (_label, fg, bg) => {
    expect(tokens[fg], `token --${fg} ausente`).toBeDefined();
    expect(tokens[bg], `token --${bg} ausente`).toBeDefined();
    expect(contrast(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(COMPONENT_PAIRS)('componente AA (3:1) — %s', (_label, fg, bg) => {
    expect(contrast(tokens[fg]!, tokens[bg]!)).toBeGreaterThanOrEqual(3);
  });
});

describe('paridade entre temas', () => {
  it('nenhuma cor existe só no tema escuro', () => {
    const onlyDark = Object.keys(dark).filter((t) => !(t in light));
    expect(onlyDark).toEqual([]);
  });

  it('não existe token de sucesso — ele acabaria aplicado a um veredito (R5)', () => {
    expect(Object.keys(light).filter((t) => /success/.test(t))).toEqual([]);
  });
});
