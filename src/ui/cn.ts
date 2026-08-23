import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Concatenação de classes com resolução de conflito do Tailwind.
 * É o utilitário que o shadcn/ui espera em `@/ui/cn` (components.json).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
