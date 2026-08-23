import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/ui/cn';

/**
 * shadcn/ui Alert. Duas adaptações:
 *
 *  1. A variante `destructive` do padrão virou `danger`, e o padrão é NEUTRO —
 *     nem vermelho, nem amarelo. Um aviso de sistema não é perigo clínico, e um
 *     estado vazio não é erro (R2).
 *  2. Layout em grade em vez do ícone posicionado em absoluto: o recuo do texto
 *     passa a ser a própria coluna, e some o par de deslocamentos mágicos que a
 *     versão de referência precisa manter em sincronia com o tamanho do ícone.
 */
const alertVariants = cva(
  [
    'grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-lg border px-4 py-3.5 text-sm',
    'has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3',
    '[&>svg]:size-4 [&>svg]:translate-y-0.5',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-border bg-muted/60 text-muted-foreground [&>svg]:text-muted-foreground',
        accent: 'border-commentary-rule/40 bg-commentary text-foreground [&>svg]:text-primary',
        danger: 'border-danger-rule bg-danger-surface text-foreground [&>svg]:text-danger',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="note" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('col-start-2 font-semibold leading-snug text-foreground', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('col-start-2 text-sm [&_p]:leading-relaxed', className)} {...props} />
  ),
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
