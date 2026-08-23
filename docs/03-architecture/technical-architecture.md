# Arquitetura Técnica — V2

> Revisão da V1. O que mudou está em §7. Decisão de base:
> [ADR-0006 — aplicação estática, sem LLM em runtime](adr/ADR-0006-aplicacao-estatica-sem-llm.md).

## 1. A aplicação inteira

```
Usuário → navegador → JSON local → lógica local → resultado
```

Sem servidor. Sem API. Sem chave. Sem banco. Sem sessão remota. Sem custo por uso.
Funciona offline depois do primeiro carregamento e continua funcionando se toda provedora de IA do
mundo sair do ar.

## 2. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js (App Router) com `output: 'export'`** | Gera site estático. Roteamento, geração de páginas por caso e divisão de código sem configuração manual |
| Linguagem | **TypeScript strict** | Os schemas de caso e chave são o contrato central do sistema |
| Validação | **Zod** | Um schema, dois usos: validar conteúdo em CI e tipar o carregamento |
| Estilo | **Tailwind** | Tipografia e espaçamento consistentes sem design system próprio |
| Componentes | **Radix primitives** apenas onde a acessibilidade é não trivial | Combobox, Accordion, Dialog acessíveis. O combobox do vocabulário é o caso claro |
| Testes | **Vitest** + **Playwright** (1 fluxo) | Rápidos; sem rede em nenhum deles |
| Conteúdo | **JSON versionado no repositório** | Caso clínico é conteúdo revisado, não linha de banco. Git dá diff e revisão — que é exatamente o que conteúdo clínico precisa |
| Deploy | **Qualquer host estático** (GitHub Pages, Vercel, Netlify, Cloudflare) | Zero infraestrutura |

**Não entram:** SDK de LLM, backend, banco, ORM, autenticação, gerenciador de estado global,
tRPC/GraphQL, Docker, monorepo, i18n, PWA, telemetria.

Uma nota sobre `output: 'export'`: ele **remove** Route Handlers, middleware e renderização em
servidor. Isso é desejado — é uma trava de arquitetura em nível de build. Se alguém tentar
introduzir uma rota de API, o build quebra. Restrição que se autoaplica vale mais que regra escrita.

## 3. Estrutura de arquivos

```
case-clinical-ai/
├── CLAUDE.md · docs/ · .claude/            # governança e desenvolvimento (não vão para o bundle)
├── content/
│   ├── specialties.json
│   ├── vocabulary/
│   │   ├── diagnoses.json
│   │   └── semantic-qualifiers.json
│   └── cases/
│       ├── cardiologia/cardio-001.case.json
│       ├── cardiologia/cardio-001.key.json
│       └── pneumologia/pneumo-001.case.json …
├── src/
│   ├── app/
│   │   ├── page.tsx                          # home
│   │   ├── especialidades/[specialty]/page.tsx
│   │   ├── casos/[caseId]/page.tsx           # visão geral do caso
│   │   ├── casos/[caseId]/simulacao/page.tsx # runner
│   │   └── casos/[caseId]/resultado/page.tsx # feedback
│   ├── content/
│   │   ├── case.schema.ts · key.schema.ts · vocabulary.schema.ts
│   │   ├── loadCase.ts                       # estático, no build
│   │   └── loadKey.ts                        # dinâmico: import() após a 1ª submissão
│   ├── domain/                               # PURO — sem React, sem I/O
│   │   ├── session.ts
│   │   ├── stages.ts
│   │   └── process-signals.ts                # revisão de hipótese, momento do compromisso
│   ├── evaluation/                           # PURO — o motor
│   │   ├── evaluate.ts                       # (key, session) → Result
│   │   ├── points/                           # uma regra por tipo de ponto de decisão
│   │   │   ├── problemRepresentation.ts · hypothesisList.ts · probabilityShift.ts
│   │   │   └── evidenceSelection.ts · testSelection.ts · finalHypothesis.ts
│   │   └── feedback/compose.ts               # monta os fragmentos na ordem pedagógica
│   ├── features/
│   │   ├── case-runner/ · decision-points/ · results/ · catalog/
│   ├── ui/                                   # componentes de apresentação
│   └── config/
└── tests/
    ├── content/       # todo JSON válido e íntegro
    ├── evaluation/    # o motor, exaustivamente
    ├── domain/
    └── e2e/
```

## 4. Regra de dependência

```
app → features → ui
        │
        ├──▶ domain      (puro)
        └──▶ evaluation  (puro)  ──▶ content/schemas
```

- `domain/` e `evaluation/` **não importam React, não fazem I/O, não leem `window`**. São funções
  sobre dados. É o que permite testá-los exaustivamente e o que garante determinismo.
- `content/` só é lido por `loadCase`/`loadKey`. Nenhum componente lê JSON direto.
- `features/` conhece `domain` e `evaluation`; o inverso nunca acontece.
- **Nada importa nada de `.claude/`.** Agentes são infraestrutura de desenvolvimento (briefing §23).

## 5. Carregamento e divisão de código

| Momento | O que carrega |
|---|---|
| Home / catálogo | `specialties.json` + metadados dos casos (id, título, dificuldade, tags) |
| Abrir um caso | `<id>.case.json` via `import()` dinâmico |
| Primeira submissão de ponto de decisão | `<id>.key.json` via `import()` dinâmico |

A chave só chega ao navegador quando é preciso corrigir algo. Isso reduz o *bundle* inicial e evita
spoiler acidental — e **não é segurança**, o que está dito explicitamente em
[ADR-0007](adr/ADR-0007-gabarito-no-cliente.md) e na documentação acadêmica.

## 6. Evolução sem reescrita

| Hoje | Amanhã | O que muda |
|---|---|---|
| `loadCase`/`loadKey` leem JSON local | leem de CMS ou API | só os dois carregadores; o schema Zod continua sendo o contrato |
| Sessão em `sessionStorage` | conta de usuário com histórico | persistência atrás de `domain/session.ts` |
| Chave no cliente | correção no servidor | `evaluate()` é função pura: roda igual no Node. Move-se sem reescrever |
| Sem IA em runtime | (se um dia houver) | entraria **depois** do motor determinístico, como comentário adicional rotulado — nunca como avaliador |

O ponto arquitetural: `evaluate()` ser função pura significa que a decisão "onde a avaliação roda"
permanece reversível para sempre. É a única fronteira que precisa ser protegida com rigor.

## 7. Mudanças desde a V1

| V1 | V2 | Motivo |
|---|---|---|
| Route Handler `/api/evaluate` custodiando a chave da API | **nenhuma rota** — `output: 'export'` | Não há LLM em runtime ([ADR-0006](adr/ADR-0006-aplicacao-estatica-sem-llm.md)); ADR-0001 fica obsoleto |
| `src/ai/` (prompt, cliente, crítico) | removido; a IA vive em `.claude/` e no processo de autoria | [authoring-pipeline.md](authoring-pipeline.md) |
| `src/validation/` (groundedness, language guard em runtime) | vira validação de **conteúdo em CI** | Não há saída de modelo para verificar |
| Deploy exigia função serverless | qualquer host estático | Consequência do acima |
| Rubrica protegida pelo servidor | chave carregada tarde, sem sigilo garantido | ADR-0007 |
| `src/domain/` puro | **mantido**, e acompanhado de `src/evaluation/` puro | O princípio de núcleo puro era bom e ficou mais central |
