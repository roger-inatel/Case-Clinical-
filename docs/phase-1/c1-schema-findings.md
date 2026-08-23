# Insuficiências do Schema Encontradas ao Autorar o C1

Registro exigido pela Fase 1: **nenhuma alteração silenciosa no modelo de dados**. Tudo que foi
estendido está aqui, com justificativa, e está declarado no campo `schemaExtensions` do próprio
`.key.json`.

Referência: [data-model.md](../03-architecture/data-model.md) (schema V2 original).

---

## Extensões aplicadas no piloto

### EXT-1 — Célula da `evidenceMatrix` precisa ser objeto, não string · **bloqueadora**

**Schema V2:** `"f1": { "dx.sca": "supports" }`
**Aplicado:** `"f1": { "dx.sca": { "rel": "supports", "why": "..." } }`

**Por quê:** [evaluation-engine §5](../03-architecture/evaluation-engine.md) especifica feedback
composto por fragmentos, **um por achado**. Com a célula como string, não existe onde escrever o
fragmento — o motor teria a relação, mas nada para dizer ao estudante. As duas partes do Discovery
V2 eram incompatíveis entre si, e isso só apareceu ao tentar autorar.

**Custo:** é a extensão que domina o esforço de autoria. 38 células × uma frase justificada cada.

**Recomendação:** adotar. Sem ela, o feedback volta a ser genérico por veredito — exatamente o que
o risco N3 tenta evitar.

---

### EXT-2 — `reviewStatus` precisa do valor `pending_human_review` · **necessária**

**Schema V2:** `draft | reviewed | approved`
**Aplicado:** `pending_human_review`

**Por quê:** `draft` significa "ainda sendo escrito"; `reviewed` significa "um humano revisou". Não
havia valor para "autoria concluída, red team executado, **aguardando** revisor humano" — que é o
estado real de todo caso enquanto a decisão D2 não for resolvida, e provavelmente o estado da
maioria dos casos durante boa parte do projeto.

**Recomendação:** adotar. Estados finais:
`draft → pending_human_review → reviewed → approved`, com `approved` exigindo `reviewedBy`,
`reviewedAt` e `redTeamPassedAt`.

---

### EXT-3 — `probability-shift` precisa de `feedbackByDirection` · **recomendada**

**Schema V2:** um único campo `rationale`.
**Aplicado:** `rationale` + `feedbackByDirection` com cinco entradas
(`diminui_muito`, `diminui`, `neutro`, `aumenta`, `aumenta_muito`).

**Por quê:** o estudante que responde "diminui muito" cometeu **o erro central do caso**; o que
responde "aumenta" está defensável. Entregar o mesmo texto aos dois desperdiça o momento pedagógico
mais valioso do ponto de decisão. Feedback elaborado que não distingue a resposta dada é feedback
genérico com outro nome.

**Custo:** cinco fragmentos por ponto de decisão desse tipo, em vez de um.

---

### EXT-4 — `problem-representation` precisa de `options` · **necessária, com questão em aberto**

**Aplicado:** lista de 14 qualificadores inline em `decisionPoints.dp1.options`.

**Por quê:** o schema V2 mencionava "chips de qualificadores semânticos" sem definir de onde vêm.

**Questão em aberto — decisão necessária:** os qualificadores devem ser (a) um vocabulário global
compartilhado, com cada caso selecionando um subconjunto, ou (b) definidos por caso?

- **(a)** dá consistência entre casos e permite comparar a evolução do estudante; exige um artefato
  a mais e força relevância artificial (nem todo qualificador se aplica a todo caso).
- **(b)** é mais simples e mais relevante por caso; permite inconsistência de nomenclatura entre casos.

**Recomendação:** (a) — lista global de ~20 qualificadores, com `dp.optionIds` selecionando o
subconjunto. Aplicado (b) no piloto apenas para não bloquear a autoria.

---

### EXT-7 — `commonMistakes.triggeredWhen` precisa de mais que `selectedConcept` · **recomendada**

**Schema V2:** `{ "selectedConcept": "dx.ansiedade" }`
**Aplicado:** também `{ "evidenceMisclassified": { "finding", "concept", "markedAs" } }`

**Por quê:** dois dos três erros típicos deste caso **não** são detectáveis pela hipótese escolhida.
"Interpretar ECG não diagnóstico como exclusão de SCA" e "achar que pulsos simétricos excluem
dissecção" aparecem na **classificação de evidências**, não no diagnóstico final — um estudante pode
acertar a hipótese e ainda assim ter cometido os dois. Sem esta extensão, o sistema perde os erros
de raciocínio de quem acerta a resposta, que são justamente os mais interessantes.

---

## Insuficiências identificadas e **não** resolvidas

### INS-1 — Não há hierarquia entre conceitos · **relevante**

`dx.sca-ssst` é um subtipo de `dx.sca`, e o vocabulário não representa isso (o campo `parentConcept`
foi escrito no recorte de vocabulário, mas **nenhuma regra do motor o usa**).

Consequências concretas que apareceram na autoria:
- Em `dp2` (antes do ECG), "SCA" é a resposta precisa e "SCA sem supra" é **prematura**.
- Em `dp5` (depois do ECG), "SCA sem supra" é a resposta precisa e "SCA" é **imprecisa, porém correta**.
- Foi preciso autorar os dois conceitos nas duas chaves, com textos diferentes, para tratar o que é
  conceitualmente uma relação de generalidade.

