# Relatório do Piloto C1

**Fase 1 concluída.** Ciclo completo: pesquisa → desenho pedagógico → autoria → red team →
classificação → correção → revalidação. **Revisão humana: não ocorreu.**

Artefatos: [caso](../../cases/c1/cardio-001.case.json) · [chave](../../cases/c1/cardio-001.key.json) ·
[vocabulário](../../cases/c1/vocabulary.excerpt.json) · [pesquisa](../research/c1/research-notes.md) ·
[desenho](c1-educational-design.md) · [red team](../reviews/c1/red-team-report.md) ·
[classificação](../reviews/c1/findings-classification.md) · [changelog](../reviews/c1/correction-changelog.md) ·
[métricas](../metrics/c1-authoring-cost.md) · [revisão humana (PENDING)](../reviews/c1/human-review.md)

---

## As 18 respostas

**1. O C1 é estruturalmente válido?**
**Sim.** Revalidação com 12 famílias de verificação: **0 erros, 0 avisos**. Referências íntegras,
sem chaves órfãs, regra temporal satisfeita, todas as 14 opções de `dp1` classificadas, nenhuma
colisão de alias, `redTeamPassedAt` corretamente `null`.

**2. É pedagogicamente coerente segundo o protocolo?**
**Parcialmente.** As incoerências internas foram corrigidas. Permanecem **seis defeitos de conteúdo**
que exigem decisão clínica: cinco hipóteses razoáveis fora do vocabulário (R4), miocardite julgada
sem dado que a discrimine (R17), ausência de ECG seriado e curva de troponina (R14), ausência de
progressão do sintoma (R1), exame de imagem genérico respondendo por duas emergências (R13) e
diferencial resolvível por eliminação mecânica (R21).

**3. O red team encontrou problemas?**
**Sim: 50** — 6 bloqueadores, 23 relevantes, 21 observações. Nenhuma categoria do checklist ficou sem
investigação declarada.

**4. Quais foram os principais?**

| # | Problema | Por que importa |
|---|---|---|
| **B1** | `dp5` avalia o estudante com achados que ele pode nunca ter obtido — 12 campos citam exames condicionais | Quem não pede troponina recebe *"a elevação de troponina indica lesão miocárdica"*. **Da perspectiva dele, o sistema inventou um exame.** Não detectável pela regra de CI original: a violação está em prosa, não em referência |
| **B4** | "angina instável" como alias de `dx.sca-ssst` num caso com troponina positiva | Produz **acerto falso silencioso** no ponto de decisão mais importante. O estudante recebe o veredito máximo por uma resposta clinicamente incorreta, e nunca sabe |
| **B6** | `learningObjectives` e `tags` entregam as respostas de dp2, dp3 e dp5 antes do início | **Anula o instrumento sem que ninguém perceba**: o estudante responde bem, o perfil sai bom, e a medida não mediu nada |
| **B2** | O veredito de TEP usa o D-dímero, exame que a própria chave manda não pedir | Inverte o incentivo: o caminho recompensado em dp4 é punido em dp5 |
| **B5** | A armadilha sobre pulsos e dissecção dispara em `markedAs: "excludes"`, estado inexistente no motor | A armadilha que corresponde ao objetivo central **nunca dispara para ninguém** |
| **B3** | Única célula do arquivo a dizer que um achado "afasta" um diagnóstico, sem ressalva | Ensina exatamente o erro que o caso existe para prevenir |

**5. Quantos foram corrigidos?**
**28 de 50 (56%).** 11 bloqueados em revisão clínica, 7 adiados por decisão de desenho, 3 sem ação
necessária, 1 falso positivo. Regra aplicada: **o autor não corrige o que foi escalado a um médico** —
todas as alterações de substância foram **reduções de afirmação**, nunca criação de conteúdo clínico.

**6. Houve falsos positivos?**
**Um, em 50 (2%)** — O17, que alega ausência de fonte para a priorização de exames quando o próprio
relatório reconhece que duas fontes cobrem formalmente o ponto. É problema de granularidade de
metadado, não de sourcing. Taxa notavelmente baixa.

**7. Houve revisão humana?**
**Não.** `reviewStatus: pending_human_review`. Não há revisor designado (**decisão D2**).
[human-review.md](../reviews/c1/human-review.md) está preenchido como *solicitação*, com as caixas
em branco. Nenhum nome foi inventado, nenhuma aprovação simulada.

