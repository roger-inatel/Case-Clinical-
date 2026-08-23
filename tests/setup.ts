import { afterEach } from 'vitest';

// Este setup roda para todos os testes, inclusive os de ambiente node.
// Só carrega o aparato de DOM quando há DOM.
if (typeof document !== 'undefined') {
  // O jsdom não implementa rolagem e reclama em stderr toda vez que um
  // componente sobe a página. Não é falha do produto: é ausência de layout.
  // Com os stubs, o caminho real de navegação é exercido em vez de pulado.
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};

  await import('@testing-library/jest-dom/vitest');
  const { cleanup } = await import('@testing-library/react');
  // Sem `globals: true`, o RTL não registra a limpeza automática entre testes.
  afterEach(cleanup);
}
