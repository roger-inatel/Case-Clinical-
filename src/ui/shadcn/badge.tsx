import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/ui/cn';

/**
 * shadcn/ui Badge. A variante `destructive` do padrão foi substituída por
 * `danger`, com um nome que diz o que ela significa aqui: perigo CLÍNICO —
 * red flag, diagnóstico cantMiss. Nunca "você errou" (R2).
 */
const badgeVariants = cva(
  'inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-background text-muted-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground',
        danger: 'border-danger-rule bg-danger-surface text-danger',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
