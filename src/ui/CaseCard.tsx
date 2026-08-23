import Link from 'next/link';
import { ArrowRight, Clock, Layers, Split } from 'lucide-react';

import type { ClinicalCase } from '@/content/schema';
import { Badge } from '@/ui/shadcn/badge';
import { Card } from '@/ui/shadcn/card';
import { DIFFICULTY_LABEL, specialtyLabel } from '@/ui/labels';

/**
 * Card de catálogo.
 *
 * Mostra apenas o PRIMEIRO objetivo de aprendizagem — e os objetivos do caso já
 * são temáticos, sem resolução (red team B6). Ler a lista completa antes de
 * começar entregaria as respostas.
 */
export function CaseCard({ clinicalCase }: { clinicalCase: ClinicalCase }) {
  const objective = clinicalCase.learningObjectives[0];

  return (
    <Card className="group relative h-full transition-shadow focus-within:shadow-md hover:shadow-md">
      <div className="flex h-full flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">
            {DIFFICULTY_LABEL[clinicalCase.difficulty] ?? clinicalCase.difficulty}
          </Badge>
          <Badge variant="outline">{specialtyLabel(clinicalCase.specialty)}</Badge>
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
            {/* O link cobre o card inteiro; o texto continua sendo o rótulo. */}
            <Link
              href={`/casos/${clinicalCase.id}/`}
              className="rounded-sm after:absolute after:inset-0 after:content-['']"
            >
              {clinicalCase.title}
            </Link>
          </h3>
          {objective && <p className="text-sm text-muted-foreground">{objective}</p>}
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Duração estimada</dt>
            <dd className="tabular-nums">~{clinicalCase.estimatedMinutes} min</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Etapas</dt>
            <dd className="tabular-nums">{clinicalCase.stages.length} etapas</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Split className="size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Pontos de decisão</dt>
            <dd className="tabular-nums">
              {clinicalCase.decisionPoints.length} pontos de decisão
            </dd>
          </div>
          <ArrowRight
            className="ml-auto size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </dl>
      </div>
    </Card>
  );
}