**Impacto se não resolvido:** duplicação de autoria em qualquer caso onde exista diagnóstico
genérico e subtipo — ou seja, em boa parte da cardiologia e da pneumologia.
**Proposta:** o motor reconhece `parentConcept` e permite ao autor declarar crédito por nível de
precisão em vez de repetir conceitos.

### INS-2 — A negativa clínica precisa virar achado · **observação**

"Nega irradiação para o dorso" só pode ser marcada na seleção de evidências se existir como achado
com `id`. Isso inflou o caso em 2 achados (`f9`, `f10`) que não são achados, e sim **ausências**.

Funciona, mas mistura duas coisas diferentes na mesma lista, e a UI vai precisar tratar disso
(um achado "Nega X" marcado como "contradiz" tem dupla negação embutida — risco de confusão).
**Proposta:** manter como está no MVP; avaliar `category: "negativa"` com renderização própria.

### INS-3 — Um caso não é autocontido · **observação com impacto de processo**

O caso depende de um terceiro artefato (o vocabulário) para ser validado. No piloto isso obrigou a
criar [`vocabulary.excerpt.json`](../../cases/c1/vocabulary.excerpt.json).

**Consequência para o processo:** autorar um caso **também é editar o vocabulário compartilhado**, e
editar o vocabulário afeta todos os casos já aprovados. A partir de C2, adicionar um alias exige
verificar se ele não colide com conceito existente.
**Proposta:** validação de colisão de alias em CI, obrigatória.

### INS-4 — Não há como declarar que um achado *reduz, mas não exclui* · **relevante**

A distinção mais importante deste caso — *reduz ≠ exclui* — está apenas na **prosa** do campo `why`.
O dado estruturado só tem `supports | contradicts | neutral`.

Consequência: o motor não consegue detectar quando o estudante trata um achado que reduz como se
excluísse. Foi preciso contornar via `commonMistakes.triggeredWhen.evidenceMisclassified` com
`markedAs: "excludes"` — mas `"excludes"` **não é um valor que o estudante pode selecionar**, então
esse gatilho, como está, nunca dispara. **É uma inconsistência real no piloto, deixada visível de
propósito.**

**Proposta:** ou (a) `rel` ganha o valor `excludes`, e a UI oferece três forças ao estudante
(sustenta / contradiz / exclui), ou (b) a célula ganha `strength: "forte" | "moderada" | "fraca"` e
o gatilho passa a comparar força. **(b) é mais simples e cobre mais casos.** Decisão necessária
antes de C2.

### INS-5 — O veredito não depende dos achados que o estudante realmente obteve · **grave**

Descoberto ao mapear a jornada com conteúdo real
([c1-student-journey §12](../04-ux/c1-student-journey.md)), não na leitura do JSON.

`dp4` permite selecionar até 3 dos 5 exames — inclusive nenhum dos dois essenciais. Mas os vereditos
de `dp5` são **estáticos por conceito**. Consequência: quem não pediu troponina e responde
"SCA sem supra" recebe `muito_compativel`, com feedback citando *"troponina acima do percentil 99"* —
um achado que essa pessoa **nunca viu**.

Isso inverte a regra temporal do projeto: em vez de avaliar com informação que o estudante não
tinha, o sistema **dá crédito por informação que ele não obteve** — e cita ao estudante um achado
que não está na tela dele.

**É lacuna do modelo de dados, não bug de implementação.** O veredito precisa poder depender do
conjunto de achados revelados.

Opções:
1. Veredito condicionado aos achados revelados (`verdicts[].requiresFindings`).
2. `dp5` exigir os exames essenciais antes de permitir conclusão — resolve, mas anula o valor
   pedagógico de `dp4`.
3. **Veredito adicional do tipo "conclusão não sustentável com os dados que você obteve"** —
   mais educativo e mais coerente com o princípio do projeto de admitir limite de informação.

**Recomendação: (3) combinada com (1).** Decisão necessária **antes de C2**.

---

## Resumo para decisão

| # | Item | Severidade | Recomendação |
|---|---|---|---|
| EXT-1 | Célula da matriz como objeto | bloqueadora | **adotar** |
| EXT-2 | `pending_human_review` | necessária | **adotar** |
| EXT-3 | `feedbackByDirection` | recomendada | adotar |
| EXT-4 | `options` em `problem-representation` | necessária | adotar + decidir global × por caso |
| EXT-7 | `triggeredWhen` estendido | recomendada | adotar |
| INS-1 | Hierarquia de conceitos | relevante | **decidir antes de C2** |
| INS-2 | Negativas como achados | observação | manter, revisar na UI |
| INS-3 | Dependência do vocabulário | observação | validar colisão de alias em CI |
| INS-4 | *Reduz* × *exclui* | relevante | **decidir antes de C2** — há gatilho inerte no piloto |
| **INS-5** | **Veredito ignora quais achados o estudante obteve** | **grave** | **decidir antes de C2** — hoje o sistema credita informação não obtida |

Nenhuma dessas mudanças invalida a arquitetura do Discovery V2. Todas são refinamentos do formato
do dado, e todas apareceram **porque** um caso real foi escrito — o que era exatamente o propósito
da Fase 1.
