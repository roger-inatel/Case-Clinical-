import { getPublishedCases } from '@/content/registry';
import { ButtonLink, CaseCard, EmptyState, PageHeader } from '@/ui';

export default function AllCasesPage() {
  const cases = getPublishedCases();

  return (
    <div className="mx-auto max-w-catalog px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-12">
      <PageHeader
        eyebrow="Catálogo"
        title="Todos os casos"
        lead={`${cases.length} ${cases.length === 1 ? 'caso disponível' : 'casos disponíveis'}. A área não é exibida em destaque: aqui a apresentação clínica é o ponto de partida, não a especialidade.`}
      />

      {cases.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Nenhum caso disponível"
            action={
              <ButtonLink href="/" variant="outline" size="lg">
                Voltar ao início
              </ButtonLink>
            }
          >
            O catálogo ainda não tem casos publicados.
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
