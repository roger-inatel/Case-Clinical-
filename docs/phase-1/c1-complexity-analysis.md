# Análise de Complexidade do C1

Objetivo: descobrir **o custo mínimo de um caso que preserve a qualidade** — não minimizar números.
Toda contagem aqui é medida sobre os arquivos, não estimada.

---

## 0. Correção de duas medições anteriores

O status parcial da Fase 1 reportou **2.144 palavras de chave** e razão **8,2×**. As duas precisam
de ajuste:

| Métrica | Reportado antes | Medido agora | Por quê mudou |
|---|---|---|---|
| Prosa autoral na chave | 2.144 | **2.271** | A primeira contagem omitia 4 tipos de campo (`redFlags.text`, `commonMistakes.trap`, `dp1.authorRepresentation`, mensagens agregadas de `dp4`) |
| Texto lido pelo estudante | 261 | **473** | 261 conta só os achados. O estudante também lê 111 palavras de enunciados e opções, 74 de objetivos de aprendizagem e 27 de título e aviso |

**Razões corretas:**

| Comparação | Razão |
|---|---|
| chave ÷ achados clínicos | **8,7×** |
| chave ÷ **tudo que o estudante lê** | **4,8×** |

A segunda é a honesta para discutir esforço. A primeira é a honesta para discutir **onde** está o
trabalho: escrever o quadro clínico é a menor parte da autoria.

---

## 1. Onde estão as 2.271 palavras

| Bucket | Itens | Palavras | % | Média |
|---|---|---|---|---|
| `evidenceMatrix.why` — células não neutras | 28 | 513 | 22,6% | 18 |
| `dp5` feedback por veredito | 10 | 367 | 16,2% | 37 |
| `dp2` feedback por conceito | 10 | 287 | 12,6% | 29 |
| `evidenceMatrix.why` — células neutras | 10 | 249 | 11,0% | 25 |
| `dp3` `feedbackByDirection` | 5 | 149 | 6,6% | 30 |
| `dp4` feedback por exame | 5 | 135 | 5,9% | 27 |
| `dp5` `authorReasoning` | 1 | 135 | 5,9% | 135 |
| `commonMistakes` (trap + why) | 6 | 108 | 4,8% | 18 |
| `dp3` `rationale` | 1 | 77 | 3,4% | 77 |
| `dp1` feedback + representação | 2 | 71 | 3,1% | 36 |
| `redFlags` (texto + porquê) | 4 | 65 | 2,9% | 16 |
| `dp4` mensagens agregadas | 2 | 52 | 2,3% | 26 |
| `differentialsToConsider.why` | 3 | 44 | 1,9% | 15 |
| `dp5` pergunta de reflexão | 1 | 19 | 0,8% | 19 |
| **Total** | **88** | **2.271** | | |

**A `evidenceMatrix` sozinha é 33,6%** das palavras (762 em 38 células). É o maior bloco isolado.

---

## 2. A descoberta que reordena a discussão

> **A avaliação determinística não precisa de nenhuma das 2.271 palavras.**

Para produzir o veredito, o motor usa apenas valores estruturados: 38 valores de `rel`, 10 créditos
em `dp2`, 10 vereditos em `dp5`, 5 classificações de exame, 1 direção esperada em `dp3` e 3 conjuntos
de qualificadores em `dp1`. Isso é **~67 valores de enum e número** — zero prosa.

Logo: **100% da prosa da chave é camada de feedback.** A pergunta "a chave é grande demais?" não é
sobre avaliação; é inteiramente sobre **quanto feedback queremos escrever**. Isso é uma decisão
pedagógica com custo conhecido, não uma dívida estrutural — e é uma alavanca de escopo direta:
dá para autorar um caso avaliável com uma fração da prosa, se aceitarmos feedback mais pobre.

---

## 3. Classificação das 2.271 palavras

### 3.1 Necessário — 1.021 palavras (45%)
Sem isso o feedback é inútil ou, pior, ensina errado.

