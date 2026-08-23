# ADR-0002 — Sem RAG no MVP; a rubrica do caso é a base de conhecimento

**Status:** proposta · **Data:** 2026-08-23

## Contexto

RAG é a resposta reflexa para "reduzir alucinação". O briefing pede explicitamente que não a
adotemos por parecer sofisticada. A pergunta correta é: **qual conhecimento falta ao modelo no
momento da avaliação?**

Resposta: nenhum que um corpus médico resolveria. O que a avaliação precisa saber é (a) o que o
caso diz — está no prompt; (b) qual o gabarito clínico daquele caso — está na rubrica, escrita por
um humano. Um retriever traria trechos genéricos de literatura sobre, digamos, síndrome coronariana
— informação que o modelo já tem e que não é específica deste paciente fictício.

## Opções

**A. RAG sobre corpus médico** (guidelines, artigos). Custo alto: licenciamento, ingestão,
embeddings, vector store, avaliação de recuperação. Modo de falha novo: recuperar trecho irrelevante
e ancorar erro nele com aparência de fonte. Avaliações sistemáticas recentes são bem mais sóbrias
sobre o ganho do que o senso comum sugere.

**B. Base estática = rubrica por caso.** O gabarito é autoral, revisado, versionado, com fontes
declaradas no próprio JSON. Grounding perfeito para o escopo do caso, nulo fora dele — e o sistema
nunca sai do caso.

**C. RAG só sobre as fontes citadas pelo caso.** Meio-termo interessante: recuperar dos guidelines
que o autor já citou. Ainda exige pipeline; ganho marginal sobre B, já que o autor destilou o
relevante na rubrica.

## Decisão

**Opção B.** RAG fica fora do MVP. A base de conhecimento é `rubric` + `sources` de cada caso.

Isso não é preguiça arquitetural: é reconhecer que **o trabalho de curadoria é o trabalho
acadêmico**. Autorar 8 casos com rubrica fundamentada em guideline é mais defensável, e mais
verificável, do que um retriever cuja qualidade de recuperação teríamos que avaliar separadamente —
com prazo de disciplina.

## Consequências

- O sistema só funciona bem **dentro** dos casos do catálogo. Aceito e explícito no produto.
- Escalar conteúdo é trabalho humano linear. Aceito no MVP (8 casos).
- Cada afirmação clínica da rubrica precisa de fonte (regra de `docs/research/README.md`).
- A porta fica aberta: o schema da resposta já prevê `basedOn`/`sourceRef`, e RAG entraria antes da
  montagem do prompt, sem alterar o schema.

## Reversibilidade

**Alta.** RAG entra como fonte adicional de contexto sem tocar no schema nem na verificação.
Gatilho para reconsiderar: catálogo > ~50 casos, ou necessidade de casos gerados dinamicamente.
