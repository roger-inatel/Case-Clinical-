// @vitest-environment jsdom
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getVocabulary } from '@/content/registry';
import {
  DiagnosisCombobox,
  type DiagnosisSelection,
} from '@/features/DiagnosisCombobox';

/**
 * O componente de maior risco de acessibilidade do produto.
 * Critérios de aceite de docs/04-ux/design-system-components.md §4.
 */

const concepts = getVocabulary().concepts;

function Harness({ max = 3 }: { max?: number }) {
  const [value, setValue] = useState<DiagnosisSelection>({ concepts: [], unknownTerms: [] });
  return (
    <DiagnosisCombobox
      concepts={concepts}
      value={value}
      onChange={setValue}
      maxSelections={max}
      label="Suas hipóteses"
    />
  );
}

const input = () => screen.getByRole('combobox');

describe('sugestões', () => {
  it('não abre a lista abaixo de 2 caracteres', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 't');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('abre a lista a partir de 2 caracteres', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'tep');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-expanded', 'true');
  });

  it('não despeja o vocabulário ao receber foco', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(input());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('encontra por sigla', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'NSTEMI');
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options[0]).toHaveTextContent(/sem supradesnivelamento/i);
  });

  it('anuncia a contagem de resultados para leitor de tela', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'sca');
    expect(screen.getByText(/sugestões disponíveis/)).toBeInTheDocument();
  });
});

describe('navegação por teclado', () => {
  it('aponta aria-activedescendant para a opção destacada', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'sindrome');
    const first = input().getAttribute('aria-activedescendant');
    expect(first).toBeTruthy();

    await user.keyboard('{ArrowDown}');
    expect(input().getAttribute('aria-activedescendant')).not.toBe(first);

    await user.keyboard('{ArrowUp}');
    expect(input().getAttribute('aria-activedescendant')).toBe(first);
  });

  it('Enter seleciona a opção destacada e vira chip', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'tep{Enter}');
    expect(screen.getByText('Tromboembolismo pulmonar')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input()).toHaveValue('');
  });

  it('Escape fecha a lista sem perder o texto digitado', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'tep{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input()).toHaveValue('tep');
  });

  it('Backspace em campo vazio remove o último selecionado', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'tep{Enter}');
    expect(screen.getByText('Tromboembolismo pulmonar')).toBeInTheDocument();
    await user.keyboard('{Backspace}');
    expect(screen.queryByText('Tromboembolismo pulmonar')).not.toBeInTheDocument();
  });
});

describe('termo fora do vocabulário', () => {
  it('responde com honestidade, sem declarar erro', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'pericardite');

    expect(screen.getByText(/não encontramos/i)).toBeInTheDocument();
    expect(screen.getByText(/não significa que a hipótese esteja errada/i)).toBeInTheDocument();
    expect(screen.queryByText(/inválid/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/incorret/i)).not.toBeInTheDocument();
  });

  it('permite registrar o termo e seguir', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'pericardite');
    await user.click(screen.getByRole('button', { name: /registrar/i }));
    expect(screen.getByText('pericardite')).toBeInTheDocument();
  });
});

describe('limite de seleções', () => {
  it('bloqueia o campo ao atingir o limite, informando o motivo', async () => {
    const user = userEvent.setup();
    render(<Harness max={1} />);
    await user.type(input(), 'tep{Enter}');
    expect(input()).toBeDisabled();
    expect(input()).toHaveAttribute('placeholder', expect.stringMatching(/limite de 1/i));
  });

  it('mostra o contador de seleções', async () => {
    const user = userEvent.setup();
    render(<Harness max={3} />);
    expect(screen.getByText(/0 de 3 selecionadas/)).toBeInTheDocument();
    await user.type(input(), 'tep{Enter}');
    expect(screen.getByText(/1 de 3 selecionadas/)).toBeInTheDocument();
  });
});

describe('remoção', () => {
  it('cada chip tem botão de remoção rotulado', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.type(input(), 'tep{Enter}');
    const remove = screen.getByRole('button', { name: /remover tromboembolismo pulmonar/i });
    await user.click(remove);
    expect(screen.queryByText('Tromboembolismo pulmonar')).not.toBeInTheDocument();
  });
});

describe('rótulo', () => {
  it('o campo tem label associado', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Suas hipóteses')).toBe(input());
  });
});
