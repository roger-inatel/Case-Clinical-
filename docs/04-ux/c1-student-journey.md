# Jornada do Estudante — C1 como referência

**Status: especificação de experiência. Nenhum código.**

Base: [`cardio-001`](../../cases/c1/cardio-001.case.json) e sua
[chave](../../cases/c1/cardio-001.key.json) reais — achados `f1`–`f20`, pontos de decisão `dp1`–`dp5`,
10 conceitos. Componentes conforme [design-system-components.md](design-system-components.md).

Duração declarada no caso: **15 minutos**.

> Mapear o fluxo com conteúdo real revelou **quatro problemas** que a leitura do JSON isolado não
> mostrou. Estão na §12 e um deles é grave.

---

## 1. Entrada — Home

**Objetivo:** enquadrar o que a ferramenta é e o que não é, antes de qualquer conteúdo clínico.

**Informação apresentada:** nome do projeto · uma frase do que ele faz ("pratique raciocínio clínico
sobre casos fictícios e receba análise estruturada do seu raciocínio") · três linhas do que ele
**não** é (não diagnostica, não substitui professor ou literatura, não usa IA em tempo real) ·
`Alert` neutro: **protótipo educacional experimental — casos fictícios**.

**Ação principal:** "Escolher uma área".
**Ação secundária:** "Como funciona" — expande, na própria página, 4 linhas sobre etapas, compromisso
com hipótese e feedback. Não é outra tela.

**Estados:** único. Sem carregamento (conteúdo estático), sem personalização, sem sessão anterior.

**Possíveis erros:** nenhum previsto. Se o catálogo falhar ao carregar, a home ainda funciona e o
botão exibe estado desabilitado com motivo lido.

**Mobile:** coluna única, aviso acima da dobra, botão com largura total.

---

## 2. Seleção de especialidade

**Objetivo:** dividir o catálogo por domínio clínico — e não sugerir progressão obrigatória.

**Informação apresentada:** duas opções — **Cardiologia** e **Pneumologia** — com contagem real de
casos publicados. Especialidade com menos de 2 casos publicados **não aparece**.

**Ação principal:** escolher a área.
**Ação secundária:** "Ver todos os casos" — ignora a divisão e vai ao catálogo completo. Existe
porque a sobreposição entre as duas áreas é intencional ([mvp-scope §1](../05-roadmap/mvp-scope.md)),
e forçar a escolha da especialidade entrega uma pista.

**Estados:** disponível · vazia (oculta).

**Possíveis erros:** especialidade sem caso aprovado → não listada, sem mensagem de erro.

**Mobile:** dois blocos empilhados, alvo generoso; **sem ícones ilustrativos** de órgão.

---

## 3. Seleção do caso — Catálogo

**Objetivo:** permitir escolha informada sem revelar nada do conteúdo clínico.

**Informação apresentada:** `Card(case)` por caso. Para o C1: título *"Desconforto torácico agudo em
homem de 54 anos"* · badges `intermediário` e `Cardiologia` · tags `dor-torácica`, `emergência`,
`viés-de-ancoragem` · duração `~15 min` · **primeiro objetivo de aprendizagem**.

Decisão deliberada: mostrar só o **primeiro** dos cinco objetivos. Os objetivos do C1 dizem
"reconhecer que um rótulo diagnóstico prévio não é evidência" — ler os cinco antes de começar
entrega o caso.

**Ação principal:** abrir o caso (card inteiro é o alvo).
**Ação secundária:** filtrar por dificuldade e tag.

**Estados:** disponível · concluído nesta sessão (marca discreta, **sem** pontuação) ·
em andamento nesta sessão (mostra "retomar").

**Possíveis erros:** nenhum caso após filtro → estado vazio com ação de limpar filtro.

**Mobile:** 1 coluna; ≥768px, 2 colunas. Filtros em linha rolável horizontal — **os únicos elementos
com rolagem lateral do produto**, e não são texto de conteúdo.

---

## 4. Apresentação do paciente — Visão geral do caso

**Objetivo:** dar o contrato antes de começar. É onde o estudante aceita que a submissão é
irreversível.

**Informação apresentada:** título · contexto do paciente (`54 anos, masculino, chega ao
pronto-socorro por conta própria, acompanhado da esposa`) · o que será exigido (4 etapas, 5 pontos
de decisão, ~15 min) · **os cinco objetivos de aprendizagem agora completos** · aviso de caso
fictício · `Alert` neutro: *"Cada resposta é registrada e não pode ser alterada depois. É
assim de propósito: parte do exercício é observar como seu raciocínio evolui."*

**Ação principal:** "Iniciar simulação".
**Ação secundária:** voltar ao catálogo.

**Estados:** pronto · retomar sessão em andamento (mostra em que etapa parou).

**Possíveis erros:** falha ao carregar o caso → mensagem específica em superfície neutra, **não
vermelha**, com "tentar novamente" e "voltar ao catálogo".

**Mobile:** aviso de irreversibilidade acima da dobra, junto do botão. É o único momento em que ele
aparece — repeti-lo a cada ponto de decisão viraria ruído.

---

## 5. Progressão das etapas — o runner

**Objetivo:** apresentar o caso em blocos, preservando o que o estudante sabia em cada momento.

**Informação apresentada:** `StepIndicator` — `Etapa 2 de 4 · História clínica`. Etapas concluídas
ficam **acessíveis e recolhidas**; a atual, expandida; as futuras aparecem sem rótulo (não
antecipam o que vem).

Texto clínico em `Card(document)`: fundo de papel, **serif**, sem borda e sem sombra. Sinais vitais
da etapa 3 em lista rótulo/valor com `tabular-nums`.

**Ação principal:** responder ao ponto de decisão da etapa.
**Ação secundária:** "Ver caso completo" — reúne tudo o que já foi revelado numa visão contínua.
Nunca revela etapa futura.

**Estados por etapa:** futura (oculta) · atual · concluída (recolhida, reabrível) ·
respondida com ponto de decisão travado.

**Possíveis erros:** tentar avançar sem responder → botão desabilitado com motivo lido, **não**
mensagem de erro.

**Mobile:** acordeão; `StepIndicator` fixo no topo; barra de ação fixa no rodapé respeitando
`safe-area-inset`.

---

## 6. Pontos de decisão — dp1, dp3, dp4

Os três pontos que não são hipótese. Cada um interrompe o fluxo exatamente onde o raciocínio falha.

### dp1 — Representação do problema *(etapa 1)*
**Objetivo:** sintetizar antes de hipotetizar.
**Apresentado:** enunciado + 14 chips (`agudo`, `crônico`, `súbito`, `insidioso`, `contínuo`,
`intermitente`, `opressivo`, `pleurítico`, `lancinante`, `retroesternal`, `localizado na parede`,
`em repouso`, `aos esforços`, `migratório`), em **ordem fixa** — ordenar por relevância seria
entregar a resposta.
**Principal:** selecionar até 5. **Secundária:** rever a queixa acima.
**Estados:** vazio · parcial (contador "3 de 5") · submetido/travado.
**Erros:** nenhuma seleção → botão desabilitado. Selecionar 5 → demais viram `aria-disabled` com
motivo lido, sem sumir.
**Mobile:** chips em várias linhas, ≥44px, sem rolagem lateral.

### dp3 — Deslocamento de probabilidade *(etapa 2)*
**Objetivo:** o núcleo pedagógico — não ancorar no rótulo diagnóstico de outro profissional.
**Apresentado:** o achado `f5` em destaque (*"há oito meses… alta com diagnóstico de crise de
ansiedade"*) + a pergunta sobre como isso altera a probabilidade.
**Principal:** escolher entre `muito menos provável` · `menos provável` · `não altera` ·
`mais provável` · `muito mais provável`. **Sem cor semântica antes de responder** — colorir as
extremidades sugeriria a resposta.
**Secundária:** reler a história completa.
**Estados:** vazio · escolhido · submetido/travado.
**Erros:** nenhuma escolha → botão desabilitado.
**Mobile:** escala vertical, uma opção por linha, rótulo textual sempre (nunca só −2…+2).

### dp4 — Seleção de exames *(etapa 3)*
**Objetivo:** parcimônia e priorização.
**Apresentado:** cinco exames com nome e tempo de resultado — ECG (imediato), troponina us (~1h),
radiografia de tórax (~30min), D-dímero (~1h), angiotomografia (~2h). **Sem indicação de qual é
apropriado.**
**Principal:** escolher até 3. **Secundária:** rever exame físico.
**Estados:** vazio · parcial · limite atingido · submetido/travado.
**Erros:** nenhum exame selecionado → permitido avançar? **Sim** — e é uma decisão de produto:
não pedir exame nenhum é uma escolha clínica, e o feedback vai comentá-la.
**Mobile:** lista vertical com checkbox; tempo de resultado em `text-xs` abaixo do nome.

**Consequência real do dp4:** só os achados dos exames pedidos aparecem na etapa 4. Quem não pedir
ECG **nunca vê `f16`**; quem não pedir troponina **nunca vê `f17`**. O caso muda conforme a decisão
— é o que torna o ponto de decisão verdadeiro. *(Ver problema P1 na §12.)*

---

## 7. Entrada da hipótese — dp2 *(etapa 1)*

**Objetivo:** gerar amplitude de diferencial com informação mínima — e registrar o momento do
compromisso.

**Informação apresentada:** apenas `f1` e `f2` acima. Enunciado: *"Com a informação disponível até
aqui, quais hipóteses você considera? Selecione até três, em ordem de prioridade."*
Microcópia necessária: *"É pouca informação de propósito. Levantar possibilidades não é concluir."*

**Ação principal:** digitar no `DiagnosisCombobox`. Sugestões só a partir de **2 caracteres**;
busca por rótulo e sinônimo — `IAM`, `STEMI`, `embolia de pulmão`, `SCA` resolvem. Máximo 8
sugestões, nunca a lista completa.
**Ação secundária:** reordenar ou remover chips selecionados.

**Estados:** vazio · digitando · com sugestões · 1–3 selecionadas · limite atingido ·
**termo não encontrado** · submetido/travado.

**Possíveis erros e como o produto responde:**

| Situação | Resposta |
|---|---|
| Digita "pericardite" (fora do vocabulário) | *"Não encontramos esse termo no vocabulário do sistema. Você pode registrá-lo e seguir."* Registra o termo. **Nunca** "inválido" |
| Digita "infato" | Sem correspondência. **Sem correção automática** — imprecisão terminológica é informação que o estudante precisa perceber |
| Seleciona só 1 hipótese | Permitido. A chave espera ≥2 (`minExpected: 2`) e o feedback comenta a amplitude |
| Seleciona "Não há dados suficientes" | Opção legítima, sem destaque e sem penalização visual |

**Mobile:** campo no topo, sugestões em popover ancorado, chips abaixo; teclado não cobre o campo.

---

## 8. Interpretação das evidências — parte do dp5 *(etapa 4)*

**Objetivo:** transformar "por que você acha isso" em dado exato. É o que substitui a análise de
texto livre por LLM ([ADR-0009](../03-architecture/adr/ADR-0009-justificativa-por-selecao-de-evidencias.md)).

**Informação apresentada:** `EvidenceSelector` com **todos os achados já revelados** — para quem
pediu ECG e troponina, são 17 itens (`f1`–`f15`, `f16`, `f17`). Cada um com três opções mutuamente
exclusivas: **sustenta** · **contradiz** · **não marcar**.

**Sem cor semântica antes da submissão. Sem contagem de acertos durante o preenchimento.**

**Ação principal:** classificar os achados relevantes.
**Ação secundária:** rever qualquer etapa anterior sem perder o preenchimento.

**Estados:** vazio · parcial · submetido/travado.

**Possíveis erros:** não marcar nada → permitido, e o feedback trata como ausência de ancoragem.
Marcar todos como "sustenta" → permitido, e é justamente o padrão que revela viés de confirmação.

**Mobile:** **o ponto de maior carga cognitiva do produto.** 17 itens × 3 opções numa tela pequena.
Mitigações: um achado por bloco, com o texto em serif e as três opções em linha; agrupamento por
etapa de origem com cabeçalho fixo; contador de progresso *"você classificou 6 de 17 achados"* —
informativo, sem sugerir que classificar todos é o esperado. *(Ver problema P4 na §12.)*

---

## 9. Diagnóstico final — dp5 *(etapa 4)*

**Objetivo:** comprometer-se e justificar.

**Informação apresentada:** os resultados dos exames pedidos + o `DiagnosisCombobox` (agora com uma
única hipótese principal) + a `Textarea` de raciocínio.

Rótulo obrigatório da textarea: **"Escreva seu raciocínio. Este texto não é corrigido
automaticamente — ele será exibido ao lado da análise do autor."** Prometer análise e entregar
comparação seria enganar.

**Ação principal:** submeter hipótese + evidências + raciocínio, juntos.
**Ação secundária:** rever o caso completo antes de submeter.

**Estados:** incompleto · pronto · submetido (irreversível).

**Possíveis erros:** raciocínio em branco → **bloqueia** (é obrigatório em `dp5`, decisão D10);
hipótese não selecionada → bloqueia; hipótese fora do vocabulário → segue, e o veredito será
"não analisada por este caso".

**Mobile:** três blocos empilhados; textarea de 5 linhas que cresce; botão de submeter na barra fixa
com o aviso final de irreversibilidade ao lado.

---

## 10. Feedback

**Objetivo:** fazer o estudante processar a análise, não rolar por ela. A evidência mostra que
feedback elaborado entregue como muro de texto é ignorado.

**Formato:** `CommentaryBlock` revelado **em sequência, com interação obrigatória entre seções** —
não é uma página que se rola.

| # | Seção | Conteúdo no C1 |
|---|---|---|
| 1 | **Veredito** | `VerdictBanner`. Quem respondeu SCA sem supra vê faixa teal e *"os dados disponíveis são fortemente compatíveis"*. Quem respondeu ansiedade vê faixa laranja e o texto que confronta a elevação de troponina. **Sem número, sem percentual** |
| 2 | **O que você fez** | Derivado da sessão, sem texto autoral: em que etapa se comprometeu, se manteve a hipótese depois de `f16`/`f17`, quais exames pediu |
| 3 | **O que contradiz** | `EvidenceItem` um a um. **Os que você não marcou vêm primeiro** |
| 4 | **O que sustenta** | Depois. Nunca antes |
| 5 | **O que você não considerou** | Red flags `rf1`/`rf2` e diferenciais `cantMiss` omitidos — dissecção de aorta, TEP. Badge vermelho, o único do produto |
| 6 | **Seu raciocínio × o do autor** | Lado a lado ≥1024px, empilhado abaixo. Seu texto exatamente como você escreveu |
| 7 | **Perfil de decisão** | Quatro dimensões com contagem explícita: *"Amplitude do diferencial — 2 de 3 hipóteses esperadas"*. Sem barra, sem nota |
| 8 | **Reflexão** | *"Se a troponina inicial tivesse voltado normal, o que mudaria na sua conduta — e o que NÃO mudaria?"* Fecha sem responder |

**Ação principal:** "Continuar" entre seções.
**Ação secundária:** rever o caso ao lado do feedback.

**Estados:** revelando (seção a seção) · completo · **degradado** (hipótese não prevista: o veredito
é honesto e as seções 3–5 aparecem reduzidas).

**Possíveis erros:** hipótese fora da chave → seção 1 diz *"esta hipótese não foi analisada pelo
autor deste caso — isso não significa que esteja errada"*, e as seções seguintes seguem com o que
existe. **Nunca** tela vazia, nunca "erro".

**Mobile:** uma seção por vez ocupando a tela; "continuar" na barra fixa; a citação do achado
mantém a serif — é a voz do paciente aparecendo dentro do comentário.

---

## 11. Encerramento

**Objetivo:** fechar com o material que sustenta o caso, e devolver a autoridade a quem a tem.

**Informação apresentada:** raciocínio completo do autor · os cinco objetivos de aprendizagem, agora
como checklist do que o caso treinou · diferenciais a considerar, com o porquê de cada um ·
**as fontes do caso, clicáveis** (SBC 2021, AHA/ACC 2021, IRAD, revisão sobre ECG normal) ·
`authoring.reviewedBy` quando existir · aviso final de protótipo educacional.

**Ação principal:** "Voltar ao catálogo".
**Ação secundária:** "Rever este caso" — reabre em modo leitura, com todas as respostas e o feedback
preservados na sessão. **Não** permite refazer: refazer apagaria o sinal de compromisso.

**Estados:** completo · sessão expirada (aba fechada → conteúdo permanece, respostas não).

**Possíveis erros:** nenhum. É a única tela sem estado de falha.

**Mobile:** fontes em lista vertical com alvo generoso; aviso no rodapé.

---

## 12. Problemas descobertos ao mapear o fluxo

Nenhum destes apareceu lendo o JSON. Todos apareceram ao percorrer a experiência com conteúdo real.

### P1 — **Grave.** Os vereditos de `dp5` assumem que os exames essenciais foram pedidos

`dp4` permite escolher até 3 de 5 exames — inclusive nenhum dos dois essenciais. Mas os vereditos de
`dp5` são **estáticos por conceito**: quem não pediu troponina e responde "SCA sem supra" recebe
`muito_compativel`, com feedback citando *"troponina acima do percentil 99"* — **um achado que essa
pessoa nunca viu.**

Isso inverte a regra temporal: em vez de avaliar com informação que o estudante não tinha, o sistema
**dá crédito** por informação que ele não obteve. E o feedback cita `f17` para quem não pediu o
exame, o que é incoerente e confuso.

**Não é bug de implementação — é lacuna do modelo de dados.** O veredito precisa poder depender do
conjunto de achados revelados. Opções a decidir: veredito condicionado aos achados revelados;
ou `dp5` exigir os exames essenciais; ou um veredito adicional do tipo "conclusão não sustentável
com os dados que você obteve". **A terceira é a mais educativa e a mais coerente com o projeto.**

Registrar como **INS-5** em [c1-schema-findings.md](../phase-1/c1-schema-findings.md) e verificar se
o red team também o encontrou — é exatamente o tipo de achado que a comparação red team × humano
existe para medir.

### P2 — `dp3` fixa a hipótese sobre a qual pergunta

O enunciado pergunta sobre síndrome coronariana aguda. Se as três hipóteses do estudante em `dp2`
foram ansiedade, refluxo e dor musculoesquelética, a pergunta chega desconectada do raciocínio dele.
É a insuficiência **EXT-5** já registrada, agora com efeito concreto na experiência.
**Mitigação de baixo custo:** reformular o enunciado para tornar explícito que a hipótese é do caso,
não dele — *"independentemente das suas hipóteses, considere síndrome coronariana aguda: …"*.

### P3 — Não há como pedir exames em duas rodadas

`dp4` acontece uma vez, na etapa 3. Na prática clínica, pede-se ECG, olha-se o resultado e então se
decide sobre troponina. O formato de etapa única perde essa iteração.
**Não é defeito de execução** — é consequência aceita do desenho em etapas fixas. Registrar como
limitação declarada; um `test-selection` em duas rodadas é candidato para um caso futuro.

### P4 — O `EvidenceSelector` tem 17 itens no mobile

Carga cognitiva alta exatamente no ponto em que o estudante já está no fim do caso. As mitigações da
§8 são hipóteses, não soluções verificadas. **Candidato número 1 do teste exploratório com
estudantes** (fase 6): se o abandono acontecer, será aqui.
