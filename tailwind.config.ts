import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Design System — Case Clinical AI
 *
 * Este arquivo NÃO define valores: ele expõe ao Tailwind os tokens declarados em
 * src/app/globals.css. Cor nova se resolve lá, não aqui.
 *
 * O tema é deliberadamente restrito — escala tipográfica fechada, três degraus
 * de sombra, radius derivado de um único `--radius`. Um componente não consegue
 * inventar linguagem visual própria porque a classe simplesmente não existe.
 */
const config: Config = {
  darkMode: 'media',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ---------------------------------------- contrato shadcn/ui */
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          rule: 'hsl(var(--primary-rule) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },

        /* ------------------------------------------ tokens de domínio */
        paper: {
          DEFAULT: 'hsl(var(--paper) / <alpha-value>)',
          rule: 'hsl(var(--paper-rule) / <alpha-value>)',
        },
        commentary: {
          DEFAULT: 'hsl(var(--commentary) / <alpha-value>)',
          rule: 'hsl(var(--commentary-rule) / <alpha-value>)',
        },
        evidence: {
          support: 'hsl(var(--evidence-support) / <alpha-value>)',
          contradict: 'hsl(var(--evidence-contradict) / <alpha-value>)',
          neutral: 'hsl(var(--evidence-neutral) / <alpha-value>)',
        },
        verdict: {
          'strong-support': 'hsl(var(--verdict-strong-support) / <alpha-value>)',
          support: 'hsl(var(--verdict-support) / <alpha-value>)',
          weak: 'hsl(var(--verdict-weak) / <alpha-value>)',
          none: 'hsl(var(--verdict-none) / <alpha-value>)',
          insufficient: 'hsl(var(--verdict-insufficient) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
          surface: 'hsl(var(--danger-surface) / <alpha-value>)',
          rule: 'hsl(var(--danger-rule) / <alpha-value>)',
        },
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        case: ['var(--font-case)', 'Georgia', 'serif'],
      },

      maxWidth: {
        reading: '68ch',
        app: '46rem',
        catalog: '64rem',
      },

      /**
       * Sem `keyframes` nem `animation` próprios, e não é esquecimento: o design
       * system proíbe animação de entrada de conteúdo (§6.3). A revelação do
       * feedback é um corte, não uma coreografia.
       */
      transitionDuration: { DEFAULT: '150ms' },
    },

    /**
     * Escala tipográfica fechada — substitui o tema, não o estende: `text-4xl`
     * e acima deixam de existir. `case` é o corpo do registro clínico, e é
     * token para que o tamanho do texto do caso não seja escolhido a olho.
     */
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5' }],
      sm: ['0.875rem', { lineHeight: '1.55' }],
      base: ['1rem', { lineHeight: '1.6' }],
      case: ['1.0625rem', { lineHeight: '1.7' }],
      lg: ['1.125rem', { lineHeight: '1.45' }],
      xl: ['1.375rem', { lineHeight: '1.3' }],
      '2xl': ['1.75rem', { lineHeight: '1.22', letterSpacing: '-0.015em' }],
      '3xl': ['2.25rem', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
    },

    /** Quatro pesos. Um quinto peso é uma quinta hierarquia que ninguém pediu. */
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    /**
     * Três degraus, e só três: repouso, cartão, sobreposição. Uma superfície
     * que precisa de mais elevação do que `md` está mal posicionada.
     */
    boxShadow: {
      none: 'none',
      sm: '0 1px 2px 0 hsl(var(--shadow-color) / 0.06), 0 1px 1px -1px hsl(var(--shadow-color) / 0.04)',
      md: '0 2px 4px -1px hsl(var(--shadow-color) / 0.07), 0 8px 20px -6px hsl(var(--shadow-color) / 0.12)',
    },

    /**
     * Radius derivado de um único token. Substitui o tema (não estende), então
     * `rounded-2xl`, `rounded-3xl` e afins deixam de existir: a classe não é
     * gerada e não pode reaparecer por descuido.
     */
    borderRadius: {
      none: '0',
      sm: 'calc(var(--radius) - 4px)',
      md: 'calc(var(--radius) - 2px)',
      lg: 'var(--radius)',
      xl: 'calc(var(--radius) + 4px)',
      full: '9999px',
    },
  },
  plugins: [animate],
};

export default config;
