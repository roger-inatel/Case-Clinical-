import { cn } from '@/ui/cn';

/**
 * Progresso por etapas — nunca barra percentual.
 *
 * É por isso que o Progress do shadcn/ui não foi instalado: percentual é
 * gamificação, sugere que existe uma pontuação acumulando e induz o estudante a
 * "terminar" em vez de raciocinar (design-system R5).
 *
 * A contagem textual não é redundância: cor e largura sozinhas não sobrevivem a
 * daltonismo nem a leitor de tela (R3).
 */
export function StepIndicator({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <ol className="flex items-center gap-1" aria-label={`Etapa ${current} de ${total}`}>
        {Array.from({ length: total }, (_, i) => {
          const state = i + 1 < current ? 'done' : i + 1 === current ? 'current' : 'future';
          return (
            <li
              key={i}
              aria-current={state === 'current' ? 'step' : undefined}
              className={cn(
                'h-1.5 rounded-full transition-all',
                state === 'done' && 'w-5 bg-primary/45',
                state === 'current' && 'w-9 bg-primary',
                state === 'future' && 'w-5 bg-border',
              )}
            />
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium tabular-nums text-foreground">
          Etapa {current} de {total}
        </span>
        {label && <span> · {label}</span>}
      </p>
    </div>
  );
}
