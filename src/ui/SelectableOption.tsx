'use client';

import { useId, type ReactNode } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Plus } from 'lucide-react';

import { cn } from '@/ui/cn';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { Label } from '@/ui/shadcn/label';
import { RadioGroupItem } from '@/ui/shadcn/radio-group';

/**
 * As opções selecionáveis do produto — um visual só para os lugares onde o
 * mesmo padrão estava reimplementado.
 *
 * Regras que elas carregam por construção:
 *  - alvo de toque >= 44px (A3);
 *  - marca de seleção sempre presente — cor nunca é portador único (R3);
 *  - bloqueio por limite usa `aria-disabled` com motivo lido, não `disabled`
 *    (um controle `disabled` some da navegação e leva o motivo junto).
 */

/**
 * Anel de foco do teclado.
 *
 * `focus-within` NÃO serve: ele acende também no clique de mouse, e a tela fica
 * pontilhada de anéis que ninguém pediu. Nas formas em que o alvo é a linha
 * inteira, o anel é da linha e o controle interno desliga o dele — dois anéis
 * concêntricos leem como defeito.
 */
const FOCUS_RING =
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background';
const NO_OWN_RING = 'focus-visible:ring-0 focus-visible:ring-offset-0';

/** Estado visual compartilhado pelas três formas. */
const optionSurface = (selected: boolean, blocked: boolean) =>
  cn(
    'relative flex items-center gap-3 border transition-colors',
    selected
      ? 'border-primary/40 bg-accent text-accent-foreground'
      : 'border-input bg-card text-foreground hover:bg-accent/50',
    blocked && 'cursor-not-allowed opacity-55 hover:bg-card',
  );

/* ------------------------------------------------------------------ pílula */

/**
 * Pílula de alternância — qualificadores da representação do problema.
 *
 * Compõe a primitiva Radix que o shadcn/ui embrulha, e não o `Checkbox` já
 * montado: ali o controle É o quadrado de 20px, e aqui o alvo precisa ser a
 * pílula inteira. Mesma semântica (`role="checkbox"`, `aria-checked`), alvo
 * maior.
 */
export function OptionPill({
  selected,
  blocked = false,
  blockedReason,
  onToggle,
  children,
}: {
  selected: boolean;
  blocked?: boolean;
  blockedReason?: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={selected}
      aria-disabled={blocked || undefined}
      title={blocked ? blockedReason : undefined}
      onCheckedChange={() => !blocked && onToggle()}
      className={cn(
        optionSurface(selected, blocked),
        'min-h-[44px] rounded-full px-4 py-2 text-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected && 'font-medium',
      )}
    >
      {selected ? (
        <Check className="size-4 shrink-0 text-primary" strokeWidth={2.75} aria-hidden />
      ) : (
        <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      {children}
    </CheckboxPrimitive.Root>
  );
}

/* --------------------------------------------------------------- linha ✔ */

/** Linha com caixa de seleção — solicitação de exames. */
export function OptionRow({
  selected,
  blocked = false,
  blockedReason,
  onToggle,
  children,
}: {
  selected: boolean;
  blocked?: boolean;
  blockedReason?: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div
      className={cn(optionSurface(selected, blocked), 'items-start rounded-md pl-4', FOCUS_RING)}
      title={blocked ? blockedReason : undefined}
    >
      <Checkbox
        id={id}
        checked={selected}
        aria-disabled={blocked || undefined}
        onCheckedChange={() => !blocked && onToggle()}
        className={cn('mt-3.5', NO_OWN_RING)}
      />
      <Label
        htmlFor={id}
        className={cn(
          'flex-1 cursor-pointer py-3 pr-4 text-base font-normal leading-snug',
          blocked && 'cursor-not-allowed',
          selected && 'font-medium',
        )}
      >
        {children}
      </Label>
    </div>
  );
}

/* --------------------------------------------------------------- linha ◉ */

/**
 * Linha de escolha única — escala de deslocamento de probabilidade.
 * Precisa estar dentro de um `<RadioGroup>` do shadcn/ui.
 */
export function OptionRadioRow({
  value,
  selected,
  children,
}: {
  value: string;
  selected: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className={cn(optionSurface(selected, false), 'items-center rounded-md pl-4', FOCUS_RING)}>
      <RadioGroupItem id={id} value={value} className={NO_OWN_RING} />
      <Label
        htmlFor={id}
        className={cn(
          'flex-1 cursor-pointer py-3.5 pr-4 text-base font-normal leading-snug',
          selected && 'font-medium',
        )}
      >
        {children}
      </Label>
    </div>
  );
}

/* ------------------------------------------------------------- alternância */

/**
 * Par de alternativas mutuamente exclusivas em linha — "Sustenta" / "Contradiz"
 * na classificação de evidência. `aria-pressed` porque é estado, não navegação.
 */
export function OptionToggle({
  selected,
  onToggle,
  mark,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  mark: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        optionSurface(selected, false),
        'min-h-[44px] rounded-md px-3.5 py-2 text-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected && 'font-medium',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid size-5 shrink-0 place-content-center rounded-sm border text-xs font-semibold',
          selected ? 'border-primary/45 bg-card text-primary' : 'border-input text-muted-foreground',
        )}
      >
        {mark}
      </span>
      {children}
    </button>
  );
}
