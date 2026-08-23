# Custo de Autoria — Caso Piloto C1 (`cardio-001`)

**Regra deste documento:** apenas números efetivamente medidos. O que não foi medido está marcado
**`NOT MEASURED`** com o método para medi-lo em C2. Nenhuma estimativa aparece como medição.

Estado: **final** — ciclo completo (pesquisa → desenho → autoria → red team → correção → revalidação).
Revisão humana: **não ocorreu**.

---

## 1. Conteúdo *(medido por script sobre os arquivos)*

### 1.1 O que o estudante lê

| Item | Rev. 1 | **Rev. 2 (final)** |
|---|---|---|
| Achados clínicos | 261 | **284** (22 achados) |
| Enunciados + rótulos de opção | 111 | 150 |
| Objetivos de aprendizagem | 74 | **21** (reescritos como temáticos — B6) |
| Título + aviso | 27 | — |
| **Total** | 473 | **455 palavras** |

### 1.2 A chave

| Item | Rev. 1 | **Rev. 2 (final)** |
|---|---|---|
| Prosa autoral | 2.271 | **2.938 palavras** |
| Campos de texto | 88 | **113** |
| Células da `evidenceMatrix` | 38 | **40** (28 não neutras, 12 neutras explícitas) |
| Densidade da matriz | 19% | **18%** (40 de 22 × 10) |
| Palavras por célula | 20 | **~19** |
| Conceitos avaliáveis | 10 | 10 |
| Vereditos com ramificação condicional | 0 | **5 de 10** |
| Pontos de decisão | 5 | 5 |
| Red flags / erros comuns | 2 / 3 | 2 / 3 |

### 1.3 Razões

| Comparação | Rev. 1 | **Rev. 2** |
|---|---|---|
| chave ÷ achados clínicos | 8,7× | **10,3×** |
| chave ÷ tudo que o estudante lê | 4,8× | **6,5×** |

> **Corrigir defeitos aumentou a chave em 29%.** As correções de B1 e R22 exigiram 5 textos de
> `verdictWhenMissing` e 14 fragmentos de `feedbackByOption`. Custo de correção é custo de prosa.

### 1.4 Vocabulário *(compartilhado, não por caso)*

| Item | Valor |
|---|---|
| Conceitos | 10 |
| Aliases | **43** (média 4,3 por conceito) |
| Conceitos pendentes identificados pelo red team | **6** (bloqueados em H3/H7) |
| Reaproveitamento em C2–C8 | `NOT MEASURED` — mensurável ao autorar C2 |

### 1.5 Tamanho em disco

| Arquivo | Rev. 1 | **Rev. 2** |
|---|---|---|
| `cardio-001.case.json` | 11,2 KB | **12,9 KB** |
| `cardio-001.key.json` | 22,6 KB | **34,1 KB** |
| `vocabulary.excerpt.json` | 3,1 KB | **5,5 KB** |

---

## 2. Processo

### 2.1 Tempo

| Item | Valor |
|---|---|
| **Tempo de sessão decorrido** (`14:25:29Z` → `15:15:35Z`) | **50 minutos de relógio** |
| **Red team (execução isolada, medido pelo runtime)** | **28 minutos** · 145.141 tokens · 19 chamadas de ferramenta |
| Tempo de pesquisa | `NOT MEASURED` |
| Tempo de desenho pedagógico | `NOT MEASURED` |
| Tempo de autoria (caso + chave) | `NOT MEASURED` |
| Tempo de classificação e correção | `NOT MEASURED` |
| Tempo de revisão humana | `NOT MEASURED` — não ocorreu |

**Três ressalvas que impedem usar os 50 minutos como custo de autoria:**

1. O relógio inclui os intervalos entre turnos — tempo de leitura e escrita do usuário. Não é
   separável com os dados disponíveis.
2. É **autoria assistida por IA**. Não estima o tempo de um autor humano escrevendo o mesmo caso.
3. **Não inclui revisão humana** — a etapa que não acelera e que hoje não tem responsável.

Único subprocesso com tempo real medido: o **red team, 28 minutos**, e ele roda sozinho.

**Método para C2:** `date -u` no início e no fim de cada uma das seis etapas.

### 2.2 Iterações e defeitos *(medido)*

