import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import tailwind from '../../tailwind.config';

/**
 * O design system verificado por teste.
 *
 * Sem isto, "shadcn/ui é a base", "escala restrita de espaçamento" e "três
 * degraus de sombra" são boa intenção que dura até o próximo componente.
 *
 * O que este arquivo NÃO faz: julgar estética. Ele verifica que nenhum
 * componente inventa vocabulário visual próprio — as classes permitidas são
 * derivadas do próprio tema, então o tema continua sendo a fonte de verdade e
 * este teste não vira uma segunda cópia dela.
 */

const SRC = join(process.cwd(), 'src');

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full, out);
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const files = collect(SRC).map((path) => ({
  path: path.replace(process.cwd(), '').replace(/\\/g, '/'),
  text: readFileSync(path, 'utf8'),
}));

const css = readFileSync(join(SRC, 'app', 'globals.css'), 'utf8');

/** Ocorrências de um padrão, com arquivo e trecho, para a mensagem de falha. */
function findAll(pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const f of files) {
    for (const line of f.text.split('\n')) {
      const m = line.match(pattern);
      if (m) hits.push(`${f.path}: ${m[0]}`);
    }
  }
  return hits;
}

/** Todos os usos de um utilitário, validados contra um conjunto permitido. */
function offenders(pattern: RegExp, allowed: Set<string>): string[] {
  const hits: string[] = [];
  for (const f of files) {
    for (const m of f.text.matchAll(pattern)) {
      if (!allowed.has(m[0])) hits.push(`${f.path}: ${m[0]}`);
    }
  }
  return [...new Set(hits)];
}

const theme = tailwind.theme!;
const extend = theme.extend!;

/* ------------------------------------------------------------------- cor */

