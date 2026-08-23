import { notFound } from 'next/navigation';
import { ArrowRight, Clock, FileWarning, Layers, Lock, Split } from 'lucide-react';

import { getCase, getPublishedCases } from '@/content/registry';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Breadcrumb,
  Bullet,
  ButtonLink,
  Card,
  DocumentBlock,
  DocumentLabel,
  PageHeader,
  SectionHeading,
  Separator,
  DIFFICULTY_LABEL,
  specialtyLabel,
} from '@/ui';

export function generateStaticParams() {
  return getPublishedCases().map((c) => ({ caseId: c.id }));
}

export default async function CaseOverviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const c = getCase(caseId);
  if (!c) notFound();

  const facts = [
    { icon: Layers, label: 'Etapas', value: `${c.stages.length}` },
    { icon: Split, label: 'Pontos de decisão', value: `${c.decisionPoints.length}` },
    { icon: Clock, label: 'Duração estimada', value: `~${c.estimatedMinutes} min` },
  ];

  return (
    <div className="mx-auto max-w-catalog px-4 pb-16 pt-6 sm:px-6 sm:pb-24">
      <Breadcrumb href={`/especialidades/${c.specialty}/`}>{specialtyLabel(c.specialty)}</Breadcrumb>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="accent">{DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}</Badge>
        {c.tags.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </div>

      <PageHeader className="mt-3" title={c.title} />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        {/* ------------------------------------------------------------ coluna */}
        <div className="min-w-0 space-y-8">
          <DocumentBlock label={<DocumentLabel>Apresentação</DocumentLabel>}>
            <p className="case-prose">
              {c.patient.age} anos, {c.patient.sex}, {c.patient.context}.
            </p>
          </DocumentBlock>

          <section aria-labelledby="o-que-esperar">
            <SectionHeading id="o-que-esperar" eyebrow="Antes de começar">
              O que esperar
            </SectionHeading>
            <ul className="mt-4 space-y-3 text-base text-muted-foreground">
              <li className="flex gap-3">
                <Bullet />
                As informações são reveladas aos poucos, na ordem em que apareceriam no
                atendimento.
              </li>
              <li className="flex gap-3">
                <Bullet />
                Você escolhe quais exames solicitar — e só vê o resultado dos que pediu.
              </li>
              <li className="flex gap-3">
                <Bullet />
                A análise final compara o seu raciocínio com uma chave escrita e revisada por uma
                pessoa.
              </li>
            </ul>
          </section>

          <section aria-labelledby="temas">
            <SectionHeading id="temas" eyebrow="Escopo">
              Temas deste caso
            </SectionHeading>
            <ul className="mt-4 space-y-3 text-base text-muted-foreground">
              {c.learningObjectives.map((o) => (
                <li key={o} className="flex gap-3">
                  <Bullet />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-4">
            <Alert>
              <Lock aria-hidden />
              <AlertTitle>Suas respostas não podem ser alteradas</AlertTitle>
              <AlertDescription>
                Cada resposta é registrada e travada quando você avança. É assim de propósito:
                parte do exercício é observar como o seu raciocínio evolui à medida que as
                informações chegam.
              </AlertDescription>
            </Alert>

            {/* Caso fictício é enquadramento, não perigo clínico: variante neutra (R2). */}
            <Alert>
              <FileWarning aria-hidden />
              <AlertTitle>Caso fictício</AlertTitle>
              <AlertDescription>{c.disclaimer}</AlertDescription>
            </Alert>
          </div>
        </div>

        {/* ------------------------------------------------------------- painel */}
        <Card className="p-5 sm:p-6 lg:sticky lg:top-20">
          <p className="eyebrow">Este caso</p>

          <dl className="mt-4 space-y-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <dt className="flex-1 text-sm text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <Separator className="my-5" />

          <ButtonLink href={`/casos/${c.id}/simulacao/`} size="lg" className="w-full">
            Iniciar simulação
            <ArrowRight aria-hidden />
          </ButtonLink>

          <p className="mt-3 text-xs text-muted-foreground">
            Sem cadastro. Nada do que você responder sai deste navegador.
          </p>
        </Card>
      </div>
    </div>
  );
}
