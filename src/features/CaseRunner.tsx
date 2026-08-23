'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CircleSlash, Lock } from 'lucide-react';

import type { CaseKey, Vocabulary } from '@/content/schema';
import type { Answer, Session, StudentCaseView } from '@/domain/types';
import {
  advanceStage,
  canAdvance,
  completeSession,
  createSession,
  currentStageIndex,
  findingsAvailableAt,
  isComplete,
  pendingDecisionPoints,
  recordAnswer,
  revealedFindings,
  stageProgress,
} from '@/domain/simulation';
import { evaluate } from '@/evaluation/evaluate';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Breadcrumb,
  Button,
  Card,
  DocumentBlock,
  DocumentLabel,
  StepIndicator,
  VITAL_LABEL,
} from '@/ui';
import { DecisionPointView } from './DecisionPoints';
import { ResultView } from './ResultView';

const storageKey = (caseId: string) => `ccai:session:${caseId}`;

export function CaseRunner({
  caseView,
  caseKey,
  vocabulary,
}: {
  caseView: StudentCaseView;
  caseKey: CaseKey;
  vocabulary: Vocabulary;
}) {
  // A sessão nasce já no primeiro render — inclusive no servidor. É isso que
  // faz o HTML estático conter o h1 e a primeira etapa do caso, em vez de um
  // "carregando". O relógio difere entre servidor e cliente, mas `startedAt`
  // não é renderizado: não há divergência de hidratação visível.
  const [session, setSession] = useState<Session>(() =>
    createSession(caseView.id, caseView.stages[0]!.id, Date.now()),
  );

  // Sessão em sessionStorage: sobrevive a recarregar a página, some ao fechar a
  // aba. Nada sai do navegador.
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey(caseView.id));
    if (!saved) return;
    try {
      setSession(JSON.parse(saved) as Session);
    } catch {
      /* sessão corrompida: segue com a sessão nova */
    }
  }, [caseView.id]);

  useEffect(() => {
    if (!session) return;
    try {
      sessionStorage.setItem(storageKey(caseView.id), JSON.stringify(session));
    } catch {
      /* modo privado ou storage cheio: a sessão segue apenas em memória */
    }
  }, [session, caseView.id]);

  const result = useMemo(() => {
    if (!session?.completedAt) return null;
    return evaluate(caseView, caseKey, vocabulary, session);
  }, [session, caseView, caseKey, vocabulary]);

  if (result) {
    return (
      <ResultView
        caseView={caseView}
        result={result}
        onRestart={() => {
          sessionStorage.removeItem(storageKey(caseView.id));
          setSession(createSession(caseView.id, caseView.stages[0]!.id, Date.now()));
        }}
      />
    );
  }

  const stageIdx = currentStageIndex(caseView, session);
  const progress = stageProgress(caseView, session);
  const pending = pendingDecisionPoints(caseView, session);
  const currentDp = pending[0];
  const visibleStages = caseView.stages.slice(0, stageIdx + 1);
  const canGoOn = canAdvance(caseView, session);
  const finished = isComplete(caseView, session);

  // `pending` é o que falta NESTA etapa; a posição no caso vem do total já
  // respondido, que é o número que o estudante reconhece.
  const totalDecisions = caseView.decisionPoints.length;
  const decisionNumber = Math.min(Object.keys(session.answers).length + 1, totalDecisions);

  function submit(answer: Answer) {
    if (!currentDp) return;
    setSession((prev) => {
      let next = recordAnswer(prev, currentDp.id, answer);
      if (isComplete(caseView, next)) next = completeSession(next, Date.now());
      return next;
    });
  }

  const findingsForFinal = currentDp
    ? findingsAvailableAt(caseView, session, currentDp.id)
    : revealedFindings(caseView, session);

  return (
    <div className="mx-auto max-w-app px-4 pb-32 pt-6 sm:px-6 sm:pb-24">
      <Breadcrumb href={`/casos/${caseView.id}/`}>Visão geral do caso</Breadcrumb>

      {/* Fica logo abaixo do cabeçalho da aplicação (h-14) e acompanha a rolagem:
          a posição no caso é a única informação que nunca pode sair da tela. */}
      <div className="sticky top-14 z-20 -mx-4 mt-3 border-y border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <StepIndicator current={progress.current} total={progress.total} label={progress.label} />
          <p className="hidden max-w-[14rem] truncate text-xs text-muted-foreground lg:block">
            {caseView.title}
          </p>
        </div>
      </div>

      <header className="mt-8">
        <p className="eyebrow">Caso clínico</p>
        <h1 className="mt-2 font-case text-2xl font-semibold tracking-tight text-foreground">
          {caseView.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {caseView.patient.age} anos, {caseView.patient.sex}, {caseView.patient.context}.
        </p>
      </header>

      {/* -------------------------------------------------- o registro clínico */}
      <div className="mt-8 space-y-3">
        {visibleStages.map((stage, i) => {
          const isCurrent = i === stageIdx;
          const findings = stage.findings.filter(
            (f) => !f.revealedBy || session.testsRequested.includes(f.revealedBy),
          );
          // Uma etapa pode ter achados incondicionais (contexto) e ainda assim
          // nenhum resultado de exame. Sem este aviso, quem não solicitou nada
          // fica sem saber por que não há resultados.
          const conditional = stage.findings.filter((f) => f.revealedBy);
          const noTestResults =
            conditional.length > 0 &&
            !conditional.some((f) => session.testsRequested.includes(f.revealedBy!));
          const vitals = stage.vitals ? Object.entries(stage.vitals) : [];

          return (
            <DocumentBlock
              key={stage.id}
              muted={!isCurrent}
              label={<DocumentLabel>{stage.label}</DocumentLabel>}
            >
              {vitals.length > 0 && (
                /* Filete por célula com margem negativa, e não `gap-px` sobre um
                   fundo colorido: com `gap` a última linha incompleta pinta a
                   célula vazia com a cor do filete. */
                <dl className="mb-4 grid grid-cols-2 overflow-hidden rounded-md border border-paper-rule sm:grid-cols-3">
                  {vitals.map(([k, v]) => (
                    <div
                      key={k}
                      className="-ml-px -mt-px border-l border-t border-paper-rule bg-paper px-3 py-2.5"
                    >
                      <dt className="text-xs font-medium tracking-wide text-muted-foreground">
                        {VITAL_LABEL[k] ?? k}
                      </dt>
                      <dd className="mt-0.5 font-case text-base tabular-nums text-foreground">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {findings.length > 0 && (
                <div className="space-y-3">
                  {findings.map((f) => (
                    <p key={f.id} className="case-prose">
                      {f.text}
                    </p>
                  ))}
                </div>
              )}

              {noTestResults && (
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <CircleSlash className="mt-0.5 size-4 shrink-0" aria-hidden />
                  Nenhum resultado de exame disponível — você não solicitou exames nesta etapa.
                </p>
              )}
            </DocumentBlock>
          );
        })}
      </div>

      {/* ------------------------------------------------- o ponto de decisão */}
      {/* Sem `overflow-hidden` no cartão: ele criaria um contexto de rolagem e
          mataria a barra de ação fixa do mobile lá dentro. As pontas são
          arredondadas faixa a faixa. */}
      {currentDp && (
        <Card className="mt-8 border-primary/25 shadow-md">
          <div className="flex items-center justify-between gap-3 rounded-t-lg border-b border-border bg-accent/60 px-4 py-2.5 sm:px-6">
            <p className="eyebrow text-accent-foreground">Ponto de decisão</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {decisionNumber} de {totalDecisions}
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <DecisionPointView
              key={currentDp.id}
              dp={currentDp}
              concepts={vocabulary.concepts}
              findings={findingsForFinal}
              tests={caseView.availableTests.map((t) => ({
                id: t.id,
                name: t.name,
                turnaround: t.turnaround,
              }))}
              onSubmit={submit}
            />
          </div>

          <p className="flex items-center gap-2 rounded-b-lg border-t border-border bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground sm:px-6">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            Sua resposta é registrada e não pode ser alterada depois.
          </p>
        </Card>
      )}

      {!currentDp && canGoOn && (
        <div className="mt-8">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setSession((s) => advanceStage(caseView, s))}
          >
            Avançar para a próxima etapa
            <ArrowRight aria-hidden />
          </Button>
        </div>
      )}

      {!currentDp && !canGoOn && !finished && (
        <Alert className="mt-8">
          <AlertTitle>Fim das etapas</AlertTitle>
          <AlertDescription>Não há mais informações a revelar neste caso.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
