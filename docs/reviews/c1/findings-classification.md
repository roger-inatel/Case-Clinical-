# Classificação dos Achados do Red Team — C1

Entrada: [red-team-report.md](red-team-report.md) — 50 achados (6 bloqueadores, 23 relevantes,
21 observações). Classificação e decisão de correção pelo autor.

Escala: **crítico** · **alto** · **moderado** · **baixo** · **falso positivo**.

---

## 0. Princípio que governou as decisões de correção

> **O autor não corrige o que o red team encaminhou à revisão clínica.**

O relatório escalou 11 questões (H1–H11) que exigem médico. Vários achados dependem delas. Corrigir
esses itens agora seria o agente de autoria decidindo substância clínica sozinho — exatamente o que
o pipeline existe para impedir ([authoring-pipeline §3](../../03-architecture/authoring-pipeline.md)).

Daí a partição:

| Grupo | Critério | Ação |
|---|---|---|
| **A — corrigir agora** | Coerência interna, estrutura, referência, redação. Nenhum juízo clínico novo | corrigido |
| **B — corrigir na direção conservadora** | Toca substância, mas a correção **reduz** uma afirmação em vez de criar uma | corrigido + item H mantido aberto |
| **C — bloqueado em revisão clínica** | Exige decidir substância médica ou **adicionar** conteúdo clínico | **não corrigido**, registrado |
| **D — decisão de desenho** | Não é defeito; é tensão consciente | não corrigido, registrado |

**28 corrigidos · 18 bloqueados ou adiados · 3 sem ação necessária · 1 falso positivo.**

---

## 1. Bloqueadores

| # | Classe | Problema | Artefato | Impacto | Ação |
|---|---|---|---|---|---|
| **B1** | **crítico** | 12 campos de `dp5` afirmam achados de s4 que dependem de `dp4`; nenhuma ramificação | `key.decisionKeys.dp5.*`, `redFlags[rf2]`, `commonMistakes[1]` | Sistema cita ao estudante exame que ele não pediu. Destrói a confiança no instrumento | **A — corrigido.** Vereditos reescritos usando só achados incondicionais; menções a exame migradas para `conditionalFragments` ancorados em `findingId` |
| **B2** | **crítico** | `verdicts["dx.tep"]` usa o D-dímero, que `dp4` manda não pedir | `key.decisionKeys.dp5.verdicts["dx.tep"].feedback` | Inverte o incentivo: o caminho recompensado em dp4 é punido em dp5 | **A — corrigido.** Veredito usa só f10 e f14; a menção a f19 virou fragmento condicional |
| **B3** | **alto** | "A ausência de supra **afasta** IAMCSST" — única célula sem a ressalva "não exclui" | `key.evidenceMatrix.f16["dx.sca-csst"].why` | Ensina o erro que o objetivo 4 existe para prevenir | **B — corrigido na direção conservadora.** H6 segue aberto |
| **B4** | **crítico** | "angina instavel" como alias de `dx.sca-ssst` num caso com troponina positiva | `vocabulary.concepts["dx.sca-ssst"].aliases` | **Acerto falso silencioso** no ponto de decisão mais importante | **B — alias removido.** Criar `dx.angina-instavel` com veredito próprio depende de **H7** — não feito |
| **B5** | **alto** | `markedAs: "excludes"` é estado inexistente: a armadilha nunca dispara | `key.commonMistakes[2].triggeredWhen` | A armadilha que corresponde ao objetivo 4 está morta | **A — corrigido.** `triggeredWhen` removido; item mantido como material de feedback |
| **B6** | **crítico** | `learningObjectives` e `tags` entregam as respostas de dp2, dp3 e dp5 antes do início | `case.learningObjectives`, `case.tags` | **Anula o instrumento silenciosamente** | **A — corrigido.** Objetivos no caso viraram temáticos; os cinco explícitos migraram para `key.learningOutcomes` (fechamento); tag `vies-de-ancoragem` → `raciocinio-diagnostico` |

**Nota sobre B1:** eu havia identificado o mesmo defeito de forma independente ao mapear a jornada
do estudante ([INS-5](../../phase-1/c1-schema-findings.md)), **antes** de o relatório existir. As
duas descobertas são independentes — o red team rodou em contexto isolado desde o início. É o
primeiro dado real sobre concordância entre revisores neste projeto.