**8. O que o humano encontrou que o red team não encontrou?**
**`NOT MEASURED`.** Esta é a métrica mais importante do piloto — a que mede o limite real da IA como
revisora de conteúdo médico — **e ela não existe**, porque a barreira 3 nunca foi exercitada.

O único dado de concordância obtido: **B1 e B5 foram encontrados de forma independente pelo red team
e pelo autor** (ao mapear a jornada do estudante, antes do relatório existir). Os dois revisores são
o mesmo modelo base em contextos separados — serve como sinal de que os defeitos são robustos, não
como medida da utilidade do agente.

**9. A `evidenceMatrix` é viável?**
**Sim — e foi a peça que resolveu o defeito mais grave.** A correção de B1 não precisou de estrutura
nova para os fragmentos: as afirmações dependentes de exame migraram para a matriz, **que já é
condicional por construção** (o motor só compõe fragmentos de achados revelados). O desenho previsto
no Discovery V2 estava certo; o caso é que não o usou em `dp5`.

40 células, densidade 18%, ~19 palavras por célula. Esparsa e sustentável.

**10. Os fragmentos de feedback funcionam?**
**Sim, e o piloto provou por contraste.** `dp1` tinha um feedback único e estático — o red team
mostrou que ele entrega o mesmo parágrafo a quem acerta tudo e a quem erra tudo (R22). Fragmentado
em 14 pedaços, passa a nomear o que faltou a cada estudante. **Onde o caso usou fragmentos, o
feedback funcionou; onde usou texto monolítico, produziu exatamente o "feedback genérico" que o
risco N3 nomeia.**

**11. O schema foi suficiente?**
**Não.** Dez extensões e cinco insuficiências, todas descobertas por escrever um caso real.

**12. Quais extensões foram necessárias?**

| Extensão | Motivo | Origem |
|---|---|---|
| **EXT-1** célula da matriz como objeto `{rel, why}` | Sem isso não há onde escrever o fragmento | autoria |
| **EXT-2** `reviewStatus: pending_human_review` | Não havia estado para "aguardando revisor" | autoria |
| **EXT-3** `feedbackByDirection` | Feedback igual para quem errou e acertou desperdiça o momento | autoria |
| **EXT-4** `options` inline em `problem-representation` | Schema não dizia de onde vêm os chips | autoria |
| **EXT-7** `triggeredWhen.evidenceMisclassified` | Dois dos três erros do caso não são detectáveis pela hipótese | autoria |
| **EXT-8** `requiresFindings` + `verdictWhenMissing` | **Correção de B1/R3** | red team |
| **EXT-9** `requiresFindings` em red flags | **Correção de R11** | red team |
| **EXT-12** `feedbackByOption` em `dp1` | **Correção de R22** | red team |
| EXT-10, 11, 13–16 | `readingLevel`, `aiAssisted`, `verdicts[].feedback`, `differentials[].cantMiss`, `dp4.excessMessage`, `learningOutcomes` | usadas sem declaração (R19) |

**Insuficiências não resolvidas:** INS-1 (sem hierarquia `parentConcept` no motor) · INS-2
(negativas como achados) · INS-3 (caso não é autocontido) · INS-4 (não há como declarar *reduz* ×
*exclui*) · **INS-5** (veredito ignorava achados obtidos — **resolvida** por EXT-8).

**13. Qual é o custo real de autoria?**

| Métrica | Valor |
|---|---|
| Texto lido pelo estudante | **455 palavras** |
| Prosa da chave | **2.938 palavras** em 113 campos |
| Razão chave/estudante | **6,5×** |
| Valores estruturados para avaliar | **~82** |
| Tempo de sessão | **50 min de relógio** (não separável do tempo de leitura do usuário) |
| Tempo de red team | **28 min** autônomos · 145k tokens |
| Iterações de correção | **1** |

**14. O que representa o maior custo?**
A **`evidenceMatrix`** (40 células, ~19 palavras cada) e os **vereditos de `dp5`** — juntos, cerca de
metade da prosa. E, descoberta do piloto: **corrigir defeitos custa 29% de prosa a mais**
(2.271 → 2.938 palavras). A correção incide 98% sobre a camada de feedback.

**15. A complexidade é estrutural ou pedagógica?**
**Pedagógica, com folga.** O motor precisa de ~82 valores estruturados e **zero prosa** para produzir
o veredito. As 2.938 palavras são, integralmente, camada de feedback — decisão pedagógica com custo
conhecido, não dívida de arquitetura. Quem olha os 34 KB do `key.json` e conclui "o schema é pesado"
está lendo custo de feedback como se fosse custo de estrutura.

