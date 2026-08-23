# Relatório de Red Team — `cardio-001`

**Data:** 2026-08-23
**Agente:** `medical-red-team` (barreira 2 do [content-review-protocol](../../06-quality/content-review-protocol.md))
**Caso:** `cardio-001` — "Desconforto torácico agudo em homem de 54 anos"

## Artefatos revisados

| Arquivo | SHA/tamanho aproximado |
|---|---|
| `cases/c1/cardio-001.case.json` | 11.498 bytes |
| `cases/c1/cardio-001.key.json` | 23.119 bytes |
| `cases/c1/vocabulary.excerpt.json` | 3.199 bytes |

Contexto normativo consultado: `docs/03-architecture/data-model.md`,
`docs/03-architecture/evaluation-engine.md`, `docs/06-quality/content-review-protocol.md` §3.

## Declaração de independência

**Não recebi a conversa de autoria deste caso, e não a solicitei.** Revisei exclusivamente os três
JSON acima, como um revisor externo os leria: sem saber o que o autor pretendia, apenas o que o
arquivo diz. Onde o relatório afirma "a chave assume X", a afirmação é derivada do JSON, não de
intenção declarada.

**Não editei nenhum artefato.** Toda sugestão abaixo é sugestão; a correção volta para `case-authoring`.

**Não sou autoridade clínica.** A seção final lista o que não tenho autoridade para julgar.

## Sumário quantitativo

| Severidade | Nº de achados |
|---|---|
| **Bloqueador** | **6** |
| **Relevante** | **23** |
| Observação | 21 |
| **Total** | **50** |

Distribuição por categoria do checklist (um achado é contabilizado uma única vez, na categoria em
que é primariamente um defeito; achados que cruzam categorias são referenciados nas demais):

| Categoria | Bloq. | Relev. | Obs. | Achados |
|---|---|---|---|---|
| 1 · inconsistência clínica | 1 | 1 | 1 | B3, R1, O1 |
| 2 · inconsistência temporal | — | 1 | 1 | R2, O2 |
| 3 · diagnóstico incompatível com os dados | 1 | 1 | — | B1, R3 |
| 4 · diferencial ausente | — | 1 | 1 | R4, O3 |
| 5 · red flags ausentes | — | 1 | 1 | R11, O4 |
| 6 · exames incoerentes | — | 2 | 1 | R13, R14, O5 |
| 7 · valores implausíveis | — | 1 | 1 | R16, O6 |
| 8 · pistas óbvias demais | 1 | 1 | 1 | B6, R21, O7 |
| 9 · pistas insuficientes | — | 1 | — | R17 |
| 10 · ambiguidade | — | 2 | 2 | R6, R18, O8, O9 |
| 11 · problemas pedagógicos | 1 | 2 | 2 | B5, R22, R25, O10, O11 |
| 12 · informação posterior usada prematuramente | 1 | 2 | 1 | B2, R7, R8, O12 |
| 13 · avaliação injusta | — | 2 | 1 | R9, R10, O13 |
| 14 · nomenclatura | 1 | — | 3 | B4, O14, O15, O16 |
| 15 · sourcing | — | 1 | 1 | R20, O17 |
| *transversal · consistência de schema* | — | 1 | 4 | R19, O18, O19, O20, O21 |
| *dos ataques executados* | — | 3 | — | R23, R24, R26 |

Os identificadores não são contíguos (R5, R12 e R15 não existem): a numeração reflete a ordem de
descoberta, e alguns achados provisórios foram consolidados em outros durante a redação. Os 50
achados listados na tabela acima são o conjunto completo.

**Veredito da barreira 2: não passa.** Seis bloqueadores impedem publicação. O mais grave (B1) não é
detectável pela validação automática, porque a violação está em prosa e não em referência de campo.

---

## 1 · Inconsistência clínica

### B3 — A chave afirma que a ausência de supra "afasta" IAMCSST, contra o próprio objetivo do caso

```
[severidade: bloqueador]
Onde:      key.evidenceMatrix.f16["dx.sca-csst"].why
O quê:     O texto diz "A ausência de supradesnivelamento do segmento ST AFASTA o diagnóstico de
           infarto com supra de ST, que é definido eletrocardiograficamente." Linguagem de exclusão
           absoluta, a partir de um único traçado. A célula vizinha do MESMO achado
           (key.evidenceMatrix.f16["dx.sca"].why) diz o oposto sobre a mesma limitação: "a acurácia
           aumenta com traçados seriados" — isto é, um ECG isolado não encerra a questão.
Por quê:   O caso declara em case.learningObjectives[3] "Distinguir achados que reduzem a
           probabilidade de uma hipótese daqueles que a excluem". Este é o único lugar do arquivo
           inteiro onde a chave usa linguagem de exclusão sem a ressalva "sem excluí-la" que ela
           aplica religiosamente em f9, f13, f14, f18 e f19. O estudante que ler f16 aprende
           exatamente o erro que o caso existe para prevenir — e o aprende da voz de autoridade da
           própria chave. Clinicamente, um ECG inicial sem supra não exclui IAMCSST (infarto
           posterior verdadeiro, supra em evolução, bloqueio de ramo, derivações não registradas).
Sugestão:  Alinhar a redação ao padrão do resto da chave: "reduz de forma importante a
           probabilidade de IAMCSST, que é definido eletrocardiograficamente — porém um traçado
           isolado não a exclui; a caracterização depende de ECG seriado e de derivações
           adicionais." Se o autor quiser manter "contradicts" como `rel`, o `why` precisa carregar
           a ressalva. Requer confirmação clínica humana (ver seção final, item H6).
```

### R1 — Nenhuma progressão do sintoma entre a queixa e a decisão final

```
[severidade: relevante]
Onde:      case.stages[s2..s4] — ausência de achado; case.stages.s4 (nenhum finding de sintoma)
O quê:     f1/f2 estabelecem um desconforto "contínuo desde o início, sem alívio espontâneo",
           iniciado há 90 minutos. A partir daí o caso nunca mais menciona o sintoma. Em s4 —
           depois de exames com turnaround declarado de até "cerca de 2 horas" — não há um único
           achado dizendo se o desconforto persiste, cedeu, piorou ou irradiou.
Por quê:   Em dp5 o estudante compromete-se com uma hipótese principal. Dor isquêmica que persiste
           por 3–4 horas, dor que cedeu espontaneamente e dor que piorou apontam para conduta e
           urgência diferentes, e são informação que qualquer clínico teria à beira do leito. O
           caso avalia a decisão final sem fornecer o dado mais barato e mais óbvio do cenário.
           O checklist §3.A pergunta "evolução temporal faz sentido (início, duração, progressão)?"
           — aqui não há progressão nenhuma para fazer sentido.
Sugestão:  Acrescentar em s4 um finding de categoria "sintoma" declarando o estado do desconforto
           no momento da reavaliação, e decidir conscientemente se ele persiste (reforça urgência)
           ou cedeu (introduz mais uma oportunidade de falso alívio, coerente com o tema do caso).
```

### O1 — FC 88 bpm no exame físico × 86 bpm no ECG

```
[severidade: observação]
Onde:      case.stages.s3.vitals.fc ("88 bpm") × case.stages.s4.findings.f16.text ("ritmo sinusal,
           86 bpm")
O quê:     Dois valores de frequência cardíaca para o mesmo paciente, sem marcação temporal que
           explique a diferença.
Por quê:   A diferença é clinicamente irrelevante e fisiologicamente esperada entre dois momentos.
           Registro apenas porque um estudante meticuloso pode marcá-la como pegadinha e gastar
           atenção nela. Não é defeito.
Sugestão:  Nenhuma ação necessária. Se o autor quiser eliminar o ruído, usar o mesmo valor.
```

> **Categoria investigada: inconsistência clínica.** Além dos itens acima, procurei por:
> sinais vitais mutuamente incompatíveis (PA 148/92, FC 88, FR 18, SatO2 97%, Tax 36,5 °C — o
> conjunto é internamente coerente e coerente com o quadro descrito); sintoma contraditório sem
> explicação (f2 "sem relação com a movimentação ou com a respiração" × f15 "palpação não reproduz"
> — reforçam-se, não se contradizem); exame físico incompatível com a hipótese esperada (f12
> ausculta normal em SCASSST é o esperado, e a chave declara isso corretamente em
> `evidenceMatrix.f12["dx.sca"]`); antecedentes mutuamente impossíveis (f6 HAS há 10 anos aos 44
> anos, f7 ex-tabagista 20 anos-maço cessado há 3 anos, f8 pai com IAM aos 52 — todos compatíveis
> entre si e com a idade de 54 anos, e f8 satisfaz o critério de história familiar precoce);
> coerência entre `patient.context` ("chega por conta própria, acompanhado da esposa") e a
> gravidade do quadro (compatível com SCASSST, que frequentemente chega deambulando).

---

## 2 · Inconsistência temporal (interna ao caso)

### R2 — Os turnarounds declarados são ficção: s4 entrega tudo simultaneamente

```
[severidade: relevante]
Onde:      case.availableTests[*].turnaround × case.stages.s4 (etapa única, sem eixo temporal)
O quê:     Os cinco exames declaram turnarounds de "imediato" (ECG), "cerca de 30 minutos" (RX),
           "cerca de 1 hora" (troponina, D-dímero) e "cerca de 2 horas" (angiotomografia). A etapa
           s4 revela todos os resultados pedidos ao mesmo tempo, sem qualquer representação da
           passagem do tempo. Um estudante que peça ECG + angioTC recebe os dois lado a lado.
Por quê:   Três consequências pedagógicas concretas. (a) O campo `turnaround` existe justamente
           para ensinar que exame lento custa tempo em emergência — e o caso anula a lição ao não
           cobrar o custo. (b) Se de fato passaram ~2 horas, o desconforto está no seu terceiro ou
           quarto ciclo horário e um ECG seriado já teria sido feito na vida real; o caso não
           oferece essa opção (ver R14). (c) `key.decisionKeys.dp5.reflectionQuestion` pergunta "Se
           a troponina INICIAL tivesse voltado normal..." — a palavra "inicial" só faz sentido se o
           estudante estiver num ponto do tempo onde uma segunda dosagem ainda não é possível, e o
           caso não estabelece qual ponto do tempo é esse.
Sugestão:  Ou (i) declarar explicitamente em s4 o instante da reavaliação ("três horas após o
           início do desconforto") e aceitar a consequência, ou (ii) fazer o turnaround custar algo
           no motor (exame de 2h atrasa a revelação), ou (iii) remover `turnaround` se ele é
           decorativo. A opção (iii) é honesta e barata; a (i) é a mais formativa.
```

### O2 — `t.rx-torax` retorna antes de `t.troponina`, contra a ordem que o feedback prega

```
[severidade: observação]
Onde:      key.decisionKeys.dp4.tests["t.rx-torax"].feedback × case.availableTests turnarounds
O quê:     O feedback do RX diz "não deve atrasar ECG nem troponina", mas o RX tem turnaround de 30
           minutos e a troponina de 1 hora — na cronologia do próprio caso, o RX chega primeiro e
           não atrasa nada.
Por quê:   A frase é correta como princípio geral (a coleta não deve ser postergada), mas no
           cenário concreto ela adverte contra um risco que o caso não modela. Feedback que adverte
           sobre algo inexistente no cenário é ruído.
Sugestão:  Reformular para "a solicitação do RX não deve postergar a coleta da troponina nem a
           realização do ECG" — o risco real é na ordem de solicitação, não na de resultado.
```

> **Categoria investigada: inconsistência temporal.** Além dos itens acima, procurei por:
> conflito entre "há cerca de 90 minutos" (f1) e "contínuo desde o início" (f2) — coerentes;
> conflito entre o "há oito meses" de f5 e o "há oito meses" do prompt de dp3 — idênticos;
> antecedentes com datas mutuamente impossíveis (f6 dez anos, f7 três anos, f8 aos 52 anos do pai —
> nenhum conflito); ordem das etapas × ordem dos pontos de decisão (`s1→dp1,dp2`; `s2→dp3`;
> `s3→dp4`; `s4→dp5` — a sequência é monotônica e correta, cada dp cai na etapa que lhe fornece a
> informação, com a exceção documentada em B1 e R7); plausibilidade da troponina positiva em
> amostra única a ~2h de sintomas (encaminhado à revisão clínica humana, item H1).

---

## 3 · Diagnóstico esperado incompatível com os dados apresentados

### B1 — `dp5` avalia o estudante com achados que ele pode nunca ter obtido

