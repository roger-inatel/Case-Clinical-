# pneumo-001 — revisão adversarial

**Data:** 2026-08-23 · **Caso:** `pneumo-001` — "Tosse com febre e piora da falta de ar em mulher de 62 anos"

> ## ⚠️ Esta revisão NÃO substitui o red team
>
> O CLAUDE.md §6 exige que o `medical-red-team` receba **o JSON, não a conversa que o gerou**, e que
> quem escreve o caso **não o aprove**. Aqui as duas coisas foram violadas: esta revisão foi feita
> por quem autorou o caso, na mesma sessão, com o raciocínio da autoria ainda em memória. Ela pega
> defeito mecânico; ela **não** pega o defeito que a autoria não enxergou por construção — que é
> justamente o que um red team independente existe para achar.
>
> Por isso `authoring.redTeamPassedAt` permanece `null` e o caso **não pode** ser marcado como
> `approved`. Ele entra no catálogo como `pending_human_review`, que é o que ele é.

---

## 1. O que foi verificado automaticamente

`tests/content/content.test.ts` roda sobre todo caso do catálogo e bloqueia merge. Para este caso,
passaram as 18 verificações, entre elas:

| Verificação | Resultado |
|---|---|
| Achados com id único; toda chave com ponto de decisão e vice-versa | ok |
| Exames e achados condicionais casam nos dois sentidos | ok |
| Toda célula da `evidenceMatrix` aponta para achado e conceito existentes | ok |
| **Regra temporal** — nenhum ponto de decisão referencia achado de etapa posterior | ok (`dp3` → `f6`, ambos em `s2`) |
| Red flag ancorado em achado condicional declara `requiresFindings` | ok (nenhum dos dois é condicional) |
| **Regressão B1** — veredito não afirma resultado de exame sem `requiresFindings` | ok |
| `requiresFindings` implica `verdictWhenMissing` | ok (`dx.pac`, `dx.dados-insuficientes`) |
| Distrator, red flag, `cantMiss` e fontes presentes | ok |
| Microcópia — sem certo/errado, sem gamificação, sem dose, sem prescrição | ok |

## 2. O que foi verificado em navegador real

Percurso completo dirigido em Chrome, contra o build exportado:

| Percurso | Veredito obtido | Esperado |
|---|---|---|
| `dx.pac` **com** radiografia | Fortemente compatível | ✅ |
| `dx.pac` **sem** nenhum exame | Compatível + nota "levou em conta apenas os exames que você solicitou" | ✅ rebaixado, não punido |
| `dx.dados-insuficientes` **com** radiografia | Pouco compatível | ✅ |
| `dx.dados-insuficientes` **sem** exame | **Compatível** | ✅ a inversão funciona |
| `dx.tep` com D-dímero marcado como "sustenta" | Pouco compatível + armadilha disparada | ✅ |
| Red flag crítico não reconhecido | Aviso exibido acima do veredito | ✅ |

Sem violação de acessibilidade (axe, WCAG 2.1 AA), sem erro de console, sem rolagem horizontal
em 390px.

**A inversão é o ponto de desenho mais importante deste caso.** Quem não pediu imagem e respondeu
"não há dados suficientes" recebe `compativel` — mais crédito do que quem pediu a imagem e mesmo
assim não concluiu. É a mesma correção que o achado B1 do red team do C1 forçou: o sistema não pode
premiar quem afirma além do que os dados sustentam, nem punir quem reconhece o próprio limite.

## 3. Ataques tentados contra o caso

