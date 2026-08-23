import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Os critérios que bloqueiam release (CLAUDE.md §10), verificados.
 *
 * §10.1 diz "teste de build falha se aparecer SDK de LLM". Este é esse teste —
 * e ele vai além: a lista de dependências de runtime é FECHADA. Adicionar uma
 * biblioteca exige editar este arquivo, o que força a conversa e o ADR em vez
 * de deixar a dependência entrar por descuido num `npm install`.
 */

const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

/** Runtime permitido, com o motivo de cada entrada. */
const ALLOWED_RUNTIME: Record<string, string> = {
  next: 'framework',
  react: 'framework',
  'react-dom': 'framework',
  zod: 'schema de conteúdo, validado em CI',

  // Design system — ADR-0011
  '@radix-ui/react-checkbox': 'shadcn/ui Checkbox',
  '@radix-ui/react-label': 'shadcn/ui Label',
  '@radix-ui/react-radio-group': 'shadcn/ui RadioGroup',
  '@radix-ui/react-separator': 'shadcn/ui Separator',
  '@radix-ui/react-slot': 'shadcn/ui `asChild`',
  'class-variance-authority': 'variantes dos componentes shadcn/ui',
  clsx: 'composição de classes',
  'tailwind-merge': 'resolução de conflito de utilitário Tailwind',
  'lucide-react': 'ícones — a biblioteca de ícones do shadcn/ui',
  'tailwindcss-animate': 'plugin de tema exigido pelo shadcn/ui',
};

/** Qualquer coisa que fale com um modelo de linguagem. */
const LLM_SDK =
  /^(openai|@anthropic-ai\/|@google\/gener|@google\/genai|@mistralai\/|cohere|groq-sdk|replicate|ollama|langchain|@langchain\/|llamaindex|ai$|@ai-sdk\/|@huggingface\/)/;

describe('dependências (CLAUDE.md §10.1)', () => {
  it('nenhum SDK de modelo de linguagem, em runtime ou em desenvolvimento', () => {
    const all = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)];
    expect(all.filter((d) => LLM_SDK.test(d))).toEqual([]);
  });

  it('a lista de dependências de runtime é fechada — nova entrada exige ADR', () => {
    const unexpected = Object.keys(pkg.dependencies).filter((d) => !(d in ALLOWED_RUNTIME));
    expect(unexpected).toEqual([]);
  });

  it('nenhuma dependência de UI concorrente — um design system, não dois', () => {
    const rivals = /^(@heroui\/|@nextui-org\/|@mui\/|antd|@chakra-ui\/|react-bootstrap|@mantine\/)/;
    const all = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)];
    expect(all.filter((d) => rivals.test(d))).toEqual([]);
  });
});

describe('aplicação estática (CLAUDE.md §10.2)', () => {
  const APP = join(ROOT, 'src', 'app');

  function collect(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) collect(full, out);
      else out.push(full.replace(ROOT, '').replace(/\\/g, '/'));
    }
    return out;
  }

  it('nenhum Route Handler e nenhum middleware', () => {
    const handlers = collect(APP).filter((f) => /\/(route|middleware)\.tsx?$/.test(f));
    expect(handlers).toEqual([]);
    expect(readdirSync(join(ROOT, 'src')).filter((f) => /^middleware\./.test(f))).toEqual([]);
  });

  it('o build continua sendo exportação estática', () => {
    const config = readFileSync(join(ROOT, 'next.config.mjs'), 'utf8');
    expect(config).toMatch(/output:\s*'export'/);
  });

  it('nenhum componente lê variável de ambiente', () => {
    const sources = collect(join(ROOT, 'src')).filter((f) => /\.tsx?$/.test(f));
    const offenders = sources.filter((f) =>
      /process\.env\.(?!NODE_ENV)/.test(readFileSync(join(ROOT, f), 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
