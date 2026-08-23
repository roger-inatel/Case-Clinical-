import { describe, expect, it } from 'vitest';
import { getCase, getCaseKey, getVocabulary } from '@/content/registry';
import { evaluate } from '@/evaluation/evaluate';
import { createSession, recordAnswer, revealedFindings } from '@/domain/simulation';
import type { Session } from '@/domain/types';
import type { EvidenceRelation } from '@/content/schema';

const CASE_ID = 'cardio-001';
const clinicalCase = getCase(CASE_ID)!;
const key = getCaseKey(CASE_ID);
const vocabulary = getVocabulary();

const T = 1_000_000;

/** Monta uma sessão completa de forma declarativa. */
function buildSession(opts: {
  qualifiers?: string[];
  hypotheses?: string[];
  unknownTerms?: string[];
  direction?: number;
  tests?: string[];
  finalConcept?: string | null;
  unknownTerm?: string | null;
  evidence?: Record<string, EvidenceRelation>;
  rationale?: string;
}): Session {
  let s = createSession(CASE_ID, clinicalCase.stages[0]!.id, T);
  s = { ...s, stagesRevealed: clinicalCase.stages.map((st) => st.id) };
  s = recordAnswer(s, 'dp1', {
    type: 'problem-representation',
    selected: opts.qualifiers ?? ['q.agudo', 'q.continuo', 'q.opressivo', 'q.retroesternal', 'q.em-repouso'],
    at: T,
  });
  s = recordAnswer(s, 'dp2', {
    type: 'hypothesis-list',
    concepts: opts.hypotheses ?? ['dx.sca', 'dx.dissecao-aorta', 'dx.tep'],
    unknownTerms: opts.unknownTerms ?? [],
    at: T,
  });
  s = recordAnswer(s, 'dp3', { type: 'probability-shift', direction: opts.direction ?? 0, at: T });
  s = recordAnswer(s, 'dp4', {
    type: 'test-selection',
    tests: opts.tests ?? ['t.ecg', 't.troponina'],
    at: T,
  });
  s = recordAnswer(s, 'dp5', {
    type: 'final-hypothesis',
    concept: opts.finalConcept === undefined ? 'dx.sca-ssst' : opts.finalConcept,
    unknownTerm: opts.unknownTerm ?? null,
    evidence: opts.evidence ?? {},
    rationale: opts.rationale ?? 'Quadro compatível com isquemia.',
    at: T,
  });
  return s;
}

const run = (s: Session) => evaluate(clinicalCase, key, vocabulary, s);

describe('percurso completo (ECG + troponina)', () => {
  it('hipótese esperada recebe o veredito máximo, sem degradação', () => {
    const r = run(buildSession({}));
    expect(r.verdict).toBe('muito_compativel');
    expect(r.verdictDegradedByMissingFindings).toBe(false);
    expect(r.notAnalysed).toBe(false);
  });

  it('ansiedade é incompatível quando a troponina foi obtida', () => {
    const r = run(buildSession({ finalConcept: 'dx.ansiedade' }));
    expect(r.verdict).toBe('incompativel');
    expect(r.verdictDegradedByMissingFindings).toBe(false);
  });

  it('dispara a armadilha de ancoragem ao concluir ansiedade', () => {
    const r = run(buildSession({ finalConcept: 'dx.ansiedade' }));
    expect(r.triggeredMistakes.some((m) => m.trap.includes('Ancorar'))).toBe(true);
  });
});

/**
 * Correção do achado B1 do red team: o veredito não pode creditar informação
 * que o estudante não obteve.
 */
