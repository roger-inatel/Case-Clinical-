# Roadmap — V2

> Revisão da V1. Mudanças em §Comparação, no fim.

Fases pequenas, cada uma com entregável verificável. Nenhuma começa antes de a anterior passar no
seu critério de saída. **Nenhuma fase depende de chave de API** — nem esta, nem nenhuma futura.

---

## Fase 0 — Decisões humanas *(bloqueante, sem código)*

Responder D1–D8 em [open-questions.md](../01-discovery/open-questions.md), com prioridade absoluta
para **D2 (revisor clínico)**. Rodar `git init` e commitar o Discovery V1+V2 antes de seguir.

**Saída:** decisões registradas; ADRs 0006–0010 movidos de "proposta" para "aceita" ou revisados.

---

## Fase 1 — Um caso completo, ponta a ponta *(o piloto)* · **EM EXECUÇÃO**

> Executada como fase exclusivamente de conteúdo, **sem schemas em código**: os JSON foram
> autorados diretamente contra a especificação de [data-model.md](../03-architecture/data-model.md)
> e validados por script descartável. Resultados em
> [c1-pilot-report.md](../phase-1/c1-pilot-report.md).
> Itens 1 (schemas Zod) e 6 (CI) permanecem pendentes para a fase de implementação.

Não são os schemas isolados. É **um caso atravessando o pipeline inteiro**, incluindo revisão humana:

1. `case.schema.ts`, `key.schema.ts`, `vocabulary.schema.ts` (Zod).
2. Vocabulário inicial com os conceitos de C1 e seus sinônimos.
3. **Caso C1 completo**: `.case.json` + `.key.json`, com pontos de decisão e feedback composto.
4. Red team executado, relatório em `docs/06-quality/case-reviews/C1.md`.
5. Revisão humana concluída → `reviewStatus: approved`.
6. Validação em CI passando.

**Saída:** um caso aprovado e o **custo real de autoria medido em horas**.

**Por que primeiro, e por que só um:** a V2 aposta tudo na autoria. Se um caso levar 20 horas, o
catálogo de 8 não cabe no prazo e o escopo precisa mudar **agora**, não na semana da entrega.
Descobrir isso é o entregável mais valioso desta fase.

---

## Fase 2 — Motor de avaliação *(sem UI)*

`evaluate(key, session) → Result` completo, com os seis tipos de ponto de decisão, a composição de
feedback e o estado `naoPrevisto`. Testado com tabela, propriedades e varredura exaustiva do
espaço de sessões de C1.

**Saída:** motor correto e provado, exercitado por testes — sem uma linha de interface.
**Por que antes da UI:** é a única parte do sistema em que um bug atinge todos os casos ao mesmo
tempo, e é 100% testável sem navegador. Fazer UI primeiro só adianta a parte agradável.

---

## Fase 3 — Fluxo de simulação

Home → especialidade → catálogo → visão geral → runner com etapas, exames sob demanda e os seis
componentes de ponto de decisão (o combobox do vocabulário é o mais delicado). Sessão em
`sessionStorage`. Ainda **sem** tela de resultado elaborada — só o veredito cru.

**Saída:** dá para jogar C1 do início ao fim no navegador.

---

## Fase 4 — Resultado e feedback

Revelação por etapas com interação obrigatória, "o que você fez", contradiz-antes-de-sustenta,
raciocínio lado a lado, perfil de decisão, fechamento com fontes.

**Saída:** a experiência educacional completa, em um caso.
**Marco:** aqui o produto está pronto. O que falta é conteúdo.

---

## Fase 5 — Catálogo *(a fase longa)*

Os 7 casos restantes, cada um pelo pipeline completo: pesquisa → desenho pedagógico → autoria →
red team → correção → CI → revisão humana. Vocabulário cresce junto.

Ordem sugerida: C2 e P2 primeiro (carregam o peso pedagógico e revelam limites do motor), **P4 por
último** (o caso de dados insuficientes exige o formato maduro).

**Saída:** 8 casos aprovados, com relatórios de red team e revisão registrados.
**Risco:** é aqui que o projeto atrasa. Mitigação: cada caso é um incremento entregável; 6 casos
bons valem mais que 8 apressados, e reduzir o catálogo é decisão legítima nesta fase.

---

## Fase 6 — Polimento e entrega

Acessibilidade auditada (teclado, contraste, leitor de tela — foco no combobox), responsividade,
README, texto acadêmico a partir de [academic-frame.md](../00-project/academic-frame.md), teste
exploratório com 2–3 estudantes, deploy estático.

**Saída:** projeto publicado e defensável.

---

## FUTURE / OUT OF SCOPE

Registrado, não implementado: mais especialidades · persistência com contas · comparação de
desempenho entre casos · exportar sessão em PDF · casos com imagem (ECG, radiografia) · modo docente
com turmas · uso somativo com nota (exigiria revisar ADR-0007 **e** ADR-0010) · medição de desfecho
de aprendizagem com desenho experimental (exigiria CEP) · qualquer comentário adicional gerado por
IA em runtime.

---

## Comparação com o roadmap V1

| V1 | V2 | Motivo |
|---|---|---|
| Conteúdo → fluxo → IA → verificação → medição | Piloto ponta a ponta → motor → fluxo → feedback → catálogo | O risco mudou de "conter a IA" para "conseguir autorar" |
| Fase 4 (verificação) era a que definia o projeto | **Fase 1 (piloto)** é a que define | Ela mede o custo real da aposta da V2 |
| Fase 5 media métricas de IA e custo | Fase 5 é produção de conteúdo | Não há IA para medir |
| "App útil sem IA" era a rede de segurança da fase 2 | Não é mais necessário: o app **é** determinístico | Consequência do ADR-0006 |
