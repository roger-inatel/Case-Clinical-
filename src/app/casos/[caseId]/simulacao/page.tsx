import { notFound } from 'next/navigation';
import { getCase, getCaseKey, getPublishedCases, getVocabulary } from '@/content/registry';
import { toStudentView } from '@/domain/simulation';
import { CaseRunner } from '@/features/CaseRunner';

export function generateStaticParams() {
  return getPublishedCases().map((c) => ({ caseId: c.id }));
}

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const clinicalCase = getCase(caseId);
  if (!clinicalCase) notFound();

  // A chave é carregada no build e entregue ao componente cliente.
  // ADR-0007: sem servidor, o gabarito chega ao navegador — a separação
  // caso × chave permanece como fronteira arquitetural e anti-spoiler
  // acidental, não como garantia de sigilo. É consequência aceita e declarada.
  const key = getCaseKey(caseId);

  return (
    <CaseRunner
      caseView={toStudentView(clinicalCase)}
      caseKey={key}
      vocabulary={getVocabulary()}
    />
  );
}
