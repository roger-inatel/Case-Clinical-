# Simplificações S1–S3 — Registro, Não Implementação

**Status: nenhuma implementada.** Este documento registra o que cada uma faria, que problema
resolve, risco, benefício e se vale testar. **Não é um plano de execução.**

> ⚠️ **A projeção conjunta de 7–9% de economia é `NOT MEASURED`.** Ela é uma conta de guardanapo
> feita sobre contagens de n-gramas, não um resultado de experimento. Não deve ser citada como
> economia comprovada em nenhum documento, nem no texto acadêmico.

---

## S1 — Fragmentos de explicação compartilhados por id

### O que faria
Extrair núcleos de explicação recorrentes para um arquivo de *snippets*, referenciados por id no
campo `why`. Exemplo:

```jsonc
// snippets.json
{ "sn.troponina-lesao": "Elevação de troponina indica lesão miocárdica." }

// key.json
"f17": { "dx.sca": { "rel": "supports", "why": "{{sn.troponina-lesao}} No contexto clínico deste caso, sustenta origem isquêmica." } }
```

### Problema que resolve
Medição objetiva sobre o C1: **seis núcleos de explicação aparecem em 16 fragmentos**.

| Núcleo | Fragmentos |
|---|---|
| "elevação de troponina indica lesão miocárdica" | 3 |
| "não produz elevação de troponina" | 3 |
| "reduz a probabilidade de dissecção" | 3 |
| "é fator de risco cardiovascular" | 3 |
| "é pouco compatível com dor de parede torácica" | 2 |
| "não é evidência sobre o episódio atual" | 2 |

O ganho principal **não é tamanho** — é **consistência**: hoje, corrigir a explicação sobre troponina
exige encontrar e editar três textos independentes. Um erro corrigido em dois lugares e esquecido no
terceiro é o modo de falha típico.

### Risco
- Texto compartilhado tende a virar genérico, e feedback genérico é o risco N3 do projeto.
- Interpolação adiciona um passo entre o dado e a tela — mais uma coisa para testar.
- Um snippet reutilizado entre **casos diferentes** pode ficar clinicamente impreciso em um deles.

### Benefício
Consistência de correção; economia de tamanho `NOT MEASURED` (limite superior grosseiro: ~3%).

### Vale testar depois?
**Sim, mas não agora e não por economia.** Vale quando houver 3+ casos e o mesmo conceito aparecer
em vários — aí o problema de consistência é real. Testar em C3, medindo edições necessárias para
corrigir uma explicação em todos os casos, com e sem snippets.

---

## S2 — Agrupar achados equivalentes

### O que faria
Permitir que o autor declare um grupo de achados com a mesma relação e uma justificativa única.
No C1, `f6` (hipertensão), `f7` (ex-tabagismo) e `f8` (história familiar) geram três células
`dx.sca: supports` com justificativas quase idênticas.

```jsonc
"findingGroups": [
  { "id": "g.fatores-risco", "findingIds": ["f6","f7","f8"],
    "label": "fatores de risco cardiovascular" }
]
```

### Problema que resolve
Repetição de autoria em achados que o raciocínio trata como um bloco. Economia medida neste caso:
**3 células → 1**, cerca de 40 palavras.

### Risco
**Sério, e é o motivo de não implementar por reflexo.** A seleção de evidências perde granularidade:
hoje o sistema sabe se o estudante reconheceu história familiar mas ignorou o tabagismo. Agrupado,
ele só sabe "reconheceu fatores de risco". Para um caso cujo objetivo é ensinar a enumerar fatores
de risco, o agrupamento destrói justamente o que se quer medir.

### Benefício
Reduz autoria repetitiva em casos com muitos fatores de risco homogêneos.

### Vale testar depois?
**Talvez — e por caso, não globalmente.** A decisão de agrupar é pedagógica: só faz sentido quando
o objetivo de aprendizagem trata o bloco como unidade. Não deve ser uma otimização automática do
motor. Registrar como recurso opcional do autor, se algum caso futuro pedir.

---

## S3 — Herança por `parentConcept`

### O que faria
`dx.sca-ssst` declara `parentConcept: "dx.sca"`, e o feedback do subtipo herda o do genérico,
declarando apenas a diferença. O motor resolveria a cadeia ao compor o feedback.

### Problema que resolve
A insuficiência **INS-1** ([c1-schema-findings.md](c1-schema-findings.md)), que apareceu de forma
concreta na autoria:

- em `dp2` (antes do ECG), `dx.sca` é a resposta precisa e `dx.sca-ssst` é **prematura**;
- em `dp5` (depois do ECG), `dx.sca-ssst` é a precisa e `dx.sca` é **imprecisa, porém correta**.

Foi preciso autorar os dois conceitos nas duas chaves, com textos diferentes, para expressar o que é
conceitualmente uma relação de generalidade. Economia neste caso: cerca de 60 palavras — e o número
**cresce** com o número de subtipos.

### Risco
- Feedback herdado pode ficar incoerente quando o subtipo muda o sentido em vez de refiná-lo.
- Aumenta a complexidade do motor: composição passa a ter resolução de cadeia, com ciclo possível.
- Dificulta ler a chave: o autor não vê mais o texto final num só lugar.

### Benefício
Elimina duplicação real e — mais importante — permite ao motor **creditar precisão diagnóstica**
("correto, mas dá para ser mais específico") em vez de tratar genérico e subtipo como conceitos sem
relação. Isso é conteúdo pedagógico que hoje só existe porque o autor escreveu à mão.

### Vale testar depois?
**Esta é a que mais merece.** Diferente de S1 e S2, ela não é uma otimização de tamanho: resolve uma
limitação de **expressividade** do modelo. Cardiologia e Pneumologia são cheias de pares
genérico/subtipo (SCA → com/sem supra; pneumonia → comunitária/aspirativa; DPOC → exacerbada).

**Recomendação:** decidir sobre INS-1 antes de C2. Se a decisão for adotar herança, ela muda o
schema — e mudar schema depois de 8 casos autorados é caro.

---

## Resumo

| # | Resolve | Economia medida | Risco | Testar? |
|---|---|---|---|---|
| S1 | Inconsistência ao corrigir explicação repetida | `NOT MEASURED` (~3% teto) | feedback genérico | sim, a partir de 3 casos, **por consistência** |
| S2 | Autoria repetitiva em achados homogêneos | 3 células, ~40 palavras | perde granularidade da seleção de evidências | talvez, e por decisão do autor |
| S3 | **Expressividade**: relação genérico ↔ subtipo | ~60 palavras, cresce | motor mais complexo | **sim, decidir antes de C2** |

Nenhuma das três é motivo para reduzir o C1. Nenhuma foi implementada.
