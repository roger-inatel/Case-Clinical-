// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getCase, getCaseKey, getVocabulary } from '@/content/registry';
import { toStudentView } from '@/domain/simulation';
import { CaseRunner } from '@/features/CaseRunner';

// next/link exige o contexto do App Router, que não existe em teste isolado.
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

function renderRunner() {
  return render(<CaseRunner caseView={caseView} caseKey={caseKey} vocabulary={vocabulary} />);
}

const combobox = () => screen.getByRole('combobox');

beforeEach(() => {
  sessionStorage.clear();
});

describe('revelação progressiva', () => {
  it('mostra apenas a primeira etapa ao iniciar', async () => {
    renderRunner();
    await waitFor(() => expect(screen.getByRole('heading', { name: /Queixa principal/ })).toBeInTheDocument());

    // Etapas seguintes não podem estar na tela.
    expect(screen.queryByRole('heading', { name: /História clínica/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/sudorese fria/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Etapa 1 de 4/)).toBeInTheDocument();
  });

  it('não oferece avançar enquanto há ponto de decisão pendente', async () => {
    renderRunner();
    await waitFor(() => expect(screen.getByText(/Ponto de decisão/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /avançar/i })).not.toBeInTheDocument();
  });

  it('só revela a próxima etapa depois de responder e avançar', async () => {
    const user = userEvent.setup();
    renderRunner();
    await waitFor(() => expect(screen.getByRole('heading', { name: /Queixa principal/ })).toBeInTheDocument());

    await user.click(screen.getByText('agudo'));
    await user.click(screen.getByRole('button', { name: /confirmar representação/i }));

    await user.type(combobox(), 'sca{Enter}');
    await user.click(screen.getByRole('button', { name: /confirmar hipóteses/i }));

    const advance = await screen.findByRole('button', { name: /avançar/i });
    expect(screen.queryByRole('heading', { name: /História clínica/ })).not.toBeInTheDocument();

    await user.click(advance);
    expect(await screen.findByRole('heading', { name: /História clínica/ })).toBeInTheDocument();
    expect(screen.getByText(/Etapa 2 de 4/)).toBeInTheDocument();
  });
});

describe('trava de resposta', () => {
  it('avisa que a resposta é irreversível antes da submissão', async () => {
    renderRunner();
    await waitFor(() =>
      expect(screen.getByText(/não pode ser alterada depois/i)).toBeInTheDocument(),
    );
  });

  it('o ponto de decisão respondido some — não há como reeditar', async () => {
    const user = userEvent.setup();
    renderRunner();
    await waitFor(() => expect(screen.getByRole('heading', { name: /Queixa principal/ })).toBeInTheDocument());

    await user.click(screen.getByText('agudo'));
    await user.click(screen.getByRole('button', { name: /confirmar representação/i }));

    expect(
      screen.queryByRole('button', { name: /confirmar representação/i }),
    ).not.toBeInTheDocument();
  });
});

describe('exames determinam o que o estudante vê', () => {
  async function playToTests(user: ReturnType<typeof userEvent.setup>) {
    await waitFor(() => expect(screen.getByRole('heading', { name: /Queixa principal/ })).toBeInTheDocument());
    await user.click(screen.getByText('agudo'));
    await user.click(screen.getByRole('button', { name: /confirmar representação/i }));
    await user.type(combobox(), 'sca{Enter}');
    await user.click(screen.getByRole('button', { name: /confirmar hipóteses/i }));
    await user.click(await screen.findByRole('button', { name: /avançar/i }));

    await user.click(await screen.findByText('Não altera'));
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(await screen.findByRole('button', { name: /avançar/i }));
  }

  it('só mostra o resultado dos exames solicitados', async () => {
    const user = userEvent.setup();
    renderRunner();
    await playToTests(user);

    await user.click(await screen.findByText(/Eletrocardiograma de 12 derivações/));
    await user.click(screen.getByRole('button', { name: /solicitar exames/i }));
    await user.click(await screen.findByRole('button', { name: /avançar/i }));

    // O laudo do ECG aparece no documento E no seletor de evidências de dp5.
    expect((await screen.findAllByText(/ritmo sinusal/i)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/percentil 99/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/D-dímero dentro do valor/i)).not.toBeInTheDocument();
  });

  it('permite seguir sem solicitar exame nenhum, e diz isso na tela', async () => {
    const user = userEvent.setup();
    renderRunner();
    await playToTests(user);

    await user.click(
      await screen.findByRole('button', { name: /seguir sem solicitar exames/i }),
    );
    await user.click(await screen.findByRole('button', { name: /avançar/i }));

    expect(
      await screen.findByText(/nenhum resultado de exame disponível/i),
    ).toBeInTheDocument();
    // A nota de contexto da etapa continua visível — ela não depende de exame.
    expect(screen.getAllByText(/reavaliação realizada/i).length).toBeGreaterThan(0);
  });
});

describe('fluxo completo até a análise', () => {
  it('chega ao resultado e mostra o veredito', async () => {
    const user = userEvent.setup();
    renderRunner();

    await waitFor(() => expect(screen.getByRole('heading', { name: /Queixa principal/ })).toBeInTheDocument());
    await user.click(screen.getByText('agudo'));
    await user.click(screen.getByText('opressivo / em aperto'));
    await user.click(screen.getByRole('button', { name: /confirmar representação/i }));

    await user.type(combobox(), 'sca{Enter}');
    await user.click(screen.getByRole('button', { name: /confirmar hipóteses/i }));
    await user.click(await screen.findByRole('button', { name: /avançar/i }));

    await user.click(await screen.findByText('Não altera'));
    await user.click(screen.getByRole('button', { name: /^confirmar$/i }));
    await user.click(await screen.findByRole('button', { name: /avançar/i }));

    await user.click(await screen.findByText(/Eletrocardiograma de 12 derivações/));
    await user.click(screen.getByText(/Troponina ultrassensível/));
    await user.click(screen.getByRole('button', { name: /solicitar exames/i }));
    await user.click(await screen.findByRole('button', { name: /avançar/i }));

    // Hipótese final + evidências + raciocínio
    await user.type(await screen.findByRole('combobox'), 'IAM sem supra{Enter}');
    await user.type(
      screen.getByLabelText(/escreva seu raciocínio/i),
      'Quadro clínico e perfil de risco sustentam origem isquêmica.',
    );
    await user.click(screen.getByRole('button', { name: /concluir e ver a análise/i }));

    expect(await screen.findByText(/Análise do seu raciocínio/i)).toBeInTheDocument();
    expect(screen.getByText(/Fortemente compatível com os dados/)).toBeInTheDocument();
  });
});

describe('acessibilidade da simulação', () => {
  it('a etapa atual é marcada com aria-current', async () => {
    renderRunner();
    await waitFor(() => expect(screen.getByRole('heading', { name: /Queixa principal/ })).toBeInTheDocument());
    const steps = screen.getByRole('list', { name: /etapa 1 de 4/i });
    expect(within(steps).getAllByRole('listitem').some((li) => li.getAttribute('aria-current') === 'step')).toBe(true);
  });

  it('os grupos de opção têm legenda associada', async () => {
    renderRunner();
    await waitFor(() => expect(screen.getByRole('group')).toBeInTheDocument());
    expect(screen.getByRole('group')).toHaveAccessibleName(/como você resumiria este problema/i);
  });

  it('há um único h1 na página', async () => {
    renderRunner();
    await waitFor(() => expect(screen.getByRole('heading', { name: /Queixa principal/ })).toBeInTheDocument());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
