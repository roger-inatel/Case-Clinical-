import type {
  CaseKey,
  ClinicalCase,
  EvidenceRelation,
  FinalHypothesisKeyT,
  HypothesisListKeyT,
  ProbabilityShiftKeyT,
  ProblemRepresentationKeyT,
  TestSelectionKeyT,
  Verdict,
  Vocabulary,
} from '@/content/schema';
import type {
  Answer,
  DecisionPointResult,
  EvaluationResult,
  EvidenceItemResult,
  ProfileDimension,
  Session,
} from '@/domain/types';
import { revealedFindings } from '@/domain/simulation';

/**
 * Motor de avaliação determinístico.
 *
 * `evaluate` é FUNÇÃO PURA: sem rede, sem relógio, sem aleatoriedade, sem
 * estado global. Mesma entrada → mesma saída, sempre. É o que torna o sistema
 * testável por exaustão e reprodutível numa banca.
 *
 * Referência: docs/03-architecture/evaluation-engine.md
 */

export const VERDICT_LABELS: Record<Verdict, string> = {
  muito_compativel: 'Fortemente compatível com os dados',
  compativel: 'Compatível com os dados',
  parcialmente_compativel: 'Parcialmente compatível com os dados',
  pouco_compativel: 'Pouco compatível com os dados',
  incompativel: 'Não sustentado pelos dados',
  dados_insuficientes: 'Dados insuficientes para sustentar ou afastar',
};

const NOT_ANALYSED_MESSAGE =
  'Esta hipótese não foi analisada pelo autor deste caso. Isso não significa que esteja errada — significa que o caso não a cobre. Veja abaixo as hipóteses que ele analisa.';

/* ------------------------------------------------------------ localizadores */

/**
 * O motor só precisa destas três coisas do caso. Tipar assim permite chamá-lo
 * tanto com o `ClinicalCase` completo (testes, build) quanto com a
 * `StudentCaseView` (cliente) — sem que a chave precise vazar para o tipo.
 */
export type EvaluableCase = Pick<ClinicalCase, 'id' | 'stages' | 'decisionPoints'>;

function findDp(c: EvaluableCase, type: string) {
  return c.decisionPoints.find((d) => d.type === type);
}

function keyOf<T>(key: CaseKey, dpId: string | undefined): T | undefined {
  if (!dpId) return undefined;
  return key.decisionKeys[dpId] as T | undefined;
}

function answerOf<T extends Answer['type']>(
  session: Session,
  dpId: string | undefined,
  type: T,
): Extract<Answer, { type: T }> | undefined {
  if (!dpId) return undefined;
  const a = session.answers[dpId];
  return a && a.type === type ? (a as Extract<Answer, { type: T }>) : undefined;
}

/* ------------------------------------------------------------------ motor */