| Item | Palavras | Por quê é necessário |
|---|---|---|
| `dp5` feedback dos 10 vereditos | 367 | É o que o estudante recebe sobre a própria conclusão. Remover = "incompatível" sem explicação |
| Células com nuance clínica que a relação não carrega (`f13` reduz≠exclui, `f16` ECG não diagnóstico, `f5` rótulo prévio, `f3` sustenta ambas, `f17` troponina) | ~180 | **Sem o texto, o dado estruturado mente.** `f13` = "contradiz" sozinho ensina que pulso simétrico exclui dissecção |
| `dp3` `rationale` + as duas direções erradas de `feedbackByDirection` | ~150 | É o ponto de decisão central do caso |
| `dp4` feedback dos 2 exames essenciais + `essentialMissedMessage` | ~90 | Sem isso, omitir o ECG não ensina nada |
| `dp1` feedback + representação do autor | 71 | O ponto de decisão só faz sentido com um modelo de comparação |
| `redFlags.whyDangerous` | ~40 | Red flag sem "por que é perigoso" é lista |
| `dp5` pergunta de reflexão | 19 | Fecha o caso |

### 3.2 Pedagogicamente útil — 730 palavras (32%)
Melhora o feedback. Removível com perda real, mas não fatal.

| Item | Palavras |
|---|---|
| `dp2` feedback dos 10 conceitos | 287 |
| `authorReasoning` (comparação lado a lado com o texto do estudante) | 135 |
| `commonMistakes` | 108 |
| `feedbackByDirection` nas 3 direções corretas/defensáveis | ~90 |
| `dp4` feedback dos 3 exames não essenciais + `excessMessage` | ~110 |

`authorReasoning` merece nota: é o insumo da autoexplicação, que é o item com melhor suporte
empírico no desenho pedagógico. Cortá-lo é barato em palavras e caro em fundamento.

### 3.3 Estrutural — 65 palavras (3%)
Existe porque o modelo de dados exige, não porque alguém vai ler: `redFlags.text`,
`commonMistakes.trap`, rótulos de opções. Custo desprezível.

### 3.4 Redundante — **localizado e medido: pequeno**

Medição objetiva (5-gramas repetidos em mais de um fragmento):

| Núcleo repetido | Fragmentos |
|---|---|
| "elevação de troponina indica lesão miocárdica" | 3 |
| "não produz elevação de troponina" | 3 |
| "reduz a probabilidade de dissecção" | 3 |
| "é fator de risco cardiovascular" | 3 |
| "é pouco compatível com dor de parede torácica" | 2 |
| "não é evidência sobre o episódio atual" | 2 |

**Seis núcleos, em 16 fragmentos.** Economia real de consolidá-los: **NOT MEASURED** — exigiria
reescrever e recontar. Limite superior grosseiro: os núcleos têm 5–8 palavras; eliminar ~10
ocorrências economizaria da ordem de 60–80 palavras, **~3% da chave**.

**Conclusão desconfortável para quem esperava gordura: a redundância é real, está localizada, e é
pequena.** As 2.271 palavras não são inchaço — são o custo de explicar 38 relações e 10 vereditos.

### 3.5 Potencialmente simplificável — 3 propostas concretas

| # | Proposta | Alvo | Ganho | Custo |
|---|---|---|---|---|
| **S1** | **Fragmentos compartilhados por id** (`snippets.troponina-lesao`), interpolados pelo motor | os 6 núcleos repetidos | ~3% das palavras, e **consistência**: corrigir a explicação em um lugar corrige em todos | um artefato a mais; risco de texto genérico fora de contexto |
| **S2** | **Agrupar achados equivalentes** — `f6`, `f7`, `f8` são três células "sustenta / fator de risco cardiovascular" | 3 células → 1 grupo | ~40 palavras e 2 células por caso | o estudante perde a marcação individual de cada fator |
| **S3** | **Herança por `parentConcept`** — feedback do subtipo herda do genérico e só declara a diferença | duplicação `dx.sca` ↔ `dx.sca-ssst` em `dp2` e `dp5` | ~60 palavras neste caso; cresce em casos com mais subtipos | exige o INS-1 resolvido no motor |

Nenhuma delas reduz qualidade. Juntas, projetam algo em torno de 7–9% — **NOT MEASURED**.

---

## 4. As 38 células da `evidenceMatrix`