**16. O que pode ser simplificado sem perda de qualidade?**
Três candidatos, **nenhum com economia comprovada** ([S1–S3](c1-simplifications-s1-s3.md), todos
`NOT MEASURED`). O que mudou de opinião no piloto: **S3 (herança `parentConcept`) é a mais valiosa —
e não por economia.** Ela resolve uma limitação de *expressividade*: foi preciso autorar `dx.sca` e
`dx.sca-ssst` separadamente nas duas chaves porque o modelo não sabe que um é subtipo do outro. O
red team confirmou o efeito por outro ângulo (O21: três labels quase idênticos no autocomplete).

A redundância textual real é de **~3%** — não há gordura a cortar.

**17. O pipeline é repetível?**
**Cinco das seis etapas, sim.** Pesquisa, desenho, autoria, red team e correção rodaram ponta a ponta
e produziram artefatos verificáveis. O red team roda sozinho em 28 minutos com 2% de falso positivo —
é a etapa que mais entregou valor por custo.

**A sexta etapa nunca foi exercitada.** O pipeline não é repetível enquanto a barreira 3 não rodar
ao menos uma vez: não sabemos quanto tempo consome, o que encontra, nem se as onze questões são
respondíveis na prática.

**18. O modelo de 8 casos continua viável?** → ver a decisão de escopo abaixo.

---

## Decisão de escopo

# 🟡 8 CASOS VIÁVEIS COM SIMPLIFICAÇÕES

**Condicionada a um gate que hoje está fechado.**

### O que sustenta o amarelo

| Evidência | Leitura |
|---|---|
| Caso autorado em uma passagem, 0 erros estruturais na primeira validação | A autoria funciona |
| Red team autônomo, 28 min, 2% de falso positivo | A barreira 2 é barata e eficaz |
| 28 defeitos corrigidos em **1 rodada**, revalidação limpa | O ciclo de correção converge |
| Boa parte dos 50 defeitos era **de primeira vez**: B1, B5, B6 e R19 agora têm verificação automática | O defeito não repete se a validação acompanhar |
| Vocabulário amortiza entre casos | O custo marginal do caso 2 é menor que o do caso 1 |

### O que impede o verde

| Evidência | Leitura |
|---|---|
| **11 dos 22 defeitos não corrigidos exigem médico** | Metade do resíduo é inacessível à engenharia |
| **Zero casos podem chegar a `approved`** sem revisor | O gargalo não é autoria |
| Corrigir custou **+29% de prosa** | A projeção de custo precisa incluir a correção, não só a autoria |
| Defeitos de completude clínica (R4, R17, R13, R14) **vão se repetir** em cada caso novo | Não são erro de primeira vez |

### O gate

> **Se a decisão D2 não for resolvida, nenhuma classificação de escopo é válida.** O problema deixa
> de ser *quantos casos* e passa a ser *se algum caso pode ser publicado*. Oito casos produziriam
> ~88 questões clínicas sem ninguém para respondê-las.

Se D2 permanecer aberto por mais tempo, a classificação correta passa a ser **🟠 reduzir o escopo** —
não porque autorar seja caro, mas porque um catálogo menor é revisável e um catálogo maior sem
revisão não deveria existir.

### Simplificações que o amarelo pressupõe

1. Decidir **INS-1** (hierarquia) e **INS-4** (*reduz* × *exclui*) antes de C2.
2. Estender a validação automática com as verificações que este piloto produziu — elas transformam
   4 dos 6 bloqueadores em erro de CI.
3. Aceitar que o piso por caso é **~1.500–3.000 palavras de chave**, e planejar o cronograma com
   esse número, não com o texto do caso.

---

## Decisão sobre o schema

# AJUSTAR ANTES DA IMPLEMENTAÇÃO

Congelar agora significaria implementar um motor contra um modelo que já sabemos incompleto.
Reprojetar seria descartar um desenho que se mostrou correto onde foi usado.

**Mudanças justificadas pelo C1 — nenhuma especulativa:**

