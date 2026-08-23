import { describe, expect, it } from 'vitest';
import {
  getAllCases,
  getCaseKey,
  getVocabulary,
  getSpecialties,
} from '@/content/registry';
import type { FinalHypothesisKeyT, ProblemRepresentationKeyT } from '@/content/schema';

/**
 * Validação de conteúdo — barreira 1 do content-review-protocol.
 * Roda sobre TODO caso do catálogo. Bloqueia merge.
 */

const cases = getAllCases();
const vocabulary = getVocabulary();
const conceptIds = new Set(vocabulary.concepts.map((c) => c.id));
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

describe('catálogo', () => {
  it('tem ao menos um caso', () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  it('não tem caseId duplicado', () => {
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
  });

  it('toda especialidade referenciada existe em specialties.json', () => {
    const known = new Set(getSpecialties().map((s) => s.id));
    for (const c of cases) expect(known, `caso ${c.id}`).toContain(c.specialty);
  });
});

describe('vocabulário', () => {
  it('não tem alias colidindo após normalização', () => {
    const seen = new Map<string, string>();
    for (const concept of vocabulary.concepts) {
      for (const alias of concept.aliases) {
        const n = norm(alias);
        expect(seen.has(n), `alias "${alias}" em ${concept.id} e ${seen.get(n)}`).toBe(false);
        seen.set(n, concept.id);
      }
    }
  });

  it('todo conceito não especial tem ao menos 2 aliases', () => {
    for (const c of vocabulary.concepts) {
      if (c.special) continue;
      expect(c.aliases.length, `conceito ${c.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('todo parentConcept existe', () => {
    for (const c of vocabulary.concepts) {
      if (c.parentConcept) expect(conceptIds).toContain(c.parentConcept);
    }
  });
});

describe.each(cases.map((c) => [c.id, c] as const))('caso %s', (_id, clinicalCase) => {
  const key = getCaseKey(clinicalCase.id);
  const findings = clinicalCase.stages.flatMap((s) => s.findings);
  const findingIds = new Set(findings.map((f) => f.id));
  const testIds = new Set(clinicalCase.availableTests.map((t) => t.id));
  const stageOf = new Map<string, number>();
  clinicalCase.stages.forEach((s, i) => s.findings.forEach((f) => stageOf.set(f.id, i)));
  const dpStage = new Map<string, number>();
  clinicalCase.stages.forEach((s, i) => s.decisionPoints.forEach((d) => dpStage.set(d, i)));
  const conditionalFindings = new Set(findings.filter((f) => f.revealedBy).map((f) => f.id));

  it('achados têm id único', () => {
    expect(findingIds.size).toBe(findings.length);
  });

  it('todo ponto de decisão pertence a uma etapa e tem chave', () => {
    for (const dp of clinicalCase.decisionPoints) {
      expect(dpStage.has(dp.id), `dp ${dp.id} sem etapa`).toBe(true);
      expect(key.decisionKeys[dp.id], `dp ${dp.id} sem chave`).toBeDefined();
    }
  });

  it('não há chave órfã', () => {
    const known = new Set(clinicalCase.decisionPoints.map((d) => d.id));
    for (const id of Object.keys(key.decisionKeys)) expect(known).toContain(id);
  });

  it('exames e achados condicionais casam nos dois sentidos', () => {
    for (const t of clinicalCase.availableTests) {
      for (const f of t.revealsFindings) expect(findingIds).toContain(f);
    }
    for (const f of findings) {
      if (f.revealedBy) expect(testIds).toContain(f.revealedBy);
    }
  });

  it('toda célula da evidenceMatrix referencia achado e conceito existentes', () => {
    for (const [fid, row] of Object.entries(key.evidenceMatrix)) {
      expect(findingIds, `finding ${fid}`).toContain(fid);
      for (const cid of Object.keys(row)) {
        expect(conceptIds, `conceito ${cid} em ${fid}`).toContain(cid);
      }
    }
  });

  it('red flags referenciam achados existentes', () => {
    for (const rf of key.redFlags) {
      for (const f of rf.findingIds) expect(findingIds, `redFlag ${rf.id}`).toContain(f);
    }
  });

  // R11: penalizar por informação indisponível é a mesma classe de erro que B1.
  it('red flag ancorado em achado condicional declara requiresFindings', () => {
    for (const rf of key.redFlags) {
      const conditional = rf.findingIds.filter((f) => conditionalFindings.has(f));
      if (conditional.length > 0) {
        expect(rf.requiresFindings, `redFlag ${rf.id}`).toBeDefined();
      }
    }
  });

  // A regra mais crítica: ninguém é avaliado com informação que ainda não tinha.
  it('REGRA TEMPORAL: nenhum ponto de decisão referencia achado de etapa posterior', () => {
    for (const dp of clinicalCase.decisionPoints) {
      if (dp.type !== 'probability-shift') continue;
      const dpIdx = dpStage.get(dp.id);
      const fIdx = stageOf.get(dp.aboutFinding);
      expect(fIdx, `aboutFinding ${dp.aboutFinding} inexistente`).toBeDefined();
      expect(fIdx!, `dp ${dp.id}`).toBeLessThanOrEqual(dpIdx!);
    }
  });

  it('problem-representation: toda opção está classificada e tem fragmento', () => {
    const dp = clinicalCase.decisionPoints.find((d) => d.type === 'problem-representation');
    if (!dp || dp.type !== 'problem-representation') return;
    const k = key.decisionKeys[dp.id] as ProblemRepresentationKeyT;
    const classified = new Set([...k.expected, ...k.acceptable, ...k.misleading]);
    for (const opt of dp.options) {
      expect(classified, `opção ${opt.id} sem classificação`).toContain(opt.id);
      expect(k.feedbackByOption[opt.id], `opção ${opt.id} sem fragmento`).toBeDefined();
    }
    expect(k.expected.length).toBeLessThanOrEqual(dp.maxSelections);
  });

  it('todo conceito citado nas chaves existe no vocabulário', () => {
    for (const dpKey of Object.values(key.decisionKeys)) {
      const k = dpKey as Record<string, unknown>;
      if (k.concepts) for (const id of Object.keys(k.concepts)) expect(conceptIds).toContain(id);
      if (k.verdicts) for (const id of Object.keys(k.verdicts)) expect(conceptIds).toContain(id);
      if (typeof k.aboutConcept === 'string') expect(conceptIds).toContain(k.aboutConcept);
    }
    for (const d of key.differentialsToConsider) expect(conceptIds).toContain(d.conceptId);
  });

  it('commonMistakes só dispara em estados que o motor possui', () => {
    for (const m of key.commonMistakes) {
      const t = m.triggeredWhen;
      if (!t) continue;
      if (t.selectedConcept) expect(conceptIds).toContain(t.selectedConcept);
      if (t.evidenceMisclassified) {
        expect(findingIds).toContain(t.evidenceMisclassified.finding);
        expect(conceptIds).toContain(t.evidenceMisclassified.concept);
      }
    }
  });

  /**
   * REGRESSÃO B1 — o defeito mais grave encontrado pelo red team.
   * Um veredito não pode afirmar resultado de exame que o estudante pode não
   * ter obtido. A violação vive em PROSA, então a verificação varre texto.
   */
  it('REGRESSÃO B1: veredito não cita resultado de exame sem requiresFindings', () => {
    const dp = clinicalCase.decisionPoints.find((d) => d.type === 'final-hypothesis');
    if (!dp) return;
    const k = key.decisionKeys[dp.id] as FinalHypothesisKeyT;
    const examWords: Array<[string, string[]]> = [];
    for (const test of clinicalCase.availableTests) {
      const conditional = test.revealsFindings.filter((f) => conditionalFindings.has(f));
      if (conditional.length === 0) continue;
      const words = norm(test.name)
        .replace(/\(.*?\)/g, '')
        .split(/[\s,]+/)
        .filter((w) => w.length > 5);
      for (const w of words) examWords.push([w, conditional]);
    }
    /**
     * Vocabulário do RESULTADO — palavras que só podem ser ditas por quem viu o
     * laudo, e que o nome do exame não entrega. Endereçado por caso: um id como
     * `f17` significa coisas diferentes em casos diferentes, e aplicar a lista
     * de um caso ao outro é acusar defeito onde não há.
     */
    const resultWords: Record<string, Array<[string, string[]]>> = {
      'cardio-001': [
        ['percentil 99', ['f17']],
        ['supradesnivelamento', ['f16']],
      ],
      'pneumo-001': [
        ['broncograma', ['f16']],
        ['opacidade', ['f16']],
        ['leucocitose', ['f17']],
        ['desvio a esquerda', ['f17']],
      ],
    };
    const perCase = resultWords[clinicalCase.id] ?? [];
    examWords.push(...perCase);

    for (const [conceptId, entry] of Object.entries(k.verdicts)) {
      const required = new Set(entry.requiresFindings ?? []);
      const text = norm(entry.feedback);
      for (const [word, needed] of examWords) {
        if (!findingIds.has(needed[0]!)) continue;
        if (text.includes(word) && !needed.some((f) => required.has(f))) {
          throw new Error(
            `verdicts["${conceptId}"].feedback menciona "${word}" sem requiresFindings ${needed.join('/')}`,
          );
        }
      }

      /**
       * O ramo `verdictWhenMissing` é exibido justamente a quem NÃO obteve o
       * achado. Ele não pode AFIRMAR o resultado — mas pode, e deve:
       *  - NOMEAR o exame ausente, para explicar por que a conclusão fica
       *    limitada ("sustentar lesão miocárdica exige a troponina");
       *  - NOMEAR a própria hipótese do estudante, mesmo quando o rótulo dela
       *    contém uma palavra de laudo ("SEM supradesnivelamento do ST").
       * Por isso entram aqui só palavras de resultado que não aparecem em
       * nenhum rótulo de conceito avaliado por este caso.
       */
      if (!entry.verdictWhenMissing) continue;
      const labelText = norm(
        Object.keys(k.verdicts)
          .map((id) => vocabulary.concepts.find((c) => c.id === id)?.label ?? '')
          .join(' '),
      );
      const missingText = norm(entry.verdictWhenMissing.feedback);
      for (const [word, needed] of perCase) {
        if (!needed.some((f) => required.has(f))) continue;
        if (labelText.includes(word)) continue;
        if (missingText.includes(word)) {
          throw new Error(
            `verdicts["${conceptId}"].verdictWhenMissing.feedback afirma "${word}", que só existe no achado que faltou`,
          );
        }
      }
    }
  });

  it('requiresFindings implica verdictWhenMissing e aponta para achados reais', () => {
    const dp = clinicalCase.decisionPoints.find((d) => d.type === 'final-hypothesis');
    if (!dp) return;
    const k = key.decisionKeys[dp.id] as FinalHypothesisKeyT;
    for (const [conceptId, entry] of Object.entries(k.verdicts)) {
      if (!entry.requiresFindings) continue;
      expect(entry.verdictWhenMissing, `veredito ${conceptId}`).toBeDefined();
      for (const f of entry.requiresFindings) expect(findingIds).toContain(f);
    }
  });

  it('completude pedagógica: distrator, red flag, cantMiss e fontes', () => {
    expect(findings.filter((f) => f.isDistractor).length).toBeGreaterThanOrEqual(1);
    expect(key.redFlags.length).toBeGreaterThanOrEqual(1);
    expect(clinicalCase.sources.length).toBeGreaterThanOrEqual(1);
    const dp = clinicalCase.decisionPoints.find((d) => d.type === 'hypothesis-list');
    if (dp) {
      const k = key.decisionKeys[dp.id] as { concepts: Record<string, { cantMiss?: boolean }> };
      expect(Object.keys(k.concepts).length).toBeGreaterThanOrEqual(3);
      expect(Object.values(k.concepts).some((v) => v.cantMiss)).toBe(true);
    }
  });

  it('integridade da revisão: approved exige revisor e red team', () => {
    const a = clinicalCase.authoring;
    if (a.reviewStatus === 'approved') {
      expect(a.reviewedBy).toBeTruthy();
      expect(a.reviewedAt).toBeTruthy();
      expect(a.redTeamPassedAt).toBeTruthy();
    }
  });
});
