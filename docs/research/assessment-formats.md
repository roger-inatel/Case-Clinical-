# Pesquisa: Formatos de Avaliação Determinística de Raciocínio Clínico

> **Novo na V2.** Enquanto um LLM avaliava a resposta, o formato da pergunta importava pouco. Sem
> LLM, **o formato da pergunta é o sistema de avaliação**. Felizmente, educação médica estuda isso
> há quarenta anos e tem instrumentos validados — não precisamos inventar.
>
> Nota de honestidade: fontes localizadas por busca; nível de leitura declarado em
> [sources.md](sources.md). Números precisam de conferência no original antes de irem para o artigo.

## 1. Key Features (KF) — a espinha dorsal recomendada

**O que é:** uma *key feature* é um **passo crítico na resolução de um problema clínico** — o ponto
onde o raciocínio costuma falhar. Um problema no formato KF apresenta um cenário e faz perguntas
**apenas sobre esses passos críticos**, ignorando o resto. As respostas típicas são "escreva/escolha
até 3 diagnósticos" ou "selecione as condutas apropriadas", com **chave de correção e crédito
parcial** definidos por especialistas.

- `[EVIDÊNCIA]` Proposto na Cambridge Conference (1984) e desenvolvido para exames nacionais de
  decisão clínica; revisão sistemática organiza a evidência de validade nas cinco fontes do
  *Standards for Educational and Psychological Testing* —
  [Advances in Health Sciences Education, 2018](https://link.springer.com/article/10.1007/s10459-018-9830-5)
  *(resumo de busca; texto integral não lido)*.
- `[EVIDÊNCIA]` Há evidência convergente de que casos KF medem processos cognitivos elaborativos, e
  não conhecimento simples. Confiabilidade (alfa 0,7–0,9) exige exames **longos, de 25–40 casos**.
- `[BOA PRÁTICA]` Guia prático de construção — [Farmer & Page, Medical Education 2005](https://asmepublications.onlinelibrary.wiley.com/doi/abs/10.1111/j.1365-2929.2005.02339.x);
  [Page & Bordage, 1995](https://pubmed.ncbi.nlm.nih.gov/7873006/).

**Por que serve exatamente ao nosso caso:** KF foi projetado para ser **corrigido por chave**, sem
avaliador humano no momento da resposta. É literalmente avaliação determinística de raciocínio
clínico, com validação publicada. É o formato que a V2 precisa.

**A limitação que precisamos declarar:** confiabilidade de nível de exame exige 25–40 casos. Temos
**8**. Consequência direta e inegociável: o sistema é **formativo**, não somativo. Não produz nota,
não certifica, não compara estudantes. Isso já era a decisão da V1 (questão P3) e agora tem uma
razão quantitativa concreta.

**Implicação de desenho:** cada caso não é "um caso com uma pergunta no fim". É **um caso com 3–5
pontos de decisão**, cada um sobre um passo crítico. Perguntar o diagnóstico final é apenas um deles
— e frequentemente o menos informativo.

## 2. Script Concordance Test (SCT) — adotar o formato, não a pontuação

**O que é:** dado um cenário e uma hipótese, apresenta-se **uma informação nova** e pergunta-se se
ela torna a hipótese mais ou menos provável (escala −2 a +2). A pontuação é **agregada de um painel
de especialistas**: a resposta vale conforme a proporção do painel que a escolheu.

- `[EVIDÊNCIA]` Usado desde 2009 na graduação e pós-graduação para avaliar raciocínio sob
  incerteza; escores aumentam com nível de treinamento (evidência de validade de construto) —
  [PMC6766395](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6766395/),
  [Medicina Geral, PMC5806088](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5806088/).
- `[EVIDÊNCIA]` Estudo *think-aloud* de validade de processo de resposta: respostas com crédito
  vieram acompanhadas de justificativas concordantes com especialistas em altíssima proporção, e a
  maioria das respostas sem crédito baseou-se em raciocínio falho —
  [PMC7870454](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7870454/).
- `[EVIDÊNCIA]` **Críticas relevantes:** a evidência de confiabilidade tende a ignorar erro de
  medida entre painelistas e teste-reteste, usando alfa como substituto; e a relação entre o
  construto declarado e o processo real de resposta não está firmemente estabelecida (crítica de
  Kreiter).

**Decisão:** adotamos o **formato** — "chegou este dado novo; ele fortalece ou enfraquece sua
hipótese?" — porque ele encaixa perfeitamente na apresentação progressiva e ataca o fechamento
prematuro no ponto exato onde ele acontece.

**Não adotamos a pontuação por painel**: exigiria 10–15 especialistas por caso, que não temos. Em
vez disso, a direção esperada é **definida pelo autor e revisada pelo revisor clínico**, e o
feedback explica o raciocínio em vez de dar crédito fracionário. Isso deve ser declarado como
limitação — é um SCT *pedagógico*, não psicométrico. Chamá-lo de "SCT" sem essa ressalva seria
apropriação indevida de validade alheia.

## 3. Representação do problema e qualificadores semânticos

**O que é:** destilar o caso numa frase usando qualificadores semânticos (agudo/crônico,
localizado/difuso, súbito/insidioso). A representação do problema é o que dispara a ativação dos
*illness scripts* na memória.

- `[EVIDÊNCIA]` Representações do problema mais completas e relevantes associam-se a maior acurácia
  diagnóstica; estrutura em três partes (demografia, curso temporal, síndrome clínica) com
  qualificadores temporais associa-se a acerto —
  [J Hosp Med, 2024](https://shmpublications.onlinelibrary.wiley.com/doi/10.1002/jhm.13335) *(resumo de busca)*;
  [PMC11602430](https://pmc.ncbi.nlm.nih.gov/articles/PMC11602430/).
- `[BOA PRÁTICA]` No ensino, enfatiza-se que representações **não são "certas ou erradas", apenas
  melhores** quando contemplam os atributos relevantes.

**Implicação:** um ponto de decisão de "representação do problema" via **chips de qualificadores
semânticos** é determinístico (comparação de conjuntos), pedagogicamente fundamentado e — crucial —
naturalmente não binário. Cabe perfeitamente na filosofia do projeto de não reduzir tudo a
certo/errado.

## 4. Autoexplicação — por que manter o texto livre mesmo sem avaliá-lo

- `[EVIDÊNCIA]` Autoexplicação melhora o desempenho diagnóstico em casos subsequentes, com efeito
  concentrado em **tópicos menos familiares** —
  [Adv Health Sci Educ, 2017](https://link.springer.com/article/10.1007/s10459-017-9757-2).
- `[EVIDÊNCIA]` Fornecer o diagnóstico correto como feedback **após** a autoexplicação melhorou
  acurácia em casos de transferência próxima —
  [BMC Med Educ, 2019](https://link.springer.com/article/10.1186/s12909-019-1638-3).
- `[EVIDÊNCIA]` Em grupos tutoriais, ensino por hipotético-dedutivo superou (ligeiramente)
  autoexplicação — [PMC5889380](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5889380/). O efeito não
  é universal nem grande.

**Implicação:** o campo de justificativa em texto livre **permanece**, mesmo sem avaliação
automática. O benefício vem do ato de escrever, não da correção. O desenho: o estudante escreve →
o sistema revela a análise autoral → **os dois textos aparecem lado a lado** para comparação. Isso
é autoexplicação seguida de feedback, que é exatamente a sequência com evidência.

Consequência honesta: **nunca prometemos "análise da sua justificativa"**. A UI diz o que é: "compare
seu raciocínio com o do autor do caso". Prometer análise e entregar comparação seria enganar.

## 5. Recordar × reconhecer: como o estudante informa a hipótese

- `[EVIDÊNCIA]` Meta-analiticamente, testes de reconhecimento (múltipla escolha) produzem efeito de
  teste **pelo menos comparável** ao de recordação livre; o quadro é mais nuançado do que o senso
  comum sugere.
- `[EVIDÊNCIA]` **Processamento apropriado à transferência**: a transferência é favorecida pela
  semelhança entre os processos cognitivos do treino e os da tarefa-alvo —
  [Frontiers in Education, 2019](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2019.00005/full),
  [PMC4513285](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4513285/).

**Implicação:** o argumento decisivo **não** é "recordação memoriza melhor" — a evidência aí é
mista. É que na clínica o médico **gera** hipóteses, não escolhe de uma lista de quatro. Um
autocomplete sobre vocabulário controlado, que só sugere após alguns caracteres digitados, aproxima
a geração enquanto mantém a correção determinística. Ver [ADR-0008](../03-architecture/adr/ADR-0008-vocabulario-controlado-de-hipoteses.md).

## 6. Design do feedback

- `[EVIDÊNCIA]` Na revisão de Shute (2008), **feedback elaborado** (com explicação, pistas,
  exemplos) mostrou-se mais efetivo que apenas informar acerto/erro (KR) ou a resposta correta
  (KCR), com maior impacto em aprendizagem de ordem superior —
  [Shute, Focus on Formative Feedback](https://myweb.fsu.edu/vshute/pdf/shute%202007_f.pdf).
  Resultados mais recentes trazem nuance: em alguns contextos, a resposta correta isolada foi mais
  efetiva que combinações complexas.
- `[EVIDÊNCIA]` **Estudantes ignoram feedback elaborado de erro** em sistemas digitais —
  [J Educ Psychol / ScienceDirect, 2025](https://www.sciencedirect.com/science/article/pii/S0361476X25000608)
  *(resumo de busca)*.

**Duas implicações práticas, e a segunda é a que a maioria dos protótipos erra:**

1. Feedback elaborado (por que sustenta, por que contradiz, o que considerar) — não só o veredito.
2. **Feedback tem que ser interativo, não um muro de texto.** Se o estudante rolar a página e sair,
   a evidência diz que ele não leu. Desenho: revelar a evidência contrária **item a item**, exigir
   um clique de reconhecimento em cada achado que ele deixou passar, e fechar com uma pergunta.
   Ver [ux-flow.md](../04-ux/ux-flow.md).

## 7. Síntese — o formato do caso na V2

```
Caso = cenário progressivo + 3 a 5 PONTOS DE DECISÃO (key features)
```

| Tipo de ponto de decisão | Origem | Determinístico porque |
|---|---|---|
| Representação do problema (chips) | qualificadores semânticos | comparação de conjuntos |
| Hipóteses iniciais (até 3) | key features | chave com crédito por conceito |
| Deslocamento de probabilidade após dado novo | SCT (formato) | direção definida pelo autor |
| Seleção de evidências a favor/contra | matriz achado × hipótese | pertinência a conjunto |
| Escolha de exames | key features | chave com crédito e custo |
| Hipótese final + justificativa livre | KF + autoexplicação | KF pontua; a justificativa não é pontuada |

Nada disso precisa de LLM. Tudo isso é anterior a LLMs — e mais validado que eles.