| # | Mudança | Justificativa |
|---|---|---|
| 1 | Célula da matriz como objeto `{rel, why}` | EXT-1 — sem ela não há fragmento |
| 2 | `requiresFindings` + `verdictWhenMissing` em vereditos | **B1** — o defeito mais grave do caso |
| 3 | `requiresFindings` em red flags | **R11** — penalização por informação indisponível |
| 4 | `feedbackByOption` em `problem-representation` | **R22** — contrato do motor |
| 5 | `markedAs` como **enum fechado** dos estados reais | **B5** — a armadilha morta passaria em `string` |
| 6 | `parentConcept` reconhecido pelo motor | **INS-1** — duplicação em todo par genérico/subtipo |
| 7 | `strength` na célula da matriz (*reduz* × *exclui*) | **INS-4** — a distinção central do caso vive só na prosa |
| 8 | `reviewStatus` com `pending_human_review` | EXT-2 — é o estado real de todo caso hoje |
| 9 | `readingLevel` em `sources` | Já em uso; foi o que tornou o achado R20 possível |
| 10 | `schemaExtensions` **nos dois arquivos** | R19 — extensão declarada no arquivo errado |

---

## Próxima ação recomendada

# E — Submeter o C1 à revisão clínica humana (resolver D2)

**Uma ação. Não executada.**

### Por quê esta e não as outras

| Opção | Por que não |
|---|---|
| **A** congelar → motor | Congelaria um modelo com 5 mudanças justificadas pendentes, incluindo a correção de B1 |
| **B** ajustar modelo → motor | É a resposta certa para a pergunta errada. As mudanças de schema já estão **identificadas e aplicadas no C1**; o que falta não é engenharia |
| **C** mais um piloto antes de implementar | Mediria autoria de novo — que já sabemos que funciona — e acumularia mais ~11 questões clínicas sem resposta. Repetiria a única etapa que já temos |
| **D** reduzir o escopo | Prematuro. O custo de autoria não é o problema; a ausência de revisor é |

### Por que E

Três coisas que **só** a barreira 3 produz, e que nenhuma quantidade de engenharia substitui:

1. **A métrica que valida o pipeline inteiro** — defeitos achados pelo humano e não pelo red team.
   É o resultado publicável do trabalho, e hoje é `NOT MEASURED`.
2. **Desbloqueio de 11 defeitos reais** que permanecem no C1 e que vão reaparecer em todos os
   outros casos.
3. **A primeira medição de custo da etapa que não acelera.** Se a revisão de um caso levar oito
   horas, o catálogo de 8 é inviável **independentemente** de tudo o que a engenharia fizer — e
   isso muda a decisão de escopo imediatamente.

### O pedido, concreto

Um médico ou docente, **um caso, uma sessão**: ler o [caso](../../cases/c1/cardio-001.case.json) e a
[chave](../../cases/c1/cardio-001.key.json), preencher o
[checklist](../reviews/c1/human-review.md) e responder as **11 questões H1–H11** do
[relatório do red team](../reviews/c1/red-team-report.md#requer-revisão-clínica-humana).

A pergunta que decide: **"você deixaria um estudante do 4º ano usar este caso sem supervisão?"**

**Enquanto isso não acontecer, o C1 permanece `pending_human_review` e nenhum outro caso deve ser
autorado.**

---

## O que este piloto contradiz no Discovery V2

Registro exigido pela regra final da Fase 1 — não proteger decisões anteriores.

| Decisão do Discovery V2 | O que o C1 mostrou |
|---|---|
| *"A validação automática pega defeito estrutural; o red team pega o semântico"* | **Parcialmente falso.** B1 é semântico **e** automatizável — a regra de CI só precisava ser estendida para varrer prosa por palavras de resultado de exame. A fronteira entre CI e red team é mais móvel do que o documento supunha |
| *"O red team recebe o JSON, não a conversa"* | **Confirmado e valioso.** O isolamento produziu 50 achados com 2% de falso positivo |
| *"A complexidade do C1 seria estrutural"* (implícito no dimensionamento) | **Falso.** É 98% pedagógica |
| *"`naoPrevisto` é estado honesto para o caso residual"* | **Insuficiente.** Com 5 hipóteses razoáveis fora do vocabulário, `naoPrevisto` vira resultado **modal** para o bom estudante. O estado é honesto; a frequência é defeito |
| *"Piloto para medir o custo de autoria"* | **A métrica errada.** O custo de autoria não é o gargalo — a revisão clínica é, e ela não foi medida porque não aconteceu |

A última linha é a conclusão mais importante do piloto: **a Fase 1 foi desenhada para responder
"quanto custa autorar" e a resposta que ela produziu foi "essa não é a pergunta que decide o
projeto".**
