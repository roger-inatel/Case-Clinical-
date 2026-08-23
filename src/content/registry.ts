import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import {
  CaseSchema,
  KeySchema,
  VocabularySchema,
  SpecialtiesSchema,
  type ClinicalCase,
  type CaseKey,
  type Vocabulary,
  type Specialty,
} from './schema';

/**
 * Carregamento de conteúdo — SOMENTE SERVIDOR (build time).
 *
 * Objetivo técnico do projeto: "adicionar um novo caso deve ser principalmente
 * adicionar um novo arquivo de conteúdo". Por isso a descoberta é por varredura
 * do diretório, não por lista manual. Um `.case.json` novo aparece sozinho no
 * catálogo — nenhum código de UI precisa mudar.
 *
 * Roda no build (`output: 'export'` prerenderiza tudo) e nos testes. Nunca no
 * navegador: componentes cliente recebem os dados por props.
 */

const CONTENT_DIR = join(process.cwd(), 'content');
const CASES_DIR = join(CONTENT_DIR, 'cases');

/** Status aceitos no catálogo. Ver PROJECT_STATUS.md → "revisão clínica". */
const PUBLISHABLE_STATUSES = new Set(['pending_human_review', 'reviewed', 'approved']);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function fail(file: string, error: unknown): never {
  const detail =
    error && typeof error === 'object' && 'issues' in error
      ? JSON.stringify((error as { issues: unknown }).issues, null, 2)
      : String(error);
  throw new Error(`Conteúdo inválido em ${file}:\n${detail}`);
}

/** Todos os arquivos `*.case.json` sob content/cases/**, em ordem estável. */
function discoverCaseFiles(): string[] {
  if (!existsSync(CASES_DIR)) return [];
  const out: string[] = [];
  for (const specialtyDir of readdirSync(CASES_DIR, { withFileTypes: true })) {
    if (!specialtyDir.isDirectory()) continue;
    const dir = join(CASES_DIR, specialtyDir.name);
    for (const file of readdirSync(dir)) {
      if (file.endsWith('.case.json')) out.push(join(dir, file));
    }
  }
  return out.sort();
}

let casesCache: ClinicalCase[] | null = null;

export function getAllCases(): ClinicalCase[] {
  if (casesCache) return casesCache;
  const cases = discoverCaseFiles().map((file) => {
    const parsed = CaseSchema.safeParse(readJson(file));
    if (!parsed.success) fail(file, parsed.error);
    const expectedId = basename(file).replace(/\.case\.json$/, '');
    if (parsed.data.id !== expectedId) {
      throw new Error(`Conteúdo inválido em ${file}: id "${parsed.data.id}" difere do nome do arquivo "${expectedId}".`);
    }
    return parsed.data;
  });
  const ids = new Set<string>();
  for (const c of cases) {
    if (ids.has(c.id)) throw new Error(`caseId duplicado: ${c.id}`);
    ids.add(c.id);
  }
  casesCache = cases;
  return cases;
}

/** Casos que aparecem no catálogo. */
export function getPublishedCases(): ClinicalCase[] {
  return getAllCases().filter((c) => PUBLISHABLE_STATUSES.has(c.authoring.reviewStatus));
}

export function getCase(caseId: string): ClinicalCase | undefined {
  return getAllCases().find((c) => c.id === caseId);
}

export function getCaseKey(caseId: string): CaseKey {
  const c = getCase(caseId);
  if (!c) throw new Error(`Caso inexistente: ${caseId}`);
  const file = join(CASES_DIR, c.specialty, `${caseId}.key.json`);
  if (!existsSync(file)) throw new Error(`Chave ausente para o caso ${caseId} (esperado em ${file}).`);
  const parsed = KeySchema.safeParse(readJson(file));
  if (!parsed.success) fail(file, parsed.error);
  if (parsed.data.caseId !== caseId) {
    throw new Error(`Chave ${file} declara caseId "${parsed.data.caseId}", esperado "${caseId}".`);
  }
  return parsed.data;
}

let vocabCache: Vocabulary | null = null;

export function getVocabulary(): Vocabulary {
  if (vocabCache) return vocabCache;
  const file = join(CONTENT_DIR, 'vocabulary', 'diagnoses.json');
  const parsed = VocabularySchema.safeParse(readJson(file));
  if (!parsed.success) fail(file, parsed.error);
  vocabCache = parsed.data;
  return parsed.data;
}

export function getSpecialties(): Specialty[] {
  const file = join(CONTENT_DIR, 'specialties.json');
  const parsed = SpecialtiesSchema.safeParse(readJson(file));
  if (!parsed.success) fail(file, parsed.error);
  return [...parsed.data.specialties].sort((a, b) => a.order - b.order);
}

/** Especialidades com ao menos um caso publicado. Ver ux-flow §2. */
export function getSpecialtiesWithCases(): Array<Specialty & { caseCount: number }> {
  const cases = getPublishedCases();
  return getSpecialties()
    .map((s) => ({ ...s, caseCount: cases.filter((c) => c.specialty === s.id).length }))
    .filter((s) => s.caseCount > 0);
}

export function getCasesBySpecialty(specialtyId: string): ClinicalCase[] {
  return getPublishedCases().filter((c) => c.specialty === specialtyId);
}