---

## 2. Relevantes

| # | Classe | Problema | Ação |
|---|---|---|---|
| R3 | **crítico** | Sem troponina, o veredito máximo é dado a uma suposição; `dados_insuficientes` é punido | **A — corrigido** junto com B1 |
| R4 | **alto** | 5 hipóteses razoáveis fora do vocabulário (pericardite, Takotsubo, IAM tipo 2, pneumotórax, vasoespástica); 4 são insinuadas pelo próprio texto | **C — bloqueado em H3.** Adicionar diferenciais é decisão clínica. **Este é o achado adiado de maior impacto** |
| R6 | **alto** | `dp3` empacota dois fatos com direções opostas (episódio recorrente × rótulo alheio) | **A — corrigido.** `f5` dividido em `f5a`/`f5b`; `dp3` aponta para `f5b` |
| R7 | **alto** | `dp1` classifica qualificadores com base em `f9`, de s2 | **A — corrigido.** Modo de instalação movido para `f1` |
| R8 | **alto** | `q.subito` e `q.lancinante` sem classificação nenhuma | **A — corrigido.** Ambos classificados |
| R9 | **alto** | `acceptableRange [0,1]` exclui a resposta que o próprio feedback chama de "defensável" | **A — corrigido** para `[0,2]` |
| R10 | **moderado** | Três representações da mesma escala sem mapeamento declarado | **A — corrigido.** `directionScale` explícito |
| R11 | **alto** | `rf2` é red flag inalcançável para quem não pediu troponina | **A — corrigido.** `requiresFindings` declarado |
| R13 | moderado | `t.angiotc` responde por dissecção e TEP com um protocolo genérico | **C — bloqueado em H5** |
| R14 | **alto** | Faltam ECG seriado e troponina seriada — os exames que materializam o objetivo 3 | **C — adiado.** Exige segunda rodada de `test-selection`: mudança de desenho, não correção |
| R16 | moderado | Troponina sem valor, e a chave cobra discriminação que só o valor permitiria | **B — corrigido na direção conservadora.** Pretensão do feedback de miocardite rebaixada; H11 aberto |
| R17 | **alto** | Miocardite não recebe nenhum negativo pertinente e é julgada assim mesmo | **C — bloqueado.** Adicionar dado sobre pródromo viral é conteúdo clínico novo. Mitigado parcialmente via R16 |
| R18 | moderado | `dp4` diz "agora" sem avisar que não haverá "depois" | **A — corrigido** no enunciado |
| R19 | moderado | Extensões declaradas no arquivo errado; extensões usadas sem declaração | **A — corrigido.** `schemaExtensions` no caso e lista completada |
| R20 | **alto** | Três números afirmados como fato a partir de fontes `search-summary-only` | **B — corrigido na direção conservadora.** Números removidos, lição preservada. H8 aberto |
| R21 | moderado | Cinco negativos resolvem o diferencial por eliminação mecânica | **D — decisão de desenho.** Registrado. Tornar um negativo ambíguo exigiria inventar achado clínico |
| R22 | **alto** | `dp1` produz feedback idêntico para todos, contra o contrato do motor | **A — corrigido.** Fragmentado por opção |
| R23 | **alto** | ECG não diagnóstico classificado como **sustentando** SCASSST | **B — corrigido** para `neutral`; a própria célula já admitia que não confirma. H6 aberto |
| R24 | **alto** | Matriz diz que a angio-TC afasta dissecção; `dp5` diz que nada a exclui | **A — corrigido** junto com B1 |
| R25 | moderado | Miocardite: crédito 0.2 em dp2, elogiada em dp5 | **A — corrigido.** Crédito 0.5 |
| R26 | **alto** | D-dímero penalizado em dp4 e creditado na matriz | **A — corrigido.** `why` de f19 reescrito |
| R1 | moderado | Nenhuma progressão do sintoma entre a queixa e a decisão | **C — bloqueado.** Decidir se persiste, cede ou piora é decisão clínica |
| R2 | moderado | Turnarounds declarados são ficção | **A — corrigido parcialmente.** Instante da reavaliação declarado em s4 |

