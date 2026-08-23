import type { ClinicalCase, DecisionPoint, Finding } from '@/content/schema';
import type { Answer, DecisionPointId, Session, StudentCaseView } from './types';

/**
 * Simulation engine — PURO.
 * Controla etapas, revelação progressiva e registro de respostas.
 * Não conhece React nem armazenamento. Recebe o relógio como argumento.
 */

export function toStudentView(c: ClinicalCase): StudentCaseView {
  return {
    id: c.id,
    title: c.title,
    specialty: c.specialty,
    difficulty: c.difficulty,
    estimatedMinutes: c.estimatedMinutes,
    tags: c.tags,
    learningObjectives: c.learningObjectives,
    patient: c.patient,
    disclaimer: c.disclaimer,
    stages: c.stages,
    availableTests: c.availableTests,
    decisionPoints: c.decisionPoints,
    sources: c.sources,
  };
}

export function createSession(caseId: string, firstStageId: string, now: number): Session {
  return {
    caseId,
    startedAt: now,
    stagesRevealed: [firstStageId],
    testsRequested: [],
    answers: {},
    completedAt: null,
  };
}

export function getDecisionPoint(
  c: Pick<StudentCaseView, 'decisionPoints'>,
  id: DecisionPointId,
): DecisionPoint | undefined {
  return c.decisionPoints.find((d) => d.id === id);
}

/** Índice da etapa a que um ponto de decisão pertence. -1 se órfão. */
export function stageIndexOfDecisionPoint(
  c: Pick<StudentCaseView, 'stages'>,
  id: DecisionPointId,
): number {
  return c.stages.findIndex((s) => s.decisionPoints.includes(id));
}

/**
 * Achados que o estudante já viu.
 * Regra dupla: a etapa precisa estar revelada E, se o achado depende de exame,
 * o exame precisa ter sido solicitado. É o que garante que ninguém seja
 * avaliado com informação que não obteve.
 */
export function revealedFindings(
  c: Pick<StudentCaseView, 'stages'>,
  session: Pick<Session, 'stagesRevealed' | 'testsRequested'>,
): Finding[] {
  const out: Finding[] = [];
  for (const stage of c.stages) {
    if (!session.stagesRevealed.includes(stage.id)) continue;
    for (const f of stage.findings) {
      if (f.revealedBy && !session.testsRequested.includes(f.revealedBy)) continue;
      out.push(f);
    }
  }
  return out;
}

/** Achados visíveis no momento em que um ponto de decisão foi apresentado. */
export function findingsAvailableAt(
  c: Pick<StudentCaseView, 'stages'>,
  session: Pick<Session, 'testsRequested'>,
  decisionPointId: DecisionPointId,
): Finding[] {
  const idx = stageIndexOfDecisionPoint(c, decisionPointId);
  if (idx < 0) return [];
  const stageIds = c.stages.slice(0, idx + 1).map((s) => s.id);
  return revealedFindings(c, { stagesRevealed: stageIds, testsRequested: session.testsRequested });
}

export function currentStageIndex(c: Pick<StudentCaseView, 'stages'>, session: Session): number {
  return Math.max(0, c.stages.findIndex((s) => s.id === session.stagesRevealed.at(-1)));
}

export function pendingDecisionPoints(
  c: Pick<StudentCaseView, 'stages' | 'decisionPoints'>,
  session: Session,
): DecisionPoint[] {
  const idx = currentStageIndex(c, session as Session);
  const stage = c.stages[idx];
  if (!stage) return [];
  return stage.decisionPoints
    .filter((id) => !(id in session.answers))
    .map((id) => getDecisionPoint(c, id))
    .filter((d): d is DecisionPoint => Boolean(d));
}

/** A etapa atual só se fecha quando todos os seus pontos obrigatórios foram respondidos. */
export function canAdvance(
  c: Pick<StudentCaseView, 'stages' | 'decisionPoints'>,
  session: Session,
): boolean {
  const idx = currentStageIndex(c, session as Session);
  if (idx >= c.stages.length - 1) return false;
  return pendingDecisionPoints(c, session).length === 0;
}

export function advanceStage(c: Pick<StudentCaseView, 'stages'>, session: Session): Session {
  const idx = currentStageIndex(c, session);
  const next = c.stages[idx + 1];
  if (!next || session.stagesRevealed.includes(next.id)) return session;
  return { ...session, stagesRevealed: [...session.stagesRevealed, next.id] };
}

/**
 * Registra uma resposta. Respostas são IRREVERSÍVEIS — é o que dá sentido ao
 * sinal de revisão de hipótese (ux-flow §2). Uma segunda gravação é ignorada.
 */
export function recordAnswer(
  session: Session,
  decisionPointId: DecisionPointId,
  answer: Answer,
): Session {
  if (decisionPointId in session.answers) return session;
  const next: Session = {
    ...session,
    answers: { ...session.answers, [decisionPointId]: answer },
  };
  if (answer.type === 'test-selection') {
    next.testsRequested = [...new Set([...session.testsRequested, ...answer.tests])];
  }
  return next;
}

export function isAnswered(session: Session, decisionPointId: DecisionPointId): boolean {
  return decisionPointId in session.answers;
}

export function isComplete(
  c: Pick<StudentCaseView, 'decisionPoints'>,
  session: Session,
): boolean {
  return c.decisionPoints.every((d) => d.required === false || d.id in session.answers);
}

export function completeSession(session: Session, now: number): Session {
  return session.completedAt ? session : { ...session, completedAt: now };
}

/** Progresso por etapas — nunca percentual (design-system R5). */
export function stageProgress(
  c: Pick<StudentCaseView, 'stages'>,
  session: Session,
): { current: number; total: number; label: string } {
  const idx = currentStageIndex(c, session);
  const stage = c.stages[idx];
  return { current: idx + 1, total: c.stages.length, label: stage?.label ?? '' };
}
