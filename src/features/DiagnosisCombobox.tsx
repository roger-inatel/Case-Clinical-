'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import type { Concept } from '@/content/schema';
import { Button, Input, Label, cn } from '@/ui';
import { MIN_CHARS, normalizeTerm as norm, searchConcepts } from './diagnosisSearch';

/**
 * Entrada de hipótese por vocabulário controlado (ADR-0008).
 *
 * O estudante DIGITA o que pensou — não escolhe de uma lista pronta. Sugestões
 * só aparecem a partir de 2 caracteres, e a lista completa nunca é exibida:
 * despejar o vocabulário entregaria o diferencial de bandeja.
 *
 * Sem busca aproximada de propósito: aceitar "infato" como "infarto" mascara
 * imprecisão terminológica que o estudante precisa perceber.
 *
 * Por que não o Command/Combobox do shadcn/ui: o cmdk filtra e ordena por conta
 * própria, exibe a lista inteira ao abrir e não tem o conceito de "termo fora
 * do vocabulário, registrado assim mesmo" — que é justamente a regra
 * pedagógica deste campo. O que se compõe daqui é a apresentação: Input, Label
 * e Button do shadcn, superfície de popover e tokens do tema. O contrato ARIA e
 * o comportamento de teclado são os já validados por teste.
 */

export interface DiagnosisSelection {
  concepts: string[];
  unknownTerms: string[];
}

export function DiagnosisCombobox({
  concepts,
  value,
  onChange,
  maxSelections,
  label,
  disabled = false,
}: {
  concepts: Concept[];
  value: DiagnosisSelection;
  onChange: (next: DiagnosisSelection) => void;
  maxSelections: number;
  label: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const inputId = useId();

  const total = value.concepts.length + value.unknownTerms.length;
  const atLimit = total >= maxSelections;

  const suggestions = useMemo(
    () => searchConcepts(concepts, query, value.concepts),
    [concepts, query, value.concepts],
  );

  const showPanel = open && norm(query).length >= MIN_CHARS && !atLimit;
  const noMatch = showPanel && suggestions.length === 0;

  function select(concept: Concept) {
    if (atLimit) return;
    onChange({ ...value, concepts: [...value.concepts, concept.id] });
    setQuery('');
    setActive(0);
    inputRef.current?.focus();
  }

  function registerUnknown() {
    const term = query.trim();
    if (!term || atLimit) return;
    onChange({ ...value, unknownTerms: [...value.unknownTerms, term] });
    setQuery('');
    inputRef.current?.focus();
  }

  function removeConcept(id: string) {
    onChange({ ...value, concepts: value.concepts.filter((c) => c !== id) });
  }

  function removeUnknown(term: string) {
    onChange({ ...value, unknownTerms: value.unknownTerms.filter((t) => t !== term) });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && query === '') {
      if (value.unknownTerms.length > 0) removeUnknown(value.unknownTerms.at(-1)!);
      else if (value.concepts.length > 0) removeConcept(value.concepts.at(-1)!);
      return;
    }
    if (!showPanel) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(suggestions.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = suggestions[active];
      if (chosen) select(chosen);
      else if (noMatch) registerUnknown();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const labelOf = (id: string) => concepts.find((c) => c.id === id)?.label ?? id;

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>

      {total > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.concepts.map((id) => (
            <li key={id}>
              <Chip
                label={labelOf(id)}
                onRemove={disabled ? undefined : () => removeConcept(id)}
              />
            </li>
          ))}
          {value.unknownTerms.map((term) => (
            <li key={term}>
              <Chip
                label={term}
                outsideVocabulary
                onRemove={disabled ? undefined : () => removeUnknown(term)}
              />
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="relative mt-3">
          {/* O painel é irmão deste bloco, e não filho: posicionado em `absolute`
              sem `top`, ele cai na própria posição estática — logo abaixo do
              campo. O ícone, por outro lado, precisa se centrar no CAMPO, não na
              altura do bloco inteiro. Daí o invólucro. */}
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={inputId}
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={showPanel}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                showPanel && suggestions[active] ? `${listId}-${active}` : undefined
              }
              autoComplete="off"
              disabled={atLimit}
              value={query}
              placeholder={
                atLimit ? `Limite de ${maxSelections} atingido` : 'Digite um diagnóstico…'
              }
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              className="pl-10"
            />
          </div>

          <p aria-live="polite" className="sr-only">
            {showPanel
              ? suggestions.length > 0
                ? `${suggestions.length} sugestões disponíveis`
                : 'Nenhuma sugestão encontrada'
              : ''}
          </p>

          {showPanel && (
            <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
              {suggestions.length > 0 ? (
                <ul id={listId} role="listbox" aria-label="Sugestões" className="p-1">
                  {suggestions.map((c, i) => (
                    <li
                      key={c.id}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        select(c);
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        'flex min-h-[44px] cursor-pointer items-center rounded-sm px-3 py-2 text-base',
                        i === active
                          ? 'bg-accent font-medium text-accent-foreground'
                          : 'text-foreground',
                      )}
                    >
                      {c.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Não encontramos <span className="font-semibold text-foreground">{query}</span>{' '}
                    no vocabulário deste caso. Você pode registrá-lo e seguir — isso não significa
                    que a hipótese esteja errada.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 w-full sm:w-auto"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={registerUnknown}
                  >
                    Registrar “{query.trim()}” assim mesmo
                  </Button>
                </div>
              )}
            </div>
          )}

          <p className="mt-2 text-xs tabular-nums text-muted-foreground">
            {total} de {maxSelections} selecionadas · sugestões a partir de {MIN_CHARS} letras
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Hipótese já registrada.
 *
 * O tracejado e o itálico marcam o termo que não está no vocabulário do caso —
 * a distinção precisa ser visível sem depender de cor (R3), e não pode parecer
 * um erro: registrar um termo fora da lista é uma escolha legítima.
 */
function Chip({
  label,
  outsideVocabulary = false,
  onRemove,
}: {
  label: string;
  outsideVocabulary?: boolean;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[44px] items-center gap-1 rounded-full border py-1 pl-4 pr-1.5 text-sm',
        outsideVocabulary
          ? 'border-dashed border-input italic text-foreground'
          : 'border-primary/25 bg-accent font-medium text-accent-foreground',
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${label}`}
          className="grid size-8 shrink-0 place-content-center rounded-full text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </span>
  );
}
