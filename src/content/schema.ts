import { z } from 'zod';

/**
 * Schemas de conteúdo — fonte única de verdade do contrato.
 * Referência: docs/03-architecture/data-model.md
 *
 * Campos prefixados com "_" são notas de autoria e passam sem validação
 * (`.passthrough()`), de propósito: são para humanos, não para o motor.
 */

/* ------------------------------------------------------------------ enums */

export const EVIDENCE_RELATIONS = ['supports', 'contradicts', 'neutral'] as const;
export type EvidenceRelation = (typeof EVIDENCE_RELATIONS)[number];

export const VERDICTS = [
  'muito_compativel',
  'compativel',
  'parcialmente_compativel',
  'pouco_compativel',
  'incompativel',
  'dados_insuficientes',
] as const;
export type Verdict = (typeof VERDICTS)[number];

export const TIERS = ['esperada', 'aceitavel', 'implausivel'] as const;
export const TEST_VALUES = ['essencial', 'util', 'desnecessario', 'inadequado'] as const;
export const DIFFICULTIES = ['facil', 'intermediario', 'avancado'] as const;
export const REVIEW_STATUSES = [
  'draft',
  'pending_human_review',
  'reviewed',
  'approved',
] as const;

export const DECISION_POINT_TYPES = [
  'problem-representation',
  'hypothesis-list',
  'probability-shift',
  'test-selection',
  'final-hypothesis',
] as const;
export type DecisionPointType = (typeof DECISION_POINT_TYPES)[number];

/* ------------------------------------------------------------------- caso */

const FindingSchema = z
  .object({
    id: z.string().min(1),
    category: z.string().min(1),
    text: z.string().min(10),
    isDistractor: z.boolean().optional(),
    revealedBy: z.string().optional(),
  })
  .passthrough();

const StageSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    decisionPoints: z.array(z.string()).default([]),
    vitals: z.record(z.string()).optional(),
    findings: z.array(FindingSchema).min(1),
  })
  .passthrough();

const AvailableTestSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    turnaround: z.string().min(1),
    revealsFindings: z.array(z.string()).min(1),
  })
  .passthrough();

const QualifierOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const DecisionPointSchema = z.discriminatedUnion('type', [
  z
    .object({
      id: z.string(),
      type: z.literal('problem-representation'),
      prompt: z.string().min(10),
      maxSelections: z.number().int().positive(),
      required: z.boolean().default(true),
      options: z.array(QualifierOptionSchema).min(2),
    })
    .passthrough(),
  z
    .object({
      id: z.string(),
      type: z.literal('hypothesis-list'),
      prompt: z.string().min(10),
      maxSelections: z.number().int().positive(),
      required: z.boolean().default(true),
    })
    .passthrough(),
  z
    .object({
      id: z.string(),
      type: z.literal('probability-shift'),
      prompt: z.string().min(10),
      aboutFinding: z.string().min(1),
      required: z.boolean().default(true),
    })
    .passthrough(),
  z
    .object({
      id: z.string(),
      type: z.literal('test-selection'),
      prompt: z.string().min(10),
      maxSelections: z.number().int().positive(),
      required: z.boolean().default(true),
    })
    .passthrough(),
  z
    .object({
      id: z.string(),
      type: z.literal('final-hypothesis'),
      prompt: z.string().min(10),
      requiresEvidenceSelection: z.boolean().default(true),
      requiresRationaleText: z.boolean().default(true),
      required: z.boolean().default(true),
    })
    .passthrough(),
]);

const SourceSchema = z
  .object({
    title: z.string().min(1),
    organization: z.string().min(1),
    year: z.number().int(),
    url: z.string().url(),
    usedFor: z.array(z.string()).min(1),
    readingLevel: z.string().optional(),
  })
  .passthrough();

export const CaseSchema = z
  .object({
    id: z.string().min(1),
    schemaVersion: z.number().int().positive(),
    revision: z.number().int().positive().default(1),
    schemaExtensions: z.array(z.string()).optional(),
    specialty: z.string().min(1),
    difficulty: z.enum(DIFFICULTIES),
    title: z.string().min(5),
    estimatedMinutes: z.number().int().positive(),
    tags: z.array(z.string()),
    learningObjectives: z.array(z.string()).min(1),
    patient: z
      .object({
        age: z.number().int().positive(),
        sex: z.string().min(1),
        context: z.string().min(1),
      })
      .passthrough(),
    stages: z.array(StageSchema).min(2),
    availableTests: z.array(AvailableTestSchema).default([]),
    decisionPoints: z.array(DecisionPointSchema).min(1),
    disclaimer: z.string().min(10),
    authoring: z
      .object({
        createdBy: z.string().min(1),
        aiAssisted: z.boolean().optional(),
        redTeamPassedAt: z.string().nullable(),
        reviewedBy: z.string().nullable(),
        reviewedAt: z.string().nullable(),
        reviewStatus: z.enum(REVIEW_STATUSES),
        fictional: z.boolean(),
      })
      .passthrough(),
    sources: z.array(SourceSchema).min(1),
  })
  .passthrough();

export type ClinicalCase = z.infer<typeof CaseSchema>;
export type Finding = z.infer<typeof FindingSchema>;
export type Stage = z.infer<typeof StageSchema>;
export type AvailableTest = z.infer<typeof AvailableTestSchema>;
export type DecisionPoint = z.infer<typeof DecisionPointSchema>;

/* ------------------------------------------------------------------ chave */

const EvidenceCellSchema = z.object({
  rel: z.enum(EVIDENCE_RELATIONS),
  why: z.string().min(20),
});

