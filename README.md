# Case Clinical AI

Protótipo educacional **experimental** para estudantes de Medicina praticarem **raciocínio clínico**
sobre **casos fictícios**, com avaliação **determinística** e feedback escrito e revisado por humanos.

> O sistema não diz qual é o diagnóstico. Ele mostra **o que sustenta e o que contradiz o raciocínio
> do estudante**, com base numa chave que uma pessoa escreveu e revisou.

---

## ⚠️ Avisos

- **Protótipo educacional experimental.** Todos os casos são fictícios.
- **Não orienta decisão clínica real** e não substitui médico, professor ou literatura médica.
- Nenhum caso do catálogo está `approved`: os dois estão em `pending_human_review`, aguardando red
  team independente e revisão humana ([CLAUDE.md §10.3](CLAUDE.md)).
- Este repositório é público e contém as **chaves de correção** dos casos em `content/`. Isso é
  consequência declarada e aceita da arquitetura estática — ver
  [ADR-0007](docs/03-architecture/adr/ADR-0007-gabarito-no-cliente.md).

## Zero IA em tempo de execução

A avaliação é uma **função pura**: mesma entrada, mesma saída, sempre. Não há chamada a modelo de
linguagem, não há servidor, não há banco, não há chave de API. O app funciona offline e para sempre.
A decisão está em [ADR-0006](docs/03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md), e é
verificada por teste — `tests/quality/dependencies.test.ts` reprova o build se um SDK de LLM, uma
rota de API ou um middleware aparecer.

IA foi usada **na autoria** (pesquisa, escrita de casos, código), e isso está documentado em
[docs/phase-1/c1-ai-participation.md](docs/phase-1/c1-ai-participation.md).

## Como rodar

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run check        # typecheck + 236 testes + build de produção
npm run build        # exporta o site estático para out/
```

## Arquitetura

```
Caso JSON  →  registry (fs, build time)  →  StudentCaseView  →  CaseRunner (cliente)
                                                                    ↓
                                                    simulation.ts  (puro)
                                                                    ↓
                                                    evaluate.ts    (puro)  →  ResultView
```

| Pasta | O que é |
|---|---|
| `content/` | **Fonte de verdade clínica** — casos, chaves de correção e vocabulário |
| `src/domain/` | Sessão, etapas e sinais de processo. **Puro**: sem React, sem I/O, sem relógio |
| `src/evaluation/` | O motor determinístico e a composição do feedback. **Puro** |
| `src/content/` | Schemas Zod e carregadores (só em build time) |
| `src/features/` | Composição de UI por funcionalidade |
| `src/ui/` | Camada de apresentação — shadcn/ui em `src/ui/shadcn/` |
| `docs/` | Discovery, arquitetura, ADRs, pesquisa com fonte, revisões e qualidade |
| `.claude/` | Agentes e skills de autoria. **Infraestrutura de desenvolvimento**, não faz parte do produto |

Regra de dependência: `app → features → {domain, evaluation} → schemas`.
Nada em `src/` importa nada de `.claude/`.

## Adicionar um caso

É o objetivo técnico do projeto, e funciona:

1. criar `content/cases/<especialidade>/<id>.case.json` e `<id>.key.json`;
2. acrescentar conceitos novos em `content/vocabulary/diagnoses.json`, se houver;
3. `npm test` valida schema, integridade referencial, regra temporal e regressão B1;
4. o caso aparece sozinho no catálogo — **nenhum código de UI muda**.

## Qualidade verificada por teste

| Suíte | O que impede |
|---|---|
| `tests/content/` | Caso inválido, chave órfã, achado avaliado antes de ser revelado, veredito que afirma exame não solicitado |
| `tests/domain/` · `tests/evaluation/` | Regressão no motor determinístico |
| `tests/features/` | Acessibilidade do combobox, fluxo completo da simulação, revelação por etapas do resultado |
| `tests/quality/design-tokens.ts` | Cor crua, escala fora do tema, alvo de toque abaixo de 44px |
| `tests/quality/contrast.ts` | Par de tokens abaixo de AA, nos dois temas — calculado, não estimado |
| `tests/quality/dependencies.ts` | SDK de LLM, segunda biblioteca de UI, rota de API, `process.env` |
| `tests/quality/microcopy.ts` | Linguagem de certo/errado, gamificação, prescrição, atribuição de autoria a IA |

## Documentação

Comece por [docs/README.md](docs/README.md) · estado atual em
[docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) · regras que governam o repositório em
[CLAUDE.md](CLAUDE.md).

## Stack

Next.js 15 (`output: 'export'`) · React 19 · TypeScript strict · Tailwind CSS 3 · shadcn/ui · Zod · Vitest
