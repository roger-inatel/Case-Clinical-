'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown,
  Equal,
  ExternalLink,
  Minus,
  Plus,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react';

import type { EvaluationResult, StudentCaseView } from '@/domain/types';
import type { Verdict } from '@/content/schema';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Breadcrumb,
  Bullet,
  Button,
  ButtonLink,
  Card,
  CommentaryBlock,
  PageHeader,
  SectionHeading,
  Separator,
  cn,
} from '@/ui';
import { testName } from '@/evaluation/evaluate';

/**
 * Tela de resultado.
 *
 * O feedback é REVELADO em sequência, com interação obrigatória entre seções —
 * não é uma página que se rola. A evidência mostra que estudantes ignoram
 * feedback elaborado entregue como muro de texto (research/assessment-formats §6).
 */

/** Faixa de cor do veredito. Nunca é o único portador: o rótulo textual vem logo abaixo (R3). */
const VERDICT_TONE: Record<Verdict, string> = {
  muito_compativel: 'bg-verdict-strong-support',
  compativel: 'bg-verdict-support',
  parcialmente_compativel: 'bg-verdict-support',
  pouco_compativel: 'bg-verdict-weak',
  incompativel: 'bg-verdict-none',
  dados_insuficientes: 'bg-verdict-insufficient',
};

/**
 * `parcialmente_compativel` é a ÚNICA faixa bicolor (design-system §5.4):
 * "parte dos dados sustenta, outra parte não" é literalmente o que a faixa
 * mostra. Uma cor intermediária esconderia essa informação.
 */
