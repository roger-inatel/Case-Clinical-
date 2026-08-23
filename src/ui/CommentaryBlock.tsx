import type { ReactNode } from 'react';
import { Quote } from 'lucide-react';

import { cn } from '@/ui/cn';

/**
 * A outra voz: interpretação escrita e revisada por uma pessoa.
 *
 * Nunca é só um fundo levemente diferente — sempre filete lateral, versalete e
 * família tipográfica de interface. O texto do caso é serifado sobre papel; o
 * comentário é sans sobre superfície tingida. Quem olha de longe já sabe qual
 * é qual, que é exatamente o ponto (CLAUDE.md §4.7).
 */
export function CommentaryBlock({
  title = 'Comentário do autor',
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-lg rounded-l-sm border-l-[3px] border-commentary-rule bg-commentary px-4 py-4 sm:px-6 sm:py-5',
        className,
      )}
    >
      <p className="eyebrow mb-2.5 flex items-center gap-1.5">
        <Quote className="size-3.5 shrink-0 text-commentary-rule" aria-hidden />
        {title}
      </p>
      {children}
    </section>
  );
}