```
[severidade: bloqueador]
Onde:      key.decisionKeys.dp5.verdicts["dx.sca-ssst"].feedback
           key.decisionKeys.dp5.verdicts["dx.sca"].feedback
           key.decisionKeys.dp5.verdicts["dx.ansiedade"].feedback
           key.decisionKeys.dp5.verdicts["dx.dre"].feedback
           key.decisionKeys.dp5.verdicts["dx.dor-musculoesqueletica"].feedback
           key.decisionKeys.dp5.verdicts["dx.dados-insuficientes"].feedback
           key.decisionKeys.dp5.verdicts["dx.dissecao-aorta"].feedback
           key.decisionKeys.dp5.verdicts["dx.tep"].feedback
           key.decisionKeys.dp5.authorReasoning
           key.decisionKeys.dp5.reflectionQuestion
           key.redFlags[rf2].findingIds
           key.commonMistakes[1].triggeredWhen.evidenceMisclassified.finding
O quê:     TODOS os cinco achados da etapa s4 (f16–f20) têm `revealedBy` — nenhum aparece sem que o
           exame correspondente tenha sido solicitado. `case.decisionPoints.dp4.maxSelections` é 3.
           Há cinco exames. Logo o estudante chega a dp5 tendo visto NO MÁXIMO 3 dos 5 achados, e
           a chave não tem uma única ramificação: doze campos de texto de dp5 afirmam, como fato
           consumado, resultados de exames que o estudante pode não ter pedido.

           Enumeração campo a campo do que cada texto pressupõe:
           - `verdicts["dx.sca-ssst"].feedback` → pressupõe f16 E f17 ("ECG sem supradesnivelamento
             e troponina acima do percentil 99").
           - `verdicts["dx.sca"].feedback` → pressupõe f16 E f17 ("Com ECG sem supradesnivelamento
             e troponina elevada, porém, é possível ser mais preciso").
           - `verdicts["dx.sca-csst"].feedback` → pressupõe f16 ("O ECG deste paciente não mostra
             supradesnivelamento").
           - `verdicts["dx.miocardite"].feedback` → pressupõe f17 ("troponina elevada indica lesão
             miocárdica").
           - `verdicts["dx.dissecao-aorta"].feedback` → pressupõe f18 ("mediastino sem alargamento")
             E f17 ("diante de troponina elevada").
           - `verdicts["dx.tep"].feedback` → pressupõe f19 ("D-dímero normal"). Ver B2.
           - `verdicts["dx.ansiedade"].feedback` → pressupõe f17 ("A elevação de troponina indica
             lesão miocárdica").
           - `verdicts["dx.dre"].feedback` → pressupõe f17 ("não produz elevação de troponina").
           - `verdicts["dx.dor-musculoesqueletica"].feedback` → pressupõe f17 ("há elevação de
             troponina").
           - `verdicts["dx.dados-insuficientes"].feedback` → pressupõe f17 ("troponina acima do
             percentil 99 tem dados suficientes").
           - `authorReasoning` → pressupõe f16 E f17.
           - `reflectionQuestion` → pressupõe que a troponina foi dosada.
           - `redFlags[rf2].findingIds = ["f17"]` → red flag inalcançável sem a troponina (ver R11).
           - `commonMistakes[1].triggeredWhen` aponta para f16 → armadilha inalcançável sem o ECG.

           Não existe nenhum campo em `dp5` que cubra o caso de f17 ausente. Não existe fallback,
           não existe variante, não existe mensagem condicional.
Por quê:   Este é o defeito central do caso e viola a regra que o próprio `data-model.md` chama de
           razão de existir da estrutura de etapas: *"findings fora de stages não existe. Todo achado
           pertence a uma etapa, o que define o que o estudante sabia em cada ponto de decisão. É o
           que impede avaliar alguém por informação que ele ainda não tinha."*

           A validação automática NÃO pega isto. A regra de CI é "nenhum achado de etapa posterior é
           referenciado por ponto de decisão de etapa anterior" — verificação de *referência de
           campo*. Aqui a violação está em *prosa*: dp5 está na etapa correta, e as strings citam
           achados condicionais que nenhum validador de schema lê. É precisamente o "defeito
           semântico que a CI não pegaria" que o §3.E do protocolo manda procurar.

           O dano ao estudante é direto e destrutivo da confiança no instrumento. Percurso concreto
           e perfeitamente permitido pela UI: um estudante pede ECG + RX + angiotomografia (3 de 3
           seleções, dentro do limite). Ele vê um ECG normal, um RX normal e uma angioTC que afasta
           dissecção e TEP. Nenhuma troponina. Ele conclui `dx.ansiedade`. O sistema responde:
           *"A elevação de troponina indica lesão miocárdica, que crise de ansiedade não produz."*
           O estudante nunca dosou troponina. Da perspectiva dele, o sistema **inventou um exame**.
           Isso aciona simultaneamente o risco N4 (estado não previsto) e o N5 (o estudante culpa o
           sistema), e contradiz frontalmente `evaluation-engine.md` §8: *"Não gera texto. Todo texto
           exibido foi escrito e revisado por um humano"* — o texto foi escrito por um humano, mas
           foi exibido num contexto onde é falso.
Sugestão:  Três caminhos, em ordem de custo crescente e de qualidade crescente:
           (a) **Fechar o buraco na estrutura**: tornar `t.ecg` e `t.troponina` obrigatórios em dp4
               (ou elevar `maxSelections` para 5 e transformar o excesso em sinal, não em bloqueio),
               garantindo que f16 e f17 estejam sempre revelados em dp5. Barato, mas destrói a lição
               de parcimônia que dp4 pretende ensinar.
           (b) **Fragmentar o feedback de dp5 por achado**, como manda `evaluation-engine.md` §5: o
               veredito carrega só a asserção que não depende de exame ("o quadro clínico e o perfil
               de risco sustentam origem isquêmica"), e as menções a ECG/troponina/RX/D-dímero
               migram para fragmentos ancorados em `f16`/`f17`/`f18`/`f19` que o motor só compõe se
               o achado foi revelado. É a arquitetura que o documento já descreve; o caso
               simplesmente não a usou em dp5.
           (c) **Declarar um veredito alternativo para a sessão sem troponina**, incluindo tornar
               `dx.dados-insuficientes` a resposta de maior crédito nesse percurso — o que é
               explicitamente previsto em `evaluation-engine.md` §4.
           Enquanto nenhuma das três for feita, o caso não pode ser publicado.
```

### R3 — Sem troponina, o diagnóstico esperado não é sustentado pelos dados que o estudante viu

```
[severidade: relevante]
Onde:      key.decisionKeys.dp5.verdicts["dx.sca-ssst"].verdict ("muito_compativel")
           key.decisionKeys.dp5.verdicts["dx.dados-insuficientes"].verdict ("pouco_compativel")
O quê:     Corolário de B1, mas com um dano próprio que merece achado separado. `dx.sca-ssst` é
           `muito_compativel` incondicionalmente. Mas "sem supradesnivelamento do segmento ST" é
           uma caracterização que exige um ECG (f16) e "síndrome coronariana aguda" com essa
           precisão exige a troponina (f17). Um estudante que não pediu nenhum dos dois — percurso
           permitido — recebe "muito_compativel" por uma hipótese que, com os dados dele, é no
           máximo uma suposição. Simetricamente, `dx.dados-insuficientes` recebe
           "pouco_compativel" com a justificativa de que "um paciente com troponina acima do
           percentil 99 tem dados suficientes" — para o estudante sem troponina, essa é
           possivelmente a resposta MAIS defensável do caso, e ele é reprovado nela.
Por quê:   Inverte o incentivo pedagógico exato que o projeto declara. `evaluation-engine.md` §4:
           "`dados_insuficientes` pode ser o veredito de maior crédito de um caso". Aqui, o
           estudante que reconhece corretamente o limite da sua própria investigação é punido, e o
           que chuta a resposta certa sem ter os dados é premiado com o veredito máximo. Isso ensina
           a adivinhar.
Sugestão:  Amarrado à correção de B1. Se o caminho (c) for adotado, `dx.dados-insuficientes` precisa
           de veredito condicional ao conjunto de exames revelados. Se o caminho (a) for adotado, o
           problema desaparece por construção.
```

> **Categoria investigada: diagnóstico esperado incompatível com os dados.** Além dos itens acima,
> procurei por: se `dx.sca-ssst` é o mais provável *dados os achados* no percurso completo (ECG +
> troponina) — sim, é defensável e bem construído; se o autor "já sabia a resposta" e escreveu os
> achados para trás — há sinal disso na simetria dos negativos pertinentes (ver R21, categoria 8),
> mas a linha causal história→exame→exame complementar é internamente correta; se algum achado
> isolado contradiz o diagnóstico esperado (f16 ECG normal é o único candidato, e a chave o trata
> corretamente como `neutral` para `dx.sca`); se a troponina isolada basta para chamar de SCASSST
> em vez de lesão miocárdica inespecífica (encaminhado à revisão clínica humana, itens H1 e H2).

---

## 4 · Diagnóstico diferencial ausente

### R4 — Cinco hipóteses clinicamente razoáveis não existem no vocabulário e produzirão `naoPrevisto`

```
[severidade: relevante]
Onde:      vocabulary.excerpt.concepts (ausências)
           key.decisionKeys.dp2.concepts (ausências)
           key.decisionKeys.dp5.verdicts (ausências)
O quê:     Levantei as hipóteses que um estudante do 4º ano razoavelmente proporia para "desconforto
           torácico retroesternal opressivo, contínuo, 90 min, em repouso, homem de 54 anos com
           fatores de risco" e depois para "troponina elevada com ECG não diagnóstico". Cinco delas
           não têm `conceptId` e portanto caem direto em `naoPrevisto` — em dp2 E em dp5:

           1. **Pericardite / miopericardite aguda.** O caso escreve, em f12, o negativo pertinente
              exato dessa hipótese ("sem sopros ou ATRITO"). O autor pensou em pericardite ao
              redigir o exame físico e não a colocou no vocabulário. Pior: com troponina elevada +
              ECG sem supra + dor contínua, miopericardite é uma hipótese *forte* em dp5, e é o
              diferencial que um bom estudante levanta justamente por não se contentar com o óbvio.
           2. **Cardiomiopatia de estresse (Takotsubo).** O caso constrói, em f4, "semanas de
              estresse intenso no trabalho, com insônia e irritabilidade" e depois entrega troponina
              elevada com ECG não diagnóstico. Esse é o retrato de manual da síndrome. O estudante
              que conecta o distrator ao achado — que é o raciocínio mais sofisticado que este caso
              permite — é o único que recebe "esta hipótese não foi analisada pelo autor". O caso
              pune a leitura mais inteligente do seu próprio distrator.
           3. **Lesão miocárdica tipo 2 / IAM tipo 2.** A própria chave abre a porta em
              `verdicts["dx.sca-ssst"].feedback`: "a caracterização definitiva como infarto tipo 1
              depende de curva de troponina e do contexto". Se a chave reconhece que tipo 1 não está
              estabelecido, o tipo 2 é a alternativa nomeada — e não existe como conceito.
           4. **Pneumotórax espontâneo.** O caso escreve o negativo em f18 ("sem pneumotórax"). Mesmo
              padrão: negativo pertinente redigido, conceito ausente.
           5. **Angina vasoespástica (Prinzmetal).** Dor em repouso, ex-tabagista, ECG sem alteração
              no momento da dor registrada. Diferencial pertinente e não representado.

           Também ausentes, com prioridade menor: pneumonia (f18 escreve "sem consolidações"),
           espasmo esofágico, úlcera péptica/dispepsia.
Por quê:   `evaluation-engine.md` §6 trata `naoPrevisto` como estado honesto, e é. Mas ele existe
           para o caso residual, não para absorver os cinco diferenciais mais óbvios do cenário. Um
           caso em que os diferenciais que o próprio texto insinua (atrito, pneumotórax, estresse
           prolongado) não são selecionáveis produz `naoPrevisto` como resultado *modal* para o
           estudante forte, e a mensagem "isso não significa que esteja errada — significa que o
           caso não a cobre" lida cinco vezes é indistinguível de um caso mal feito.

           Nota metodológica: cada um desses é, pelo desenho do próprio projeto, um item de backlog
           de autoria que o sistema contaria. Sabendo disso antes de publicar, publicar assim mesmo
           é escolher gerar o dado em vez de corrigir a causa.
Sugestão:  Mínimo para publicação: `dx.pericardite` (com alias "miopericardite") e
           `dx.takotsubo`, ambos com veredito declarado em dp5 e crédito em dp2 — são os dois que o
           próprio conteúdo do caso convoca. `dx.iam-tipo-2` é o terceiro em prioridade. Alternativa
           mais barata para os demais: remover do texto os negativos pertinentes que insinuam
           hipóteses não representadas ("sem atrito", "sem pneumotórax"), o que reduz a promessa que
           o caso faz ao estudante.
```

### O3 — `differentialsToConsider` não inclui os diferenciais que o caso insinua

```
[severidade: observação]
Onde:      key.differentialsToConsider
O quê:     A lista tem três itens (dissecção, TEP, miocardite). Os cinco de R4 não estão. A seção 6
           do feedback composto ("CONSIDERE TAMBÉM") portanto nunca menciona pericardite nem
           Takotsubo, mesmo para o estudante que não as considerou.
Por quê:   Consequência de R4, registrada separadamente porque a correção é em outro campo: mesmo
           que os conceitos entrem no vocabulário, alguém precisa lembrar de listá-los aqui.
Sugestão:  Sincronizar com a correção de R4.
```

> **Categoria investigada: diagnóstico diferencial ausente.** Além dos itens acima, procurei por:
> `cantMiss` faltante — o caso declara dois (`dx.dissecao-aorta`, `dx.tep`), que são os dois
> corretos para dor torácica aguda em PS; procurei um terceiro candidato a `cantMiss` (ruptura
> esofágica/Boerhaave — não há vômito no caso, prior baixíssima, corretamente ausente); verifiquei
> se algum conceito marcado `implausivel` é defensável (`dx.ansiedade` e
> `dx.dor-musculoesqueletica` em dp2 — ambos com crédito 0.0; a marcação é defensável *para a etapa
> s1*, e a chave explicita o motivo em cada feedback, o que é boa prática); verifiquei coerência
> entre `dp2.concepts[].cantMiss` e `differentialsToConsider[].cantMiss` — consistentes para
> dissecção e TEP.

---

## 5 · Red flags ausentes

### R11 — `rf2` é um red flag inalcançável para parte dos percursos

```
[severidade: relevante]
Onde:      key.redFlags[1] (rf2), campo findingIds: ["f17"]
O quê:     rf2 ("Elevação de troponina indicando lesão miocárdica", `critical: true`) depende
           exclusivamente de f17, que só existe se `t.troponina` foi solicitado em dp4 — onde há 3
           seleções para 5 exames. O estudante que não pediu troponina não pode, por construção,
           reconhecer este red flag.
Por quê:   `evaluation-engine.md` §7 define a dimensão "Reconhecimento de perigo" como "red flags e
           `cantMiss` identificados". O perfil final desse estudante vai reportar um red flag não
           reconhecido que ele **não tinha como reconhecer**. A contagem transparente que o projeto
           escolheu em vez de nota ("2 de 3 red flags") vira uma acusação falsa — e como não há nota
           agregada para diluir, o item aparece isolado e legível. É penalização por informação
           indisponível, a mesma classe de erro de B1.
Sugestão:  Se rf2 vai continuar, precisa de condicionalidade: ou o motor desconta do denominador os
           red flags cujos `findingIds` não foram revelados, ou rf2 é reformulado para ancorar em
           achado sempre visível. A primeira opção é regra de motor, não de conteúdo — mas é o
           conteúdo que a torna necessária, e o autor deveria registrar a dependência.
```

### O4 — `rf1.text` invoca fatores de risco que não estão nos seus `findingIds`

```
[severidade: observação]
Onde:      key.redFlags[0].text × key.redFlags[0].findingIds (["f1", "f3"])
O quê:     O texto do red flag é "Desconforto torácico prolongado em repouso, acompanhado de
           sintomas autonômicos, em paciente com MÚLTIPLOS FATORES DE RISCO CARDIOVASCULAR". Os
           fatores de risco são f6 (HAS), f7 (ex-tabagismo) e f8 (história familiar) — nenhum dos
           três está em `findingIds`, que lista apenas f1 e f3.
Por quê:   Se a UI destaca os achados que compõem um red flag, o estudante vê o texto falar em
           fatores de risco e o destaque não os inclui. É incoerência de baixo impacto, mas é
           exatamente o tipo de desalinhamento que uma revisão de conteúdo existe para pegar.
Sugestão:  Incluir f6, f7 e f8 em `findingIds`, ou remover a cláusula de fatores de risco do `text`.
           Preferir a primeira: o red flag é mais forte com eles.
```

> **Categoria investigada: red flags ausentes.** Além dos itens acima, procurei por: sinal de alarme
> presente no caso e não declarado — examinei um a um os 20 findings e os cinco sinais vitais.
> Candidatos avaliados e descartados: sudorese objetivada ao exame (f11 "sudoreico" — é a mesma
> manifestação de f3, já coberta por rf1, ainda que rf1 aponte para o relato e não para o achado
> objetivo); PA 148/92 com uso irregular de anti-hipertensivo (achado banal, corretamente não
> declarado); dor contínua há 90 minutos sem alívio (subsumida em rf1 pelo qualificador
> "prolongado"). Também procurei o inverso — red flag declarado que é achado banal: os dois
> declarados (rf1, rf2) são genuínos sinais de alarme, nenhum é trivial. Verifiquei ainda se
> dissecção e TEP deveriam ter red flag próprio: não, porque no caso os achados dessas hipóteses são
> negativos; um red flag sobre eles seria factualmente falso.

---

## 6 · Exames incoerentes com o quadro

### R13 — `t.angiotc` responde a duas perguntas incompatíveis com um único protocolo

