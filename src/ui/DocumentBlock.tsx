import type { ReactNode } from 'react';

import { cn } from '@/ui/cn';

/**
 * O papel: o registro clínico.
 *
 * Não é um Card do shadcn de propósito — Card é superfície de INTERFACE, com
 * elevação e ação. Isto é documento: fundo de papel, filete fino, sombra
 * nenhuma. A separação dado × comentário (CLAUDE.md §4.7) precisa ser legível
 * antes de qualquer palavra ser lida, e é a ausência de elevação que faz isso.
 */
export function DocumentBlock({
  label,
  children,
  className,
  muted = false,
}: {
  /** Rótulo da etapa, exibido como versalete no topo do documento. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Etapas já percorridas recuam um passo, sem sumir. */
  muted?: boolean;
}) {
  return (
    <article
      className={cn(
        'rounded-lg border border-paper-rule bg-paper px-4 py-4 transition-colors sm:px-6 sm:py-5',
        muted && 'border-border bg-paper/60',
        className,
      )}
    >
      {label}
      {children}
    </article>
  );
}

/**
 * Cabeçalho do documento: versalete + filete. O filete é o que dá ao bloco a
 * leitura de "folha de registro" em vez de "mais um cartão".
 */
export function DocumentLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="eyebrow shrink-0">{children}</h2>
      <span aria-hidden className="h-px flex-1 bg-paper-rule" />
    </div>
  );
}
