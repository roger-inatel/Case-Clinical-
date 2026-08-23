import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/ui/cn';

/**
 * shadcn/ui Button, com duas adaptações deliberadas — ambas por regra do
 * produto, não por gosto:
 *
 *  1. A variante `destructive` foi REMOVIDA. Este produto não destrói nada, e
 *     uma variante vermelha acabaria usada como "resposta errada" — vermelho é
 *     perigo clínico (design-system R2).
 *  2. Toda altura é >= 44px. `size` altera densidade horizontal e tipografia,
 *     nunca o alvo de toque (A3).
 */
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md',
    // `border` em TODAS as variantes, inclusive nas que a deixam transparente:
    // sem isso a caixa muda de tamanho ao trocar de variante e o alinhamento
    // entre botões vizinhos quebra por 2px.
    'border font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-primary-rule bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        outline:
          'border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost:
          'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground',
        link:
          'border-transparent text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary',
      },
      size: {
        sm: 'h-11 px-4 text-sm',
        default: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