```
[severidade: relevante]
Onde:      case.availableTests["t.angiotc"].name ("Angiotomografia de tórax")
           case.stages.s4.findings.f20.text
O quê:     f20 relata, de um único exame chamado "Angiotomografia de tórax": "sem sinais de
           dissecção aórtica E sem falhas de enchimento nas artérias pulmonares". São duas leituras
           que, na prática, dependem de fases de contraste e sincronização diferentes — angio-TC de
           aorta e angio-TC de artérias pulmonares (CTPA) são protocolos distintos. Existe protocolo
           combinado ("triple rule-out"), mas ele tem indicação restrita e não é o que o nome
           genérico "Angiotomografia de tórax" comunica.
Por quê:   O estudante aprende que existe um exame único que afasta as duas emergências vasculares
           de uma vez, e que basta pedir "angiotomografia". É simplificação que se transfere para a
           prática de forma errada — e o caso não a sinaliza como simplificação didática.
           Encaminho a substância à revisão clínica humana (item H5); o que afirmo com autoridade é
           que o nome do exame e o conteúdo do laudo não estão alinhados no JSON.
Sugestão:  Ou nomear o protocolo explicitamente ("Angiotomografia de tórax, protocolo combinado
           aorta e artérias pulmonares"), ou desmembrar em dois exames com turnarounds próprios — o
           que, de quebra, torna a lição de parcimônia de dp4 mais afiada.
```

### R14 — Faltam exatamente os exames que materializam o objetivo de aprendizagem 3

```
[severidade: relevante]
Onde:      case.availableTests (ausência de ECG seriado e de segunda dosagem de troponina)
O quê:     `case.learningObjectives[2]` é "Interpretar um ECG não diagnóstico como resultado não
           conclusivo, e não como exclusão de isquemia". A chave reforça em
           `evidenceMatrix.f16["dx.sca"].why`: "a acurácia aumenta com traçados seriados". A conduta
           que corporifica esse objetivo — repetir o ECG, repetir a troponina — não está em
           `availableTests`. O estudante só pode aprender o princípio de forma declarativa; não pode
           agir sobre ele.
Por quê:   É a diferença entre um caso *key features* e um questionário sobre um caso. O ponto de
           decisão dp4 pergunta "quais exames você solicita agora" e a resposta pedagogicamente mais
           madura no cenário — "ECG seriado e curva de troponina" — não é oferecível. O caso ensina
           uma regra e depois impede o estudante de aplicá-la, na única etapa onde aplicá-la seria
           possível.
Sugestão:  Acrescentar `t.ecg-seriado` e `t.troponina-3h` a `availableTests`, com valor "essencial"
           ou "util" em dp4 e achados correspondentes em s4. Isso também dá material para uma
           segunda rodada de dp5 mais rica, e resolve parcialmente a tensão de R2.
```

### O5 — Nenhum exame permite discriminar as causas não coronarianas de lesão miocárdica

```
[severidade: observação]
Onde:      case.availableTests (ausência de ecocardiograma, PCR, hemograma)
O quê:     Com troponina elevada e ECG não diagnóstico, o exame que discrimina SCASSST de miocardite
           e de Takotsubo é o ecocardiograma (alteração segmentar × global × padrão apical). Não
           está disponível.
Por quê:   Concentra o estudante na resposta pretendida por ausência de alternativa, não por
           raciocínio. Relacionado a R4 e R17. Mantido como observação porque um caso pode
           legitimamente restringir o arsenal — desde que a chave não cobre uma discriminação que o
           arsenal não permite (e ela cobre: ver R17).
Sugestão:  Se `dx.miocardite` vai continuar recebendo `parcialmente_compativel` com feedback que
           afirma que "o conjunto favorece origem isquêmica", oferecer o exame que sustenta essa
           afirmação.
```

> **Categoria investigada: exames incoerentes com o quadro.** Além dos itens acima, procurei por:
> exame pedido cujo resultado seria impossível dado o quadro (nenhum — os cinco laudos são
> internamente compatíveis com o cenário); laudo que afirma mais do que o exame pode afirmar (f19
> "D-dímero dentro do valor de referência" é apropriadamente qualitativo; f17 é qualitativo demais,
> ver R16); coerência entre `revealsFindings` de cada teste e o `revealedBy` do achado
> correspondente (os cinco pares casam: t.ecg↔f16, t.troponina↔f17, t.rx-torax↔f18,
> t.d-dimero↔f19, t.angiotc↔f20 — nenhuma referência quebrada); classificação de valor em dp4
> coerente com o cenário (ECG e troponina "essencial" — correto; RX "util" — defensável; D-dímero e
> angioTC "desnecessario" — encaminhado a revisão clínica humana, item H4, e problemático por outro
> motivo em B2 e R18).

---

## 7 · Valores fisiológicos suspeitos ou implausíveis para este paciente

### R16 — A troponina não tem valor, e a chave exige do estudante uma discriminação que só o valor permitiria

```
[severidade: relevante]
Onde:      case.stages.s4.findings.f17.text
           key.decisionKeys.dp5.verdicts["dx.miocardite"].feedback
O quê:     f17 diz apenas "valor acima do percentil 99 do limite superior de referência do
           laboratório". Sem número, sem unidade, sem múltiplo do percentil 99, sem delta (não há
           segunda amostra — ver R14). Uma elevação marginal e uma elevação de vinte vezes o
           percentil 99 têm significados diagnósticos muito diferentes, e o caso não diz qual é.
           Ao mesmo tempo, `verdicts["dx.miocardite"].feedback` afirma que "o conjunto — perfil de
           risco, caráter do desconforto, sintomas autonômicos — favorece origem isquêmica",
           rebaixando miocardite a `parcialmente_compativel`.
Por quê:   A chave cobra uma discriminação (isquêmica × inflamatória) usando três elementos
           clínicos que não discriminam — perfil de risco, dor opressiva e sintomas autonômicos
           ocorrem nas duas — e omite o único dado que discriminaria. O estudante que responde
           `dx.miocardite` está fazendo raciocínio correto sobre informação insuficiente e recebe
           crédito parcial com uma justificativa que não se sustenta nos dados apresentados.
           Cruzamento com categoria 13: em dp2 miocardite vale 0.2, e em dp5 a chave diz que ela
           "não deveria ser descartada sem consideração" (ver R25).
Sugestão:  Duas opções. (i) Dar um valor a f17 que torne a leitura inequívoca e que sustente a
           afirmação da chave. (ii) Manter o qualitativo e rebaixar a pretensão do feedback de
           miocardite, reconhecendo explicitamente que a discriminação exige eco e curva, que o caso
           não oferece — o que seria coerente com a honestidade epistêmica que o projeto declara.
```

### O6 — Perfil de sinais vitais quase normal em paciente com lesão miocárdica em curso

```
[severidade: observação]
Onde:      case.stages.s3.vitals
O quê:     PA 148/92, FC 88, FR 18, SatO2 97%, Tax 36,5 °C — em paciente com troponina acima do
           percentil 99 e desconforto contínuo há ~2h.
Por quê:   É plausível: SCASSST frequentemente cursa com sinais vitais preservados, e a chave
           declara corretamente em `evidenceMatrix.f12["dx.sca"]` que exame normal não afasta a
           hipótese. Registro apenas porque a normalidade total (inclusive FR 18 em paciente
           "visivelmente ansioso") é levemente conveniente para o desenho do caso — nada aqui
           empurra o estudante para nenhuma direção, o que é intencional mas não é típico.
           Não é defeito. Encaminhado a H1 junto com a questão da troponina.
Sugestão:  Nenhuma. Registro para o revisor clínico confirmar plausibilidade do conjunto.
```

> **Categoria investigada: valores fisiológicos implausíveis.** Além dos itens acima, procurei por:
> valor fora de faixa fisiológica (nenhum — todos os cinco sinais vitais estão em faixa possível);
> valor implausível *para este paciente* especificamente, considerando idade 54, HAS de dez anos com
> uso irregular de losartana e ex-tabagismo (PA 148/92 é coerente com hipertensão mal controlada, e
> não com hipertensão tratada — coerência boa); combinação impossível (FC 88 com PA 148/92 e SatO2
> 97% — sem conflito); unidades e formatação (todas corretas e no padrão brasileiro: mmHg, bpm,
> irpm, %, °C com vírgula decimal); consistência de "20 anos-maço" com a idade (compatível);
> ausência de valor numérico onde ele seria esperado (só f17 — ver R16; f19 D-dímero qualitativo é
> aceitável porque a decisão clínica é binária contra o ponto de corte).

---

## 8 · Pistas excessivamente óbvias

### B6 — `learningObjectives` e `tags` entregam as respostas de dp2, dp3 e dp5 antes do início

```
[severidade: bloqueador]
Onde:      case.learningObjectives[0..4]
           case.tags (["dor-toracica", "emergencia", "vies-de-ancoragem"])
O quê:     Os dois campos vivem no `.case.json`, que por `ADR-0007` e pela tabela §1 do
           `data-model.md` "chega ao navegador ao abrir o caso" — antes de qualquer submissão. A
           separação caso × chave protege a chave; não protege estes campos. E eles contêm, em
           texto claro, as respostas:

           - `tags[2] = "vies-de-ancoragem"` → nomeia o mecanismo do erro que dp3 existe para
             detectar. dp3 é o ponto de decisão pedagogicamente mais valioso do caso inteiro.
           - `learningObjectives[0]` "Manter síndrome coronariana aguda como hipótese prioritária
             diante de desconforto torácico em repouso com sintomas autonômicos" → é literalmente a
             resposta de dp2 (`dx.sca`, crédito 1.0), com a justificativa incluída.
           - `learningObjectives[1]` "Reconhecer que um rótulo diagnóstico atribuído em atendimento
             anterior não é evidência sobre o episódio atual" → é a paráfrase quase verbatim de
             `decisionKeys.dp3.rationale`. O estudante lê a chave de dp3 antes de ver f5.
           - `learningObjectives[2]` "Interpretar um ECG não diagnóstico como resultado não
             conclusivo, e não como exclusão de isquemia" → neutraliza `commonMistakes[1]`, a
             segunda armadilha declarada do caso.
           - `learningObjectives[4]` "Manter na lista os diagnósticos que são fatais se ignorados,
             mesmo quando pouco prováveis" → instrui o estudante a marcar os `cantMiss` em dp2.

           Quatro dos cinco pontos de decisão têm sua resposta antecipada. O quinto (dp4) é o menos
           discriminativo.
Por quê:   O caso mede raciocínio diagnóstico. Se os objetivos são exibidos antes, ele passa a medir
           leitura atenta de uma lista de objetivos. Não é um defeito de grau — é a anulação do
           instrumento. E é silencioso: o estudante responde bem, o perfil sai bom, e ninguém
           descobre que a medida não mediu nada. O checklist §3.D pergunta "as pistas são óbvias
           demais (o caso se resolve na queixa principal)?" — aqui o caso se resolve antes da queixa
           principal.

           Registro a condicionalidade honestamente: **isto depende de a UI exibir esses campos
           antes do caso**, o que não pude verificar porque não recebi a UI. Mas o ônus está do lado
           do conteúdo: nada no `data-model.md` marca `learningObjectives` ou `tags` como
           material pós-submissão, e "objetivos de aprendizagem" e "tags" são, por convenção
           universal em catálogos de conteúdo, material de vitrine. Um caso que só é válido se a UI
           esconder parte do seu próprio arquivo tem um acoplamento não declarado.
Sugestão:  Três opções, todas viáveis: (i) mover `learningObjectives` para o `.key.json`, exibindo-os
           no feedback final — que é, aliás, onde eles são pedagogicamente mais úteis (fechamento
           explícito da lição); (ii) manter no caso mas reescrevê-los em nível de tema, sem a
           resolução ("Raciocínio diagnóstico em dor torácica aguda"; "Uso de informação de
           atendimentos prévios"); (iii) declarar no `data-model.md` que ambos os campos são
           pós-submissão e garantir isso na UI. A opção (i) é a mais limpa. Em qualquer cenário,
           trocar a tag `"vies-de-ancoragem"` por algo neutro (`"raciocinio-diagnostico"`).
```

### R21 — A bateria de negativos pertinentes resolve o diferencial por eliminação mecânica

```
[severidade: relevante]
Onde:      case.stages.s2.findings.f9, f10
           case.stages.s3.findings.f13, f14, f15
O quê:     Cinco achados, todos negativos, cada um desativando exatamente um diferencial, na ordem
           em que os diferenciais aparecem na chave:
           - f9 "nega início súbito de dor de forte intensidade e nega irradiação para o dorso"
             → dissecção
           - f10 "nega dispneia súbita, imobilização prolongada, cirurgia recente ou viagem de longa
             duração" → TEP
           - f13 "pulsos radiais e femorais simétricos; PA semelhante nos dois membros"
             → dissecção (segunda vez)
           - f14 "membros inferiores sem edema, sem empastamento, sem assimetria" → TEP (segunda vez)
           - f15 "a palpação da parede torácica não reproduz o desconforto" → musculoesquelética
Por quê:   O estudante não precisa raciocinar sobre probabilidade: precisa riscar da lista. Cada
           diferencial recebe dois tiros (dissecção e TEP) ou um tiro certeiro (parede torácica), e
           nenhum negativo é ambíguo ou parcial. Isso é o oposto do que a chave prega em outros
           campos — `evidenceMatrix.f9`, `f13`, `f14` e `f18` todos advertem corretamente que esses
           achados "reduzem sem excluir". Mas a *acumulação* deles produz, na experiência do
           estudante, uma exclusão prática, e o caso perde a tensão diagnóstica que diz querer
           ensinar. Consequência direta: em dp5, `dx.dissecao-aorta` e `dx.tep` já estão mortos
           antes de qualquer exame, e a única decisão real é SCA × ansiedade — que os
           `learningObjectives` já resolveram (B6).
Sugestão:  Remover a duplicação: manter f9 OU f13 para dissecção, f10 OU f14 para TEP. Melhor
           ainda, tornar um deles genuinamente ambíguo (p. ex., uma leve assimetria de PA entre os
           membros, que reduz sem resolver) — isso obrigaria o estudante a raciocinar sobre a
           hipótese `cantMiss` em vez de riscá-la, que é a competência que `differentialsToConsider`
           declara querer treinar.
```

### O7 — `f5` é um distrator explicitado pelo próprio prompt de dp3

```
[severidade: observação]
Onde:      case.decisionPoints.dp3.prompt
O quê:     O prompt reapresenta f5 integralmente e pergunta como ele altera a probabilidade de SCA.
           Ao isolar o achado e perguntar sobre ele, o formato SCT sinaliza que o achado é
           importante e suspeito.
Por quê:   É inerente ao formato SCT e não é evitável — a literatura de SCT trabalha assim. Registro
           porque combina com B6: um estudante que leu a tag "vies-de-ancoragem" e depois vê o
           sistema destacar exatamente o achado do rótulo prévio não precisa de raciocínio nenhum.
           Isolado, o prompt de dp3 é bem construído.
Sugestão:  Nenhuma no prompt. A correção é em B6.
```

> **Categoria investigada: pistas excessivamente óbvias.** Além dos itens acima, procurei por: a
> queixa principal já entregar o diagnóstico (f1+f2 descrevem dor típica, mas sem fatores de risco
> nem sintomas autonômicos, que só vêm em s2 — a etapa s1 está corretamente calibrada e dp2 é um
> ponto de decisão legítimo); `title` revelador ("Desconforto torácico agudo em homem de 54 anos" —
> neutro, correto, não nomeia diagnóstico); `disclaimer` ou `patient.context` com vazamento (nenhum);
> nome de exame que entregue a resposta (nenhum); `estimatedMinutes` ou `difficulty` como pista
> (irrelevantes); ordenação dos conceitos em `dp2.concepts` — a chave lista `dx.sca` primeiro, mas
> a ordem de exibição na UI vem do vocabulário/autocomplete, não da chave, então não vaza.

---

## 9 · Pistas insuficientes

### R17 — Miocardite não recebe nenhum negativo pertinente, e a chave a julga mesmo assim

