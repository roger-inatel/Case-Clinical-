# ADR-0009 — Justificativa por seleção de evidências; texto livre não avaliado

**Status:** proposta · **Data:** 2026-08-23 · **Substitui parcialmente:** ADR-0003

## Contexto

Na V1, o estudante escrevia a justificativa em texto livre e um LLM a analisava: quais evidências
ele citou, quais inventou, quais contradições ignorou. Sem LLM, essa análise é impossível de fazer
de forma exata — e fazer de forma aproximada (palavra-chave, similaridade de string) seria pior que
não fazer: erra, e erra com aparência de análise.

Mas a justificativa é o que separa raciocínio clínico de adivinhação. Abandoná-la reduziria o
sistema a um quiz de diagnóstico.

## Opções

**A. Remover a justificativa.** Simples, e destrói o propósito do produto.

**B. Texto livre com heurística** (palavras-chave, similaridade). Avaliação frágil apresentada como
avaliação. O pior dos mundos.

**C. Seleção estruturada de evidências:** o estudante marca, entre os achados já revelados, os que
sustentam e os que contradizem sua hipótese. Corrigido contra a `evidenceMatrix` do caso.

**D. C + texto livre preservado, mas explicitamente não avaliado.**

## Decisão

**Opção D.**

A parte avaliada é a **seleção de evidências** — exata, sem ambiguidade, e produzindo sinais
pedagógicos que a V1 só conseguia aproximar por LLM:

| Sinal derivado | Significado |
|---|---|
| marcou como "sustenta" um achado que contradiz | inversão de evidência — o erro mais grave |
| não marcou um achado contrário | ponto cego / viés de confirmação |
| não marcou um red flag | omissão de perigo |
| marcou achado neutro como sustentando | superinterpretação |

A parte não avaliada é o **texto livre**, mantido por evidência própria: autoexplicação melhora
desempenho diagnóstico em casos subsequentes, e o benefício vem do ato de escrever, não da correção
([research/assessment-formats.md](../../research/assessment-formats.md) §4). Depois de submeter, o
estudante vê seu texto **lado a lado** com a análise do autor — autoexplicação seguida de feedback,
que é a sequência com suporte empírico.

**Regra de honestidade inegociável:** a UI nunca promete análise do texto. O rótulo é "compare seu
raciocínio com o do autor". Prometer análise e entregar comparação seria enganar o estudante sobre a
natureza da ferramenta — exatamente o tipo de coisa que este projeto existe para não fazer.

## Consequências

- A `evidenceMatrix` (achado × conceito → sustenta/contradiz/neutro) vira artefato obrigatório de
  autoria. É trabalho: precisa ser preenchida para cada hipótese plausível, não só para a esperada.
- Achados precisam ser frases curtas e autocontidas, para serem marcáveis individualmente. Isso
  restringe a redação do caso — e melhora, porque força precisão.
- O texto livre é armazenado apenas em `sessionStorage` e nunca sai do navegador.
- O que sobrevive do ADR-0003: o princípio de que **evidência precisa estar ancorada em um achado
  identificável**. Mudou quem faz a ancoragem — antes, o modelo em runtime; agora, o autor, uma vez,
  com revisão humana.

## Reversibilidade

**Alta.** Se um dia houver avaliação de texto livre, ela entra **somando** à seleção de evidências,
nunca substituindo — a seleção é exata e a análise de texto não é.