| # | Ataque | Resultado |
|---|---|---|
| A1 | O quadro é compatível com mais de um diagnóstico ao mesmo tempo? | Parcialmente, e é intencional. Bronquite aguda e síndrome gripal são plausíveis **até** o exame físico focal; a imagem separa. Nenhuma das duas recebe veredito melhor que `parcialmente_compativel` |
| A2 | O caso pune quem levanta TEP? | Não. `dx.tep` tem `credit: 0.8`, `tier: esperada` e `cantMiss: true` na lista inicial. No veredito final recebe `pouco_compativel` com texto que abre reconhecendo o acerto de tê-la considerado |
| A3 | Algum veredito afirma achado que o estudante pode não ter obtido? | Não — verificado por teste, e o ramo `verdictWhenMissing` de `dx.pac` foi reescrito para dizer "sem imagem" em vez de nomear o laudo |
| A4 | O distrator é óbvio demais ou invisível demais? | O rótulo de "virose" (`f3`) e o contato domiciliar (`f9`) puxam para etiologia viral; o D-dímero (`f20`) só aparece para quem o pediu. Três distratores em camadas diferentes |
| A5 | Há pista que entrega a resposta antes da hora? | Os objetivos de aprendizagem são temáticos e não nomeiam o diagnóstico (regra B6 do red team do C1). O título fala de sintoma, não de doença |
| A6 | O caso sugere conduta, tratamento ou prescrição? | Não. Nenhum antibiótico é citado, nenhuma dose aparece, e o escore de gravidade é apresentado como **leitura de risco**, nunca como decisão de onde tratar |
| A7 | Os valores são plausíveis entre si? | Febre 38,4 °C com FC 104 bpm e FR 24 irpm é coerente. SatO₂ 93% em ar ambiente é coerente com consolidação lobar sem insuficiência respiratória franca |
| A8 | O corte de idade é usado corretamente? | Sim, e é o ponto do qualificador "em idosa": 62 anos **não** marca o ponto de idade do CURB-65, que é ≥ 65. O feedback explica isso |

## 4. Achados que permanecem abertos — para o revisor humano

| # | Achado | Por que não corrigi |
|---|---|---|
| **P-1** | O caso trata **gravidade** sem nunca dizer onde a paciente deveria ser tratada. Isso é deliberado (CLAUDE.md §10.6 proíbe conduta), mas deixa o tema pela metade: critérios de gravidade existem, no mundo real, para decidir local de cuidado | É uma tensão entre o escopo do produto e a integridade do tema. Decisão de escopo, não de autoria |
| **P-2** | `dx.pac` cobre pneumonia bacteriana e viral sob o mesmo conceito. Um estudante que responda "pneumonia viral" não tem como registrar isso no vocabulário | Exigiria decidir se o vocabulário deve distinguir etiologia — decisão clínica com efeito em todos os casos futuros |
| **P-3** | A macicez à percussão (`f12`) levanta derrame parapneumônico, e a radiografia (`f16`) diz "sem derrame significativo". A tensão é clinicamente real e educativa, mas **nenhum ponto de decisão a explora** | Adicionar um sexto ponto de decisão contraria o teto de 5 do CLAUDE.md §2 |
| **P-4** | Nenhuma fonte foi lida integralmente por um humano deste projeto. Duas foram lidas em texto completo por extração automática, duas em nível de abstract/recomendação | Regra §7: o nível de leitura está declarado em cada fonte e em `docs/research/sources.md`. Um revisor que queira promover a citação precisa ler |
| **P-5** | O caso é declarado "fácil", mas tem 5 pontos de decisão e 22 achados — a mesma densidade do caso intermediário | A dificuldade aqui vem do conteúdo clínico, não do número de passos. Se o piloto mostrar que cansa, o corte é reduzir pontos de decisão, não simplificar a clínica |

## 5. Fontes usadas na autoria

Todas verificadas na própria fonte (título, autores, veículo, volume, páginas e DOI conferidos).
Nenhuma foi citada sem ser aberta.

| Fonte | Nível de leitura | Usada para |
|---|---|---|
| Metlay JP, et al. ATS/IDSA CAP Guideline. *Am J Respir Crit Care Med.* 2019;200(7):e45-e67 | abstract + recomendações | critério diagnóstico, priorização de exames, hemocultura em ambulatório |
| Corrêa RA, et al. Recomendações SBPT PAC 2018. *J Bras Pneumol.* 2018;44(5):405-424 | integral (PDF) | papel da radiografia, escores de gravidade, limitação do exame físico |
| Lim WS, et al. CURB-65. *Thorax.* 2003;58(5):377-382 | integral (PMC) | itens objetivos de gravidade, corte de idade de 65 anos |
| Metlay JP, Kapoor WN, Fine MJ. *JAMA.* 1997;278(17):1440-1445 | abstract estruturado (DARE) | nenhum achado do exame físico confirma pneumonia sem imagem |

A afirmação que mais carrega o caso — *"nenhum achado do exame físico, isolado ou combinado, confirma
pneumonia sem imagem"* — vem da quarta fonte e está reproduzida quase literalmente da conclusão dela.
