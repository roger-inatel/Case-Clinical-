# Arquitetura de Agentes — V2

> Revisão da V1. Mudanças em §5.

## 1. Agora a distinção é simples

A V1 precisava separar agentes de desenvolvimento de agentes de runtime. **A V2 elimina a segunda
categoria inteira.** Todo agente é ferramenta de desenvolvimento, vive em `.claude/`, e não é
enviado ao usuário final (briefing §23).

Consequência boa e pouco óbvia: **o custo do erro de um agente despencou**. Um agente que erra
agora produz um diff que um humano revisa. Na V1, um agente equivalente produzia texto clínico
direto na tela do estudante. Isso permite usar os agentes com muito mais liberdade — e é uma razão
adicional pela qual a decisão de tirar o LLM do runtime foi acertada.

## 2. Os sete agentes

| Agente | Responsabilidade | Escreve em | Status V2 |
|---|---|---|---|
| [`medical-research`](../../.claude/agents/medical-research.md) | Evidência clínica e pedagógica com fonte | `docs/research/` | `KEPT` |
| [`educational-design`](../../.claude/agents/educational-design.md) | Onde estão os passos críticos; tipo de cada ponto de decisão; desenho do feedback | `docs/04-ux/`, seção de desenho dos casos | **`NEW`** |
| [`case-authoring`](../../.claude/agents/case-authoring.md) | Escreve `.case.json` e `.key.json`; mantém o vocabulário | `content/` | `MODIFIED` (era `case-designer`) |
| [`medical-red-team`](../../.claude/agents/medical-red-team.md) | Tenta quebrar o caso: incoerência, diferencial faltando, valores suspeitos, ambiguidade | `docs/06-quality/case-reviews/` | `MODIFIED` (era `ai-safety-critic`) |
| [`ux-designer`](../../.claude/agents/ux-designer.md) | Fluxo, telas, hierarquia, acessibilidade, microcópia | `docs/04-ux/`, `src/ui/` | `MODIFIED` |
| [`architecture-guardian`](../../.claude/agents/architecture-guardian.md) | Estrutura, dependências, ADRs | `docs/03-architecture/` | `MODIFIED` |
| [`quality-engineer`](../../.claude/agents/quality-engineer.md) | Testes determinísticos e validação de conteúdo | `tests/`, `docs/06-quality/` | `MODIFIED` |

Removido: `clinical-evaluator-designer` — não existe prompt de runtime para projetar. A taxonomia de
compatibilidade migrou para `case-authoring`; a disciplina de citar evidência ancorada migrou para
a `evidenceMatrix`; o desenho do feedback migrou para `educational-design`.

## 3. Por que `educational-design` passou a existir

Na V1 ele era desnecessário: o LLM decidia, em runtime, o que dizer ao estudante. Na V2 alguém
precisa decidir, **por caso e antes**, três coisas que definem se o caso ensina ou só pergunta:

1. **Quais são os 3–5 passos críticos** deste caso (as *key features*). Escolher errado produz um
   caso que testa memória em vez de raciocínio.
2. **Qual tipo de ponto de decisão** cabe em cada passo — representação do problema, deslocamento
   de probabilidade, seleção de evidências, escolha de exames.
3. **Como o feedback é revelado** para que o estudante realmente o processe, dado que a evidência
   mostra que estudantes ignoram feedback elaborado entregue como muro de texto.

Isso é competência pedagógica, não clínica nem de interface. Diluir entre `case-authoring` e
`ux-designer` foi o que a V1 fez — e funcionava porque não era necessário. Agora é.

## 4. Regras de operação

1. **Um agente, um domínio de escrita.** A tabela acima é normativa.
2. **`case-authoring` nunca aprova o próprio caso.** `reviewStatus: "approved"` é campo de humano.
3. **`medical-red-team` recebe o JSON, não a conversa que o produziu.** Contexto do autor
   contamina a crítica.
4. **`medical-red-team` não corrige.** Ele acusa; a correção volta para `case-authoring`.
5. **Nenhum agente inventa fonte.** Regra da skill [`medical-sourcing`](../../.claude/skills/medical-sourcing/SKILL.md).
6. **Nenhum agente toca `src/evaluation/` sem teste.** O motor é o único ponto onde um bug afeta
   todos os casos ao mesmo tempo.

## 5. Mudanças desde a V1

| V1 | V2 | Motivo |
|---|---|---|
| Duas famílias (build-time × runtime) | Uma só | Sem IA em runtime |
| 7 agentes, com `clinical-evaluator-designer` | 7 agentes, com `educational-design` no lugar | Não há prompt para projetar; há desenho pedagógico para fazer |
| `ai-safety-critic` criticava **respostas da IA** | `medical-red-team` critica **casos** | O objeto de risco mudou |
| `case-designer` escrevia caso + rubrica em prosa | `case-authoring` escreve caso + chave estruturada + vocabulário | O motor precisa de dado operável |
| Crítico condicional por gatilho em runtime | Red team obrigatório para **todo** caso | Sem verificação em runtime, a crítica não pode ser amostral |
| Skills propostas: `case-authoring`, `ai-eval-run`, `case-lint` | `ai-eval-run` **cancelada**; `case-lint` promovida a prioritária | Não há suíte de IA para rodar; há muito JSON para validar |