const RedFlagSchema = z
  .object({
    id: z.string().min(1),
    findingIds: z.array(z.string()).min(1),
    requiresFindings: z.array(z.string()).optional(),
    critical: z.boolean(),
    text: z.string().min(10),
    whyDangerous: z.string().min(10),
  })
  .passthrough();

const ProblemRepresentationKey = z
  .object({
    expected: z.array(z.string()).min(1),
    acceptable: z.array(z.string()).default([]),
    misleading: z.array(z.string()).default([]),
    authorRepresentation: z.string().min(10),
    feedbackByOption: z.record(
      z.object({
        role: z.enum(['expected', 'acceptable', 'misleading']),
        whenMissing: z.string().optional(),
        whenSelected: z.string().optional(),
      }),
    ),
    summaryTemplate: z.string().optional(),
  })
  .passthrough();

const HypothesisListKey = z
  .object({
    minExpected: z.number().int().nonnegative().default(1),
    concepts: z.record(
      z
        .object({
          credit: z.number().min(0).max(1),
          tier: z.enum(TIERS),
          cantMiss: z.boolean().optional(),
          feedback: z.string().min(10),
        })
        .passthrough(),
    ),
  })
  .passthrough();

const ProbabilityShiftKey = z
  .object({
    aboutConcept: z.string().min(1),
    aboutFinding: z.string().optional(),
    directionScale: z.record(z.string()),
    expectedDirection: z.number().int().min(-2).max(2),
    acceptableRange: z.tuple([z.number().int(), z.number().int()]),
    rationale: z.string().min(20),
    feedbackByDirection: z.record(z.string().min(10)),
  })
  .passthrough();

const TestSelectionKey = z
  .object({
    tests: z.record(
      z
        .object({
          value: z.enum(TEST_VALUES),
          feedback: z.string().min(10),
        })
        .passthrough(),
    ),
    essentialMissedMessage: z.string().min(10),
    excessMessage: z.string().optional(),
  })
  .passthrough();

const VerdictEntrySchema = z
  .object({
    verdict: z.enum(VERDICTS),
    requiresFindings: z.array(z.string()).optional(),
    feedback: z.string().min(10),
    verdictWhenMissing: z
      .object({
        verdict: z.enum(VERDICTS),
        feedback: z.string().min(10),
      })
      .optional(),
  })
  .passthrough()
  .refine((v) => !v.requiresFindings || !!v.verdictWhenMissing, {
    message: 'requiresFindings exige verdictWhenMissing (EXT-8)',
  });

const FinalHypothesisKey = z
  .object({
    verdicts: z.record(VerdictEntrySchema),
    authorReasoning: z.string().min(20),
    reflectionQuestion: z.string().min(10),
  })
  .passthrough();

const DecisionKeySchema = z.union([
  ProblemRepresentationKey,
  HypothesisListKey,
  ProbabilityShiftKey,
  TestSelectionKey,
  FinalHypothesisKey,
]);

export const KeySchema = z
  .object({
    caseId: z.string().min(1),
    schemaVersion: z.number().int().positive(),
    revision: z.number().int().positive().default(1),
    schemaExtensions: z.array(z.string()).optional(),
    learningOutcomes: z
      .object({ items: z.array(z.string()).min(1) })
      .passthrough()
      .optional(),
    evidenceMatrix: z.record(z.record(EvidenceCellSchema)),
    redFlags: z.array(RedFlagSchema).min(1),
    decisionKeys: z.record(DecisionKeySchema),
    commonMistakes: z
      .array(
        z
          .object({
            trap: z.string().min(5),
            why: z.string().min(10),
            triggeredWhen: z
              .object({
                selectedConcept: z.string().optional(),
                evidenceMisclassified: z
                  .object({
                    finding: z.string(),
                    concept: z.string(),
                    markedAs: z.enum(EVIDENCE_RELATIONS),
                  })
                  .optional(),
              })
              .optional(),
          })
          .passthrough(),
      )
      .default([]),
    differentialsToConsider: z
      .array(
        z
          .object({
            conceptId: z.string().min(1),
            why: z.string().min(10),
            cantMiss: z.boolean().default(false),
          })
          .passthrough(),
      )
      .default([]),
  })
  .passthrough();

export type CaseKey = z.infer<typeof KeySchema>;
export type ProblemRepresentationKeyT = z.infer<typeof ProblemRepresentationKey>;
export type HypothesisListKeyT = z.infer<typeof HypothesisListKey>;
export type ProbabilityShiftKeyT = z.infer<typeof ProbabilityShiftKey>;
export type TestSelectionKeyT = z.infer<typeof TestSelectionKey>;
export type FinalHypothesisKeyT = z.infer<typeof FinalHypothesisKey>;
export type VerdictEntry = z.infer<typeof VerdictEntrySchema>;
export type EvidenceCell = z.infer<typeof EvidenceCellSchema>;
export type RedFlag = z.infer<typeof RedFlagSchema>;

/* ------------------------------------------------------------ vocabulário */

const ConceptSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    aliases: z.array(z.string()).default([]),
    specialties: z.array(z.string()).optional(),
    category: z.string().optional(),
    special: z.boolean().optional(),
    parentConcept: z.string().optional(),
  })
  .passthrough();

export const VocabularySchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    concepts: z.array(ConceptSchema).min(1),
  })
  .passthrough();

export type Concept = z.infer<typeof ConceptSchema>;
export type Vocabulary = z.infer<typeof VocabularySchema>;

/* ---------------------------------------------------------- especialidades */

export const SpecialtiesSchema = z
  .object({
    schemaVersion: z.number().int().positive(),
    specialties: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          description: z.string().min(10),
          order: z.number().int(),
        }),
      )
      .min(1),
  })
  .passthrough();

export type Specialty = z.infer<typeof SpecialtiesSchema>['specialties'][number];
