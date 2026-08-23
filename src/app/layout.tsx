import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import Link from 'next/link';
import { Activity } from 'lucide-react';

import { Badge } from '@/ui';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-case',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Case Clinical AI — Raciocínio clínico com casos simulados',
  description:
    'Protótipo educacional experimental para treinamento de raciocínio clínico por meio de casos clínicos fictícios. Avaliação determinística, sem IA em tempo de execução.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-foreground focus:shadow-md"
        >
          Ir para o conteúdo
        </a>

        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-catalog items-center justify-between gap-4 px-4 sm:px-6">
            <Link
              href="/"
              className="-ml-1 flex items-center gap-2.5 rounded-md px-1 py-1.5 transition-opacity hover:opacity-80"
            >
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-content-center rounded-md bg-primary text-primary-foreground"
              >
                <Activity className="size-4" strokeWidth={2.5} />
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Case Clinical AI
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/casos/"
                className="rounded-md px-1 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Casos
              </Link>
              <Badge variant="outline" className="hidden sm:inline-flex">
                Protótipo educacional
              </Badge>
            </div>
          </div>
        </header>

        <main id="conteudo" className="flex-1">
          {children}
        </main>

        <footer className="mt-20 border-t border-border bg-muted/40">
          <div className="mx-auto max-w-catalog px-4 py-8 sm:px-6">
            <p className="eyebrow">Aviso</p>
            <div className="mt-3 grid max-w-reading gap-3 text-sm text-muted-foreground">
              <p>
                Protótipo educacional experimental. Todos os casos são fictícios e destinam-se
                exclusivamente ao estudo. Não orienta decisão clínica real e não substitui médico,
                professor ou literatura médica.
              </p>
              <p>
                Avaliação determinística — nenhuma chamada a modelos de linguagem em tempo de
                execução. Nada do que você responde sai do seu navegador.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
