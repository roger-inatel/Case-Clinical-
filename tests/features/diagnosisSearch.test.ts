import { describe, expect, it } from 'vitest';
import { getVocabulary } from '@/content/registry';
import {
  MAX_SUGGESTIONS,
  MIN_CHARS,
  normalizeTerm,
  rankConcept,
  searchConcepts,
} from '@/features/diagnosisSearch';

/**
 * Busca do vocabulário controlado (ADR-0008).
 * Testes puros — o comportamento que mais importa não precisa de DOM.
 */

const concepts = getVocabulary().concepts;
const idsFor = (q: string, exclude: string[] = []) =>
  searchConcepts(concepts, q, exclude).map((c) => c.id);

describe('normalização', () => {
  it('ignora caixa e acento', () => {
    expect(normalizeTerm('DISSECÇÃO')).toBe('disseccao');
    expect(normalizeTerm('  Infarto  ')).toBe('infarto');
  });
});

describe('limiar de caracteres', () => {
  it('não sugere nada abaixo do mínimo', () => {
    expect(searchConcepts(concepts, '')).toEqual([]);
    expect(searchConcepts(concepts, 'i')).toEqual([]);
    expect(searchConcepts(concepts, ' a ')).toEqual([]);
  });

  it('passa a sugerir a partir do mínimo', () => {
    expect('ia'.length).toBe(MIN_CHARS);
    expect(searchConcepts(concepts, 'sca').length).toBeGreaterThan(0);
  });

  // Despejar o vocabulário entregaria o diferencial pronto.
  it('nunca devolve a lista completa', () => {
    expect(searchConcepts(concepts, 'a').length).toBe(0);
    expect(searchConcepts(concepts, 'ia').length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
  });
});

describe('busca por sigla e sinônimo', () => {
  it.each([
    ['IAM sem supra', 'dx.sca-ssst'],
    ['NSTEMI', 'dx.sca-ssst'],
    ['STEMI', 'dx.sca-csst'],
    ['TEP', 'dx.tep'],
    ['embolia de pulmão', 'dx.tep'],
    ['DRGE', 'dx.drge'],
    ['sindrome aortica aguda', 'dx.dissecao-aorta'],
    ['ataque de pânico', 'dx.ansiedade'],
    ['não sei', 'dx.dados-insuficientes'],
  ])('resolve "%s" para %s', (query, expected) => {
    expect(idsFor(query)).toContain(expected);
  });

  it('acha por alias mesmo com acento digitado e alias sem acento', () => {
    expect(idsFor('dissecção')).toContain('dx.dissecao-aorta');
  });
});

describe('sem busca aproximada', () => {
  // Aceitar "infato" mascararia imprecisão terminológica que o estudante
  // precisa perceber. É decisão de desenho, não limitação.
  it.each(['infato', 'trombolismo', 'pericardit'])('não resolve "%s"', (typo) => {
    const results = idsFor(typo);
    expect(results).not.toContain('dx.sca-ssst');
    expect(results).not.toContain('dx.tep');
  });
});

describe('ordenação', () => {
  it('prefixo vem antes de substring', () => {
    expect(rankConcept(concepts.find((c) => c.id === 'dx.tep')!, 'tep')).toBe(0);
  });

  it('o primeiro resultado de "sindrome coronariana" é o conceito genérico', () => {
    expect(idsFor('sindrome coronariana')[0]).toBe('dx.sca');
  });
});

describe('exclusão do que já foi selecionado', () => {
  it('não sugere conceito já escolhido', () => {
    expect(idsFor('tep', ['dx.tep'])).not.toContain('dx.tep');
  });
});

describe('conceito especial', () => {
  it('"dados insuficientes" é buscável como qualquer outro', () => {
    expect(idsFor('dados insuficientes')).toContain('dx.dados-insuficientes');
  });
});
