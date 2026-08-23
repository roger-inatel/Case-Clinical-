'use client';

import { useId, useState } from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';

import type { Concept, DecisionPoint, EvidenceRelation, Finding } from '@/content/schema';
import type { Answer } from '@/domain/types';
import {
  Button,
  Label,
  OptionPill,
  OptionRadioRow,
  OptionRow,
  OptionToggle,
  RadioGroup,
  Textarea,
  cn,
} from '@/ui';
import { DiagnosisCombobox, type DiagnosisSelection } from './DiagnosisCombobox';

/** A escala SCT sempre com rótulo textual — nunca só −2…+2. */
const DIRECTIONS: Array<{ value: number; label: string }> = [
  { value: -2, label: 'Muito menos provável' },
  { value: -1, label: 'Menos provável' },
  { value: 0, label: 'Não altera' },
  { value: 1, label: 'Mais provável' },
  { value: 2, label: 'Muito mais provável' },
];

const EVIDENCE_OPTIONS: Array<{ value: EvidenceRelation; label: string; icon: typeof Plus }> = [
  { value: 'supports', label: 'Sustenta', icon: Plus },
  { value: 'contradicts', label: 'Contradiz', icon: Minus },
];

/* ------------------------------------------------------------ estruturais */

function Prompt({ children }: { children: React.ReactNode }) {
  return <p className="text-lg font-semibold leading-snug text-foreground">{children}</p>;
}

function Counter({ n, max }: { n: number; max: number }) {
  return (
    <p className="text-xs tabular-nums text-muted-foreground">
      {n} de {max} selecionados
    </p>
  );
}

/**
 * Barra de ação.
 *
 * No mobile fica fixa no rodapé do cartão — sem isso, o botão de submeter do
 * último ponto de decisão fica abaixo de uma lista de ~17 achados e some da
 * tela. No desktop volta ao fluxo normal. As margens negativas sangram até a
 * borda do cartão, que tem `p-4` no mobile e `p-6` a partir de `sm`.
 */
function ActionBar({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 -mx-4 -mb-4 mt-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        'sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-none',
      )}
    >
      {children}
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SubmitButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button size="lg" className="w-full sm:w-auto" disabled={disabled} onClick={onClick}>
      {children}
      <ArrowRight aria-hidden />
    </Button>
  );
}

/* ----------------------------------------- 1. Representação do problema */

