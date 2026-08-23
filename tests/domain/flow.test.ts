import { describe, expect, it } from 'vitest';
import { getCase, getCaseKey, getVocabulary } from '@/content/registry';
import {
  advanceStage,
  canAdvance,
  completeSession,
  createSession,
  isComplete,
  pendingDecisionPoints,
  recordAnswer,
  revealedFindings,
  stageProgress,
  toStudentView,
} from '@/domain/simulation';
import { evaluate } from '@/evaluation/evaluate';
import type { Answer, Session } from '@/domain/types';

/**
 * Fluxo principal ponta a ponta, no domínio.
 * Percorre exatamente o que a UI percorre — sem navegador.
 */

const clinicalCase = getCase('cardio-001')!;
const caseView = toStudentView(clinicalCase);
const key = getCaseKey('cardio-001');
const vocabulary = getVocabulary();

function answerFor(dpId: string, type: string, tests: string[]): Answer {
  const at = 1;
  switch (type) {
    case 'problem-representation':
      return { type: 'problem-representation', selected: ['q.agudo', 'q.opressivo'], at };
    case 'hypothesis-list':
      return { type: 'hypothesis-list', concepts: ['dx.sca'], unknownTerms: [], at };
    case 'probability-shift':
      return { type: 'probability-shift', direction: 0, at };
    case 'test-selection':
      return { type: 'test-selection', tests, at };
    default:
      return {
        type: 'final-hypothesis',
        concept: 'dx.sca-ssst',
        unknownTerm: null,
        evidence: { f1: 'supports', f17: 'supports' },
        rationale: 'Quadro clínico e perfil de risco sustentam origem isquêmica.',
        at,
      };
  }
}

/** Simula a UI: responde tudo da etapa, avança, repete. */
function playThrough(tests: string[]): { session: Session; steps: string[] } {
  let session = createSession(caseView.id, caseView.stages[0]!.id, 0);
  const steps: string[] = [];
  let guard = 0;

  while (!isComplete(caseView, session) && guard++ < 50) {
    const pending = pendingDecisionPoints(caseView, session);
    if (pending.length > 0) {
      const dp = pending[0]!;
      steps.push(`${stageProgress(caseView, session).label} → ${dp.type}`);
      session = recordAnswer(session, dp.id, answerFor(dp.id, dp.type, tests));
      continue;
    }
    if (canAdvance(caseView, session)) {
      session = advanceStage(caseView, session);
      continue;
    }
    break;
  }
  return { session: completeSession(session, 2), steps };
}

describe('fluxo completo do estudante', () => {
  it('percorre as 4 etapas e os 5 pontos de decisão, na ordem', () => {
    const { session, steps } = playThrough(['t.ecg', 't.troponina']);
    expect(steps).toEqual([
      'Queixa principal → problem-representation',
      'Queixa principal → hypothesis-list',
      'História clínica → probability-shift',
      'Exame físico → test-selection',
      'Exames complementares → final-hypothesis',
    ]);
    expect(session.stagesRevealed).toHaveLength(4);
    expect(isComplete(caseView, session)).toBe(true);
    expect(session.completedAt).not.toBeNull();
  });

  it('produz um resultado avaliável ao final', () => {
    const { session } = playThrough(['t.ecg', 't.troponina']);
    const r = evaluate(caseView, key, vocabulary, session);
    expect(r.verdict).toBe('muito_compativel');
    expect(r.decisionPointResults.length).toBeGreaterThanOrEqual(4);
    expect(r.reflectionQuestion.length).toBeGreaterThan(0);
    expect(r.learningOutcomes.length).toBeGreaterThan(0);
  });

  it('a revelação progressiva respeita etapa e exame solicitado', () => {
    const { session } = playThrough(['t.ecg']);
    const ids = revealedFindings(caseView, session).map((f) => f.id);
    expect(ids).toContain('f16'); // ECG pedido
    expect(ids).not.toContain('f17'); // troponina não pedida
    expect(ids).not.toContain('f19');
  });

  it('respostas são irreversíveis: a segunda gravação é ignorada', () => {
    let s = createSession(caseView.id, caseView.stages[0]!.id, 0);
    s = recordAnswer(s, 'dp1', { type: 'problem-representation', selected: ['q.agudo'], at: 1 });
    s = recordAnswer(s, 'dp1', { type: 'problem-representation', selected: ['q.cronico'], at: 2 });
    const a = s.answers.dp1;
    expect(a?.type === 'problem-representation' && a.selected).toEqual(['q.agudo']);
  });

  it('não avança enquanto houver ponto de decisão pendente na etapa', () => {
    const s = createSession(caseView.id, caseView.stages[0]!.id, 0);
    expect(canAdvance(caseView, s)).toBe(false);
  });

  it('o caso funciona sem solicitar exame nenhum', () => {
    const { session } = playThrough([]);
    const r = evaluate(caseView, key, vocabulary, session);
    expect(isComplete(caseView, session)).toBe(true);
    expect(r.verdict !== null || r.notAnalysed).toBe(true);
    expect(r.processSignals.essentialTestsMissed.length).toBeGreaterThan(0);
  });

  it('a StudentCaseView não carrega nenhum campo da chave', () => {
    const serialized = JSON.stringify(caseView);
    for (const forbidden of ['evidenceMatrix', 'decisionKeys', 'verdicts', 'authorReasoning']) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