export function evaluate(
  c: EvaluableCase,
  key: CaseKey,
  vocabulary: Vocabulary,
  session: Session,
): EvaluationResult {
  const conceptLabel = (id: string) =>
    vocabulary.concepts.find((x) => x.id === id)?.label ?? id;

  const revealed = revealedFindings(c, session);
  const revealedIds = new Set(revealed.map((f) => f.id));
  const findingText = (id: string) =>
    c.stages.flatMap((s) => s.findings).find((f) => f.id === id)?.text ?? id;

  const dp1 = findDp(c, 'problem-representation');
  const dp2 = findDp(c, 'hypothesis-list');
  const dp3 = findDp(c, 'probability-shift');
  const dp4 = findDp(c, 'test-selection');
  const dp5 = findDp(c, 'final-hypothesis');

  const k1 = keyOf<ProblemRepresentationKeyT>(key, dp1?.id);
  const k2 = keyOf<HypothesisListKeyT>(key, dp2?.id);
  const k3 = keyOf<ProbabilityShiftKeyT>(key, dp3?.id);
  const k4 = keyOf<TestSelectionKeyT>(key, dp4?.id);
  const k5 = keyOf<FinalHypothesisKeyT>(key, dp5?.id);

  const a1 = answerOf(session, dp1?.id, 'problem-representation');
  const a2 = answerOf(session, dp2?.id, 'hypothesis-list');
  const a3 = answerOf(session, dp3?.id, 'probability-shift');
  const a4 = answerOf(session, dp4?.id, 'test-selection');
  const a5 = answerOf(session, dp5?.id, 'final-hypothesis');

  const initialHypotheses = a2?.concepts ?? [];
  const finalConcept = a5?.concept ?? null;
  const studentEvidence = a5?.evidence ?? {};

  /* ------------------------------------------------- veredito da hipótese */

  let verdict: Verdict | null = null;
  let verdictFeedback = '';
  let notAnalysed = false;
  let degraded = false;

  if (!finalConcept) {
    notAnalysed = true;
    verdictFeedback = a5?.unknownTerm
      ? NOT_ANALYSED_MESSAGE
      : 'Nenhuma hipótese final foi registrada.';
  } else {
    const entry = k5?.verdicts?.[finalConcept];
    if (!entry) {
      notAnalysed = true;
      verdictFeedback = NOT_ANALYSED_MESSAGE;
    } else {
      const missing = (entry.requiresFindings ?? []).filter((f) => !revealedIds.has(f));
      if (missing.length > 0 && entry.verdictWhenMissing) {
        verdict = entry.verdictWhenMissing.verdict;
        verdictFeedback = entry.verdictWhenMissing.feedback;
        degraded = true;
      } else {
        verdict = entry.verdict;
        verdictFeedback = entry.feedback;
      }
    }
  }

  /* --------------------------------------------------- itens de evidência */

  const contradicting: EvidenceItemResult[] = [];
  const supporting: EvidenceItemResult[] = [];

  if (finalConcept) {
    for (const finding of revealed) {
      const cell = key.evidenceMatrix[finding.id]?.[finalConcept];
      if (!cell) continue;
      const marked = (studentEvidence[finding.id] ?? null) as EvidenceRelation | null;
      const item: EvidenceItemResult = {
        findingId: finding.id,
        findingText: finding.text,
        relation: cell.rel,
        why: cell.why,
        studentMarked: marked,
        missed: marked === null,
        inverted:
          marked !== null && cell.rel !== 'neutral' && marked !== cell.rel && marked !== 'neutral',
      };
      if (cell.rel === 'contradicts') contradicting.push(item);
      else supporting.push(item);
    }
  }

  // Não marcados primeiro: são os pontos cegos (ux-flow §4).
  const byMissedFirst = (a: EvidenceItemResult, b: EvidenceItemResult) =>
    Number(b.missed) - Number(a.missed);
  contradicting.sort(byMissedFirst);
  supporting.sort(byMissedFirst);

  /* ---------------------------------------------------------- red flags */

  const applicableRedFlags = key.redFlags.filter((rf) =>
    (rf.requiresFindings ?? []).every((f) => revealedIds.has(f)),
  );
  const recognized = (findingIds: string[]) =>
    findingIds.some((f) => studentEvidence[f] !== undefined);
  const missedRedFlags = applicableRedFlags
    .filter((rf) => !recognized(rf.findingIds))
    .map((rf) => ({ text: rf.text, whyDangerous: rf.whyDangerous, critical: rf.critical }));
  const criticalRedFlagMissed = missedRedFlags.some((rf) => rf.critical);

  /* ------------------------------------------------------- diferenciais */

  const consideredConcepts = new Set([...initialHypotheses, ...(finalConcept ? [finalConcept] : [])]);
  const missedDifferentials = key.differentialsToConsider
    .filter((d) => !consideredConcepts.has(d.conceptId))
    .map((d) => ({ label: conceptLabel(d.conceptId), why: d.why, cantMiss: d.cantMiss }));

  /* ------------------------------------------------- pontos de decisão */

  const decisionPointResults: DecisionPointResult[] = [];

  if (dp1 && k1 && a1) {
    const fragments: string[] = [];
    for (const id of k1.expected) {
      if (!a1.selected.includes(id)) {
        const f = k1.feedbackByOption[id]?.whenMissing;
        if (f) fragments.push(f);
      }
    }
    for (const id of a1.selected) {
      const opt = k1.feedbackByOption[id];
      if (opt && opt.role !== 'expected' && opt.whenSelected) fragments.push(opt.whenSelected);
    }
    const hit = k1.expected.filter((id) => a1.selected.includes(id)).length;
    decisionPointResults.push({
      decisionPointId: dp1.id,
      type: 'problem-representation',
      prompt: dp1.prompt,
      fragments,
      summary: (k1.summaryTemplate ?? 'Você contemplou {n} de {total} atributos relevantes.')
        .replace('{n}', String(hit))
        .replace('{total}', String(k1.expected.length)),
    });
  }

  if (dp2 && k2 && a2) {
    const fragments = a2.concepts
      .map((id) => k2.concepts[id]?.feedback)
      .filter((f): f is string => Boolean(f));
    for (const term of a2.unknownTerms) {
      fragments.push(
        `Você propôs "${term}", que não está no vocabulário deste caso. O autor não a analisou — o que não significa que esteja errada.`,
      );
    }
    const cantMissIds = Object.entries(k2.concepts)
      .filter(([, v]) => v.cantMiss)
      .map(([id]) => id);
    const omitted = cantMissIds.filter((id) => !a2.concepts.includes(id));
    for (const id of omitted) {
      fragments.push(
        `Você não levantou ${conceptLabel(id)} — um diagnóstico que é fatal se ignorado. Mantê-lo na lista inicial é raciocínio correto mesmo quando ele se mostra improvável.`,
      );
    }
    decisionPointResults.push({
      decisionPointId: dp2.id,
      type: 'hypothesis-list',
      prompt: dp2.prompt,
      fragments,
      summary:
        a2.concepts.length < k2.minExpected
          ? `Você levantou ${a2.concepts.length} hipótese(s); este caso esperava ao menos ${k2.minExpected}.`
          : null,
    });
  }

  if (dp3 && k3 && a3) {
    const fragments: string[] = [];
    const byDirection = k3.feedbackByDirection[String(a3.direction)];
    if (byDirection) fragments.push(byDirection);
    fragments.push(k3.rationale);
    const [lo, hi] = k3.acceptableRange;
    decisionPointResults.push({
      decisionPointId: dp3.id,
      type: 'probability-shift',
      prompt: dp3.prompt,
      fragments,
      summary:
        a3.direction >= lo && a3.direction <= hi
          ? 'Sua resposta está dentro da faixa que o autor considera defensável.'
          : 'Sua resposta está fora da faixa que o autor considera defensável.',
    });
  }

  const essentialMissed: string[] = [];
  const unnecessaryRequested: string[] = [];

  if (dp4 && k4 && a4) {
    const fragments: string[] = [];
    for (const [testId, entry] of Object.entries(k4.tests)) {
      const requested = a4.tests.includes(testId);
      if (entry.value === 'essencial' && !requested) essentialMissed.push(testId);
      if (requested && (entry.value === 'desnecessario' || entry.value === 'inadequado')) {
        unnecessaryRequested.push(testId);
      }
      if (requested) fragments.push(entry.feedback);
    }
    if (essentialMissed.length > 0) {
      fragments.unshift(k4.essentialMissedMessage);
      for (const t of essentialMissed) {
        const f = k4.tests[t]?.feedback;
        if (f) fragments.push(f);
      }
    }
    if (unnecessaryRequested.length > 0 && k4.excessMessage) fragments.push(k4.excessMessage);
    decisionPointResults.push({
      decisionPointId: dp4.id,
      type: 'test-selection',
      prompt: dp4.prompt,
      fragments,
      summary: null,
    });
  }

  /* ------------------------------------------------------- erros comuns */

  const triggeredMistakes = key.commonMistakes
    .filter((m) => {
      const t = m.triggeredWhen;
      if (!t) return false;
      if (t.selectedConcept && finalConcept === t.selectedConcept) return true;
      if (t.evidenceMisclassified) {
        const { finding, concept, markedAs } = t.evidenceMisclassified;
        return finalConcept === concept && studentEvidence[finding] === markedAs;
      }
      return false;
    })
    .map((m) => ({ trap: m.trap, why: m.why }));

  /* ------------------------------------------------------------- perfil */

  const profile: ProfileDimension[] = [];

  if (k2 && a2) {
    const target = Object.entries(k2.concepts)
      .filter(([, v]) => v.tier === 'esperada' || v.cantMiss)
      .map(([id]) => id);
    if (target.length > 0) {
      profile.push({
        id: 'amplitude',
        label: 'Amplitude do diferencial',
        achieved: target.filter((id) => a2.concepts.includes(id)).length,
        total: target.length,
        meaning: 'Hipóteses que o caso considera indispensáveis na lista inicial.',
      });
    }
  }

  const relevantEvidence = [...contradicting, ...supporting];
  if (relevantEvidence.length > 0) {
    profile.push({
      id: 'ancoragem',
      label: 'Ancoragem em evidência',
      achieved: relevantEvidence.filter((i) => i.studentMarked === i.relation).length,
      total: relevantEvidence.length,
      meaning: 'Achados que você classificou da mesma forma que o autor do caso.',
    });
  }

  const dangerTotal = applicableRedFlags.length + key.differentialsToConsider.filter((d) => d.cantMiss).length;
  if (dangerTotal > 0) {
    const cantMissConsidered = key.differentialsToConsider.filter(
      (d) => d.cantMiss && consideredConcepts.has(d.conceptId),
    ).length;
    profile.push({
      id: 'perigo',
      label: 'Reconhecimento de perigo',
      achieved: applicableRedFlags.length - missedRedFlags.length + cantMissConsidered,
      total: dangerTotal,
      meaning: 'Sinais de alarme e diagnósticos fatais se ignorados que você reconheceu.',
    });
  }

  const revised =
    initialHypotheses.length > 0 && finalConcept !== null && !initialHypotheses.includes(finalConcept);
  if (a2 && a5) {
    profile.push({
      id: 'flexibilidade',
      label: 'Flexibilidade',
      achieved: revised ? 1 : 0,
      total: 1,
      meaning: revised
        ? 'Você revisou sua hipótese diante das informações que foram surgindo.'
        : 'Você manteve a hipótese inicial até o fim. Isso pode ser convicção bem fundamentada ou fechamento prematuro — vale reler o que apareceu depois.',
    });
  }

  /* ---------------------------------------------------- sinais de processo */

  const commitStageIdx = dp2
    ? c.stages.findIndex((s) => s.decisionPoints.includes(dp2.id))
    : -1;

  return {
    caseId: c.id,
    verdict,
    verdictLabel: verdict ? VERDICT_LABELS[verdict] : 'Hipótese não analisada por este caso',
    notAnalysed,
    notAnalysedTerm: a5?.unknownTerm ?? null,
    verdictFeedback,
    verdictDegradedByMissingFindings: degraded,
    processSignals: {
      stagesSeenBeforeCommitting: commitStageIdx >= 0 ? commitStageIdx + 1 : 0,
      totalStages: c.stages.length,
      initialHypotheses,
      finalHypothesis: finalConcept,
      revisedHypothesis: revised,
      testsRequested: session.testsRequested,
      essentialTestsMissed: essentialMissed,
      unnecessaryTestsRequested: unnecessaryRequested,
    },
    contradicting,
    supporting,
    missedRedFlags,
    criticalRedFlagMissed,
    missedDifferentials,
    decisionPointResults,
    triggeredMistakes,
    studentRationale: a5?.rationale ?? '',
    authorReasoning: k5?.authorReasoning ?? '',
    reflectionQuestion: k5?.reflectionQuestion ?? '',
    profile: profile.filter((p) => p.total > 0),
    learningOutcomes: key.learningOutcomes?.items ?? [],
  };
}

/** Nome legível de um exame, para uso na UI. */
export function testName(c: Pick<ClinicalCase, 'availableTests'>, testId: string): string {
  return c.availableTests.find((t) => t.id === testId)?.name ?? testId;
}
