import { cn } from '@/ui/cn';

/**
 * Marcador de lista.
 *
 * Existe para que a lista com respiro — item em `flex`, marcador alinhado à
 * primeira linha — não seja remontada com utilitários soltos em cada tela. O
 * `list-disc` do navegador não serve aqui: ele gruda o marcador no texto e
 * quebra o alinhamento quando o item tem mais de uma linha.
 */
export function Bullet({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40', className)}
    />
  );
}