describe('percurso sem os exames essenciais (regressão B1)', () => {
  const noEssentials = { tests: ['t.rx-torax', 't.d-dimero', 't.angiotc'] };

  it('a hipótese "correta" NÃO recebe o veredito máximo sem troponina e ECG', () => {
    const r = run(buildSession({ ...noEssentials }));
    expect(r.verdictDegradedByMissingFindings).toBe(true);
    expect(r.verdict).toBe('dados_insuficientes');
    expect(r.verdict).not.toBe('muito_compativel');
  });

  it('o feedback exibido não menciona troponina para quem não a dosou', () => {
    const r = run(buildSession({ ...noEssentials }));
    expect(r.verdictFeedback.toLowerCase()).not.toContain('acima do percentil 99');
  });

  it('reconhecer o limite da informação passa a ser a melhor resposta', () => {
    const r = run(buildSession({ ...noEssentials, finalConcept: 'dx.dados-insuficientes' }));
    expect(r.verdict).toBe('muito_compativel');
    expect(r.verdictDegradedByMissingFindings).toBe(true);
  });

  it('a mesma resposta é penalizada quando a troponina FOI obtida', () => {
    const r = run(buildSession({ finalConcept: 'dx.dados-insuficientes' }));
    expect(r.verdict).toBe('pouco_compativel');
  });

  it('sinaliza os exames essenciais omitidos', () => {
    const r = run(buildSession({ ...noEssentials }));
    expect(r.processSignals.essentialTestsMissed).toEqual(['t.ecg', 't.troponina']);
    expect(r.processSignals.unnecessaryTestsRequested).toContain('t.d-dimero');
  });

  it('red flag inalcançável não entra no denominador (regressão R11)', () => {
    const withTrop = run(buildSession({}));
    const without = run(buildSession({ ...noEssentials }));
    const dangerOf = (r: ReturnType<typeof run>) => r.profile.find((p) => p.id === 'perigo')!;
    expect(dangerOf(without).total).toBeLessThan(dangerOf(withTrop).total);
  });
});

describe('hipótese fora da chave', () => {
  it('responde com honestidade, não com erro', () => {
    const r = run(buildSession({ finalConcept: null, unknownTerm: 'pericardite' }));
    expect(r.notAnalysed).toBe(true);
    expect(r.verdict).toBeNull();
    expect(r.verdictFeedback).toContain('não foi analisada');
    // Nunca declara erro: o caso não a cobre, o que é diferente de estar errada.
    expect(r.verdictFeedback.toLowerCase()).not.toContain('incorreta');
    expect(r.verdictFeedback.toLowerCase()).not.toContain('você errou');
    expect(r.verdictFeedback).toContain('não significa que esteja errada');
  });
});

describe('seleção de evidências', () => {
  const evidence: Record<string, EvidenceRelation> = {
    f3: 'supports',
    f17: 'supports',
    f16: 'contradicts', // inversão: a chave declara neutral
  };

  it('só considera achados revelados', () => {
    const r = run(buildSession({ tests: ['t.ecg'], evidence }));
    expect(r.supporting.some((i) => i.findingId === 'f17')).toBe(false);
  });

  it('marca item não classificado como ponto cego', () => {
    const r = run(buildSession({ evidence: {} }));
    expect(r.contradicting.every((i) => i.missed)).toBe(true);
  });

  it('a evidência contrária vem antes da favorável e os não marcados primeiro', () => {
    const r = run(buildSession({ evidence }));
    const missedFirst = r.contradicting.map((i) => i.missed);
    expect([...missedFirst].sort((a, b) => Number(b) - Number(a))).toEqual(missedFirst);
  });

  it('dispara a armadilha de interpretar o ECG como exclusão', () => {
    const r = run(
      buildSession({ finalConcept: 'dx.sca', evidence: { f16: 'contradicts' } }),
    );
    expect(r.triggeredMistakes.some((m) => m.trap.includes('ECG'))).toBe(true);
  });
});