| Categoria | Células | Veredito |
|---|---|---|
| **Necessárias** — sustentam a seleção de evidências das 4 hipóteses que um estudante realmente escolhe (`dx.sca`, `dx.ansiedade`, `dx.dissecao-aorta`, `dx.tep`) | 27 | manter |
| **Pedagogicamente úteis** — as 10 neutras explícitas ("este achado não discrimina") | 10 | **manter.** São contraintuitivas e é onde mora o ensino sobre evidência não discriminante |
| **Potencialmente agrupáveis** — `f6`/`f7`/`f8` → `dx.sca` | 3 | agrupar (S2) |
| **Redundantes** | 0 | — |

Densidade: 38 células para 20 achados × 10 conceitos = **19% de preenchimento**. A matriz é
esparsa, como previsto no Discovery V2 — o autor não preenche 200 células, preenche as que importam.

**Custo real medido:** 762 palavras / 38 células = **20 palavras por célula**. É esse número que
projeta o custo dos próximos casos, não o total.

---

## 5. Os 80 (na contagem completa, 88) fragmentos

| Camada | Fragmentos | Necessidade |
|---|---|---|
| Vereditos de `dp5` | 10 | necessária — 1 por conceito avaliável |
| Células da matriz | 38 | necessária/útil — 1 por relação declarada |
| Conceitos de `dp2` | 10 | útil |
| Exames de `dp4` | 5 | 2 necessários, 3 úteis |
| Direções de `dp3` | 5 | 2 necessários, 3 úteis |
| Demais (reflexão, raciocínio do autor, armadilhas, red flags, agregados) | 20 | mistos |

**O número de fragmentos é função direta do número de conceitos avaliáveis.** 10 conceitos →
10 vereditos + 10 feedbacks de `dp2` + a fatia da matriz. Reduzir fragmentos significa **reduzir
conceitos**, o que significa mais estados `naoPrevisto` — troca ruim. O piloto sugere que
**8–10 conceitos por caso é o ponto de equilíbrio**, não um excesso.

---

## 6. Os 42 aliases

| Fato medido | Implicação |
|---|---|
| 42 aliases / 10 conceitos = **4,2 por conceito** | Densidade adequada para o combobox funcionar |
| Custo em palavras: ~100 (4,4% do total) | Desprezível |
| **Os 10 conceitos são compartilhados entre casos** | **Custo amortizado, não por caso** |

Este é o item com melhor perspectiva de reaproveitamento. Estimativa para C2 (dor torácica típica
com supra de ST): dos conceitos necessários, praticamente todos já existem — o caso adiciona talvez
1 ou 2. Para os casos de Pneumologia, a sobreposição cai, mas `dx.tep` e `dx.sca` já estão lá.

**Não classificar aliases como custo por caso** foi um erro implícito da estimativa inicial.

---

## 7. Custo mínimo de um caso que preserve a qualidade

Somando o que a análise sustenta:

| Camada | Palavras | Pode cair? |
|---|---|---|
| Texto clínico (achados + enunciados + objetivos) | 473 | não |
| Prosa necessária da chave | ~1.021 | não |
| Prosa pedagogicamente útil | ~730 | **sim, é a alavanca de escopo** |
| Estrutural | 65 | não |

**Piso com qualidade preservada: ~1.560 palavras por caso** (473 + 1.021 + 65), contra 2.744 no C1
completo. Reduzir abaixo disso começa a cortar explicação de veredito e nuance clínica — que é onde
o produto ensina.

**Recomendação:** não cortar nada no C1. Ele é o caso de referência e serve de padrão de qualidade.
A alavanca existe e está identificada, para ser usada **se e quando** o prazo exigir — decisão que
fica no relatório final, com dados.

---

## 8. O que esta análise mudou de opinião

1. A razão **não é 8,2×** — é 4,8× contra tudo que o estudante lê. O número inicial exagerava.
2. **A avaliação não custa prosa nenhuma.** Todo o custo é feedback, e feedback é escolha.
3. **Não há gordura significativa.** Quem esperava encontrar 30% de redundância não vai encontrar:
   são ~3%.
4. **O vocabulário não é custo por caso.** Amortiza entre os oito.
5. O custo por célula da matriz (**20 palavras**) é a constante que projeta os próximos casos — e é
   um número que só existe porque um caso real foi escrito.