```
[severidade: relevante]
Onde:      case.stages (ausência de dado sobre pródromo viral, febre, PCR, ecocardiograma)
           key.decisionKeys.dp5.verdicts["dx.miocardite"] (verdict "parcialmente_compativel")
O quê:     O caso é generoso com negativos pertinentes para dissecção (f9, f13, f18), TEP (f10, f14,
           f19, f20) e dor de parede (f15). Para miocardite — que é o diferencial mais direto de
           "troponina elevada com ECG não diagnóstico" e que a chave mantém explicitamente vivo em
           `differentialsToConsider[2]` — não há **um único** dado: nada sobre quadro viral recente,
           nada sobre febre nos dias anteriores (a Tax atual de 36,5 °C não informa sobre a semana
           passada), nada de PCR, nada de eco.
Por quê:   Assimetria de informação que o estudante não pode resolver com raciocínio. Ele é levado a
           rebaixar miocardite sem base, e a chave então lhe diz que rebaixá-la totalmente teria
           sido erro ("não deveria ser descartada sem consideração"). O estudante fica numa posição
           impossível: não tem dado para manter, é repreendido por descartar. Isso é o oposto de
           "pistas insuficientes" no sentido trivial (o caso é resolvível); é insuficiência
           *seletiva*, dirigida a um diferencial específico que a chave continua cobrando.
Sugestão:  Acrescentar em s2 um achado de categoria "negativa" sobre pródromo viral e febre recente
           — barato, uma linha, e alinha miocardite ao tratamento que os outros diferenciais
           recebem. Alternativamente, oferecer o ecocardiograma em `availableTests` (ver O5).
```

> **Categoria investigada: pistas insuficientes.** Além do item acima, procurei por: se um clínico
> resolveria o caso com o que é apresentado — sim, no percurso ECG+troponina o quadro é resolvível e
> a hipótese esperada é a mais defensável; se dp1 tem base para os qualificadores esperados
> (f1 e f2 sustentam os cinco `expected` — sim, exceto pelo problema inverso documentado em R7); se
> dp2 tem base suficiente em s1 (dois achados são pouco, mas é intencional e a chave calibra os
> feedbacks para s1, o que é boa prática); se dp3 tem base (f5 é apresentado no próprio prompt —
> sim); se dp4 tem base (s1–s3 completos — sim); se falta dado demográfico ou de contexto necessário
> (peso, medicações além da losartana, alergias — nenhum é necessário para as decisões cobradas).

---

## 10 · Ambiguidade excessiva / pergunta com mais de uma leitura razoável

### R6 — `dp3` empacota dois fatos que deslocam a probabilidade em direções diferentes

```
[severidade: relevante]
Onde:      case.decisionPoints.dp3.prompt
           case.stages.s2.findings.f5.text
           key.decisionKeys.dp3.expectedDirection ("neutral")
O quê:     f5 e o prompt de dp3 contêm dois fatos distintos costurados numa frase:
           (A) **há oito meses o paciente teve um quadro semelhante** — episódio recorrente de
               desconforto torácico não explicado, em homem com fatores de risco;
           (B) **outro médico rotulou aquele episódio como crise de ansiedade**.
           São informações de naturezas diferentes. (A) é dado sobre o paciente e, lido sozinho,
           **aumenta** a suspeita (padrão recorrente não elucidado). (B) é dado sobre uma conclusão
           alheia e é **neutro** sobre o episódio de hoje. A chave declara `expectedDirection:
           "neutral"` e o `rationale` argumenta quase inteiramente sobre (B) — mencionando (A) só de
           passagem, no fim ("Se este dado desloca alguma coisa, é no sentido de manter — ou até
           aumentar — a vigilância").
Por quê:   O estudante que lê (A) como o fato relevante responde "aumenta" com raciocínio impecável.
           Ele é tratado como fora do valor esperado (embora dentro de `acceptableRange`, ver R7) e
           recebe o feedback "Defensável" — que reconhece o mérito mas não reconhece que a
           ambiguidade é do enunciado, não da resposta. Pior: como a pergunta admite duas leituras,
           dp3 deixa de medir o que quer medir (resistência à ancoragem) e passa a medir qual dos
           dois fatos o estudante privilegiou. O checklist §3.D pergunta explicitamente "alguma
           pergunta admite mais de uma leitura razoável?" — esta admite duas, e as duas são boas.
Sugestão:  Separar em dois achados e, idealmente, em dois momentos: f5a "Há oito meses procurou
           pronto-socorro por quadro semelhante" e f5b "…e recebeu alta com diagnóstico de crise de
           ansiedade". dp3 então pergunta sobre f5b especificamente, e `expectedDirection: neutral`
           passa a ser inequívoco. Bônus pedagógico: fica possível um dp adicional sobre f5a com
           direção esperada positiva, o que ensina a distinguir as duas leituras em vez de puni-las.
```

### R18 — `dp4` pergunta "agora" sem estabelecer que não haverá um "depois"

```
[severidade: relevante]
Onde:      case.decisionPoints.dp4.prompt ("Quais exames você solicita agora? Selecione até três.")
O quê:     "Agora" implica sequência: o estudante razoavelmente entende que poderá solicitar mais
           adiante, conforme os resultados. Não poderá — dp4 é o único `test-selection` do caso, e
           a escolha é definitiva e irreversível. Um estudante que raciocina em duas ondas ("peço
           ECG e RX agora; se o ECG não fechar, peço troponina") faz exatamente o que a palavra
           "agora" autoriza e perde a troponina para sempre.
Por quê:   Combinado com B1, esta é a mecânica que produz o dano concreto: o estudante entra em dp5
           sem f17 por causa de uma leitura razoável do enunciado, e recebe feedback sobre uma
           troponina inexistente. A ambiguidade do enunciado e o pressuposto da chave se somam.
           Isoladamente já seria injusto: penalizar sequenciamento — que é bom raciocínio em
           emergência — sem avisar que sequenciar não é possível.
Sugestão:  Reformular para tornar a finalidade explícita: "Selecione até três exames. Esta é sua
           única oportunidade de solicitação neste caso." Feio, mas honesto. Alternativa melhor:
           introduzir um segundo `test-selection` após os primeiros resultados, o que resolveria
           também R14 e daria ao caso a estrutura de reavaliação que ele hoje não tem.
```

### O8 — `dp5` não sinaliza a granularidade esperada

```
[severidade: observação]
Onde:      case.decisionPoints.dp5.prompt ("Qual sua hipótese diagnóstica principal?")
           key.decisionKeys.dp5.verdicts["dx.sca"] × ["dx.sca-ssst"]
O quê:     `dx.sca` recebe `compativel`; `dx.sca-ssst` recebe `muito_compativel`. A diferença entre
           os dois vereditos é só granularidade. O prompt não pede precisão máxima, e em dp2 a
           chave ensinou o contrário — que a formulação genérica era a adequada.
Por quê:   A inversão entre dp2 e dp5 é intencional e pedagogicamente boa (a precisão passa a ser
           possível depois do ECG), e o feedback de `dx.sca` explica isso bem ("é possível ser mais
           preciso"). Registro porque o estudante que responde `dx.sca` não errou nada: ele apenas
           não adivinhou que agora se pedia o subtipo. O feedback compensa; o prompt poderia evitar.
Sugestão:  "Qual sua hipótese diagnóstica principal? Use a formulação mais precisa que os dados
           permitirem."
```

### O9 — `f9` é um negativo composto cujo escopo admite três leituras

```
[severidade: observação]
Onde:      case.stages.s2.findings.f9.text
O quê:     "Nega início súbito de dor de forte intensidade e nega irradiação do desconforto para o
           dorso." A primeira metade encadeia dois atributos numa única negativa, e o escopo do
           "nega" é ambíguo: o paciente nega (a) o início súbito, (b) a forte intensidade, ou
           (c) a conjunção — isto é, a dor pode ter sido súbita mas não intensa, ou intensa mas não
           súbita, e a frase não distingue.
Por quê:   O atributo "início súbito" é exatamente o que dp1 cobra em `q.subito`/`q.insidioso`
           (achados R7 e R8), e é o descritor que mais pesa contra dissecção. Um negativo cujo
           escopo é indeterminado não resolve nem uma coisa nem outra, e o estudante não tem como
           saber qual leitura a chave adotou — ela adota a (a), conforme se deduz de
           `dp1.acceptable = ["q.insidioso"]`, mas nunca o diz.
Sugestão:  Desmembrar em duas negativas independentes, ou reformular positivamente o modo de
           instalação em f1 ("de instalação gradual ao longo de alguns minutos"), o que resolveria
           R7 e O9 de uma vez.
```

