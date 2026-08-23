# ADR-0010 — Perfil de decisão por caso; sem nota agregada

**Status:** proposta · **Data:** 2026-08-23

## Contexto

O briefing V2 menciona pontuação (§14). Com correção determinística, calcular um número é trivial —
e é justamente por ser trivial que precisa de uma decisão explícita sobre **se** e **como**.

Dois fatos delimitam a resposta:

1. A literatura de *key features* reporta confiabilidade aceitável (alfa 0,7–0,9) em exames de
   **25–40 casos**. Temos **8**. Um número derivado de 8 casos não sustenta inferência sobre a
   competência de ninguém.
2. Número exibido vira meta. O estudante passa a otimizar o número, e o número não é o objetivo.

## Opções

**A. Nota global (0–100) com histórico e comparação.** Familiar, motivador — e não sustentável
psicometricamente aqui. Além disso, exigiria persistência, que está fora de escopo.

**B. Nenhuma medida.** Perde-se o feedback quantitativo específico que é útil: "você identificou 3
dos 4 achados-chave" é informação, não nota.

**C. Perfil por caso, em quatro dimensões, com contagens explícitas e sem agregação.**

## Decisão

**Opção C.** Ao final de cada caso:

| Dimensão | Medida |
|---|---|
| Amplitude do diferencial | hipóteses relevantes levantadas / esperadas |
| Ancoragem em evidência | achados corretamente classificados / relevantes |
| Reconhecimento de perigo | red flags e `cantMiss` identificados |
| Flexibilidade | revisou a hipótese diante de dado que a contradizia? |

Contagem transparente ("3 de 4"), nunca percentual único, nunca soma entre dimensões, nunca placar
entre casos, nunca comparação entre estudantes.

A diferença entre "3 de 4 achados-chave" e "75%" não é estética. A primeira diz **o que fazer**; a
segunda só diz onde você está numa régua que não existe.

## Consequências

- O sistema é declaradamente **formativo**. Isso vai para a UI, para o README e para o texto
  acadêmico, com a justificativa quantitativa (8 casos × 25–40 exigidos).
- Nada de ranking, medalha, streak ou progresso percentual — coerente com "sem gamificação"
  (briefing §27) e agora com uma razão metodológica, não só estética.
- Se o projeto crescer para 25+ casos e alguém quiser usá-lo com peso avaliativo, este ADR e o
  ADR-0007 precisam ser revisados **juntos**.
- Fica mais fácil defender o trabalho: não estamos alegando medir competência clínica.

## Reversibilidade

**Alta** tecnicamente (o motor já produz as contagens), **baixa** metodologicamente — introduzir nota
exigiria validação psicométrica que está fora do escopo de um protótipo.
