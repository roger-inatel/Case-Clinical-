import type { Concept } from '@/content/schema';

/**
 * Lógica de busca do vocabulário controlado — PURA e testável sem DOM.
 *
 * Regras de ADR-0008, todas verificáveis:
 *  - sugestões só a partir de MIN_CHARS caracteres;
 *  - nunca a lista completa (o teto é MAX_SUGGESTIONS);
 *  - busca por rótulo E por alias, tolerante a acento e caixa;
 *  - SEM busca aproximada: "infato" não vira "infarto".
 */

export const MIN_CHARS = 2;
export const MAX_SUGGESTIONS = 8;

/** Casefold + remoção de diacríticos. Mesma regra declarada no vocabulário. */
export function normalizeTerm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Menor é melhor: 0 prefixo, 1 início de palavra, 2 substring, Infinity nenhum. */
export function rankConcept(concept: Concept, query: string): number {
  const q = normalizeTerm(query);
  if (q.length === 0) return Infinity;
  let best = Infinity;
  for (const candidate of [concept.label, ...concept.aliases]) {
    const h = normalizeTerm(candidate);
    if (h.startsWith(q)) best = Math.min(best, 0);
    else if (h.includes(` ${q}`)) best = Math.min(best, 1);
    else if (h.includes(q)) best = Math.min(best, 2);
  }
  return best;
}

export function searchConcepts(
  concepts: Concept[],
  query: string,
  exclude: string[] = [],
): Concept[] {
  if (normalizeTerm(query).length < MIN_CHARS) return [];
  return concepts
    .filter((c) => !exclude.includes(c.id))
    .map((c) => ({ concept: c, score: rankConcept(c, query) }))
    .filter((x) => x.score < Infinity)
    .sort((a, b) => a.score - b.score || a.concept.label.localeCompare(b.concept.label, 'pt-BR'))
    .slice(0, MAX_SUGGESTIONS)
    .map((x) => x.concept);
}