describe('perfil de decisão', () => {
  it('nunca reporta denominador zero', () => {
    const r = run(buildSession({}));
    for (const d of r.profile) expect(d.total).toBeGreaterThan(0);
  });

  it('detecta manutenção da hipótese inicial', () => {
    const r = run(buildSession({ hypotheses: ['dx.sca-ssst'], finalConcept: 'dx.sca-ssst' }));
    expect(r.processSignals.revisedHypothesis).toBe(false);
    expect(r.profile.find((p) => p.id === 'flexibilidade')?.achieved).toBe(0);
  });

  it('detecta revisão de hipótese', () => {
    const r = run(buildSession({ hypotheses: ['dx.ansiedade'], finalConcept: 'dx.sca-ssst' }));
    expect(r.processSignals.revisedHypothesis).toBe(true);
  });

  it('conta amplitude do diferencial contra o alvo do caso', () => {
    const r = run(buildSession({ hypotheses: ['dx.sca'] }));
    const amp = r.profile.find((p) => p.id === 'amplitude')!;
    expect(amp.achieved).toBeLessThan(amp.total);
  });
});

describe('propriedades gerais', () => {
  const sessions = [
    buildSession({}),
    buildSession({ tests: [] }),
    buildSession({ finalConcept: 'dx.ansiedade' }),
    buildSession({ finalConcept: null, unknownTerm: 'takotsubo' }),
    buildSession({ hypotheses: [], evidence: { f1: 'supports' } }),
    buildSession({ direction: -2, tests: ['t.ecg'] }),
  ];

  it('toda sessão termina em veredito ou em "não analisada"', () => {
    for (const s of sessions) {
      const r = run(s);
      expect(r.verdict !== null || r.notAnalysed).toBe(true);
    }
  });

  it('nenhum item de evidência referencia achado não revelado', () => {
    for (const s of sessions) {
      const visible = new Set(revealedFindings(clinicalCase, s).map((f) => f.id));
      const r = run(s);
      for (const i of [...r.contradicting, ...r.supporting]) {
        expect(visible).toContain(i.findingId);
      }
    }
  });

  /**
   * D-IMPL-01: o veredito é sobre a hipótese e NÃO é rebaixado por red flag
   * ignorado — mas o perigo ignorado nunca pode passar silenciosamente.
   */
  it('red flag crítico ignorado é sempre sinalizado, qualquer que seja o veredito', () => {
    for (const s of sessions) {
      const r = run(s);
      const hasCritical = r.missedRedFlags.some((rf) => rf.critical);
      expect(r.criticalRedFlagMissed).toBe(hasCritical);
    }
  });

  it('quem acerta a hipótese e ignora o perigo recebe o aviso, não um veredito pior', () => {
    const r = run(buildSession({ evidence: {} }));
    expect(r.verdict).toBe('muito_compativel');
    expect(r.criticalRedFlagMissed).toBe(true);
    expect(r.missedRedFlags.length).toBeGreaterThan(0);
  });

  it('é idempotente e livre de efeito', () => {
    for (const s of sessions) {
      expect(JSON.stringify(run(s))).toBe(JSON.stringify(run(s)));
    }
  });

  it('não expõe fragmento de conceito que o estudante não escolheu', () => {
    const r = run(buildSession({ hypotheses: ['dx.sca'], finalConcept: 'dx.sca' }));
    const dp2 = r.decisionPointResults.find((d) => d.type === 'hypothesis-list')!;
    const drgeFeedback = 'Refluxo gastroesofágico pode causar desconforto retroesternal';
    expect(dp2.fragments.join(' ')).not.toContain(drgeFeedback);
  });
});

describe('varredura do espaço de sessões', () => {
  it('nenhuma combinação de hipótese final × conjunto de exames quebra o motor', () => {
    const conceptIds = vocabulary.concepts.map((c) => c.id);
    const testSets = [
      [],
      ['t.ecg'],
      ['t.troponina'],
      ['t.ecg', 't.troponina'],
      ['t.rx-torax', 't.d-dimero', 't.angiotc'],
      ['t.ecg', 't.rx-torax', 't.angiotc'],
    ];
    let count = 0;
    for (const concept of conceptIds) {
      for (const tests of testSets) {
        const r = run(buildSession({ finalConcept: concept, tests }));
        expect(r.verdictLabel.length).toBeGreaterThan(0);
        expect(r.verdict !== null || r.notAnalysed).toBe(true);
        count++;
      }
    }
    expect(count).toBe(conceptIds.length * testSets.length);
  });
});