function VerdictBand({ verdict }: { verdict: Verdict | null }) {
  if (verdict === 'parcialmente_compativel') {
    return (
      <div aria-hidden className="flex h-1.5">
        <span className="w-1/2 bg-verdict-support" />
        <span className="w-1/2 bg-verdict-weak" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className={cn('h-1.5', verdict ? VERDICT_TONE[verdict] : 'bg-verdict-insufficient')}
    />
  );
}

const RELATION = {
  supports: { label: 'Sustenta', tone: 'text-evidence-support', icon: Plus },
  contradicts: { label: 'Contradiz', tone: 'text-evidence-contradict', icon: Minus },
  neutral: { label: 'Não discrimina', tone: 'text-evidence-neutral', icon: Equal },
} as const;

function EvidenceList({
  items,
  emptyMessage,
}: {
  items: EvaluationResult['contradicting'];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-base text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((i) => {
        const { label, tone, icon: Icon } = RELATION[i.relation];
        return (
          <li key={i.findingId}>
            <Card className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {/* Ícone + rótulo sempre: cor nunca é portador único (R3). */}
                <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', tone)}>
                  <Icon className="size-4 shrink-0" strokeWidth={3} aria-hidden />
                  {label}
                </span>
                {i.missed && <Badge variant="outline">você não marcou este achado</Badge>}
                {i.inverted && <Badge variant="outline">você marcou o oposto</Badge>}
              </div>

              <blockquote className="case-prose mt-3 border-l-2 border-paper-rule pl-3.5 text-sm">
                {i.findingText}
              </blockquote>

              <p className="mt-3 text-base text-muted-foreground">{i.why}</p>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export function ResultView({
  caseView,
  result,
  onRestart,
}: {
  caseView: StudentCaseView;
  result: EvaluationResult;
  onRestart: () => void;
}) {
  const [revealed, setRevealed] = useState(1);

  // A análise substitui a simulação na mesma rota: sem isto o navegador mantém a
  // rolagem do último ponto de decisão e o veredito nasce fora da tela.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const sections: Array<{ key: string; node: React.ReactNode }> = [];

  /* 1 — veredito */
  sections.push({
    key: 'veredito',
    node: (
      <div className="space-y-4">
        {result.criticalRedFlagMissed && (
          <Alert variant="danger">
            <TriangleAlert aria-hidden />
            <AlertTitle>Um sinal de alarme passou despercebido</AlertTitle>
            <AlertDescription>
              Você não marcou os achados que compõem um sinal de alarme crítico deste caso. Isso é
              independente da sua hipótese — e é o tipo de omissão que mais custa na prática.
            </AlertDescription>
          </Alert>
        )}

        <Card className="overflow-hidden shadow-md">
          <VerdictBand verdict={result.verdict} />
          <div className="p-5 sm:p-6">
            <p className="eyebrow">Sua hipótese</p>
            <p className="mt-2 font-case text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {result.verdictLabel}
            </p>
            <p className="mt-3 max-w-reading text-base text-muted-foreground">
              {result.verdictFeedback}
            </p>
            {result.verdictDegradedByMissingFindings && (
              <p className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
                Esta análise levou em conta apenas os exames que você solicitou.
              </p>
            )}
          </div>
        </Card>
      </div>
    ),
  });

  /* 2 — o que você fez (determinístico, sem texto autoral) */
  const p = result.processSignals;
  const processLines: string[] = [
    `Você se comprometeu com hipóteses na etapa ${p.stagesSeenBeforeCommitting} de ${p.totalStages}.`,
    p.revisedHypothesis
      ? 'Você revisou sua hipótese ao longo do caso.'
      : 'Você manteve a hipótese inicial até o fim. Isso pode ser convicção fundamentada ou fechamento prematuro — vale reler o que apareceu depois.',
    p.testsRequested.length === 0
      ? 'Você não solicitou exames complementares.'
      : `Exames solicitados: ${p.testsRequested.map((t) => testName(caseView, t)).join(', ')}.`,
  ];
  if (p.essentialTestsMissed.length > 0) {
    processLines.push(
      `Não solicitados: ${p.essentialTestsMissed.map((t) => testName(caseView, t)).join(', ')}.`,
    );
  }

  sections.push({
    key: 'processo',
    node: (
      <section className="space-y-4">
        <SectionHeading eyebrow="Registro">O que você fez</SectionHeading>
        <ul className="space-y-3">
          {processLines.map((line) => (
            <li key={line} className="flex gap-3 text-base text-muted-foreground">
              <Bullet />
              <span className="tabular-nums">{line}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
  });

  /* 3 — contradiz ANTES de sustenta (decisão pedagógica) */
  sections.push({
    key: 'contradiz',
    node: (
      <section className="space-y-4">
        <SectionHeading eyebrow="Evidência">O que contradiz sua hipótese</SectionHeading>
        <EvidenceList
          items={result.contradicting}
          emptyMessage="Nenhum achado do caso contradiz diretamente esta hipótese."
        />
      </section>
    ),
  });

  sections.push({
    key: 'sustenta',
    node: (
      <section className="space-y-4">
        <SectionHeading eyebrow="Evidência">O que sustenta sua hipótese</SectionHeading>
        <EvidenceList
          items={result.supporting}
          emptyMessage="Nenhum achado do caso sustenta diretamente esta hipótese."
        />
      </section>
    ),
  });

  /* 5 — o que não foi considerado */
  if (
    result.missedRedFlags.length > 0 ||
    result.missedDifferentials.length > 0 ||
    result.triggeredMistakes.length > 0
  ) {
    sections.push({
      key: 'nao-considerado',
      node: (
        <section className="space-y-4">
          <SectionHeading eyebrow="Ângulos cegos">O que você não considerou</SectionHeading>

          {result.missedRedFlags.map((rf) => (
            <Alert key={rf.text} variant={rf.critical ? 'danger' : 'default'}>
              {rf.critical && <TriangleAlert aria-hidden />}
              <AlertTitle>{rf.text}</AlertTitle>
              <AlertDescription>{rf.whyDangerous}</AlertDescription>
            </Alert>
          ))}

          {result.missedDifferentials.map((d) => (
            <Card key={d.label} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-foreground">{d.label}</p>
                {d.cantMiss && <Badge variant="danger">fatal se ignorado</Badge>}
              </div>
              <p className="mt-2 text-base text-muted-foreground">{d.why}</p>
            </Card>
          ))}

          {result.triggeredMistakes.map((m) => (
            <CommentaryBlock key={m.trap} title="Armadilha frequente">
              <p className="text-base font-semibold text-foreground">{m.trap}</p>
              <p className="mt-2 text-base text-muted-foreground">{m.why}</p>
            </CommentaryBlock>
          ))}
        </section>
      ),
    });
  }

  /* 6 — pontos de decisão */
  if (result.decisionPointResults.length > 0) {
    sections.push({
      key: 'decisoes',
      node: (
        <section className="space-y-4">
          <SectionHeading eyebrow="Percurso">Suas decisões ao longo do caso</SectionHeading>
          {result.decisionPointResults.map((d) => (
            <CommentaryBlock key={d.decisionPointId}>
              <p className="text-sm font-semibold text-foreground">{d.prompt}</p>
              {d.summary && <p className="mt-2 text-base text-foreground">{d.summary}</p>}
              <ul className="mt-3 space-y-2">
                {d.fragments.map((f, i) => (
                  <li key={i} className="flex gap-3 text-base text-muted-foreground">
                    <Bullet className="bg-commentary-rule" />
                    {f}
                  </li>
                ))}
              </ul>
            </CommentaryBlock>
          ))}
        </section>
      ),
    });
  }

  /* 7 — raciocínio lado a lado */
  sections.push({
    key: 'raciocinio',
    node: (
      <section className="space-y-4">
        <SectionHeading eyebrow="Comparação">Seu raciocínio e o do autor</SectionHeading>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4 sm:p-5">
            <p className="eyebrow">Seu raciocínio</p>
            <p className="mt-2 whitespace-pre-wrap text-base text-foreground">
              {result.studentRationale || '—'}
            </p>
          </Card>
          <CommentaryBlock title="Raciocínio do autor">
            <p className="text-base text-foreground">{result.authorReasoning}</p>
          </CommentaryBlock>
        </div>
      </section>
    ),
  });

  /* 8 — perfil, sem nota agregada */
  if (result.profile.length > 0) {
    sections.push({
      key: 'perfil',
      node: (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Sem nota"
            hint="Contagens, não nota. Este instrumento é formativo: um caso não mede competência."
          >
            Perfil de decisão
          </SectionHeading>
          <ul className="space-y-2.5">
            {result.profile.map((d) => (
              <li key={d.id}>
                <Card className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-base font-semibold text-foreground">{d.label}</p>
                    <p className="text-sm font-medium tabular-nums text-muted-foreground">
                      {d.id === 'flexibilidade'
                        ? d.achieved === 1
                          ? 'revisou'
                          : 'manteve'
                        : `${d.achieved} de ${d.total}`}
                    </p>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{d.meaning}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ),
    });
  }

  /* 9 — fechamento */
  sections.push({
    key: 'fechamento',
    node: (
      <section className="space-y-6">
        <SectionHeading eyebrow="Encerramento">Para fechar</SectionHeading>

        <CommentaryBlock title="Pergunta de reflexão">
          <p className="text-base text-foreground">{result.reflectionQuestion}</p>
        </CommentaryBlock>

        {result.learningOutcomes.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-foreground">O que este caso treinou</h3>
            <ul className="mt-3 space-y-2">
              {result.learningOutcomes.map((o) => (
                <li key={o} className="flex gap-3 text-base text-muted-foreground">
                  <Bullet />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-base font-semibold text-foreground">Fontes deste caso</h3>
          <ul className="mt-3 space-y-2.5">
            {caseView.sources.map((s) => (
              <li key={s.url} className="text-sm">
                {/* Âncora em fluxo inline, não `inline-flex`: com duas linhas de
                    título o flex joga o ícone para a borda direita, longe do
                    texto a que ele pertence. */}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
                >
                  {s.title}
                  <ExternalLink
                    className="ml-1 inline size-3.5 align-text-bottom text-muted-foreground"
                    aria-hidden
                  />
                </a>
                <span className="text-muted-foreground">
                  {' '}
                  — {s.organization}, {s.year}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/casos/" size="lg">
            Escolher outro caso
          </ButtonLink>
          <Button variant="outline" size="lg" onClick={onRestart}>
            <RotateCcw aria-hidden />
            Refazer este caso do início
          </Button>
        </div>

        <Alert>
          <AlertTitle>Protótipo educacional experimental</AlertTitle>
          <AlertDescription>{caseView.disclaimer}</AlertDescription>
        </Alert>
      </section>
    ),
  });

  const visible = sections.slice(0, revealed);
  const hasMore = revealed < sections.length;

  return (
    <div className="mx-auto max-w-app px-4 pb-24 pt-6 sm:px-6">
      <Breadcrumb href={`/casos/${caseView.id}/`}>{caseView.title}</Breadcrumb>

      <PageHeader
        className="mt-4"
        eyebrow="Análise"
        title="Análise do seu raciocínio"
        lead="Escrita e revisada por uma pessoa. Nenhuma parte deste texto foi gerada automaticamente."
      />

      <div className="mt-10 space-y-12" aria-live="polite">
        {visible.map((s) => (
          <div key={s.key}>{s.node}</div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 border-t border-border pt-6">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => setRevealed((r) => r + 1)}>
            Continuar
            <ArrowDown aria-hidden />
          </Button>
          <p className="mt-3 text-xs tabular-nums text-muted-foreground">
            {revealed} de {sections.length} seções
          </p>
        </div>
      )}
    </div>
  );
}