> **Categoria investigada: ambiguidade excessiva.** Além dos itens acima, procurei por: opções de
> dp1 mutuamente sobrepostas ("agudo" × "de início súbito" — sobreposição real e não resolvida pela
> chave, tratada em R7 e R8 por ser problema de cobertura antes de ser de ambiguidade; "opressivo /
> em aperto" × "retroesternal" — eixos diferentes, sem sobreposição); redação de achado com dupla
> leitura (f9 é um negativo composto — "nega início súbito DE DOR DE FORTE INTENSIDADE" pode ser
> lido como negando o início súbito, ou negando a forte intensidade, ou ambos; registrado em O9);
> `prompt` de dp2 ("em ordem de prioridade" — a chave não usa ordem em lugar nenhum, registrado em
> O10); vocabulário com conceitos indistinguíveis pelo label (`dx.sca` × `dx.sca-ssst` para quem
> digita "sindrome coronariana" — ver O21).

---

## 11 · Problemas pedagógicos

### B5 — `commonMistakes[2]` dispara em um estado que o motor não possui: a armadilha está morta

```
[severidade: bloqueador]
Onde:      key.commonMistakes[2].triggeredWhen.evidenceMisclassified.markedAs (valor: "excludes")
O quê:     `evaluation-engine.md` §3.4 define exaustivamente os estados da seleção de evidências:
           `supports | contradicts | neutral | redFlag`. **"excludes" não existe.** A UI não tem
           esse botão; a matriz não tem esse valor; a tabela de sinais derivados não o prevê. A
           condição `markedAs: "excludes"` é insatisfazível: nenhuma sessão possível a aciona.
Por quê:   `commonMistakes[2]` é "Concluir que pulsos simétricos excluem dissecção de aorta" — e a
           chave dedica a esse ponto o trecho mais elaborado do arquivo: cita o IRAD, cita os ~15%
           de déficit de pulso, e repete o argumento em `evidenceMatrix.f13` e em
           `verdicts["dx.dissecao-aorta"].feedback`. É uma das três armadilhas declaradas do caso, e
           é a única que corresponde ao objetivo de aprendizagem 4 ("Distinguir achados que reduzem
           a probabilidade daqueles que a excluem"). **Ela nunca vai disparar.** O estudante que
           comete exatamente esse erro — o erro que o caso mais quer pegar — não recebe nada.

           E o pior: o defeito é invisível na leitura casual, porque o JSON está bem-formado, o
           campo existe, o texto é excelente. Só aparece quando se confronta o valor com a lista
           fechada de estados do motor. A validação de schema pega isto **apenas se** o Zod
           declarar `markedAs` como enum dos quatro valores — se estiver como `string`, passa.
           O checklist §3.E pergunta "`commonMistakes` corresponde a algo que a chave realmente
           detecta?". Este não corresponde.
Sugestão:  O erro que se quer capturar, expresso nos estados que existem, é: o estudante marcou f13
           como `contradicts` para `dx.dissecao-aorta` **e** não incluiu `dx.dissecao-aorta` entre as
           hipóteses mantidas / escolheu-a e a descartou. Ou seja, a armadilha não é sobre o rótulo
           da evidência, é sobre a *conclusão* tirada dela — porque marcar f13 como `contradicts` é
           **correto** segundo a própria `evidenceMatrix.f13`. Isso exige reformular o
           `triggeredWhen` para uma condição composta (evidência marcada como contradizente +
           hipótese abandonada), o que provavelmente exige uma nova extensão de schema. Enquanto
           isso, a alternativa honesta é remover o `triggeredWhen` e manter o item como material do
           feedback final, não como armadilha detectada.

           Nota: verificar também se `commonMistakes[1]` sofre do mesmo mal. Ele usa
           `markedAs: "contradicts"` para f16/`dx.sca` — estado válido, condição satisfazível.
           Esse está correto (embora inalcançável sem o ECG, ver B1).
```

### R22 — `dp1` produz o mesmo feedback para todos os estudantes, contra o contrato do motor

```
[severidade: relevante]
Onde:      key.decisionKeys.dp1.feedback (string única)
O quê:     dp1 tem 14 opções e um único campo `feedback`, estático. Não há fragmento por
           qualificador, nem por qualificador omitido, nem por qualificador `misleading` marcado.
Por quê:   `evaluation-engine.md` §3.1 promete literalmente: *"sua representação contempla 3 de 4
           atributos relevantes; faltou o curso temporal"*. E §5 é categórico: *"Dois estudantes com
           a mesma hipótese final e caminhos diferentes recebem feedbacks diferentes"*. O estudante
           que marcou os cinco `expected` e o que marcou "crônico, pleurítico, aos esforços" recebem
           o **mesmo parágrafo**. Pior, o parágrafo único enumera todos os atributos corretos — ele é
           o gabarito em prosa, entregue igualmente a quem acertou e a quem errou, sem nomear o que
           faltou a cada um. É exatamente o "feedback genérico" que o risco N3 nomeia e que a
           arquitetura de fragmentos foi desenhada para evitar.
Sugestão:  Decompor em fragmentos ancorados por opção: um por `expected` omitido ("faltou a
           circunstância: o desconforto começou em repouso, e isso é o que mais eleva a suspeita de
           isquemia") e um por `misleading` marcado ("você marcou 'aos esforços'; o caso diz que o
           desconforto começou enquanto o paciente assistia televisão"). O motor então compõe a
           contagem que §3.1 promete.
```

### R25 — Sinal contraditório sobre `dx.miocardite` entre dp2 e dp5

```
[severidade: relevante]
Onde:      key.decisionKeys.dp2.concepts["dx.miocardite"].credit (0.2)
           key.decisionKeys.dp5.verdicts["dx.miocardite"].feedback
           key.differentialsToConsider[2]
O quê:     Em dp2, levantar miocardite vale 0.2 — o segundo menor crédito entre os conceitos não
           implausíveis, abaixo até de refluxo (0.3) — com o feedback "ainda que menos provável
           nesta apresentação". Em dp5, a chave diz que miocardite "permanece no diferencial de
           lesão miocárdica e **não deveria ser descartada sem consideração**", e
           `differentialsToConsider` a lista para aparecer na seção "CONSIDERE TAMBÉM" do feedback.
Por quê:   O estudante que levantou miocardite cedo — o que a chave depois declara ser o
           comportamento desejável — foi quase não creditado por isso. E o que não a levantou recebe,
           no fim, a advertência de que deveria tê-la considerado. O sinal de crédito e o sinal de
           texto apontam para lados opostos. §3.D do protocolo cobra coerência de crédito entre
           conceitos; aqui a incoerência é entre etapas do mesmo conceito.
           Comparar com o tratamento de `dx.tep`: crédito 0.6 em dp2, `cantMiss: true`, e
           `verdicts["dx.tep"].feedback` diz "Tê-lo considerado nas etapas iniciais foi correto" —
           coerente. Miocardite recebe o elogio sem o crédito.
Sugestão:  Ou elevar o crédito de miocardite em dp2 para a faixa de 0.5–0.6, coerente com o que dp5
           diz sobre ela; ou rebaixar a pretensão de dp5 e removê-la de `differentialsToConsider`.
           A primeira é mais coerente com R17 e com a estrutura de lesão miocárdica que o caso monta.
```

### O10 — `dp2` pede ordem de prioridade e a chave ignora a ordem

```
[severidade: observação]
Onde:      case.decisionPoints.dp2.prompt ("Selecione até três, em ordem de prioridade.")
           key.decisionKeys.dp2 (nenhum campo de ordem)
O quê:     O prompt pede ordenação. A chave é um mapa `conceptId → {credit, tier, feedback}` — sem
           qualquer noção de posição. O estudante que coloca `dx.ansiedade` em primeiro e `dx.sca`
           em terceiro recebe o mesmo crédito de quem faz o inverso.
Por quê:   Pedir um esforço cognitivo que não é lido é ruído, e é a espécie de detalhe que o
           estudante percebe (ele reordena, o resultado não muda) e que corrói a confiança no
           instrumento. Priorização em diferencial de dor torácica é, além disso, uma competência
           que valeria a pena medir.
Sugestão:  Remover "em ordem de prioridade" do prompt, ou introduzir crédito posicional — o que
           exigiria extensão de schema e provavelmente não vale o custo agora.
```

### O11 — `essentialMissedMessage` é única para dois exames essenciais distintos

```
[severidade: observação]
Onde:      key.decisionKeys.dp4.essentialMissedMessage
O quê:     A mensagem é "Você não solicitou um dos exames que definem a conduta inicial na dor
           torácica aguda. ECG e troponina são os dois pilares da avaliação inicial." Ela é a mesma
           para quem omitiu só o ECG, só a troponina, ou ambos.
Por quê:   Cada omissão tem significado clínico diferente (omitir o ECG é omitir o exame de 10
           minutos que triagem STEMI; omitir a troponina é omitir a detecção de lesão), e o motor
           tem a informação para distinguir. Feedback que não distingue desperdiça a única
           oportunidade de nomear o erro específico.
Sugestão:  Deixar a mensagem geral e deixar o motor compor com o `feedback` de cada teste omitido —
           os textos de `tests["t.ecg"].feedback` e `tests["t.troponina"].feedback` já existem e já
           servem para isso.
```

> **Categoria investigada: problemas pedagógicos.** Além dos itens acima, procurei por: ponto de
> decisão em passo trivial — dp5 é quase trivial no percurso completo (revelada a troponina, a
> resposta está entregue: a chave já disse em `evidenceMatrix.f17["dx.ansiedade"]` que "crise de
> ansiedade não produz lesão miocárdica"), mas mantenho como observação e não achado porque o
> subtipo SCASSST × SCA ainda exige uma decisão real; dp1, dp2, dp3 e dp4 estão em passos
> genuinamente críticos e a escolha do autor é boa — dp3 em particular é o melhor ponto de decisão
> do caso; distrator fraco — f4 (estresse) e f5 (rótulo prévio) são distratores fortes e bem
> construídos, e `isDistractor` está corretamente marcado nos dois, satisfazendo a regra de CI;
> feedback que só declara veredito — varri os 9 vereditos de dp5, os 10 conceitos de dp2, os 5
> testes de dp4 e as 5 direções de dp3: **todos** explicam o porquê, o que é qualidade acima da
> média e merece registro positivo; ausência de `reflectionQuestion` (presente e boa, embora
> dependente da troponina — ver B1).

---

## 12 · Informação posterior usada prematuramente

> **Esta é a categoria que a tarefa marca como mais crítica. Percorri campo a campo cada
> `decisionKey`, confrontando o texto com o conjunto de achados disponíveis na etapa em que o ponto
> de decisão aparece.** O mapa de disponibilidade que usei:
>
> | Ponto | Etapa | Achados disponíveis |
> |---|---|---|
> | dp1, dp2 | s1 | f1, f2 |
> | dp3 | s2 | f1–f10 |
> | dp4 | s3 | f1–f15 |
> | dp5 | s4 | f1–f15 + **no máximo 3** de {f16, f17, f18, f19, f20} |

### B1 — (ver categoria 3) `dp5` cita achados condicionais como se fossem certos

Achado completo em §3. É primariamente um achado desta categoria: doze campos de `dp5` afirmam
achados de s4 que dependem de `dp4`, sem qualquer condicionalidade. Contabilizado uma vez, em §3.

### B2 — `verdicts["dx.tep"].feedback` usa o resultado de um exame que `dp4` manda não pedir

```
[severidade: bloqueador]
Onde:      key.decisionKeys.dp5.verdicts["dx.tep"].feedback
           key.decisionKeys.dp4.tests["t.d-dimero"].value ("desnecessario")
O quê:     dp4 classifica o D-dímero como **desnecessário** e justifica com rigor: "Sem achados que
           sustentem probabilidade pré-teste relevante de tromboembolismo, o D-dímero tende a gerar
           investigação em cascata sem alterar a conduta imediata." Duas telas depois, dp5 justifica
           o veredito de TEP assim: "Ausência de dispneia súbita, ausência de fatores de risco
           tromboembólicos, membros inferiores sem alterações **e D-dímero normal** tornam TEP pouco
           provável."

           O D-dímero normal é f19, revelado apenas por `t.d-dimero`. O estudante que seguiu
           corretamente a orientação da própria chave — não pediu o D-dímero — recebe um feedback que
           cita o resultado do D-dímero. E o estudante que desobedeceu recebe, em dp4, uma repreensão
           por ter pedido o exame cujo resultado a chave depois usa como pilar do seu raciocínio.
Por quê:   Isto vai além de B1: não é só informação que o estudante pode não ter — é informação que
           a chave **instruiu o estudante a não obter** e depois usou contra ele. A contradição é
           interna à mesma chave, entre dois pontos de decisão consecutivos, e inverte o incentivo:
           o caminho recompensado em dp4 é o caminho punido em dp5. Um estudante atento percebe e
           conclui, corretamente, que o gabarito não foi verificado contra si mesmo — e a partir daí
           não confia em nenhum outro feedback do caso.

           O mesmo padrão, com severidade menor, atinge `verdicts["dx.dissecao-aorta"].feedback`, que
           cita "mediastino sem alargamento" (f18, do RX que dp4 classifica apenas como "util" e que
           o estudante pode não ter pedido).
Sugestão:  Reescrever `verdicts["dx.tep"].feedback` usando apenas os achados incondicionais (f10,
           f14) — que já bastam: "Ausência de dispneia súbita, ausência de fatores de risco
           tromboembólicos e membros inferiores sem alterações tornam TEP pouco provável." A menção
           ao D-dímero migra para um fragmento ancorado em f19, exibido só a quem o pediu — onde,
           aliás, ela é pedagogicamente ótima ("o exame que você pediu confirmou o que a clínica já
           indicava; note que ele não mudou sua conduta"). Mesmo tratamento para f18 no feedback de
           dissecção.
```

### R7 — A chave de `dp1` classifica qualificadores com base em um achado da etapa seguinte

```
[severidade: relevante]
Onde:      key.decisionKeys.dp1.acceptable (["q.insidioso"])
           key.decisionKeys.dp1.misleading (contém "q.migratorio")
           case.stages.s2.findings.f9
O quê:     dp1 está em s1, onde o estudante tem apenas f1 e f2. Nenhum dos dois diz nada sobre a
           velocidade de instalação do desconforto nem sobre migração da dor. f1 diz "iniciado há
           cerca de 90 minutos enquanto o paciente assistia televisão"; f2 diz "contínuo desde o
           início, sem alívio espontâneo e sem relação com a movimentação ou com a respiração".

           A chave, mesmo assim:
           - marca **`q.insidioso` como `acceptable`**. A única base possível para isso é f9 ("nega
             início súbito de dor de forte intensidade") — que está em **s2**.
           - marca **`q.migratorio` como `misleading`**. A única base possível é a segunda metade de
             f9 ("nega irradiação do desconforto para o dorso") — também **s2**, e ainda assim
             imperfeita, porque irradiação e migração não são a mesma coisa.
Por quê:   A regra de CI ("nenhum achado de etapa posterior é referenciado por ponto de decisão de
           etapa anterior") não pega isto, porque a dependência é semântica: dp1 não *referencia* f9
           por id, apenas o *pressupõe*. É o mesmo mecanismo de B1, aplicado a um ponto de menor
           consequência. O estudante em s1 não tem como saber se o início foi súbito ou insidioso — e
           é julgado numa dimensão sobre a qual não recebeu dado.
Sugestão:  Ou mover para s1 a informação sobre a instalação do desconforto (uma cláusula em f1
           resolveria: "…de instalação gradual ao longo de alguns minutos"), ou remover `q.insidioso`
           de `acceptable` e `q.migratorio` de `misleading`, deixando ambos como não classificados —
           mas ver R8, que mostra que "não classificado" também é um problema.
```

### R8 — `dp1` deixa duas opções sem classificação nenhuma, incluindo a mais provável de ser marcada

```
[severidade: relevante]
Onde:      key.decisionKeys.dp1 (expected + acceptable + misleading cobrem 12 das 14 opções)
           case.decisionPoints.dp1.options["q.subito"], ["q.lancinante"]
O quê:     Contagem: `expected` tem 5 (agudo, contínuo, opressivo, retroesternal, em-repouso),
           `acceptable` tem 1 (insidioso), `misleading` tem 6 (crônico, pleurítico, aos-esforços,
           migratório, localizado-parede, intermitente). Total 12. `options` tem 14.
           **Não classificados: `q.subito` e `q.lancinante`.**

           `q.subito` ("de início súbito") é, provavelmente, o qualificador que mais estudantes
           marcarão: dor torácica aguda em repouso, iniciada em um momento identificável, é
           naturalmente descrita como súbita. Ele cai num vazio: não é esperado, não é aceitável,
           não é enganoso. `q.lancinante` é o descritor clássico de dissecção aórtica — marcar isso
           num paciente cuja dor é "em aperto" é um erro de representação que merecia ser nomeado,
           e é o erro que alimentaria diretamente a discussão de `cantMiss` do caso.
Por quê:   Duas consequências. (a) O motor não tem o que fazer com essas seleções — a chave não
           define comportamento, e o resultado depende de implementação não especificada (silêncio?
           tratado como neutro? erro?). Estado indefinido em conteúdo é o que a barreira 2 existe
           para pegar. (b) Pedagogicamente, o caso desperdiça `q.lancinante`: era a oportunidade de
           conectar a representação do problema ao diferencial de dissecção, e ela passa em branco.
Sugestão:  Classificar as duas. `q.subito` é o caso interessante: dada a ambiguidade documentada em
           R7, o mais defensável é `acceptable` (e possivelmente remover `q.insidioso`, ou manter
           os dois como aceitáveis, reconhecendo que s1 não decide a questão). `q.lancinante`
           pertence a `misleading`, com fragmento explicando por que o descritor importa.
```

### O12 — `dp2.concepts["dx.miocardite"].feedback` fala de "lesão miocárdica" antes de qualquer troponina

```
[severidade: observação]
Onde:      key.decisionKeys.dp2.concepts["dx.miocardite"].feedback
O quê:     O texto é "Hipótese pertinente para dor torácica com **possível lesão miocárdica**, ainda
           que menos provável nesta apresentação." Em s1 não há troponina e nada no caso sugere lesão
           miocárdica.
Por quê:   Está na fronteira: "possível" torna a frase um raciocínio a priori sobre a categoria de
           hipótese, não uma citação de achado — e nesse sentido é legítimo. Registro porque, lida
           por um estudante em s1, a frase insinua que lesão miocárdica está em jogo, o que é uma
           dica sobre o que os exames vão mostrar. Contraste com o rigor exemplar dos feedbacks de
           `dx.sca-csst` e `dx.sca-ssst` no mesmo dp2, que dizem explicitamente "nesta etapa ainda
           não há ECG" — a chave sabe fazer isso e fez, em quase todos os campos.
Sugestão:  "Hipótese pertinente entre as causas cardíacas de dor torácica, ainda que menos provável
           nesta apresentação."
```

> **Categoria investigada: informação posterior usada prematuramente.** Registro o que verifiquei e
> passou, porque a maior parte da chave está correta neste quesito e o autor claramente teve o
> cuidado em mente:
> - **dp2, todos os 10 conceitos:** `dx.sca` cita apenas f1/f2; `dx.sca-csst` e `dx.sca-ssst` dizem
>   explicitamente "nesta etapa ainda não há ECG" (exemplar); `dx.dissecao-aorta` e `dx.tep` são
>   argumentos a priori sobre `cantMiss`, sem citar achado; `dx.dre` cita "quadro agudo iniciado em
>   repouso" (f1, s1 ✓); `dx.ansiedade` diz "nesta etapa, nada no caso ainda sugere ansiedade" —
>   **verificado e correto**, f4/f5/f11 são de s2/s3; `dx.dor-musculoesqueletica` cita "iniciado em
>   repouso, contínuo e sem relação com movimentação ou respiração" (f1+f2, s1 ✓) e, notavelmente,
>   **não** cita f15 (palpação, s3), que teria sido o argumento fácil — restrição correta;
>   `dx.dados-insuficientes` não cita achado. **Um único problema (O12).**
> - **dp3, `rationale` e as 5 direções de `feedbackByDirection`:** citam f5 (s2 ✓) e "paciente com
>   fatores de risco" (f6–f8, s2 ✓). O argumento sobre pânico e prevalência de DAC é literatura, não
>   achado. **Nenhum vazamento.**
> - **dp4, os 5 testes:** `t.d-dimero` justifica-se por "sem achados que sustentem probabilidade
>   pré-teste relevante" (f10, f14 — s2/s3 ✓); `t.angiotc` por "não há achados sustentando suspeita
>   de dissecção ou TEP" (f9, f13, f10, f14 ✓); `t.rx-torax` por triagem de mediastino (a priori);
>   `t.ecg` e `t.troponina` são argumentos de protocolo. **Nenhum vazamento** — dp4 é a chave mais
>   limpa do arquivo neste quesito.
> - **`evidenceMatrix`:** por construção não pode vazar, porque cada célula é ancorada num achado e
>   o motor só compõe fragmentos de achados revelados (`evaluation-engine.md` §5, seções 3 e 4).
>   Verificado que nenhuma célula cita um achado *diferente* daquele a que pertence — exceto
>   `f16["dx.sca"].why`, que menciona "traçados seriados" (conduta, não achado do caso: aceitável).
> - **`redFlags`:** rf1 ancora em f1/f3 (s1/s2 ✓, embora o texto extrapole — O4); rf2 ancora em f17
>   (condicional — R11).

---

## 13 · Avaliação injusta

### R9 — `dp3`: a faixa aceitável exclui uma resposta que o próprio feedback chama de defensável

```
[severidade: relevante]
Onde:      key.decisionKeys.dp3.acceptableRange ([0, 1])
           key.decisionKeys.dp3.feedbackByDirection["aumenta_muito"]
O quê:     A escala do formato SCT é −2…+2 (`evaluation-engine.md` §3.3), e `feedbackByDirection`
           confirma cinco níveis: `diminui_muito` (−2), `diminui` (−1), `neutro` (0), `aumenta` (+1),
           `aumenta_muito` (+2). `acceptableRange` é `[0, 1]` — portanto **+2 está fora da faixa
           aceitável**. Mas o texto de `feedbackByDirection["aumenta_muito"]` diz: *"**Defensável**
           na direção, ainda que forte na intensidade: o dado sozinho não confirma nada, mas
           certamente não é motivo para reduzir a suspeita."*

           O estudante lê "defensável" e é contabilizado como fora do esperado.
Por quê:   Contradição direta entre o texto exibido e a regra de correção, dentro do mesmo objeto.
           E é a contradição que mais dói, porque nega o próprio princípio declarado do formato:
           §3.3 diz "correção pela **direção**, não pelo valor exato — intensidade sem painel de
           especialistas não tem como ser calibrada, e fingir que tem seria fraude metodológica".
           Ao cortar em +1, a chave corrige exatamente pela intensidade que o documento diz não ser
           calibrável. O estudante é penalizado por uma diferença de grau que o projeto declara não
           saber medir.
Sugestão:  `acceptableRange: [0, 2]`, coerente com o texto do feedback e com §3.3. Se o autor
           genuinamente quer sinalizar excesso de intensidade, o lugar disso é o texto do fragmento
           (já está lá: "ainda que forte na intensidade"), não a faixa de aceitação.
```

### R10 — `dp3`: representação numérica e representação por rótulo convivem sem mapeamento declarado

```
[severidade: relevante]
Onde:      key.decisionKeys.dp3.acceptableRange (números) × key.decisionKeys.dp3.feedbackByDirection
           (rótulos) × key.decisionKeys.dp3.expectedDirection ("neutral", terceira representação)
O quê:     Três vocabulários para a mesma dimensão no mesmo objeto: `expectedDirection` usa a string
           `"neutral"` (em inglês); `acceptableRange` usa inteiros; `feedbackByDirection` usa chaves
           em português (`neutro`, `aumenta`…). O mapeamento rótulo↔inteiro não está declarado em
           lugar nenhum — nem na chave, nem no `data-model.md`, nem no `evaluation-engine.md`, nem
           na extensão `EXT-3-feedback-by-direction` (que é só um nome numa lista, sem
           especificação disponível).
Por quê:   O motor precisa saber que `"aumenta_muito"` é +2 para escolher o fragmento. Como não há
           declaração, a associação fica implícita na implementação — e uma inversão silenciosa
           (p. ex., ordem alfabética das chaves) faria o estudante que respondeu "diminui muito"
           receber o elogio destinado a quem respondeu "aumenta muito". É o tipo de defeito que
           passa em todo teste que use a mesma suposição do código.
           Também é o que impede verificar R9 de forma conclusiva a partir do conteúdo: eu infiro o
           mapeamento pela ordem e pela semântica, não porque esteja escrito.
Sugestão:  Declarar o mapeamento explicitamente — chaves numéricas (`"-2"`, `"-1"`, `"0"`, `"1"`,
           `"2"`) ou um campo `directionScale` no objeto. E unificar a língua: `expectedDirection:
           "neutral"` deveria ser `"neutro"` para casar com `feedbackByDirection`.
```

### O13 — `dp1`: cinco `expected` para `maxSelections: 5` produz tolerância zero

```
[severidade: observação]
Onde:      case.decisionPoints.dp1.maxSelections (5)
           key.decisionKeys.dp1.expected (5 itens)
O quê:     Só existe uma seleção que contempla os cinco atributos esperados: exatamente esses cinco.
           Qualquer qualificador adicional defensável — `q.subito`, que a chave nem classifica (R8),
           ou `q.insidioso`, que ela chama de `acceptable` — consome uma das cinco vagas e
           necessariamente derruba um `expected`.
Por quê:   `evaluation-engine.md` §3.1 diz que o resultado de `problem-representation` é "nunca
           errado" e se expressa como contagem ("3 de 4 atributos relevantes"). A contagem continua
           funcionando, então o dano é menor do que parece. Mas o estudante que marca um aceitável
           é matematicamente impedido de atingir 5/5, e a chave não sinaliza esse trade-off em lugar
           nenhum. Mantenho como observação, não relevante, porque a arquitetura de contagem absorve
           boa parte do problema.
Sugestão:  `maxSelections: 6`, ou reduzir `expected` a 4 promovendo o quinto a `acceptable`.
```

> **Categoria investigada: avaliação injusta.** Além dos itens acima, procurei por: crédito
> incoerente entre conceitos em dp2 — `dx.dissecao-aorta` 0.7 e `dx.tep` 0.6, ambos `cantMiss`, sem
> justificativa declarada para a diferença (defensável: dissecção tem prior maior neste quadro, e a
> diferença é pequena; não faço achado); `dx.dre` 0.3 acima de `dx.miocardite` 0.2 (incoerente com
> dp5 — tratado em R25); penalização por listar conceito implausível (verifiquei: `credit: 0.0`, e o
> motor por §3.2 não subtrai — correto, e o feedback de `dx.ansiedade` diz explicitamente
> "considerá-la não é erro", o que é exemplar); `dx.sca` 1.0 em dp2 mas só `compativel` em dp5
> (a inversão é intencional, explicada e pedagogicamente correta — ver O8); bloqueio de excedente em
> dp2 (`maxSelections: 3` com 2 `cantMiss` + 1 esperada = exatamente 3, o que é apertado mas
> factível e força uma priorização legítima); `minExpected: 2` (satisfazível de várias formas —
> justo). Achados desta categoria que estão contabilizados em outras seções por serem primariamente
> de lá: B1, B2, R3, R11, R18.

---

## 14 · Problemas de nomenclatura

### B4 — "angina instável" é alias de um conceito que recebe `muito_compativel` num caso com troponina positiva

```
[severidade: bloqueador]
Onde:      vocabulary.concepts["dx.sca-ssst"].aliases (contém "angina instavel")
           key.decisionKeys.dp5.verdicts["dx.sca-ssst"].verdict ("muito_compativel")
           case.stages.s4.findings.f17
O quê:     O vocabulário coloca **"angina instavel"** como alias de `dx.sca-ssst`, ao lado de
           "NSTEMI", "IAM sem supra" e "IAMSSST". Mas angina instável e IAM sem supra de ST são
           entidades distintas, e o critério que as separa é exatamente a troponina: **angina
           instável é, por definição, síndrome coronariana aguda sem elevação de biomarcador de
           necrose.** Este caso tem, em f17, troponina acima do percentil 99.

           Consequência mecânica: o estudante digita "angina instável", o autocomplete o resolve
           para `dx.sca-ssst`, e o motor devolve `muito_compativel` — o veredito máximo do caso —
           para uma resposta que, com os dados apresentados, está clinicamente incorreta. Ele nunca
           saberá. O feedback que ele recebe ("quadro clínico compatível… e troponina acima do
           percentil 99") vai *confirmar* o erro dele, porque descreve a troponina elevada como se
           sustentasse a resposta que ele deu.
Por quê:   O vocabulário controlado é a fundação da correção determinística (ADR-0008). Um alias
           incorreto não produz um erro visível — produz um **acerto falso**, silencioso, no ponto de
           decisão mais importante do caso. É o pior tipo de defeito de conteúdo: não gera reclamação,
           gera aprendizado errado. E a distinção angina instável × IAMSSST não é sutileza acadêmica:
           é a distinção que o próprio caso passa cinco etapas construindo, e é o que dá sentido a
           `verdicts["dx.sca"].feedback` ("Precisão diagnóstica muda a conduta").

           Agravante: `dx.sca` já tem o alias "angina instavel ou infarto", o que sugere que o autor
           tinha consciência de que angina instável é um subconjunto de SCA — e mesmo assim a
           colocou dentro do ramo sem supra.
Por quê2:  Nota de escopo: afirmo com segurança a **incoerência interna** (o vocabulário atribui a um
           conceito um alias cuja definição é incompatível com um achado do caso). A questão de qual
           é a taxonomia canônica correta está encaminhada à revisão clínica humana, item H7.
Sugestão:  Remover "angina instavel" dos aliases de `dx.sca-ssst`. Se angina instável precisa ser
           selecionável — e provavelmente precisa, porque é hipótese razoável *antes* da troponina —
           ela merece `conceptId` próprio (`dx.angina-instavel`), com crédito em dp2 e veredito
           próprio em dp5 (`incompativel` ou `pouco_compativel`, dada a troponina elevada, com
           feedback que ensine exatamente esta distinção). Isso transformaria o defeito no melhor
           momento pedagógico do caso.
```

### O14 — `dx.dre`: o identificador usa uma sigla que não é a corrente

```
[severidade: observação]
Onde:      vocabulary.concepts[7].id ("dx.dre")
O quê:     O label é "Doença do refluxo gastroesofágico", cuja sigla corrente em português é
           **DRGE** — e o próprio conceito lista "DRGE" como primeiro alias. O `id` é `dx.dre`.
Por quê:   `id` é referenciado em 8 lugares entre a chave e a matriz de evidências, e o
           `data-model.md` estabelece que "o mesmo diagnóstico tenha o mesmo `id` em todos" os
           casos — ou seja, este id vai propagar por todo o catálogo. Corrigir agora custa um
           `find/replace`; corrigir depois de 8 casos custa uma migração. Além disso, "DRE" tem
           outro significado corrente em contexto clínico brasileiro, o que torna o id ambíguo para
           quem lê o JSON.
Sugestão:  Renomear para `dx.drge` antes que outros casos referenciem o id.
```

### O15 — `dx.ansiedade` agrupa três construtos distintos sob um único conceito

```
[severidade: observação]
Onde:      vocabulary.concepts["dx.ansiedade"].label + .aliases
O quê:     O label é "Transtorno de ansiedade / crise de pânico" e os aliases incluem "ansiedade",
           "crise de ansiedade", "sindrome do panico", "ataque de panico", "transtorno de panico" e
           **"somatizacao"**. São pelo menos três entidades diferentes: transtorno de ansiedade
           generalizada (crônico), ataque de pânico (episódico agudo) e transtorno de somatização
           (outro eixo inteiro).
Por quê:   O caso julga esse conceito com precisão — `implausivel` em dp2, `incompativel` em dp5 —
           mas o conceito não é preciso. E a argumentação da chave depende da distinção: o
           `rationale` de dp3 apoia-se em literatura sobre **transtorno de pânico** especificamente
           ("transtorno de pânico associa-se a maior prevalência de doença arterial coronariana"),
           enquanto f5 fala em "crise de ansiedade" e o conceito absorve as duas coisas. O argumento
           mais sofisticado do caso repousa sobre uma distinção que o vocabulário apaga.
Sugestão:  Separar `dx.transtorno-ansiedade` de `dx.ataque-panico`, no mínimo. Remover "somatizacao"
           dos aliases em qualquer cenário — é um construto distinto e merece conceito próprio ou
           nenhum.
```

### O16 — "costocondrite" como alias de uma categoria, e outras imprecisões menores de alias

```
[severidade: observação]
Onde:      vocabulary.concepts["dx.dor-musculoesqueletica"].aliases (contém "costocondrite")
           vocabulary.concepts (aliases ausentes, listados abaixo)
O quê:     (a) "Costocondrite" é um diagnóstico específico (inflamação das articulações
           costocondrais, com dor reprodutível à palpação), não um sinônimo da categoria "dor
           torácica musculoesquelética". Um estudante que digita "costocondrite" está fazendo uma
           afirmação mais forte do que a que o conceito representa.
           (b) Aliases correntes ausentes, que travariam o autocomplete (o `data-model.md` §2 é
           explícito: "`aliases` é requisito funcional, não conveniência… toda sigla de uso corrente
           entra"): `dx.dissecao-aorta` não tem "sindrome aortica aguda" nem "DAA";
           `dx.sca-csst` não tem "supra de ST"; `dx.miocardite` não tem "miopericardite" (o que é
           consequência de R4, já que pericardite não existe como conceito); `dx.tep` não tem
           "tromboembolismo pulmonar agudo".
           (c) Labels são acentuadas, aliases são sistematicamente sem acento ("isquemia miocardica
           aguda", "disseccao de aorta"). A regra de normalização que faz os dois casarem não está
           declarada em nenhum documento.
Por quê:   Cada alias faltante é uma interação travada que o estudante atribui ao sistema (risco N5
           nomeado no `data-model.md`). (a) é imprecisão de conteúdo; (c) é acoplamento implícito com
           a implementação do autocomplete.
Sugestão:  Remover "costocondrite" ou promovê-la a conceito próprio; acrescentar os aliases
           listados; declarar a regra de normalização (provavelmente: casefold + remoção de
           diacríticos) no `data-model.md` §2.
```

> **Categoria investigada: nomenclatura.** Além dos itens acima, procurei por: unicidade global de
> aliases, que o `data-model.md` §6 exige — verifiquei os 10 conceitos par a par e **não encontrei
> colisão exata**; a quase-colisão "angina instavel ou infarto" (`dx.sca`) × "angina instavel"
> (`dx.sca-ssst`) passa na regra literal mas é uma armadilha de autocomplete por prefixo, e cai em
> B4 de qualquer forma. Verifiquei siglas: IAMCSST, IAMSSST, STEMI, NSTEMI, SCA, TEP, DRGE — todas
> corretas e corretamente atribuídas. Verifiquei termos clínicos no texto do caso: "20 anos-maço"
> (correto), "percentil 99 do limite superior de referência" (formulação correta), "troponina I
> ultrassensível" (uso brasileiro corrente; o termo técnico é "alta sensibilidade", mas
> "ultrassensível" é aceito), "bulhas rítmicas e normofonéticas" (correto), "empastamento de
> panturrilhas" (correto), "ECG de 12 derivações" (correto). Verifiquei `label` de
> `dx.dados-insuficientes` contra o `data-model.md` §2 ("Não há dados suficientes para sustentar uma
> hipótese" × "Não há dados suficientes para uma hipótese") — divergência trivial de redação,
> registro sem achado. Verifiquei a nomenclatura de `t.angiotc` — problema real, contabilizado em
> R13 (categoria 6).

---

## 15 · Sourcing

### R20 — Números específicos são afirmados como fato a partir de fontes que o próprio arquivo declara não ter lido

```
[severidade: relevante]
Onde:      key.evidenceMatrix.f16["dx.sca"].why ("cerca de 8% dos pacientes com infarto apresentam
             ECG normal")
           key.evidenceMatrix.f13["dx.dissecao-aorta"].why ("déficit de pulso esteve presente em
             apenas cerca de 15% dos pacientes")
           key.decisionKeys.dp5.verdicts["dx.dissecao-aorta"].feedback (repete os ~15%)
           key.commonMistakes[2].why (repete os ~15%)
           key.evidenceMatrix.f18["dx.dissecao-aorta"].why ("em parcela relevante dos pacientes")
           case.sources[*].readingLevel (todos: "search-summary-only")
O quê:     A chave faz três afirmações quantitativas e as usa como pilares argumentativos —
           os ~15% do IRAD aparecem **três vezes**, em três campos diferentes, e são a base de uma
           das três armadilhas declaradas do caso. Ao mesmo tempo, **todas as cinco fontes** trazem
           `readingLevel: "search-summary-only"`, isto é, o próprio arquivo declara que nenhuma foi
           lida além do resumo de busca.

           Problemas específicos, em ordem de gravidade:
           (a) Um número citado três vezes como fundamento pedagógico, derivado de resumo de busca,
               não tem lastro verificado. Se os ~15% estiverem errados, três campos ficam errados
               simultaneamente e a armadilha inteira perde a base.
           (b) "em parcela relevante dos pacientes" (f18) não é um número — é uma vaguidade com
               aparência de citação. Ou o dado existe e deve ser dado, ou a afirmação deve ser
               formulada sem invocar o registro.
           (c) O `usedFor` da fonte do IRAD é `["differentialDiagnosis", "educationalFeedback"]` —
               nenhuma das duas tags rastreia uma **estatística de prevalência de achado**. A
               rastreabilidade por afirmação que `usedFor` promete não cobre o uso real que a chave
               faz da fonte.
           (d) A afirmação de dp3 ("transtorno de pânico associa-se a maior prevalência de doença
               arterial coronariana") mapeia para a fonte PubMed 20372755, com `usedFor:
               ["distractorDesign", "educationalFeedback"]` — de novo, nenhuma tag epidemiológica,
               e é uma afirmação de associação populacional sustentando o argumento central de dp3.
           (e) `readingLevel` não é campo previsto no `data-model.md` §3 e não está declarado em
               `schemaExtensions` (ver R19). Ele é honesto e útil — mas, sendo não declarado, um
               validador de CI ou uma leitura futura pode simplesmente ignorá-lo.
Por quê:   O protocolo abre dizendo que "o que estiver no JSON é o que o estudante lê como verdade"
           e que este documento "é a única coisa entre um erro de autoria e um estudante aprendendo
           algo errado". Números com casa decimal implícita, repetidos, atribuídos a um registro
           internacional nomeado, carregam autoridade desproporcional à verificação que receberam.
           O campo `readingLevel` é uma boa prática de honestidade — e é justamente ele que torna
           este achado obrigatório, porque documenta que a verificação não aconteceu.
Sugestão:  Antes da publicação, um humano abre as fontes e confirma os três números. Se confirmados,
           `readingLevel` sobe para o nível correspondente e as afirmações ficam. Se não puderem ser
           confirmados, reformular sem número ("déficit de pulso está ausente na maioria dos
           pacientes com dissecção" preserva integralmente a lição e não afirma o que não se
           verificou). Acrescentar a `usedFor` uma tag como `"epidemiology"` ou
           `"findingPrevalence"` para os usos (c) e (d). Encaminhado à revisão humana, item H8.
```

### O17 — Nenhuma fonte cobre a priorização que `dp4` faz do D-dímero e da angiotomografia

```
[severidade: observação]
Onde:      key.decisionKeys.dp4.tests["t.d-dimero"].feedback
           key.decisionKeys.dp4.tests["t.angiotc"].feedback
           case.sources[*].usedFor
O quê:     Duas fontes declaram `usedFor: ["testPrioritization"]` (SBC 2021 e AHA/ACC 2021), o que
           formalmente cobre dp4. Mas a afirmação específica — que D-dímero em paciente de baixa
           probabilidade "é fonte conhecida de falso-positivo" e "tende a gerar investigação em
           cascata" — é uma afirmação sobre desempenho de teste e sobre consequência de conduta, e
           nenhuma fonte é marcada para isso. O mesmo para "angiotomografia não é primeira linha
           neste cenário".
Por quê:   As duas afirmações são amplamente aceitas e provavelmente corretas; não estou
           contestando a substância. Registro porque a granularidade de `usedFor` promete
           rastreabilidade "por afirmação" (`data-model.md` §3) e aqui a promessa não se cumpre —
           duas das afirmações mais prescritivas do caso não têm âncora específica.
Sugestão:  Verificar se as diretrizes citadas de fato tratam do ponto e, se sim, nada muda além de
           uma nota. Se não, adicionar fonte específica sobre estratégia diagnóstica em TEP
           (regra de decisão + D-dímero ajustado).
```

> **Categoria investigada: sourcing.** Além dos itens acima, procurei por: afirmação clínica em
> feedback sem nenhuma fonte correspondente — varri os 9 vereditos de dp5, os 10 conceitos de dp2,
> as 5 direções de dp3, os 5 testes de dp4 e as 24 células de `evidenceMatrix`; as afirmações
> substantivas mapeiam plausivelmente para as cinco fontes declaradas, com as lacunas de
> granularidade documentadas acima. Verifiquei a estrutura de cada entrada de `sources` contra o
> `data-model.md` §3: as cinco têm `title`, `organization`, `year`, `url` e `usedFor` — completas.
> Notei que `sources[3].organization` é **"PubMed 20372755"**, que é um identificador de registro e
> não uma organização (o campo deveria trazer o periódico); registro sem achado separado por ser
> trivial. Notei que `sources[2]` é datada de 2026 com DOI `10.3389/fcvm.2026.1835982` — plausível
> na data de hoje, mas não verificável por mim; encaminhado ao item H9. Não verifiquei a
> acessibilidade de nenhuma URL — está fora do meu papel e é requisito de CI para
> `reviewStatus: "approved"`.

---

## Achados transversais de consistência de schema

Não pertencem a nenhuma das 15 categorias, mas bloqueariam a CI ou a leitura futura.

### R19 — Extensões de schema declaradas no arquivo errado, e extensões usadas sem declaração

```
[severidade: relevante]
Onde:      key.schemaExtensions (["EXT-1…", "EXT-2…", "EXT-3…", "EXT-4…", "EXT-7…"])
           case.* (nenhum campo schemaExtensions)
O quê:     Quatro problemas encadeados:
           (a) `case.authoring.reviewStatus` vale **"pending_human_review"**, que não pertence ao
               enum do `data-model.md` §3 (`draft | reviewed | approved`). A extensão que autoriza
               isso — `EXT-2-review-status-pending` — está declarada no **`.key.json`**, mas o campo
               está no **`.case.json`**, que não declara extensão nenhuma. Se o schema Zod do caso
               tiver o enum fechado, o merge é bloqueado por um campo cuja licença está em outro
               arquivo.
           (b) `case.decisionPoints.dp1.options[]` é a extensão `EXT-4-inline-qualifier-options` —
               mesma situação: declarada na chave, usada no caso.
           (c) `case.sources[*].readingLevel` e `case.authoring.aiAssisted` não são previstos no
               `data-model.md` e **não estão declarados em nenhuma extensão**, nem na chave.
           (d) A numeração `EXT-1, 2, 3, 4, 7` pula 5 e 6. Ou duas extensões existem em outro lugar
               do projeto, ou a lista está incompleta. E há features usadas na chave que não
               correspondem a nenhum EXT listado: `decisionKeys.dp1.feedback`,
               `decisionKeys.dp4.excessMessage`, `decisionKeys.dp5.verdicts[*].feedback` (o
               `data-model.md` §4 mostra `verdicts` com apenas o campo `verdict`) e
               `differentialsToConsider[*].cantMiss`.
Por quê:   O mecanismo de extensão existe para tornar auditável o que se afastou do modelo. Aqui ele
           está parcialmente preenchido, o que é pior do que não existir: dá a impressão de que o
           desvio foi controlado quando metade dele não foi registrada. E o item (a) é um bloqueio
           de CI plausível e imediato.
Sugestão:  Acrescentar `schemaExtensions` ao `.case.json` listando EXT-2 e EXT-4; registrar as
           extensões faltantes para `readingLevel`, `aiAssisted`, `dp1.feedback`,
           `dp4.excessMessage`, `verdicts[*].feedback` e `differentialsToConsider[*].cantMiss`;
           esclarecer EXT-5 e EXT-6.
```

### O18 — Tiers grafados sem acento e um tier do motor nunca usado

```
[severidade: observação]
Onde:      key.decisionKeys.dp2.concepts[*].tier ("esperada", "aceitavel", "implausivel")
O quê:     O `evaluation-engine.md` §3.2 define os tiers como `'esperada' | 'aceitável' |
           'perigosa-omissão' | 'implausível'` — com acento. A chave usa as formas sem acento. Além
           disso, **nenhum conceito do caso usa `perigosa-omissão`**, embora dois conceitos sejam
           `cantMiss: true`.
Por quê:   A grafia é problema de igualdade de string, que quebra silenciosamente ou exige
           normalização não declarada. O tier não usado é escolha legítima (o flag `cantMiss` cobre
           a função), mas vale confirmar se `perigosa-omissão` e `cantMiss` são a mesma coisa
           expressa de duas formas — se forem, uma delas é redundante e deveria sair do modelo.
Sugestão:  Padronizar a grafia num dos dois lados. Decidir a relação entre `perigosa-omissão` e
           `cantMiss` e documentá-la.
```

### O19 — `dp2` permite combinar `dx.dados-insuficientes` com hipóteses específicas

```
[severidade: observação]
Onde:      key.decisionKeys.dp2.concepts["dx.dados-insuficientes"] (credit 0.1, tier "aceitavel")
           case.decisionPoints.dp2.maxSelections (3)
O quê:     Nada impede a seleção `{dx.sca, dx.dissecao-aorta, dx.dados-insuficientes}` — "minhas
           hipóteses são SCA, dissecção, e não há dados suficientes para uma hipótese". É
           semanticamente contraditório e rende 0.1 de crédito extra.
Por quê:   Impacto pequeno (0.1), mas é um estado sem sentido que o motor aceita e credita. O
           feedback do conceito é bem escrito e antecipa parcialmente a questão ("levantar
           possibilidades não é o mesmo que concluir"), o que sugere que o autor viu o problema e
           optou por resolvê-lo com texto.
Sugestão:  Tornar `dx.dados-insuficientes` mutuamente exclusivo com outros conceitos em pontos de
           `hypothesis-list`, na UI ou como regra de chave.
```

### O20 — `dp2.maxSelections: 3` torna impossível a resposta que a chave premia integralmente

```
[severidade: observação]
Onde:      case.decisionPoints.dp2.maxSelections (3) × key.decisionKeys.dp2.concepts
O quê:     A chave premia `dx.sca` (1.0, esperada) e marca `dx.dissecao-aorta` e `dx.tep` como
           `cantMiss`. São exatamente três, e o limite é três. Portanto a única seleção que evita
           qualquer sinalização de omissão é precisamente `{dx.sca, dx.dissecao-aorta, dx.tep}` — e
           qualquer outra hipótese razoável (miocardite, DRGE, ou as cinco de R4) força o estudante a
           abrir mão de um `cantMiss` e a receber por isso a sinalização de omissão de perigo.
Por quê:   O limite converte um exercício de amplitude do diferencial numa escolha forçada, e a
           dimensão "Amplitude do diferencial" do perfil (§7) mede algo que o teto de 3 já
           determinou. Registro como observação porque o aperto é intencional em `key features` e
           força priorização — mas o autor deveria saber que a resposta ótima é única.
Sugestão:  `maxSelections: 4` daria folga para uma hipótese própria do estudante sem custo em
           `cantMiss`. Ou aceitar conscientemente o desenho e registrar a decisão.
```

### O21 — Autocomplete ambíguo entre `dx.sca` e seus dois filhos

```
[severidade: observação]
Onde:      vocabulary.concepts["dx.sca"], ["dx.sca-ssst"], ["dx.sca-csst"]
O quê:     Os três labels começam com "Síndrome coronariana aguda". Quem digita "sindrome
           coronariana" recebe três resultados quase idênticos, distinguíveis apenas pelo sufixo. O
           campo `parentConcept` existe nos dois filhos, mas nada indica que a UI o use para
           agrupar ou desambiguar.
Por quê:   Em dp2 a chave dá 1.0 ao genérico e 0.6 aos específicos; em dp5 ela dá `compativel` ao
           genérico e `muito_compativel` a um específico. A diferença de crédito entre três itens
           visualmente quase idênticos numa lista de autocomplete é uma fonte de erro de seleção,
           não de raciocínio.
Sugestão:  Explorar `parentConcept` na apresentação (hierarquia visível), ou encurtar os labels dos
           filhos ("…**com** supra de ST" / "…**sem** supra de ST" com destaque).
```

---

## Ataques executados

### Ataque 1 — Resolver o caso como um estudante fraco

Percorri o caso interpretando um estudante que ancora no distrator e não tem disciplina de
diferencial.

| Ponto | O que ele faz | A chave detecta? |
|---|---|---|
| dp1 | Marca `agudo, subito, continuo, opressivo, retroesternal` | **Parcialmente.** Acerta 4 dos 5 `expected`; `q.subito` não tem classificação (R8) e ocupou a vaga de `em-repouso`, que é o qualificador que a própria chave diz ser o mais importante. O feedback estático (R22) não vai dizer a ele que faltou justamente esse. |
| dp2 | `dx.ansiedade`, `dx.dor-musculoesqueletica`, `dx.dre` | **Sim, bem.** 0.0 + 0.0 + 0.3, `minExpected: 2` não satisfeito, dois `cantMiss` omitidos sinalizados. Este é o melhor momento da chave. |
| dp3 | Responde `diminui_muito` | **Sim, excelente.** O fragmento correspondente é o melhor texto do arquivo: nomeia a ancoragem e explica o mecanismo sem humilhar. |
| dp4 | Pede RX, D-dímero, angioTC (evita os "invasivos", segue o próprio diferencial errado) | **Sim.** `essentialMissedMessage` dispara; `excessMessage` dispara. Correto. |
| dp5 | Vê RX normal, D-dímero normal, angioTC normal. Nenhum ECG, nenhuma troponina. Conclui `dx.ansiedade` | **Falha catastroficamente.** Recebe: *"A elevação de troponina indica lesão miocárdica, que crise de ansiedade não produz."* **Ele nunca dosou troponina.** |

**Onde ele cai:** exatamente onde o caso quer que ele caia — em dp3 e dp5, ancorado no rótulo prévio.
A chave detecta a queda em dp1 (mal), dp2 (bem), dp3 (excelente) e dp4 (bem).

**Onde a chave falha:** no ponto final e mais importante. O feedback que deveria fechar a lição cita
um exame inexistente na sessão dele. Além disso, a segunda armadilha declarada do caso
(`commonMistakes[1]`, sobre interpretar o ECG como exclusão) **não pode disparar**, porque ele não
pediu ECG; e a terceira (`commonMistakes[2]`, pulsos e dissecção) **nunca dispara para ninguém**,
por B5. Das três armadilhas declaradas, o estudante fraco aciona **uma**.

Observação adicional: o percurso dele — três exames "desnecessários" ou "úteis" e nenhum essencial —
é o pior percurso possível e é perfeitamente permitido. O caso não tem nenhum mecanismo que force o
ECG, o exame que ele mesmo declara dever ser feito "nos primeiros minutos do atendimento".

### Ataque 2 — Hipóteses razoáveis fora do vocabulário e da chave

Levantei sistematicamente o que um estudante do 4º ano proporia. Cada linha é um `naoPrevisto`
garantido, em dp2 **e** em dp5.

| Hipótese | Por que ele a proporia | O caso a insinua? |
|---|---|---|
| Pericardite / miopericardite | Dor contínua, troponina elevada, ECG sem supra | **Sim** — f12 escreve "sem atrito", o negativo pertinente da pericardite |
| Cardiomiopatia de estresse (Takotsubo) | f4 dá semanas de estresse; f17 dá troponina elevada; f16 dá ECG não diagnóstico | **Sim** — é a leitura mais inteligente do distrator central do caso |
| Lesão miocárdica tipo 2 / IAM tipo 2 | Troponina elevada sem critério de tipo 1 estabelecido | **Sim** — a própria chave escreve "a caracterização definitiva como infarto tipo 1 depende de curva de troponina" |
| Pneumotórax espontâneo | Dor torácica aguda em ex-tabagista | **Sim** — f18 escreve "sem pneumotórax" |
| Angina vasoespástica (Prinzmetal) | Dor em repouso, ex-tabagista, ECG normal entre episódios | Não |
| Pneumonia | Diferencial de rotina em dor torácica | **Sim** — f18 escreve "sem consolidações" |
| Espasmo esofágico | Dor retroesternal opressiva não relacionada a esforço | Parcialmente (via `dx.dre`) |
| Úlcera péptica / dispepsia | Dor epigástrica-retroesternal com náusea (f3) | Não |

**Oito hipóteses, das quais quatro são explicitamente insinuadas pelo texto do próprio caso.** O
caso escreve o negativo pertinente e depois não deixa o estudante nomear a hipótese que o negativo
afasta — que é a forma mais frustrante possível de encontrar um `naoPrevisto`. Achado em R4.

### Ataque 3 — Ler só o feedback, sem o caso

Li os textos de feedback isoladamente, como o estudante os recebe.

**Sustentam-se sozinhos e bem:** todos os cinco fragmentos de `dp3.feedbackByDirection` (o melhor
conjunto do arquivo — cada um nomeia o raciocínio, não o veredito); os cinco de `dp4.tests`; os dez
de `dp2.concepts`; `dp1.feedback` (embora estático, R22); `dp5.verdicts["dx.sca-csst"].feedback`.

**Não se sustentam — citam achado que o estudante pode não ter visto:** dez dos campos de dp5,
enumerados em B1. Destaco os dois piores:

- `verdicts["dx.dre"].feedback`: *"Refluxo gastroesofágico não produz elevação de troponina e não
  explica o conjunto de achados."* Para quem não dosou troponina, esta frase é sobre um exame
  inexistente e a segunda metade ("o conjunto de achados") não especifica nada. O fragmento inteiro
  não informa.
- `reflectionQuestion`: *"Se a troponina inicial tivesse voltado normal, o que mudaria na sua
  conduta?"* Para quem não pediu troponina, a pergunta é ininteligível — e ela é o último texto que
  o estudante lê no caso.

**Citam conduta em vez de raciocínio:** `dp4.tests["t.ecg"].feedback` ("deve ser realizado nos
primeiros minutos do atendimento") é prescritivo, mas em registro educacional e sem dose nem
terapêutica. Aceitável. Nenhum feedback do arquivo prescreve tratamento, dose ou prognóstico, e o
`disclaimer` é explícito e bem redigido. **A dimensão F do protocolo (linguagem e segurança) está
limpa** — registro aqui porque não é uma das 15 categorias mas faz parte do checklist §3.

### Ataque 4 — "Exclui" onde deveria ser "reduz", e vice-versa

Este é o eixo do caso e a chave acerta quase sempre. Varri todas as 24 células de `evidenceMatrix` e
os 9 vereditos de dp5 procurando linguagem de exclusão indevida.

**Corretos, com a ressalva explícita (padrão exemplar):** f9 ("reduz… mas não a exclui"); f10
("reduz… sem excluí-la"); f13 ("simetria de pulsos NÃO exclui dissecção aórtica"); f14 ("reduz…
sem excluí-lo"); f18 ("radiografia normal não exclui dissecção"); f19 ("reduz de forma
importante"); f16/`dx.sca` ("O exame reduz a probabilidade; não encerra a investigação");
`verdicts["dx.dissecao-aorta"]` ("nenhum deles exclui formalmente a hipótese").

**Incorretos ou tensos:**

1. **`f16["dx.sca-csst"].why` — "afasta o diagnóstico".** Exclusão absoluta a partir de um traçado
   único, e é a única célula do arquivo sem ressalva. **Achado B3.**
2. **`f20["dx.dissecao-aorta"].why` — "afasta a hipótese com alto grau de confiança".** Aqui a
   linguagem forte é provavelmente correta (angio-TC é o padrão), mas cria a contradição do Ataque 5.
3. **`f16["dx.sca-ssst"].rel = "supports"` — o problema inverso.** A ausência de supra é um
   critério **definicional** do rótulo, não evidência *a favor* de isquemia. A própria célula
   admite: "embora isoladamente não confirme isquemia". Classificar um ECG não diagnóstico como
   `supports` ensina o estudante a marcar como sustentação um achado que não sustenta — que é
   exatamente a "superinterpretação" que `evaluation-engine.md` §3.4 lista como sinal de erro. A
   chave produz, ela mesma, o erro que o motor foi desenhado para detectar. **Achado R23, abaixo.**

#### R23 — Um ECG não diagnóstico é classificado como sustentando SCASSST

```
[severidade: relevante]
Onde:      key.evidenceMatrix.f16["dx.sca-ssst"].rel (valor "supports")
O quê:     Um ECG sem supradesnivelamento é classificado como sustentando SCASSST. A ausência de
           supra é condição definicional do rótulo "sem supra", não evidência de isquemia — e o
           `why` da própria célula reconhece isso ("embora isoladamente não confirme isquemia").
Por quê:   Se o estudante marca f16 como "sustenta" para a hipótese que ele escolheu, o motor
           registra "reconhecimento correto do padrão"; se ele marca como "neutro" — que é a leitura
           epistemicamente mais rigorosa, e a que a chave adota para `dx.sca` na célula vizinha —
           registra "ponto cego". O estudante mais cuidadoso é o punido, num achado que o caso
           declara ser "o mais mal interpretado do caso".
Sugestão:  Reclassificar como `neutral` com o `why` explicando a diferença entre critério
           definicional e evidência, que é uma distinção que vale a pena ensinar; ou manter
           `supports` e reescrever o `why` para justificar por que é sustentação e não definição.
           Requer decisão do autor e confirmação clínica (item H6).
```

### Ataque 5 — Contradições entre `evidenceMatrix` e os textos de `decisionKeys`

Cruzei cada célula da matriz com cada campo de texto das chaves. Quatro contradições:

**(1) f20 × `verdicts["dx.dissecao-aorta"].feedback`** — a mais nítida.
- Matriz: *"Angiotomografia sem sinais de dissecção **afasta a hipótese com alto grau de
  confiança**."*
- dp5: *"Os achados reduzem bastante a probabilidade — ausência de início súbito e de irradiação
  dorsal, pulsos simétricos, mediastino sem alargamento. Repare, porém, que **nenhum deles exclui
  formalmente a hipótese**."*

O feedback de dp5 enumera três achados e **omite f20**, e então generaliza para "nenhum deles". Para
o estudante que pediu a angiotomografia, a afirmação é falsa: ele tem em mãos justamente o achado
que a matriz diz afastar a hipótese com alto grau de confiança. A lição pretendida ("reduz ≠ exclui")
é ensinada com um exemplo que o próprio caso refuta.

#### R24 — A matriz diz que a angio-TC afasta dissecção; `dp5` diz que nada a exclui

```
[severidade: relevante]
Onde:      key.evidenceMatrix.f20["dx.dissecao-aorta"].why
           × key.decisionKeys.dp5.verdicts["dx.dissecao-aorta"].feedback
O quê:     A matriz diz que a angio-TC afasta dissecção com alto grau de confiança; o feedback de
           dp5 afirma que nenhum achado do caso a exclui formalmente, sem mencionar a angio-TC.
Por quê:   Contradição direta entre dois campos da mesma chave, exibidos ao mesmo estudante na mesma
           tela de feedback (a matriz alimenta as seções 3 e 4 do feedback composto; o veredito
           alimenta a seção 1). O estudante lê os dois e não pode conciliá-los.
Sugestão:  Condicionar a frase de dp5: a generalização "nenhum deles exclui" vale para os achados
           clínicos e para o RX, e deve ser dita sobre eles. Se a angio-TC foi feita, o fragmento
           correspondente deve reconhecê-lo. É a mesma correção estrutural de B1 (fragmentos
           ancorados em achado, não veredito monolítico).
```

**(2) f20 × `verdicts["dx.tep"].verdict`** — mesma mecânica.
A matriz diz que a angio-TC "afasta tromboembolismo pulmonar com alto grau de confiança"; o veredito
de dp5 para `dx.tep` é `pouco_compativel`. Para o estudante que fez a angio-TC, `incompativel` seria
o veredito correto. O veredito é estático e não pode ramificar — mesma raiz que B1. Contabilizado
junto com (1) acima.

**(3) `f19` × `dp4.tests["t.d-dimero"]`** — contradição de incentivo, não de fato.

#### R26 — O D-dímero é penalizado em `dp4` e creditado na `evidenceMatrix`

```
[severidade: relevante]
Onde:      key.evidenceMatrix.f19["dx.tep"].why × key.decisionKeys.dp4.tests["t.d-dimero"].value
O quê:     A matriz credita o D-dímero como achado que "reduz de forma importante a probabilidade de
           TEP em paciente com baixa probabilidade pré-teste". dp4 classifica pedi-lo como
           `desnecessario`, precisamente porque a probabilidade pré-teste é baixa.
Por quê:   O estudante que pediu o D-dímero é penalizado em dp4 e depois **recompensado** em dp5:
           ele tem um achado a mais para classificar corretamente na seleção de evidências, o que
           melhora sua dimensão "Ancoragem em evidência" (§7). O caminho punido produz melhor
           perfil. Combinado com B2 (onde a chave usa o D-dímero no feedback de quem não o pediu), o
           tratamento do D-dímero é incoerente nos três pontos em que ele aparece.
Sugestão:  Decidir uma posição e mantê-la nos três campos. Se o D-dímero é desnecessário, o `why` de
           f19 deve dizer o que o exame de fato ensina neste caso — "confirmou o que a clínica já
           indicava e não alterou a conduta" — em vez de creditá-lo como redutor de probabilidade.
```

**(4) `f3["dx.ansiedade"] = "supports"` × `dp2.concepts["dx.ansiedade"].feedback`** — verificado e
**não é contradição.** A matriz diz que náusea e sudorese sustentam ansiedade; dp2 diz "nesta etapa,
nada no caso ainda sugere ansiedade". Parecem incompatíveis, mas f3 pertence a s2 e dp2 está em s1:
no momento de dp2, o estudante de fato não tem f3. A chave está correta e o cuidado é notável.
Registro como verificação que passou.

---

## Requer revisão clínica humana

Não tenho autoridade para julgar os itens abaixo. Cada um envolve substância médica, não coerência
interna. Encaminho ao revisor clínico (decisão D2) — nenhum deles deve ser resolvido pelo agente de
autoria sozinho.

| # | Questão | Campo | Por que preciso de um médico |
|---|---|---|---|
| **H1** | Uma troponina I ultrassensível acima do percentil 99 em **amostra única**, colhida a ~2h do início dos sintomas, com ECG inteiramente normal e sinais vitais preservados — é apresentação plausível de SCASSST neste paciente? | `case.stages.s4.findings.f17`, `case.stages.s3.vitals` | Plausibilidade de cinética de biomarcador. Relacionado a R16 e O6. |
| **H2** | `muito_compativel` para `dx.sca-ssst` é defensável **sem curva de troponina**, dado que a própria chave escreve que "a caracterização definitiva como infarto tipo 1 depende de curva de troponina e do contexto"? | `key.decisionKeys.dp5.verdicts["dx.sca-ssst"].verdict` | O veredito máximo é atribuído a uma conclusão que o próprio texto qualifica como não definitiva. |
| **H3** | Pericardite/miopericardite e cardiomiopatia de estresse devem ser diferenciais **obrigatórios** neste quadro (troponina elevada + ECG não diagnóstico + contexto de estresse prolongado)? Algum deles chega a ser `cantMiss`? | `vocabulary.concepts`, `key.differentialsToConsider` | Define se R4 é relevante ou bloqueador. Miopericardite com derrame pode ser tempo-dependente. |
| **H4** | D-dímero e angiotomografia merecem `desnecessario`, ou algum deles é `util` / `inadequado` neste cenário? A justificativa de cascata diagnóstica está correta? | `key.decisionKeys.dp4.tests["t.d-dimero"]`, `["t.angiotc"]` | Julgamento de estratégia diagnóstica. Afeta B2 e R18. |
| **H5** | Um exame nomeado "Angiotomografia de tórax" pode legitimamente responder simultaneamente por dissecção aórtica e por TEP, ou o caso está descrevendo um protocolo combinado sem nomeá-lo? | `case.availableTests["t.angiotc"]`, `case.stages.s4.findings.f20` | Substância de protocolo de imagem. Achado R13. |
| **H6** | A ausência de supradesnivelamento em um ECG único **afasta** IAMCSST, ou apenas reduz a probabilidade? E um ECG não diagnóstico **sustenta** SCASSST, ou é neutro? | `key.evidenceMatrix.f16["dx.sca-csst"]`, `f16["dx.sca-ssst"]` | As duas afirmações mais centrais do caso. Achados B3 e R23. |
| **H7** | "Angina instável" pode figurar como alias de `dx.sca-ssst` num caso com troponina positiva? Qual é a taxonomia canônica a adotar no vocabulário compartilhado? | `vocabulary.concepts["dx.sca-ssst"].aliases` | Achado B4. A decisão propaga para todo o catálogo futuro. |
| **H8** | Os três números afirmados estão corretos e sustentados pelas fontes citadas? (a) "cerca de 8% dos pacientes com infarto apresentam ECG normal"; (b) "déficit de pulso em cerca de 15% dos pacientes do IRAD"; (c) RX de tórax normal "em parcela relevante" dos pacientes do IRAD. | `key.evidenceMatrix.f16["dx.sca"]`, `f13`, `f18`; `key.commonMistakes[2]` | Todas as fontes estão marcadas `readingLevel: "search-summary-only"`. Achado R20. |
| **H9** | As cinco URLs existem, resolvem e sustentam o que `usedFor` declara? Em especial `sources[2]` (Frontiers 2026, DOI `10.3389/fcvm.2026.1835982`) e `sources[3]` (cuja `organization` é um PMID, não um periódico). | `case.sources[*]` | Não verifiquei acessibilidade de URL — fora do meu papel, e requisito de CI para `approved`. |
| **H10** | A afirmação de que "transtorno de pânico associa-se a maior prevalência de doença arterial coronariana" sustenta o argumento de dp3 na força com que é usada? | `key.decisionKeys.dp3.rationale`, `key.evidenceMatrix.f5["dx.sca"]` | É o pilar do ponto de decisão pedagogicamente mais importante do caso, apoiado numa fonte de 2010 lida em resumo. |
| **H11** | A discriminação SCASSST × miocardite é possível com os dados que o caso oferece? Se não, o veredito `parcialmente_compativel` para miocardite é justo? | `key.decisionKeys.dp5.verdicts["dx.miocardite"]` | Achados R16 e R17. Nenhum dado de pródromo viral, PCR ou ecocardiograma. |

---

## Nota final

O caso tem qualidade acima da média em vários eixos que costumam falhar: os feedbacks explicam o
porquê em praticamente todos os campos; a disciplina "reduz ≠ exclui" é aplicada com rigor em seis
dos sete lugares onde importa; a calibração por etapa em `dp2`, `dp3` e `dp4` é cuidadosa e
verificável campo a campo; os distratores são fortes e honestos; e `dp3` é um ponto de decisão
genuinamente bem construído. O `readingLevel` nas fontes é uma prática de honestidade que eu
gostaria de ver em mais casos — e foi o que tornou possível o achado R20.

O que o derruba é estrutural, não de redação: **a chave de `dp5` foi escrita para um único percurso —
o estudante que pede ECG e troponina — enquanto `dp4` autoriza dezenas.** Dez campos de texto e dois
mecanismos de detecção pressupõem achados condicionais. Nenhuma validação automática pega isso,
porque a dependência está em prosa. Corrigido esse eixo (B1, B2, R3, R11), a maior parte dos demais
achados relevantes vira trabalho de acabamento.

Os outros quatro bloqueadores são independentes e cada um se corrige isoladamente: B3 (uma frase),
B4 (um alias), B5 (um valor de campo), B6 (mover ou reescrever dois campos).

**Este relatório não aprova o caso.** `redTeamPassedAt` deve permanecer `null` até que os seis
bloqueadores sejam resolvidos e os onze itens de revisão clínica sejam respondidos por um humano
com autoridade para tanto.
