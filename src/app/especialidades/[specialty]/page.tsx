import { notFound } from 'next/navigation';

import { getCasesBySpecialty, getSpecialtiesWithCases } from '@/content/registry';
import { Breadcrumb, CaseCard, EmptyState, PageHeader } from '@/ui';

export function generateStaticParams() {
  return getSpecialtiesWithCases().map((s) => ({ specialty: s.id }));
}

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ specialty: string }>;
}) {
  const { specialty } = await params;
  const meta = getSpecialtiesWithCases().find((s) => s.id === specialty);
  if (!meta) notFound();

  const cases = getCasesBySpecialty(specialty);

  return (
    <div className="mx-auto max-w-catalog px-4 pb-16 pt-6 sm:px-6 sm:pb-24">
      <Breadcrumb href="/">Áreas</Breadcrumb>

      <PageHeader
        className="mt-4"
        eyebrow="Área"
        title={meta.label}
        lead={meta.description}
      />

      {cases.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="Nenhum caso nesta área">
            Assim que um caso for publicado aqui, ele aparece automaticamente.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {cases.map((c) => (
            <li key={c.id}>
              <CaseCard clinicalCase={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
