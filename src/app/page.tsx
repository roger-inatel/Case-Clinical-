import Link from 'next/link';
import { ArrowRight, HeartPulse, Info, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { getSpecialtiesWithCases } from '@/content/registry';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Bullet,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  SectionHeading,
} from '@/ui';

/** Ícone por especialidade. Decorativo — o rótulo textual continua sendo o dado. */
const SPECIALTY_ICON: Record<string, LucideIcon> = {
  cardiologia: HeartPulse,
  pneumologia: Wind,
};

const HOW_IT_WORKS = [
  {
    title: 'A informação chega aos poucos',
    body: 'Queixa, história, exame físico e resultados aparecem na ordem em que apareceriam no atendimento — não de uma vez.',
  },
  {
    title: 'Você se compromete antes de saber',
    body: 'Em cada ponto de decisão sua resposta é registrada e travada. É o que torna visível como o raciocínio muda quando o dado seguinte chega.',
  },
  {
    title: 'A análise mostra os dois lados',
    body: 'No fim, o que sustenta e o que contradiz a sua hipótese — comparado a uma chave que uma pessoa escreveu e revisou.',
  },
];

const WHAT_IT_IS_NOT = [
  'Não diagnostica pacientes — todos os casos são fictícios.',
  'Não substitui professor, preceptor ou literatura médica.',
  'Não usa inteligência artificial em tempo de execução.',
];

export default function HomePage() {
  const specialties = getSpecialtiesWithCases();

  return (
    <div className="mx-auto max-w-catalog px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
      {/* ------------------------------------------------------------ abertura */}
      <section className="max-w-reading">
        <PageHeader
          eyebrow="Medicina · Raciocínio clínico"
          title="Pratique raciocínio clínico, não memorização"
          lead="Casos clínicos fictícios apresentados em etapas. Você se compromete com hipóteses, escolhe exames e justifica sua conclusão — e recebe uma análise estruturada do que sustenta e do que contradiz o seu raciocínio."
          actions={
            <>
              <ButtonLink href="/casos/" size="lg">
                Ver todos os casos
                <ArrowRight aria-hidden />
              </ButtonLink>
              <a
                href="#areas"
                className="text-sm font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
              >
                Escolher por área
              </a>
            </>
          }
        />
      </section>

      {/* --------------------------------------------------------- como funciona */}
      <section className="mt-16" aria-labelledby="como-funciona">
        <SectionHeading id="como-funciona" eyebrow="Como funciona">
          Três compromissos do exercício
        </SectionHeading>

        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full p-5 sm:p-6">
                <p
                  aria-hidden
                  className="font-case text-xl font-semibold tabular-nums text-primary"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------------- áreas */}
      <section className="mt-16" aria-labelledby="areas">
        <SectionHeading
          id="areas"
          eyebrow="Catálogo"
          hint="As duas áreas compartilham apresentações clínicas de propósito — dor torácica e dispneia aparecem nas duas."
        >
          Escolha uma área
        </SectionHeading>

        {specialties.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Nenhuma área disponível">
              Ainda não há casos publicados no catálogo.
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {specialties.map((s) => {
              const Icon = SPECIALTY_ICON[s.id];
              return (
                <li key={s.id}>
                  <Card className="group relative h-full p-5 transition-shadow focus-within:shadow-md hover:shadow-md sm:p-6">
                    <div className="flex items-start gap-4">
                      {Icon && (
                        <span
                          aria-hidden
                          className="grid size-10 shrink-0 place-content-center rounded-md bg-accent text-accent-foreground"
                        >
                          <Icon className="size-5" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
                          <Link
                            href={`/especialidades/${s.id}/`}
                            className="rounded-sm after:absolute after:inset-0 after:content-['']"
                          >
                            {s.label}
                          </Link>
                        </h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">{s.description}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <Badge variant="outline" className="tabular-nums">
                            {s.caseCount}{' '}
                            {s.caseCount === 1 ? 'caso disponível' : 'casos disponíveis'}
                          </Badge>
                          <ArrowRight
                            aria-hidden
                            className="size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 max-w-reading text-sm text-muted-foreground">
          Se preferir não usar a especialidade como pista,{' '}
          <Link
            href="/casos/"
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
          >
            veja todos os casos
          </Link>
          .
        </p>
      </section>

      {/* ------------------------------------------------------------- limites */}
      <section className="mt-16 grid gap-4 lg:grid-cols-2" aria-labelledby="limites">
        <div>
          <SectionHeading id="limites" eyebrow="Limites">
            O que esta ferramenta não é
          </SectionHeading>
          <ul className="mt-4 space-y-2.5">
            {WHAT_IT_IS_NOT.map((line) => (
              <li key={line} className="flex gap-3 text-sm text-muted-foreground">
                <Bullet />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <Alert variant="accent" className="self-start">
          <Info aria-hidden />
          <AlertTitle>Protótipo educacional experimental</AlertTitle>
          <AlertDescription>
            O conteúdo clínico é autoral e destinado ao estudo. A análise que você recebe foi
            escrita por uma pessoa, não gerada automaticamente.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
