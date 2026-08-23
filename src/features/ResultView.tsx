'use client';

import { useEffect, useRef, useState } from 'react';
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
import { ANCHOR, goTo } from './navigation';

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

  /**
   * M4 — a análise substitui a simulação na mesma rota. Sem subir, o navegador
   * mantém a rolagem do último ponto de decisão e o veredito nasce fora da tela;
   * sem mover o foco, quem usa teclado ou leitor de tela não sabe que a tela
   * inteira mudou. Único `window.scrollTo` do produto: é troca de tela, não
   * navegação para um alvo, e por isso é instantâneo.
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById(ANCHOR.analysisTitle)?.focus({ preventScroll: true });
  }, []);

  /** M5 — revelação de seção. `revealed` nasce em 1: a montagem não navega. */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    goTo(document.getElementById(ANCHOR.section(sectionKeys[revealed - 1] ?? '')));
    // `sectionKeys` é recalculado a cada render e é estável em conteúdo; a
    // revelação é o único gatilho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  /**
   * Uma seção é DESCRITA aqui e MONTADA no render. A separação existe para que
   * o título saiba a própria posição ("seção 3 de 9") — o total só é conhecido
   * depois que a última é empilhada.
   */
  type Section = {
    key: string;
    /** Ausente só no veredito, que é um cartão e não uma seção com título. */
    heading?: { eyebrow: string; title: string; hint?: string };
    className?: string;
    body: React.ReactNode;
  };
  const sections: Section[] = [];

  /* 1 — veredito */
  sections.push({
    key: 'veredito',
    body: (
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
    heading: { eyebrow: 'Registro', title: 'O que você fez' },
    body: (
      <>
        <ul className="space-y-3">
          {processLines.map((line) => (
            <li key={line} className="flex gap-3 text-base text-muted-foreground">
              <Bullet />
              <span className="tabular-nums">{line}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  });

  /* 3 — contradiz ANTES de sustenta (decisão pedagógica) */
  sections.push({
    key: 'contradiz',
    heading: { eyebrow: 'Evidência', title: 'O que contradiz sua hipótese' },
    body: (
      <>
        <EvidenceList
          items={result.contradicting}
          emptyMessage="Nenhum achado do caso contradiz diretamente esta hipótese."
        />
      </>
    ),
  });

  sections.push({
    key: 'sustenta',
    heading: { eyebrow: 'Evidência', title: 'O que sustenta sua hipótese' },
    body: (
      <>
        <EvidenceList
          items={result.supporting}
          emptyMessage="Nenhum achado do caso sustenta diretamente esta hipótese."
        />
      </>
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
      heading: { eyebrow: 'Ângulos cegos', title: 'O que você não considerou' },
      body: (
        <>

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
        </>
      ),
    });
  }

  /* 6 — pontos de decisão */
  if (result.decisionPointResults.length > 0) {
    sections.push({
      key: 'decisoes',
      heading: { eyebrow: 'Percurso', title: 'Suas decisões ao longo do caso' },
      body: (
        <>
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
        </>
      ),
    });
  }

  /* 7 — raciocínio lado a lado */
  sections.push({
    key: 'raciocinio',
    heading: { eyebrow: 'Comparação', title: 'Seu raciocínio e o do autor' },
    body: (
      <>
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
      </>
    ),
  });

  /* 8 — perfil, sem nota agregada */
  if (result.profile.length > 0) {
    sections.push({
      key: 'perfil',
      heading: {
        eyebrow: 'Sem nota',
        title: 'Perfil de decisão',
        hint: 'Contagens, não nota. Este instrumento é formativo: um caso não mede competência.',
      },
      body: (
        <>
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
        </>
      ),
    });
  }

  /* 9 — fechamento */
  sections.push({
    key: 'fechamento',
    heading: { eyebrow: 'Encerramento', title: 'Para fechar' },
    className: 'space-y-6',
    body: (
      <>

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
      </>
    ),
  });

  const sectionKeys = sections.map((x) => x.key);
  const visible = sections.slice(0, revealed);
  const hasMore = revealed < sections.length;

  return (
    <div className="mx-auto max-w-app px-4 pb-24 pt-6 sm:px-6">
      <Breadcrumb href={`/casos/${caseView.id}/`}>{caseView.title}</Breadcrumb>

      <PageHeader
        id={ANCHOR.analysisTitle}
        className="mt-4"
        eyebrow="Análise"
        title="Análise do seu raciocínio"
        lead="Escrita e revisada por uma pessoa. Nenhuma parte deste texto foi gerada automaticamente."
      />

      {/* Sem `aria-live` de propósito. A região viva envolvia TODAS as seções e
          despejava a seção inteira na fila de fala ao revelar — o muro de texto
          que a revelação por etapas existe para evitar, em áudio. Mover o foco
          para o título anuncia E posiciona o cursor virtual; somar os dois é
          pior que escolher um, porque o foco interrompe a fala em curso.
          Emenda ao requisito A8 em docs/04-ux/navegacao-e-foco.md §7. */}
      <div className="mt-10 space-y-12">
        {visible.map((s, i) => (
          <section key={s.key} className={s.className ?? 'space-y-4'}>
            {s.heading && (
              <SectionHeading
                id={ANCHOR.section(s.key)}
                focusable
                eyebrow={s.heading.eyebrow}
                hint={s.heading.hint}
                position={`seção ${i + 1} de ${sections.length}`}
              >
                {s.heading.title}
              </SectionHeading>
            )}
            {s.body}
          </section>
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
