import Link from 'next/link';
import type { ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import { Button } from '@/ui/shadcn/button';
import type { buttonVariants } from '@/ui/shadcn/button';

/**
 * Navegação com aparência de botão. Usa `asChild` do shadcn/ui: o elemento
 * renderizado é um `<a>` de verdade — abre em nova aba, aparece na lista de
 * links do leitor de tela — com as classes da variante aplicadas.
 */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
} & VariantProps<typeof buttonVariants>) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
