> ## ⚠️ MODIFICADO — as camadas migraram para build-time
> Não há resposta de modelo para verificar em runtime. As camadas viraram: **validação de conteúdo
> em CI** ([test-strategy.md](../../06-quality/test-strategy.md)) + **red team de casos**
> ([authoring-pipeline.md](../authoring-pipeline.md)). O crítico condicional por gatilho foi
> substituído por red team obrigatório em **todo** caso — sem verificação em runtime, a crítica não
> pode ser amostral. A análise sobre limites de auto-crítica e multi-agente continua válida e
> aplica-se ao pipeline de autoria.

# ADR-0004 — Verificação em camadas: código primeiro, crítico LLM sob gatilho

**Status:** proposta · **Data:** 2026-08-23 · **Depende de:** decisão D6

## Contexto

O briefing pede um agente de segurança que atue como red team das respostas da IA, e pede
explicitamente que pesquisemos **quando** múltiplos agentes melhoram confiabilidade e quando apenas
somam custo.

A pesquisa (`docs/research/llm-reliability-in-medicine.md` §§3–4) indica:

- auto-crítica **sem informação nova** não melhora de forma confiável e pode degradar;
- debate multi-agente tem ganho real em alguns cenários, mas com consenso sicofântico, viés de juiz
  e custo ~N×;
- feedback **externo e verificável** é a condição em que a correção funciona.

A pergunta decisiva passa a ser: *que informação o crítico teria que o primeiro modelo não tinha?*
Se a resposta for "nenhuma", ele é caro e pouco útil. Se for "o JSON do caso", então **isso é
código**, não agente.

## Opções

**A. Sem verificação.** Fora — viola o princípio 1 do projeto.

**B. Crítico LLM sempre.** ~2× custo e latência em toda avaliação, ganho incerto, e ainda sujeito a
concordar com o primeiro modelo.

**C. Só verificação determinística.** Pega evidência inventada, linguagem indevida e omissão de red
flag da rubrica. Não pega erro de *julgamento clínico* dentro do que foi corretamente citado.

**D. Camadas: determinístico sempre; crítico LLM sob gatilho objetivo.**

## Decisão

**Opção D.**

Camadas determinísticas (sempre): forma (Zod) → groundedness → autocitação → linguagem →
cobertura de red flags → coerência veredito×evidência.

Crítico LLM apenas quando dispara um gatilho: conclusão forte com confiança alta; algum item
removido pelo groundedness; hipótese do estudante coincide com diferencial `cantMiss` classificado
como improvável; `contradictingEvidence` vazio.

O crítico tem escopo estreito e saída estruturada (afirmações sem suporte, `cantMiss` omitidos,
força de conclusão incompatível). **Ele não reescreve a resposta** — produz achados que o código usa
para rebaixar confiança, remover item ou bloquear. Autor e revisor permanecem separados.

## Consequências

- Custo médio ~1,25× em vez de 2× `[HIPÓTESE]` — a taxa real de gatilho precisa ser medida.
- Ganhamos um **experimento**: rodar a suíte com e sem crítico, medindo quantos achados ele produz
  que as camadas determinísticas não produziram. Resultado publicável em qualquer direção — se o
  crítico não agregar, essa é uma contribuição honesta e útil.
- Se o crítico for removido depois, nada além de `src/ai/critic.ts` e um gatilho de configuração sai.
- Latência sobe apenas nas avaliações que disparam gatilho.

## Reversibilidade

**Alta.** Ligado/desligado por flag em `src/config/ai.ts`. As camadas determinísticas continuam.
