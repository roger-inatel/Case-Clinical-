import type { ReactNode } from 'react';
import { FileSearch } from 'lucide-react';

/**
 * Estado vazio — neutro, nunca vermelho.
 * Vazio não é erro, e erro de sistema não é perigo clínico (R2).
 */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-input bg-muted/40 px-6 py-12 text-center">
      <FileSearch className="mx-auto size-6 text-muted-foreground" aria-hidden />
      <p className="mt-4 text-lg font-semibold text-foreground">{title}</p>
      {children && (
        <p className="mx-auto mt-2 max-w-reading text-base text-muted-foreground">{children}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
