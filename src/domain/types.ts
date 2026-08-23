import type {
  ClinicalCase,
  DecisionPoint,
  EvidenceRelation,
  Verdict,
} from '@/content/schema';

/**
 * Tipos do domínio da simulação.
 * PURO: sem React, sem I/O, sem `window`, sem `Date.now()` dentro das funções
 * de decisão. O relógio entra sempre como argumento.
 */

export type DecisionPointId = string;
export type FindingId = string;
export type ConceptId = string;
export type TestId = string;

/** Uma resposta do estudante, por tipo de ponto de decisão. */
export type Answer =
  | { type: 'problem-representation'; selected: string[]; at: number }
  | { type: 'hypothesis-list'; concepts: ConceptId[]; unknownTerms: string[]; at: number }
  | { type: 'probability-shift'; direction: number; at: number }
  | { type: 'test-selection'; tests: TestId[]; at: number }
  | {
      type: 'final-hypothesis';
      concept: ConceptId | null;
      unknownTerm: string | null;
      evidence: Record<FindingId, EvidenceRelation>;
      rationale: string;
      at: number;
    };

export interface Session {
  caseId: string;
  startedAt: number;
  stagesRevealed: string[];
  testsRequested: TestId[];
  answers: Record<DecisionPointId, Answer>;
  completedAt: number | null;
}

/** O que o estudante vê — a chave nunca entra aqui. */
export interface StudentCaseView {
  id: string;
  title: string;
  specialty: string;
  difficulty: ClinicalCase['difficulty'];
  estimatedMinutes: number;
  tags: string[];
  learningObjectives: string[];
  patient: ClinicalCase['patient'];
  disclaimer: string;
  stages: ClinicalCase['stages'];
  availableTests: ClinicalCase['availableTests'];
  decisionPoints: DecisionPoint[];
  sources: ClinicalCase['sources'];
}

/* ---------------------------------------------------------------- resultado */

export interface EvidenceItemResult {
  findingId: FindingId;
  findingText: string;
  relation: EvidenceRelation;
  why: string;
  studentMarked: EvidenceRelation | null;
  /** true quando o estudante não classificou este achado. */
  missed: boolean;
  /** true quando marcou o oposto do que a chave declara. */
  inverted: boolean;
}

export interface ProcessSignals {
  stagesSeenBeforeCommitting: number;
  totalStages: number;
  initialHypotheses: ConceptId[];
  finalHypothesis: ConceptId | null;
  revisedHypothesis: boolean;
  testsRequested: TestId[];
  essentialTestsMissed: TestId[];
  unnecessaryTestsRequested: TestId[];
}

export interface ProfileDimension {
  id: 'amplitude' | 'ancoragem' | 'perigo' | 'flexibilidade';
  label: string;
  achieved: number;
  total: number;
  meaning: string;
}

export interface DecisionPointResult {
  decisionPointId: DecisionPointId;
  type: DecisionPoint['type'];
  prompt: string;
  fragments: string[];
  summary: string | null;
}

export interface EvaluationResult {
  caseId: string;
  /** null quando a hipótese final não foi analisada pelo autor. */
  verdict: Verdict | null;
  verdictLabel: string;
  notAnalysed: boolean;
  notAnalysedTerm: string | null;
  verdictFeedback: string;
  /** true quando o veredito veio de `verdictWhenMissing` (EXT-8). */
  verdictDegradedByMissingFindings: boolean;
  processSignals: ProcessSignals;
  contradicting: EvidenceItemResult[];
  supporting: EvidenceItemResult[];
  missedRedFlags: Array<{ text: string; whyDangerous: string; critical: boolean }>;
  /**
   * true quando um red flag `critical` aplicável não foi reconhecido.
   *
   * O veredito NÃO é rebaixado por isso: ele é sobre a hipótese, e um estudante
   * pode ter a hipótese certa e ainda ter deixado passar um sinal de alarme.
   * Rebaixar diria "parcialmente compatível" a quem acertou, confundindo duas
   * coisas distintas. Em vez disso, a UI exibe este aviso ACIMA do veredito.
   * Ver PROJECT_STATUS.md → decisão D-IMPL-01.
   */
  criticalRedFlagMissed: boolean;
  missedDifferentials: Array<{ label: string; why: string; cantMiss: boolean }>;
  decisionPointResults: DecisionPointResult[];
  triggeredMistakes: Array<{ trap: string; why: string }>;
  studentRationale: string;
  authorReasoning: string;
  reflectionQuestion: string;
  profile: ProfileDimension[];
  learningOutcomes: string[];
}
