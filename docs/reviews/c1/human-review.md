# Revisão Humana — Caso C1 (`cardio-001`)

# STATUS: **PENDING**

> **Nenhuma revisão humana foi realizada.** Este documento é a *solicitação* de revisão, não o
> registro de uma revisão feita.
>
> `authoring.reviewStatus` do caso está em **`pending_human_review`** e **não pode** passar para
> `approved` até que um médico ou docente identificado preencha e assine as seções 2 a 5 abaixo.
>
> Não existe revisor designado. A decisão **D2** ([open-questions.md](../../01-discovery/open-questions.md))
> segue em aberto e é, hoje, o bloqueio mais importante do projeto.

| Campo | Valor |
|---|---|
| Caso | `cardio-001` — Desconforto torácico agudo em homem de 54 anos |
| Artefatos | [`cardio-001.case.json`](../../../cases/c1/cardio-001.case.json) · [`cardio-001.key.json`](../../../cases/c1/cardio-001.key.json) · [`vocabulary.excerpt.json`](../../../cases/c1/vocabulary.excerpt.json) |
| Autoria | autor do projeto, assistida por IA (`aiAssisted: true`) |
| Red team | [red-team-report.md](red-team-report.md) |
| Revisor | **não designado** |
| Data da revisão | — |

---

## 1. Itens bloqueadores conhecidos *(preenchidos pelo autor, antes da revisão)*

Estes são problemas que o autor **sabe** que existem e que a revisão precisa resolver. Registrá-los
aqui é preferível a deixá-los para o revisor descobrir.

| # | Item | Por que bloqueia |
|---|---|---|
| **B1** | **Nenhuma fonte foi lida na íntegra.** Todas as cinco fontes do caso estão marcadas `readingLevel: "search-summary-only"` | Toda afirmação clínica do caso deriva de resumo de busca. Sem leitura primária, o conteúdo não está verificado |
| **B2** | A afirmação "cerca de 8% dos pacientes com infarto apresentam ECG normal" (usada no feedback de `f16`) vem de revisão lida apenas em resumo, e há divergência entre fontes (~8% vs ~10%) | É a afirmação que sustenta o eixo pedagógico do caso. Se o número estiver errado, o feedback ensina errado |
| **B3** | A série de 775 pacientes citada em [research-notes §3](../../research/c1/research-notes.md) vem de fonte secundária de 2005 e **não foi rastreada até o estudo original** | Citação de segunda mão viola as regras de sourcing do projeto |
| **B4** | A diretriz SBC 2021 pode ter sido atualizada. Não verificamos se é a versão vigente | O caso se apresenta como alinhado à prática brasileira atual |
| **B5** | A troponina é descrita qualitativamente ("acima do percentil 99"), sem valor numérico | Decisão deliberada (valores dependem de ensaio), mas precisa de aval clínico sobre se é didaticamente adequado |

## 1b. As 11 questões do red team — **prioridade máxima**

O [red team](red-team-report.md) escalou onze questões que não tem autoridade para julgar. **Elas
bloqueiam seis defeitos reais que permanecem no caso** e são o item mais valioso desta revisão.

| # | Questão | Desbloqueia |
|---|---|---|
| **H1** | Troponina acima do percentil 99 em amostra única, ~2h de sintomas, ECG normal e sinais vitais preservados — apresentação plausível de SCASSST? | R16, O6 |
| **H2** | `muito_compativel` é defensável **sem curva de troponina**, já que a própria chave diz que a caracterização definitiva depende dela? | Veredito central de dp5 |
| **H3** | Pericardite/miopericardite e Takotsubo devem ser diferenciais obrigatórios? Algum é `cantMiss`? | **R4** — 5 hipóteses fora do vocabulário |
| **H4** | D-dímero e angiotomografia merecem `desnecessario`? A justificativa de cascata está correta? | B2, R18 |
| **H5** | "Angiotomografia de tórax" pode responder por dissecção **e** por TEP com um protocolo? | **R13** |
| **H6** | A ausência de supra em ECG único **afasta** IAMCSST ou apenas reduz? E ECG não diagnóstico **sustenta** SCASSST ou é neutro? | **B3, R23** — as duas afirmações mais centrais do caso |
| **H7** | "Angina instável" pode ser alias de `dx.sca-ssst` com troponina positiva? Qual taxonomia adotar? | **B4** — propaga para todo o catálogo |
| **H8** | Os três números removidos estão corretos nas fontes? (ECG normal em IAM; déficit de pulso no IRAD; RX normal no IRAD) | **R20** — se confirmados, voltam |
| **H9** | As cinco URLs existem, resolvem e sustentam o que `usedFor` declara? | Requisito de CI para `approved` |
| **H10** | "Transtorno de pânico associa-se a maior prevalência de DAC" sustenta o argumento de dp3 na força com que é usado? | Pilar do melhor ponto de decisão do caso |
| **H11** | A discriminação SCASSST × miocardite é possível com os dados oferecidos? Se não, o veredito parcial é justo? | **R17** |

## 1c. Alterações de conteúdo clínico feitas na correção

