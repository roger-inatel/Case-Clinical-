# CLAUDE.md — Case Clinical AI (V2)

> Fonte de verdade para qualquer agente (humano ou IA) que trabalhe neste repositório.
> Se algo aqui conflitar com um documento em `docs/`, **este arquivo vence** — e o documento deve
> ser corrigido.
>
> **Mudança de arquitetura (V2):** não há IA em runtime. O que a V1 decidiu e por quê está em
> [docs/01-discovery/v2-migration-status.md](docs/01-discovery/v2-migration-status.md).

---

## 1. Objetivo

Protótipo educacional **experimental** para estudantes de Medicina praticarem **raciocínio clínico**
sobre **casos fictícios**, com avaliação **determinística** e feedback escrito e revisado por
humanos.

**Frase-âncora:** o sistema não diz qual é o diagnóstico. Ele mostra **o que sustenta e o que
contradiz o raciocínio do estudante**, com base numa chave que um humano escreveu e revisou.

## 2. Escopo (MVP)

Cardiologia e Pneumologia · 8 casos (1 fácil, 2 intermediários, 1 avançado por especialidade) ·
apresentação progressiva · 3–5 **pontos de decisão** por caso · avaliação determinística ·
feedback composto · aplicação estática.

## 3. Fora de escopo (explicitamente)

**Qualquer API de IA em runtime** · backend · banco · Supabase · autenticação · contas · histórico ·
RAG · chatbot · geração automática de casos em produção · imagens médicas reais · prontuário ·
prescrição · nota agregada · ranking · gamificação · pagamento · i18n · PWA · telemetria.

Ideia fora de escopo que aparecer no caminho: registrar como `FUTURE / OUT OF SCOPE` em
`docs/05-roadmap/roadmap.md` e **não implementar**.

## 4. Princípios inegociáveis

1. **Zero dependência de IA em produção.** O app funciona offline, sem chave, para sempre. Se algum
   dia isso for questionado, a decisão está em [ADR-0006](docs/03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md).
2. **Todo conteúdo clínico é revisado por humano.** `reviewStatus: "approved"` é campo de pessoa.
   Nenhum agente escreve esse valor. Nunca.
3. **Determinismo.** `evaluate()` é função pura: sem rede, sem relógio, sem aleatoriedade.
4. **"Não sei" é resposta válida e desejável.** Existe um caso inteiro dedicado a ensinar isso.
5. **O sistema admite o que não sabe.** Hipótese fora da chave recebe "não analisada por este caso",
   nunca "errada".
6. **Nunca afirmar diagnóstico nem conduta.** A linguagem é de compatibilidade com os dados.
7. **Separação dado × comentário.** Texto do caso e comentário do autor nunca compartilham o mesmo
   tratamento visual.
8. **Simplicidade vence sofisticação.** Nada entra sem justificativa em ADR.
9. **Nenhuma fonte inventada.** Sem exceção, em nenhum artefato.

## 5. Arquitetura (resumo — detalhe em `docs/03-architecture/`)

```
Usuário → navegador → JSON local → lógica local → resultado

src/
├── app/          rotas (Next.js, output: 'export' — sem API, sem middleware)
├── content/      schemas Zod + carregadores
├── domain/       PURO — sessão, etapas, sinais de processo
├── evaluation/   PURO — o motor determinístico e a composição de feedback
├── features/     composição de UI por funcionalidade
└── ui/           componentes de apresentação

content/          casos (.case.json + .key.json) e vocabulário — a fonte de verdade clínica
```

Regra de dependência: `app → features → {domain, evaluation} → schemas`.
`domain/` e `evaluation/` **não importam React, não fazem I/O, não leem `window`**.
Nada em `src/` importa nada de `.claude/`.

**Design system: shadcn/ui** ([ADR-0011](docs/03-architecture/adr/ADR-0011-shadcn-ui-como-design-system.md)).
As primitivas vivem em `src/ui/shadcn/`. Ordem de preferência, sem exceção:
`componente shadcn/ui → variante/token do tema → componente de domínio`. Uma segunda biblioteca de
UI reprova o build.

## 6. Regras para os agentes

Agentes vivem em `.claude/` e são **infraestrutura de desenvolvimento** — não fazem parte do produto.

