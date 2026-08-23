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
  eyebrow,
  title,
  lead,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('space-y-3', className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}

      <h1 className="font-case text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
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
}: {
  id?: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="text-xl font-semibold tracking-tight text-foreground">
        {children}
      </h2>
      {hint && <p className="max-w-reading text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