function ProblemRepresentation({
  dp,
  onSubmit,
}: {
  dp: Extract<DecisionPoint, { type: 'problem-representation' }>;
  onSubmit: (a: Answer) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const atLimit = selected.length >= dp.maxSelections;

  return (
    <div className="space-y-5">
      <Prompt>{dp.prompt}</Prompt>

      <fieldset>
        <legend className="sr-only">{dp.prompt}</legend>
        <ul className="flex flex-wrap gap-2">
          {dp.options.map((o) => {
            const on = selected.includes(o.id);
            return (
              <li key={o.id}>
                <OptionPill
                  selected={on}
                  blocked={!on && atLimit}
                  blockedReason={`Limite de ${dp.maxSelections} qualificadores atingido`}
                  onToggle={() =>
                    setSelected((s) => (on ? s.filter((x) => x !== o.id) : [...s, o.id]))
                  }
                >
                  {o.label}
                </OptionPill>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="space-y-1">
        <Counter n={selected.length} max={dp.maxSelections} />
        {atLimit && (
          <p className="text-xs text-muted-foreground">
            Limite atingido. Remova um qualificador para escolher outro.
          </p>
        )}
      </div>

      <ActionBar>
        <SubmitButton
          disabled={selected.length === 0}
          onClick={() => onSubmit({ type: 'problem-representation', selected, at: Date.now() })}
        >
          Confirmar representação
        </SubmitButton>
      </ActionBar>
    </div>
  );
}

/* ------------------------------------------------- 2. Hipóteses iniciais */

function HypothesisList({
  dp,
  concepts,
  onSubmit,
}: {
  dp: Extract<DecisionPoint, { type: 'hypothesis-list' }>;
  concepts: Concept[];
  onSubmit: (a: Answer) => void;
}) {
  const [value, setValue] = useState<DiagnosisSelection>({ concepts: [], unknownTerms: [] });
  const total = value.concepts.length + value.unknownTerms.length;

  return (
    <div className="space-y-5">
      <Prompt>{dp.prompt}</Prompt>

      <DiagnosisCombobox
        concepts={concepts}
        value={value}
        onChange={setValue}
        maxSelections={dp.maxSelections}
        label="Suas hipóteses"
      />

      <ActionBar>
        <SubmitButton
          disabled={total === 0}
          onClick={() =>
            onSubmit({
              type: 'hypothesis-list',
              concepts: value.concepts,
              unknownTerms: value.unknownTerms,
              at: Date.now(),
            })
          }
        >
          Confirmar hipóteses
        </SubmitButton>
      </ActionBar>
    </div>
  );
}

/* ------------------------------------- 3. Deslocamento de probabilidade */

function ProbabilityShift({
  dp,
  onSubmit,
}: {
  dp: Extract<DecisionPoint, { type: 'probability-shift' }>;
  onSubmit: (a: Answer) => void;
}) {
  const [direction, setDirection] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <Prompt>{dp.prompt}</Prompt>

      {/* Sem cor semântica antes de responder: colorir as extremidades
          sugeriria qual é a resposta certa. */}
      <RadioGroup
        aria-label={dp.prompt}
        value={direction === null ? '' : String(direction)}
        onValueChange={(v) => setDirection(Number(v))}
        className="gap-2"
      >
        {DIRECTIONS.map((d) => (
          <OptionRadioRow key={d.value} value={String(d.value)} selected={direction === d.value}>
            {d.label}
          </OptionRadioRow>
        ))}
      </RadioGroup>

      <ActionBar>
        <SubmitButton
          disabled={direction === null}
          onClick={() =>
            onSubmit({ type: 'probability-shift', direction: direction!, at: Date.now() })
          }
        >
          Confirmar
        </SubmitButton>
      </ActionBar>
    </div>
  );
}

/* ------------------------------------------------- 4. Seleção de exames */

function TestSelection({
  dp,
  tests,
  onSubmit,
}: {
  dp: Extract<DecisionPoint, { type: 'test-selection' }>;
  tests: Array<{ id: string; name: string; turnaround: string }>;
  onSubmit: (a: Answer) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const atLimit = selected.length >= dp.maxSelections;

  return (
    <div className="space-y-5">
      <Prompt>{dp.prompt}</Prompt>

      <fieldset>
        <legend className="sr-only">{dp.prompt}</legend>
        <ul className="space-y-2">
          {tests.map((t) => {
            const on = selected.includes(t.id);
            return (
              <li key={t.id}>
                <OptionRow
                  selected={on}
                  blocked={!on && atLimit}
                  blockedReason={`Limite de ${dp.maxSelections} exames atingido`}
                  onToggle={() =>
                    setSelected((s) => (on ? s.filter((x) => x !== t.id) : [...s, t.id]))
                  }
                >
                  <span className="block">{t.name}</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    resultado {t.turnaround}
                  </span>
                </OptionRow>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <Counter n={selected.length} max={dp.maxSelections} />

      <ActionBar>
        <SubmitButton
          onClick={() => onSubmit({ type: 'test-selection', tests: selected, at: Date.now() })}
        >
          {selected.length === 0 ? 'Seguir sem solicitar exames' : 'Solicitar exames'}
        </SubmitButton>
      </ActionBar>
    </div>
  );
}

/* --------------------------------------------------- 5. Hipótese final */

function FinalHypothesis({
  dp,
  concepts,
  findings,
  onSubmit,
}: {
  dp: Extract<DecisionPoint, { type: 'final-hypothesis' }>;
  concepts: Concept[];
  findings: Finding[];
  onSubmit: (a: Answer) => void;
}) {
  const [value, setValue] = useState<DiagnosisSelection>({ concepts: [], unknownTerms: [] });
  const [evidence, setEvidence] = useState<Record<string, EvidenceRelation>>({});
  const [rationale, setRationale] = useState('');
  const rationaleId = useId();

  const hasHypothesis = value.concepts.length > 0 || value.unknownTerms.length > 0;
  const rationaleOk = !dp.requiresRationaleText || rationale.trim().length >= 20;
  const classified = Object.keys(evidence).length;

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        <Prompt>{dp.prompt}</Prompt>
        <DiagnosisCombobox
          concepts={concepts}
          value={value}
          onChange={setValue}
          maxSelections={1}
          label="Hipótese principal"
        />
      </div>

      {dp.requiresEvidenceSelection && (
        <section className="space-y-4">
          <div className="space-y-1.5">
            <Prompt>Quais achados sustentam e quais contradizem sua hipótese?</Prompt>
            <p className="text-sm text-muted-foreground">
              Marque apenas os que você considera relevantes. Deixar em branco também é uma escolha.
            </p>
          </div>

          <ul className="space-y-2.5">
            {findings.map((f) => (
              <li
                key={f.id}
                className="rounded-md border border-paper-rule bg-paper px-4 py-3.5 sm:px-5"
              >
                <p className="case-prose text-sm">{f.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {EVIDENCE_OPTIONS.map((o) => {
                    const on = evidence[f.id] === o.value;
                    const Icon = o.icon;
                    return (
                      <OptionToggle
                        key={o.value}
                        selected={on}
                        mark={<Icon className="size-3.5" strokeWidth={3} />}
                        onToggle={() =>
                          setEvidence((prev) => {
                            const next = { ...prev };
                            if (on) delete next[f.id];
                            else next[f.id] = o.value;
                            return next;
                          })
                        }
                      >
                        {o.label}
                      </OptionToggle>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>

          <p className="text-xs tabular-nums text-muted-foreground">
            Você classificou {classified} de {findings.length} achados.
          </p>
        </section>
      )}

      {dp.requiresRationaleText && (
        <section className="space-y-2.5">
          <div className="space-y-1.5">
            <Label htmlFor={rationaleId}>Escreva seu raciocínio</Label>
            {/* Promessa honesta: este texto NÃO é corrigido automaticamente. */}
            <p className="text-sm text-muted-foreground">
              Este texto não é corrigido automaticamente — ele será exibido ao lado da análise do
              autor, para você comparar.
            </p>
          </div>
          <Textarea
            id={rationaleId}
            rows={6}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Por que você chegou a essa hipótese?"
          />
          <p className="text-xs tabular-nums text-muted-foreground">
            {rationale.trim().length} caracteres {rationaleOk ? '' : '(mínimo 20)'}
          </p>
        </section>
      )}

      <ActionBar
        hint={!hasHypothesis ? 'Selecione uma hipótese principal para concluir.' : undefined}
      >
        <SubmitButton
          disabled={!hasHypothesis || !rationaleOk}
          onClick={() =>
            onSubmit({
              type: 'final-hypothesis',
              concept: value.concepts[0] ?? null,
              unknownTerm: value.unknownTerms[0] ?? null,
              evidence,
              rationale: rationale.trim(),
              at: Date.now(),
            })
          }
        >
          Concluir e ver a análise
        </SubmitButton>
      </ActionBar>
    </div>
  );
}

/* ------------------------------------------------------------ despacho */

export function DecisionPointView({
  dp,
  concepts,
  findings,
  tests,
  onSubmit,
}: {
  dp: DecisionPoint;
  concepts: Concept[];
  findings: Finding[];
  tests: Array<{ id: string; name: string; turnaround: string }>;
  onSubmit: (a: Answer) => void;
}) {
  switch (dp.type) {
    case 'problem-representation':
      return <ProblemRepresentation dp={dp} onSubmit={onSubmit} />;
    case 'hypothesis-list':
      return <HypothesisList dp={dp} concepts={concepts} onSubmit={onSubmit} />;
    case 'probability-shift':
      return <ProbabilityShift dp={dp} onSubmit={onSubmit} />;
    case 'test-selection':
      return <TestSelection dp={dp} tests={tests} onSubmit={onSubmit} />;
    case 'final-hypothesis':
      return (
        <FinalHypothesis dp={dp} concepts={concepts} findings={findings} onSubmit={onSubmit} />
      );
  }
}
