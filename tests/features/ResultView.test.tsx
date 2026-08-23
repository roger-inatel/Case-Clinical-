// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getCase, getCaseKey, getVocabulary } from '@/content/registry';
import { createSession, recordAnswer, toStudentView } from '@/domain/simulation';
import { evaluate } from '@/evaluation/evaluate';
import { ResultView } from '@/features/ResultView';
import type { EvidenceRelation } from '@/content/schema';
import type { Session } from '@/domain/types';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const clinicalCase = getCase('cardio-001')!;
const caseView = toStudentView(clinicalCase);
const caseKey = getCaseKey('cardio-001');
const vocabulary = getVocabulary();

function buildResult(opts: {
  tests?: string[];
  finalConcept?: string;
  evidence?: Record<string, EvidenceRelation>;
} = {}) {
  let s: Session = createSession(caseView.id, caseView.stages[0]!.id, 1);
  s = { ...s, stagesRevealed: caseView.stages.map((st) => st.id) };
  s = recordAnswer(s, 'dp1', { type: 'problem-representation', selected: ['q.agudo'], at: 1 });
  s = recordAnswer(s, 'dp2', {
    type: 'hypothesis-list',
    concepts: ['dx.sca'],
    unknownTerms: [],
    at: 1,
  });
  s = recordAnswer(s, 'dp3', { type: 'probability-shift', direction: 0, at: 1 });
  s = recordAnswer(s, 'dp4', {
    type: 'test-selection',
    tests: opts.tests ?? ['t.ecg', 't.troponina'],
    at: 1,
  });
  s = recordAnswer(s, 'dp5', {
    type: 'final-hypothesis',
    concept: opts.finalConcept ?? 'dx.sca-ssst',
    unknownTerm: null,
    evidence: opts.evidence ?? {},
    rationale: 'Meu raciocínio escrito à mão.',
    at: 1,
  });
  return evaluate(caseView, caseKey, vocabulary, s);
}

function renderResult(result = buildResult()) {
  return render(<ResultView caseView={caseView} result={result} onRestart={() => {}} />);
}

/** Revela todas as seções clicando em "Continuar" até o botão sumir. */
async function revealAll(user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < 20; i++) {
    const next = screen.queryByRole('button', { name: /^continuar$/i });
    if (!next) break;
    await user.click(next);
  }
}

describe('revelação por etapas', () => {
  it('abre mostrando apenas o veredito', () => {
    renderResult();
    expect(screen.getByText(/Sua hipótese/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /O que sustenta/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^continuar$/i })).toBeInTheDocument();
  });

  it('mostra o progresso das seções em contagem, não em porcentagem', () => {
    renderResult();
    expect(screen.getByText(/1 de \d+ seções/)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('a evidência contrária é revelada ANTES da favorável', async () => {
    const user = userEvent.setup();
    renderResult();
    await user.click(screen.getByRole('button', { name: /^continuar$/i })); // processo
    await user.click(screen.getByRole('button', { name: /^continuar$/i })); // contradiz

    expect(screen.getByRole('heading', { name: /O que contradiz/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /O que sustenta/i })).not.toBeInTheDocument();
  });

  it('o botão some quando tudo foi revelado', async () => {
    const user = userEvent.setup();
    renderResult();
    await revealAll(user);
    expect(screen.queryByRole('button', { name: /^continuar$/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Para fechar/i })).toBeInTheDocument();
  });
});

describe('perigo ignorado', () => {
  it('avisa acima do veredito quando um red flag crítico passou (D-IMPL-01)', () => {
    const result = buildResult({ evidence: {} });
    expect(result.criticalRedFlagMissed).toBe(true);
    renderResult(result);
    expect(screen.getByText(/sinal de alarme passou despercebido/i)).toBeInTheDocument();
    // ...e o veredito NÃO é rebaixado por causa disso.
    expect(screen.getByText(/Fortemente compatível com os dados/)).toBeInTheDocument();
  });

  it('não avisa quando o estudante reconheceu o sinal', () => {
    const result = buildResult({ evidence: { f1: 'supports', f17: 'supports' } });
    expect(result.criticalRedFlagMissed).toBe(false);
    renderResult(result);
    expect(screen.queryByText(/sinal de alarme passou despercebido/i)).not.toBeInTheDocument();
  });
});

describe('perfil de decisão', () => {
  it('usa contagem explícita e nunca nota agregada (ADR-0010)', async () => {
    const user = userEvent.setup();
    renderResult();
    await revealAll(user);

    expect(screen.getByRole('heading', { name: /Perfil de decisão/i })).toBeInTheDocument();
    expect(screen.getByText(/Contagens, não nota/i)).toBeInTheDocument();
    expect(screen.getByText(/Amplitude do diferencial/)).toBeInTheDocument();
    // Nenhuma nota, percentual ou placar.
    expect(screen.queryByText(/\d+\s*%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/pontos|pontuação|nota final|score/i)).not.toBeInTheDocument();
  });
});

describe('raciocínio lado a lado', () => {
  it('exibe o texto do estudante como ele escreveu, sem julgá-lo', async () => {
    const user = userEvent.setup();
    renderResult();
    await revealAll(user);

    expect(screen.getByText('Meu raciocínio escrito à mão.')).toBeInTheDocument();
    expect(screen.getByText(/Raciocínio do autor/)).toBeInTheDocument();
  });
});

describe('atribuição autoral', () => {
  it('declara que a análise é humana, não gerada', () => {
    renderResult();
    expect(screen.getByText(/Nenhuma parte deste texto foi gerada automaticamente/i)).toBeInTheDocument();
  });

  it('rotula os blocos de interpretação como comentário do autor', async () => {
    const user = userEvent.setup();
    renderResult();
    await revealAll(user);
    expect(screen.getAllByText(/Comentário do autor|Raciocínio do autor|Pergunta de reflexão/).length).toBeGreaterThan(0);
  });
});

describe('fechamento', () => {
  it('mostra as fontes do caso com link', async () => {
    const user = userEvent.setup();
    renderResult();
    await revealAll(user);
    const links = screen.getAllByRole('link', { name: /Diretrizes da Sociedade Brasileira/i });
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('scielo.br'));
  });

  it('fecha com pergunta de reflexão e sem resposta', async () => {
    const user = userEvent.setup();
    renderResult();
    await revealAll(user);
    expect(screen.getByText(/teria mudado sua conduta/i)).toBeInTheDocument();
  });
});