| Agente | Responsabilidade | Escreve em |
|---|---|---|
| `medical-research` | Evidência clínica e pedagógica com fonte | `docs/research/` |
| `educational-design` | Passos críticos, tipos de ponto de decisão, desenho do feedback | `docs/04-ux/`, desenho dos casos |
| `case-authoring` | `.case.json`, `.key.json`, vocabulário | `content/` |
| `medical-red-team` | Tentar quebrar o caso | `docs/06-quality/case-reviews/` |
| `ux-designer` | Fluxo, telas, acessibilidade, microcópia | `docs/04-ux/`, `src/ui/` |
| `architecture-guardian` | Estrutura, dependências, ADRs | `docs/03-architecture/` |
| `quality-engineer` | Testes e validação de conteúdo | `tests/`, `docs/06-quality/` |

Regras: **um agente, um domínio de escrita** · `case-authoring` nunca aprova o próprio caso ·
`medical-red-team` recebe o JSON, não a conversa que o gerou · o red team **acusa, não corrige** ·
nenhum agente altera `src/evaluation/` sem teste.

## 7. Regras de pesquisa

Toda afirmação clínica ou empírica em `docs/` recebe rótulo:

- `[EVIDÊNCIA]` — estudo primário, revisão sistemática ou guideline. **Exige URL.**
- `[BOA PRÁTICA]` — consenso sem medição direta. **Exige URL.**
- `[HIPÓTESE]` — proposta plausível, não testada aqui.
- `[OPINIÃO]` — julgamento de engenharia.

Proibido: citar o que não foi lido · inventar DOI, autor, ano ou magnitude de efeito · promover
`[HIPÓTESE]` a `[EVIDÊNCIA]` sem fonte nova. Nível de leitura declarado em `docs/research/sources.md`.
Hierarquia de fontes em `docs/research/README.md`.

## 8. Regras para decisões arquiteturais

Exige ADR toda mudança que: adicione dependência · altere o schema do caso, da chave ou do
vocabulário · altere as regras do motor de avaliação · mude o que é exibido ao estudante como
avaliação · introduza qualquer chamada de rede.

Formato: Contexto · Opções (com custo real) · Decisão · Consequências · Reversibilidade.
Decisão sem ADR é bug. ADR substituído é **marcado, nunca apagado**.

## 9. Critérios de qualidade

- TypeScript `strict`; sem `any` em `content/`, `domain/` e `evaluation/`.
- Todo caso valida contra o schema **em CI**, não em runtime.
- `domain/` e `evaluation/` com teste unitário determinístico; **exaustão do motor é meta**.
- Nenhum teste faz rede — não porque é regra, mas porque não há o que chamar.
- Cobertura de linhas não é meta. Espaço de sessões varrido é.

## 10. Critérios de segurança e integridade (bloqueiam release)

1. **Nenhuma dependência de SDK de LLM** no `package.json`. Teste de build falha se aparecer.
2. **Nenhum Route Handler, nenhum middleware, nenhuma variável de ambiente secreta.**
3. Nenhum caso com `reviewStatus: "approved"` sem `reviewedBy`, `reviewedAt`, `redTeamPassedAt` e
   `sources`.
4. Nenhum ponto de decisão avalia achado de etapa que o estudante ainda não viu.
5. Aviso de **protótipo educacional experimental** e de **caso fictício** visível na home, na visão
   geral do caso e no rodapé do resultado.
6. Nenhum texto exibido sugere diagnóstico real, conduta, tratamento ou prescrição.
7. Nenhum dado do estudante sai do navegador.

## 11. Definition of Done (por incremento)

- [ ] Comportamento descrito em `docs/` **antes** do código.
- [ ] Testes determinísticos passando, incluindo os casos-limite relevantes.
- [ ] Nenhum critério da seção 10 violado.
- [ ] Conteúdo novo: red team executado e revisão humana registrada.
- [ ] Novas afirmações clínicas rotuladas e com fonte.
- [ ] ADR escrito se a seção 8 se aplica.
- [ ] Pendência vira item em `docs/01-discovery/open-questions.md`, não TODO silencioso.

## 12. Estado atual

**Fase: Discovery V2 concluído — aguardando decisões humanas.**
Não há código de produto. Não implementar antes de responder D2 e D7–D12 em
`docs/01-discovery/open-questions.md`.

Recomendado antes de continuar: `git init` e commit do Discovery V1+V2 — a rastreabilidade das
decisões é parte do valor acadêmico.
