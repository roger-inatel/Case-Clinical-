import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  Breadcrumb as Root,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/ui/shadcn/breadcrumb';

/**
 * Trilha de volta — um nível só, que é a profundidade real do produto.
 * Compõe o Breadcrumb do shadcn/ui; o que muda é o rótulo em pt-BR e o alvo de
 * toque de 44px, que a versão de referência não garante (A3).
 */
export function Breadcrumb({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Root aria-label="Trilha">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href={href}
              className="-ml-1 inline-flex min-h-[44px] items-center gap-1 rounded-md px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              {children}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Root>
  );
}
