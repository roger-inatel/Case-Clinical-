import type { ReactNode } from 'react';

import { cn } from '@/ui/cn';

/**
 * Topo de página.
 *
 * O título é serifado; os títulos de seção, não. A distinção não é enfeite: dá
 * ao produto a voz de artigo clínico sem precisar de mais uma cor, mais uma
 * borda ou mais um cartão. O versalete acima diz onde o leitor está.
 */
export function PageHeader({
  id,
  eyebrow,
  title,
  lead,
  actions,
  className,
}: {
  /** Quando presente, o título vira alvo de rolagem e de foco. */
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('space-y-3', className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}

      <h1
        id={id}
        tabIndex={id ? -1 : undefined}
        className={cn(
          'font-case text-2xl font-semibold tracking-tight text-foreground sm:text-3xl',
          id && 'scroll-anchor',
        )}
      >
        {title}
      </h1>

      {lead && <p className="max-w-reading text-base text-muted-foreground">{lead}</p>}

      {actions && <div className="flex flex-wrap items-center gap-3 pt-1">{actions}</div>}
    </header>
  );
}

/**
 * Título de seção com versalete opcional. Existe para que a hierarquia de
 * segundo nível seja a mesma em todas as telas.
 */
export function SectionHeading({
  id,
  eyebrow,
  children,
  hint,
  position,
  focusable = false,
}: {
  id?: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  /**
   * Sufixo lido apenas por leitor de tela — "(seção 3 de 9)". Não é microcópia
   * nova: é paridade de áudio para o contador que já está na tela.
   */
  position?: string;
  /** Alvo de rolagem e de foco após uma revelação. */
  focusable?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        id={id}
        tabIndex={focusable ? -1 : undefined}
        className={cn(
          'text-xl font-semibold tracking-tight text-foreground',
          focusable && 'scroll-anchor',
        )}
      >
        {children}
        {position && <span className="sr-only"> ({position})</span>}
      </h2>
      {hint && <p className="max-w-reading text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
