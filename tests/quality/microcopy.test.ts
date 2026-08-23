import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getAllCases, getCaseKey } from '@/content/registry';

/**
 * Microcópia como teste, não como boa intenção.
 *
 * As regras de docs/04-ux/design-system.md e ux-flow.md §7 só se sustentam se
 * forem verificáveis. Este arquivo é o que impede a linguagem proibida de
 * reaparecer conforme o catálogo cresce.
 */

const SRC = join(process.cwd(), 'src');

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * Remove comentários (as regras valem para o que o estudante lê, não para notas
 * de código) e colapsa espaços — no JSX uma frase se quebra em várias linhas, e
 * a busca precisa atravessar essa quebra.
 */
function visibleText(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
    .replace(/\s+/g, ' ');
}

const sourceFiles = collectFiles(SRC).map((path) => ({
  path: path.replace(process.cwd(), '').replace(/\\/g, '/'),
  text: visibleText(readFileSync(path, 'utf8')),
}));

const cases = getAllCases();
const contentTexts = cases.flatMap((c) => {
  const key = getCaseKey(c.id);
  return [
    { path: `${c.id}.case.json`, text: JSON.stringify(c) },
    { path: `${c.id}.key.json`, text: JSON.stringify(key) },
  ];
});

const everything = [...sourceFiles, ...contentTexts];

function scan(pattern: RegExp): string[] {
  return everything.filter((f) => pattern.test(f.text)).map((f) => f.path);
}

describe('linguagem de certo/errado', () => {
  // "Correto!"/"Errado!" reduzem raciocínio a acerto. A escala é de
  // compatibilidade com os dados, não de verdade.
  it.each([
    ['exclamação de acerto', /\b(Correto|Certo|Parabéns|Muito bem|Acertou)!/],
    ['exclamação de erro', /\b(Errado|Incorreto|Errou)!/],
    ['você errou', /você errou/i],
    ['resposta incorreta', /resposta (incorreta|errada)/i],
  ])('não usa %s', (_label, pattern) => {
    expect(scan(pattern)).toEqual([]);
  });
});

describe('atribuição da análise', () => {
  // Não há IA em runtime: dizer que "a IA analisou" seria falso.
  it.each([
    ['a IA analisou/diagnosticou', /\ba IA (analisou|diagnosticou|avaliou|concluiu)/i],
    ['inteligência artificial como autora', /segundo a inteligência artificial/i],
    ['gerado por IA', /gerado (pela|por) (IA|inteligência artificial)/i],
  ])('não atribui a análise a uma IA (%s)', (_label, pattern) => {
    expect(scan(pattern)).toEqual([]);
  });
});

describe('gamificação', () => {
  it.each([
    ['pontuação', /\b(sua pontuação|você marcou \d+ pontos|placar|ranking)\b/i],
    ['nota final', /\bnota final\b/i],
    ['medalha ou troféu', /\b(medalha|troféu|conquista desbloqueada|streak)\b/i],
    ['percentual de acerto', /\b\d+% de (acerto|aproveitamento)/i],
  ])('não introduz %s', (_label, pattern) => {
    expect(scan(pattern)).toEqual([]);
  });
});

describe('linguagem clínica proibida', () => {
  // O sistema não prescreve. Regra do CLAUDE.md §10.6.
  it.each([
    ['prescrição em imperativo', /\b(prescreva|administre|inicie o tratamento com)\b/i],
    ['dose', /\b\d+\s?(mg|mcg|g|UI)\b/i],
    ['promessa de prognóstico', /\bo prognóstico (é|será)\b/i],
  ])('não contém %s', (_label, pattern) => {
    expect(scan(pattern)).toEqual([]);
  });
});

describe('honestidade sobre o que é avaliado', () => {
  it('promete comparação — nunca análise — do texto livre', () => {
    expect(scan(/analisaremos (seu|o seu) (texto|raciocínio)/i)).toEqual([]);
    const runner = sourceFiles.find((f) => f.path.endsWith('DecisionPoints.tsx'))!;
    expect(runner.text).toMatch(/não é corrigido automaticamente/i);
  });

  it('hipótese fora do vocabulário nunca é chamada de inválida', () => {
    expect(scan(/hipótese (inválida|não permitida)/i)).toEqual([]);
    const combobox = sourceFiles.find((f) => f.path.endsWith('DiagnosisCombobox.tsx'))!;
    expect(combobox.text).toMatch(/não significa que a hipótese esteja errada/i);
  });
});

describe('disclaimer obrigatório', () => {
  it('todo caso declara ser fictício', () => {
    for (const c of cases) {
      expect(c.disclaimer.toLowerCase(), `caso ${c.id}`).toMatch(/fictício/);
      expect(c.authoring.fictional, `caso ${c.id}`).toBe(true);
    }
  });

  it('o rodapé declara ausência de IA em runtime', () => {
    const layout = sourceFiles.find((f) => f.path.endsWith('app/layout.tsx'))!;
    expect(layout.text).toMatch(/nenhuma chamada a modelos de linguagem/i);
    expect(layout.text).toMatch(/fictícios/i);
  });
});

describe('vermelho é reservado a perigo clínico (R2)', () => {
  it('nenhum componente usa token de perigo fora de red flag e cantMiss', () => {
    // As primitivas de src/ui/shadcn/ DECLARAM a variante; quem a USA precisa
    // estar falando de perigo clínico. O barril reexporta, não decide nada.
    const declaresOnly = (path: string) =>
      path.startsWith('/src/ui/shadcn/') || path === '/src/ui/index.ts';
    const offenders = sourceFiles.filter(
      (f) =>
        /danger/.test(f.text) &&
        !declaresOnly(f.path) &&
        !/RedFlag|redFlag|cantMiss|critical/.test(f.text),
    );
    expect(offenders.map((f) => f.path)).toEqual([]);
  });

  it('não existe token de sucesso — ele acabaria aplicado a um veredito', () => {
    expect(scan(/--success|text-success|bg-success/)).toEqual([]);
  });
});
