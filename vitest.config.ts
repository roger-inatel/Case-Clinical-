import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  // tsconfig usa `jsx: preserve` (exigência do Next). O vitest transpila por
  // conta própria, então o runtime automático precisa ser declarado aqui.
  esbuild: { jsx: 'automatic' },
  test: {
    // Ambiente node por padrão (rápido). Testes de componente declaram
    // `// @vitest-environment jsdom` no topo do arquivo.
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@content': resolve(__dirname, './content'),
    },
  },
});