describe('cor', () => {
  it('nenhum componente usa cor crua — tudo passa pelos tokens', () => {
    expect(findAll(/#[0-9a-fA-F]{3,6}\b|\brgb\(|\bhsl\(/)).toEqual([]);
  });

  it('nenhum componente usa a paleta do Tailwind diretamente', () => {
    expect(
      findAll(
        /\b(bg|text|border|ring|fill|stroke|decoration)-(slate|gray|zinc|neutral|stone|red|green|blue|teal|orange|indigo|amber|yellow|emerald|cyan|sky|violet|purple|pink|rose|lime)-\d{2,3}\b/,
      ),
    ).toEqual([]);
  });

  it('o contrato de tokens do shadcn/ui está declarado nos dois esquemas', () => {
    const contract = [
      'background',
      'foreground',
      'card',
      'popover',
      'primary',
      'secondary',
      'muted',
      'accent',
      'destructive',
      'border',
      'input',
      'ring',
    ];
    const dark = css.slice(css.indexOf('prefers-color-scheme: dark'));
    const missing = contract.filter(
      (t) => !css.includes(`--${t}:`) || !dark.includes(`--${t}:`),
    );
    expect(missing).toEqual([]);
  });
});

/* ---------------------------------------------------------------- radius */

describe('radius', () => {
  // Um único `--radius` gera todos os degraus. `rounded-2xl`, `rounded-3xl` e
  // `rounded` sem sufixo nem existem no tema.
  it('só usa os degraus derivados de --radius', () => {
    const sides = ['', 't', 'r', 'b', 'l', 'tl', 'tr', 'br', 'bl'];
    const allowed = new Set(
      sides.flatMap((s) =>
        Object.keys(theme.borderRadius!).map((k) => (s ? `rounded-${s}-${k}` : `rounded-${k}`)),
      ),
    );
    expect(offenders(/\brounded(?:-[a-z0-9]+)*/g, allowed)).toEqual([]);
  });

  it('o radius vem do token, nunca de um valor arbitrário', () => {
    expect(findAll(/\brounded(-[a-z]+)?-\[/)).toEqual([]);
  });
});

/* ----------------------------------------------------------- espaçamento */

describe('espaçamento', () => {
  const SCALE = [
    '0',
    'px',
    '0.5',
    '1',
    '1.5',
    '2',
    '2.5',
    '3',
    '3.5',
    '4',
    '5',
    '6',
    '8',
    '10',
    '12',
    '16',
    '20',
    '24',
    '32',
  ];
  const PROPS = [
    'p',
    'px',
    'py',
    'pt',
    'pb',
    'pl',
    'pr',
    'm',
    'mx',
    'my',
    'mt',
    'mb',
    'ml',
    'mr',
    'gap',
    'gap-x',
    'gap-y',
    'space-x',
    'space-y',
  ];

  it('não usa degraus fora da escala', () => {
    // `auto` só faz sentido em margem — é centralização, não espaçamento.
    const allowed = new Set(
      PROPS.flatMap((p) => {
        const values = p.startsWith('m') ? [...SCALE, 'auto'] : SCALE;
        return values.flatMap((s) => [`${p}-${s}`, `-${p}-${s}`]);
      }),
    );
    // Os prefixos mais longos primeiro: sem isso `gap` casa antes de `gap-x` e o
    // teste passa a acusar um utilitário que nem existe.
    const ordered = [...PROPS].sort((a, b) => b.length - a.length);
    expect(
      offenders(new RegExp(`-?\\b(?:${ordered.join('|')})-(?:\\d[\\d.]*|px|auto)\\b`, 'g'), allowed),
    ).toEqual([]);
  });
});

/* --------------------------------------------------------- alvos de toque */

describe('alvos de toque', () => {
  // A3: >= 44px em qualquer elemento interativo.
  it('nenhuma altura fixa de botão abaixo de 44px', () => {
    expect(findAll(/\bh-(?:[0-9]|10)\b(?=[^\n]*(?:Button|button|cursor-pointer))/)).toEqual([]);
  });

  it('nenhum min-h explícito abaixo de 44px', () => {
    expect(findAll(/min-h-\[(?:[0-9]|[1-3][0-9]|4[0-3])px\]/)).toEqual([]);
  });

  it('todo tamanho do Button do shadcn cumpre o alvo', () => {
    const button = files.find((f) => f.path.endsWith('ui/shadcn/button.tsx'))!;
    const sizes = button.text.slice(button.text.indexOf('size: {'));
    const heights = [...sizes.matchAll(/\bh-(\d+)\b/g)].map((m) => Number(m[1]));
    expect(heights.length).toBeGreaterThan(0);
    expect(heights.filter((h) => h * 4 < 44)).toEqual([]);
  });
});

/* -------------------------------------------------------------- sombras */

describe('sombras', () => {
  it('só existem os degraus declarados no tema', () => {
    const allowed = new Set(Object.keys(theme.boxShadow!).map((k) => `shadow-${k}`));
    expect(offenders(/\bshadow-[a-z0-9]+/g, allowed)).toEqual([]);
  });

  it('o documento clínico não recebe elevação — ele é papel, não cartão', () => {
    const onDocument = files.filter((f) =>
      /bg-paper[^\n"]*shadow|shadow[^\n"]*bg-paper/.test(f.text),
    );
    expect(onDocument.map((f) => f.path)).toEqual([]);
  });
});

/* ----------------------------------------------------------- tipografia */

describe('tipografia', () => {
  it('só usa os tamanhos declarados na escala', () => {
    const sizes = new Set(Object.keys(theme.fontSize as object));
    const colorRoots = new Set(Object.keys(extend.colors as object));
    const utilities = new Set([
      'left',
      'center',
      'right',
      'justify',
      'start',
      'end',
      'wrap',
      'nowrap',
      'balance',
      'pretty',
      'ellipsis',
      'clip',
      'current',
      'transparent',
      'inherit',
    ]);

    const invalid = new Set<string>();
    for (const f of files) {
      // A retrospectiva impede que `align-text-bottom` seja lido como `text-bottom`.
      for (const m of f.text.matchAll(/(?<![\w-])text-([a-z0-9]+)\b/g)) {
        const token = m[1]!;
        if (sizes.has(token) || colorRoots.has(token) || utilities.has(token)) continue;
        invalid.add(`${f.path}: text-${token}`);
      }
    }
    expect([...invalid]).toEqual([]);
  });

  it('nenhum tamanho de texto arbitrário', () => {
    expect(findAll(/\btext-\[/)).toEqual([]);
  });

  it('só usa os pesos definidos', () => {
    expect(findAll(/\bfont-(thin|extralight|light|extrabold|black)\b/)).toEqual([]);
  });

  it('o texto clínico tem uma definição só, e ela vive no CSS', () => {
    expect(css).toMatch(/\.case-prose\s*\{/);
    // Nenhum componente remonta a prosa clínica com utilitários soltos.
    expect(findAll(/font-case[^"]*max-w-reading|max-w-reading[^"]*font-case/)).toEqual([]);
  });
});

/* ------------------------------------------------- shadcn como base real */

describe('shadcn/ui é a base', () => {
  const outsideUi = files.filter((f) => !f.path.startsWith('/src/ui/'));

  it('nenhuma tela usa controle de formulário cru', () => {
    const raw = outsideUi.filter((f) => /<(input|textarea|select)[\s>]/.test(f.text));
    expect(raw.map((f) => f.path)).toEqual([]);
  });

  it('nenhuma tela redefine a base visual de um botão', () => {
    // A assinatura do Button do shadcn/ui. Reaparecer fora de src/ui/ significa
    // que alguém recriou o botão à mão em vez de usar a variante.
    const raw = outsideUi.filter((f) =>
      /inline-flex items-center justify-center[^"]*\bbg-primary\b/.test(f.text),
    );
    expect(raw.map((f) => f.path)).toEqual([]);
  });

  it('as primitivas do shadcn/ui não são editadas para fora do tema', () => {
    const primitives = files.filter((f) => f.path.startsWith('/src/ui/shadcn/'));
    expect(primitives.length).toBeGreaterThan(0);
    for (const f of primitives) {
      expect(f.text, f.path).toMatch(/from ['"]@\/ui\/cn['"]/);
    }
  });
});

/* ------------------------------------------------------------ duplicação */

describe('duplicação', () => {
  it('o padrão de opção selecionável vive em um lugar só', () => {
    const inlined = files.filter(
      (f) =>
        !f.path.endsWith('SelectableOption.tsx') &&
        /border-primary\/40 bg-accent text-accent-foreground/.test(f.text),
    );
    expect(inlined.map((f) => f.path)).toEqual([]);
  });

  it('a trilha de navegação vive em um lugar só', () => {
    const inlined = files.filter(
      (f) => !f.path.endsWith('ui/Breadcrumb.tsx') && /aria-label="Trilha"/.test(f.text),
    );
    expect(inlined.map((f) => f.path)).toEqual([]);
  });

  it('o versalete de seção tem uma definição só, e ela é usada de fato', () => {
    expect(css).toMatch(/\.eyebrow\s*\{/);
    const users = files.filter((f) => /className="eyebrow/.test(f.text));
    expect(users.length).toBeGreaterThanOrEqual(3);
    // Ninguém remonta o versalete à mão com o mesmo trio de utilitários.
    expect(findAll(/text-xs font-semibold uppercase/)).toEqual([]);
  });
});
