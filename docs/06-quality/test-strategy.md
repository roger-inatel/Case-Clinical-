# Estratégia de Testes — V2

> Revisão da V1. Mudanças em §7.

## Princípio

Todo o sistema é **determinístico e sem rede**. Isso significa que, ao contrário da V1, não existe
mais a categoria "comportamento que não dá para testar". Se algo não pode ser verificado por teste,
é porque foi mal desenhado — não porque é probabilístico.

Consequência: **cobertura exaustiva do motor de avaliação é viável e é meta.** Não "cobertura de
linhas" — cobertura do espaço de sessões relevantes.

## 1. Conteúdo (`tests/content/`) — a primeira linha de defesa

Roda sobre todo `.case.json`, `.key.json` e o vocabulário. Bloqueia *merge*.

**Schema e integridade**
- Zod válido nos três schemas.
- `findingId` únicos no caso; `conceptId` únicos no vocabulário; **`alias` único no vocabulário
  inteiro** (dois conceitos com o mesmo sinônimo tornam o autocomplete ambíguo).
- Toda referência resolve: `revealsFindings`, `aboutFinding`, `evidenceMatrix`, `redFlags.findingIds`,
  `triggeredWhen.selectedConcept`, `differentialsToConsider.conceptId`.
- Todo `decisionPoint` citado por uma etapa tem chave em `decisionKeys`, e vice-versa (sem órfãos
  nos dois sentidos).

**Regra temporal — a mais importante desta seção**
- Nenhum ponto de decisão referencia achado de etapa **posterior** à sua.
- Nenhuma chave avalia conceito com base em achado que o estudante ainda não viu.

Violar isso significa avaliar alguém por informação que não tinha. É o defeito mais fácil de
introduzir editando um caso e o mais difícil de perceber lendo.

**Completude pedagógica**
- ≥ 1 `isDistractor`; ≥ 1 red flag; ≥ 3 conceitos em `hypothesis-list`; ≥ 1 `cantMiss`.
- Todo conceito `tier: "esperada"` tem `feedback` não vazio; nenhum campo de feedback vazio.
- Todo caso tem ≥ 3 pontos de decisão, incluindo um `hypothesis-list` inicial e um `final-hypothesis`.
- `reviewStatus: "approved"` exige `reviewedBy`, `reviewedAt`, `redTeamPassedAt` e `sources` não vazio.
- Casos deliberadamente inválidos em `tests/content/invalid/` **precisam falhar** — teste do teste.

## 2. Motor de avaliação (`tests/evaluation/`) — o núcleo

Função pura sobre JSON. Três níveis:

**Tabular** — matriz sessão × chave → resultado esperado, por tipo de ponto de decisão. Inclui:
hipótese esperada · `cantMiss` omitido · conceito implausível · conceito fora da chave
(`naoPrevisto`) · nenhuma seleção · seleção máxima · evidência invertida (marcou como sustentando
algo que contradiz) · red flag não marcado.

**Propriedades** (verdadeiras para todo caso e toda sessão)
- Nenhuma sessão produz `muito_compativel` se um red flag `critical` foi ignorado.
- Todo resultado termina em veredito **ou** `naoPrevisto`. Nunca em vazio.
- O feedback composto nunca contém fragmento de conceito que o estudante não escolheu.
- Nenhum fragmento referencia achado de etapa não revelada.
- `evaluate` é idempotente e livre de efeito: duas chamadas com a mesma entrada produzem saídas
  estruturalmente idênticas.
- O perfil de decisão nunca reporta denominador zero.

**Exaustão** — o espaço de sessões relevantes por caso é pequeno (poucos pontos de decisão, poucas
opções). Varredura completa por caso, verificando que nenhuma combinação quebra ou produz texto
incoerente.

## 3. Domínio (`tests/domain/`)

Funções puras: revelação de etapas · exames pedidos × disponíveis · sinais de processo (revisou a
hipótese? em que ponto se comprometeu? manteve a hipótese diante de dado contrário?) ·
serialização de sessão · trava de não edição após submissão.

## 4. Interface (`tests/features/`)

Componentes com lógica real, não snapshots:
- **Combobox do vocabulário**: busca por rótulo e por sinônimo, acentuação, caixa, limite de
  seleções, teclado completo, termo não encontrado → caminho `naoPrevisto`.
- Revelação progressiva de etapas e de exames.
- Bloqueio de edição de ponto de decisão já respondido.
- Feedback revelado passo a passo, com a interação obrigatória entre seções.

Sem testes de snapshot: quebram por espaçamento e não protegem nada que importe.

## 5. Build e segurança (`tests/build/`)

- **Nenhuma dependência de SDK de LLM** no `package.json` — falha o build se aparecer.
- `output: 'export'` configurado; **nenhum Route Handler, nenhum middleware** no projeto.
- Nenhuma variável de ambiente com segredo é referenciada no código.
- Nenhuma chamada de rede em runtime além do carregamento de assets estáticos próprios.
- Nada de `content/**/*.key.json` no *bundle* inicial (verificação sobre a saída do build).

Esta seção é curta porque a V2 eliminou quase toda a superfície de risco da V1. O que sobrou é
garantir que ela não volte por descuido.

## 6. E2E (`tests/e2e/`) — um fluxo

Playwright: home → especialidade → caso → representação do problema → hipóteses iniciais →
exames → hipótese final com seleção de evidências → resultado revelado → fechamento.
Sem mock: **a aplicação inteira roda de verdade**, porque não há nada externo para simular.

## 7. Mudanças desde a V1

| V1 | V2 | Motivo |
|---|---|---|
| "Nenhum teste de CI chama a API do LLM" | Regra desnecessária: **não há API** | ADR-0006 |
| `tests/validation/` (groundedness, language guard, coverage) | `tests/evaluation/` (motor) + `tests/content/` (integridade) | O objeto de verificação mudou de "saída do modelo" para "conteúdo autoral" |
| Fixtures gravadas de respostas de LLM | Não existem mais | Nada a gravar |
| Testes de prompt injection e limites de entrada | Removidos | Sem prompt, sem superfície |
| E2E com rota de IA mockada | E2E sem mock nenhum | Não há dependência externa |
| Cobertura não é meta | **Exaustão do motor é meta** | Determinismo tornou viável o que era impossível |
| Teste de "não vazamento da rubrica" | Substituído por "key fora do bundle inicial" | Sigilo virou anti-spoiler ([ADR-0007](../03-architecture/adr/ADR-0007-gabarito-no-cliente.md)) |