---

## 3. Observações

**Corrigidas (13):** O2 (feedback do RX reformulado) · O4 (`rf1.findingIds` inclui f6–f8) ·
O8 (prompt de dp5 pede precisão) · O10 ("ordem de prioridade" removido) ·
O11 (`essentialMissedMessage` genérica + composição) · O12 (dp2/miocardite sem insinuar lesão
miocárdica) · O13 (`dp1.maxSelections` → 6) · O14 (`dx.dre` → `dx.drge`) · O15 ("somatizacao"
removido dos aliases) · O16b/c (aliases acrescentados; regra de normalização declarada) ·
O18 (grafia dos tiers padronizada) · O20 (`dp2.maxSelections` → 4) · O21 (labels dos subtipos
encurtados).

**Bloqueadas em revisão clínica (2):** O3 (sincronizar `differentialsToConsider` — depende de R4/H3) ·
O5 (oferecer ecocardiograma — depende de H11).

**Sem ação necessária (3):** O1 (FC 88 × 86 — o próprio relatório declara "não é defeito") ·
O6 (sinais vitais quase normais — plausível, encaminhado a H1) · O7 (SCT sinaliza o achado — inerente
ao formato; a correção é B6, já feita).

**Adiadas por decisão de desenho (2):** O9 (`f9` como negativo composto — resolvido de lado pela
correção de R7) · O19 (`dados-insuficientes` combinável com hipóteses — impacto 0.1, o feedback já
antecipa).

**Falso positivo (1):**

| # | Alegação | Por que não procede |
|---|---|---|
| **O17** | "Nenhuma fonte cobre a priorização que `dp4` faz do D-dímero e da angiotomografia" | O relatório reconhece na própria justificativa que as duas fontes marcadas `usedFor: ["testPrioritization"]` **cobrem formalmente** dp4, e que "as duas afirmações são amplamente aceitas e provavelmente corretas". O achado é sobre **granularidade de tag**, não sobre ausência de fonte — e a granularidade prometida em `data-model.md` §3 é "por afirmação clínica", não "por afirmação sobre estratégia de teste". Registro como melhoria de metadado, não como defeito de sourcing. **Nenhuma correção.** |

Um falso positivo em 50 achados. É uma taxa notavelmente baixa e vale registrar como dado sobre a
utilidade do agente.

---

## 4. Achados adiados — o que permanece errado no C1

Registro explícito, porque um caso corrigido em 28 de 50 pontos **não é um caso pronto**:

| # | O que continua quebrado | Consequência para o estudante |
|---|---|---|
| **R4** | 5 hipóteses razoáveis produzem `naoPrevisto`, 4 delas insinuadas pelo texto | O estudante que faz a leitura mais inteligente do distrator (Takotsubo) é o único sem resposta |
| **R17** | Miocardite julgada sem dado que permita discriminá-la | Posição impossível: não tem dado para manter, é repreendido por descartar |
| **R14** | Não é possível pedir ECG seriado nem curva de troponina | O objetivo 3 só pode ser aprendido de forma declarativa |
| **R1** | O caso não diz o que aconteceu com o desconforto | Decisão final sem o dado mais barato do cenário |
| **R13** | Um exame genérico responde por duas emergências | Simplificação didática não sinalizada |
| **R21** | Diferencial resolvível por eliminação mecânica | Menos tensão diagnóstica do que o caso promete |

**Os seis dependem de decisão clínica humana.** Nenhum é corrigível por engenharia de conteúdo.

---

## 5. O dado que este exercício produziu

| Métrica | Valor |
|---|---|
| Achados do red team | **50** |
| Falsos positivos | **1** (2%) |
| Corrigidos pelo autor | **28** (56%) |
| Bloqueados em revisão clínica | **11** (22%) |
| Adiados por desenho ou custo | **7** (14%) |
| Sem ação necessária | **3** (6%) |
| **Achados que exigem médico para serem resolvidos** | **11 de 22 não corrigidos** |

A última linha é a mais importante do piloto: **metade do que sobrou depende de uma pessoa que o
projeto ainda não tem** (decisão D2).