| Item | Valor |
|---|---|
| Iterações de autoria antes da 1ª validação | **1** |
| Problemas estruturais na 1ª validação automática | **0** |
| **Problemas encontrados pelo red team** | **50** (6 bloqueadores, 23 relevantes, 21 observações) |
| Falsos positivos | **1** (2%) |
| **Corrigidos** | **28** (56%) |
| Bloqueados em revisão clínica | **11** (22%) |
| Adiados por decisão de desenho ou custo | **7** (14%) |
| Sem ação necessária | **3** (6%) |
| Rodadas de correção até a revalidação passar | **1** |
| Erros/avisos após a correção | **0 / 0** |
| Novos problemas introduzidos pela correção | **0 estruturais**; 2 consequências registradas (§3 do [changelog](../reviews/c1/correction-changelog.md)) |
| **Problemas encontrados pela revisão humana** | `NOT MEASURED` — **não houve revisão humana** |
| **Achados só pelo humano e não pelo red team** | `NOT MEASURED` — **a métrica mais importante do piloto, e ela não existe** |

### 2.3 Concordância entre revisores independentes *(medido, parcial)*

Único dado real de concordância que o piloto produziu:

| Achado | Encontrado por | Independente? |
|---|---|---|
| **B1 / INS-5** — vereditos citam achados que o estudante pode não ter obtido | **red team** (contexto isolado) **e autor** (ao mapear a jornada) | **Sim.** O red team foi lançado antes do mapeamento; nenhum dos dois viu o trabalho do outro |
| **B5 / INS-4** — gatilho `markedAs: "excludes"` inerte | **red team** e **autor** (registrado antes do relatório) | **Sim** |

Dois dos seis bloqueadores foram encontrados em duplicata por revisores independentes. **Não é a
métrica red team × humano** — os dois revisores são o mesmo modelo base, com contextos separados.
Vale como sinal de que o defeito é robusto, não como medida da utilidade do red team.

### 2.4 Autocontenção por falta de fonte *(medido)*

3 células de 40 enfraquecidas · 1 eixo de desenho abandonado · **3 números removidos** na correção
de R20. Custo direto da política de sourcing.

### 2.5 Artefatos *(medido)*

| Tipo | Quantidade |
|---|---|
| Arquivos de conteúdo (JSON) | 3 |
| Documentos de processo | 10 |
| Scripts descartáveis de validação | 3 (fora do repositório) |
| Fontes localizadas / **lidas na íntegra** | 12 / **0** |
| Famílias de verificação automática | 11 → **12** |

---

## 3. O custo em três camadas

### 3.1 Avaliação — o que o motor precisa para o veredito

| Valor estruturado | Rev. 2 |
|---|---|
| `rel` das células | 40 |
| Créditos e `tier` em `dp2` | 10 |
| Vereditos em `dp5` | 10 (+5 `verdictWhenMissing`) |
| `requiresFindings` | 6 (5 vereditos + 1 red flag) |
| Classificações de exame em `dp4` | 5 |
| Direção esperada + faixa + escala em `dp3` | 3 |
| Conjuntos de qualificadores em `dp1` | 3 |
| **Total** | **~82 valores estruturados** |

**Prosa necessária: zero.** A conclusão do relatório parcial **permanece válida após a revalidação**;
o número subiu de ~67 para ~82 porque as correções acrescentaram condicionalidade, não prosa.

### 3.2 Feedback — o que o estudante lê

**2.938 palavras.** Camada dominante, inteiramente escolha pedagógica.

### 3.3 Estrutural — o que existe para o caso ser representável

~165 palavras + 43 aliases amortizados. **Desprezível.**

### 3.4 Conclusão

> A complexidade do C1 é **pedagógica, não estrutural** — e a correção de defeitos incide
> integralmente sobre a camada pedagógica.

Corrigir 28 defeitos custou **+667 palavras de prosa e +15 valores estruturados**. A proporção
(98% prosa) diz onde vai o tempo de quem corrigir os próximos casos.

---

## 4. Pendências

| Linha | Depende de |
|---|---|
| Tempo por etapa | instrumentação em C2 |
| Reaproveitamento de vocabulário | autoria de C2 |
| **Problemas achados pelo humano × pelo red team** | **decisão D2** |
| Economia real de S1–S3 | experimento dedicado |
| Confirmação dos 11 itens clínicos (H1–H11) | **decisão D2** |