Dez alterações mexeram em substância clínica ([changelog §1](correction-changelog.md)). Todas foram
**reduções de afirmação ou reorganizações** — nenhuma criou conteúdo clínico novo. As duas que mais
merecem atenção:

- **`f1` ganhou "de instalação gradual ao longo de alguns minutos"** e **`f9` perdeu "nega início
  súbito"**. O negativo pertinente de dissecção ficou mais fraco; a compensação está na nova célula
  `f1 → dx.dissecao-aorta`. **O equilíbrio do diferencial mudou.**
- **`f16 → dx.sca-ssst` passou de `supports` para `neutral`** (ECG não diagnóstico não sustenta
  isquemia; é critério definicional). Depende de **H6**.

## 2. Checklist de revisão clínica *(a preencher pelo revisor)*

| # | Item | Resposta | Comentário |
|---|---|---|---|
| 1 | O caso é clinicamente plausível como um todo? | ☐ sim ☐ com ressalvas ☐ não | |
| 2 | Os sinais vitais são coerentes com o quadro descrito? | ☐ sim ☐ não | |
| 3 | A evolução temporal (90 minutos, sintomas, exames) é realista? | ☐ sim ☐ não | |
| 4 | O diagnóstico esperado (SCA sem supra de ST) é **o mais defensável** com os dados apresentados? | ☐ sim ☐ não | |
| 5 | Falta algum diagnóstico diferencial relevante? | ☐ não ☐ sim → quais | |
| 6 | Falta algum red flag? | ☐ não ☐ sim → quais | |
| 7 | Os exames marcados como `essencial` / `util` / `desnecessario` estão corretamente classificados? | ☐ sim ☐ não | |
| 8 | Algum feedback está clinicamente incorreto? | ☐ não ☐ sim → quais | |
| 9 | O caso ensina que ansiedade é "a resposta errada"? (não deveria) | ☐ não ☐ sim → onde | |
| 10 | O texto contém alguma orientação que possa ser lida como conduta clínica real? | ☐ não ☐ sim → onde | |

## 3. Verificação da `evidenceMatrix` *(a preencher pelo revisor)*

A matriz tem **38 células autoradas** (28 não neutras). Não é necessário revisar todas — estas são
as que mudam o que o estudante aprende:

| Célula | Classificação autoral | Concorda? |
|---|---|---|
| `f3` → `dx.ansiedade` = **sustenta** ("náusea e sudorese também ocorrem em ansiedade; não discrimina") | sustenta ambas | ☐ sim ☐ não |
| `f5` → `dx.ansiedade` = **neutro** (rótulo prévio não é evidência sobre o episódio atual) | neutro | ☐ sim ☐ não |
| `f5` → `dx.sca` = **neutro** (pânico não é fator protetor) | neutro | ☐ sim ☐ não |
| `f13` → `dx.dissecao-aorta` = **contradiz**, com ressalva de que **não exclui** | contradiz, não exclui | ☐ sim ☐ não |
| `f16` → `dx.sca` = **neutro** (ECG não diagnóstico não exclui SCA) | neutro | ☐ sim ☐ não |
| `f17` → `dx.tep` = **neutro** (troponina não é específica) | neutro | ☐ sim ☐ não |
| `f17` → `dx.miocardite` = **sustenta** | sustenta | ☐ sim ☐ não |

## 4. Verificação dos vereditos de `dp5` *(a preencher pelo revisor)*

| Hipótese do estudante | Veredito autoral | Concorda? |
|---|---|---|
| SCA sem supra de ST | `muito_compativel` | ☐ sim ☐ não |
| SCA (genérica) | `compativel` | ☐ sim ☐ não |
| Miocardite | `parcialmente_compativel` | ☐ sim ☐ não |
| Dissecção de aorta | `pouco_compativel` | ☐ sim ☐ não |
| TEP | `pouco_compativel` | ☐ sim ☐ não |
| Ansiedade / pânico | `incompativel` | ☐ sim ☐ não |
| "Dados insuficientes" | `pouco_compativel` | ☐ sim ☐ não |

## 5. A pergunta que decide

> **Você deixaria um estudante do 4º ano usar este caso sem supervisão?**
>
> ☐ SIM ☐ NÃO
>
> Justificativa: ________________________________________________

Um **NÃO** impede `reviewStatus: "approved"`, independentemente de todas as respostas anteriores.

## 6. Assinatura

| | |
|---|---|
| Nome do revisor | |
| Formação / vínculo | |
| Data | |
| Decisão | ☐ aprovado ☐ aprovado com correções ☐ reprovado |

---

## 7. Regra de integridade deste documento

Este arquivo **não pode** ser preenchido por um agente de IA, nem parcialmente. Nenhum nome de
revisor pode ser inventado. Nenhuma caixa pode ser marcada por quem não é o revisor. Se o projeto
for entregue sem revisão humana, o campo `reviewStatus` permanece `pending_human_review` e essa
limitação vai declarada no texto acadêmico — o que é honesto e defensável. Simular aprovação não é.
