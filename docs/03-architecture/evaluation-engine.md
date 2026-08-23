# Motor de Avaliação Determinístico

> **Novo na V2.** Substitui o pipeline de IA em runtime descrito em [ai-strategy.md](ai-strategy.md)
> (obsoleto). Fundamentação dos formatos em [research/assessment-formats.md](../research/assessment-formats.md).

## 1. Definição

```ts
evaluate(caseKey: CaseKey, session: Session): Result
```

**Função pura.** Sem rede, sem relógio, sem aleatoriedade, sem estado global. Mesma entrada → mesma
saída, sempre. Isso não é preciosismo: é o que torna o sistema testável exaustivamente e
reproduzível em uma banca.

## 2. Um caso é uma sequência de pontos de decisão

O erro que queremos evitar é o caso-quiz: ler tudo e escolher o diagnóstico no fim. Isso avalia
reconhecimento, não raciocínio. No formato *key features*, cada caso tem **3 a 5 pontos de decisão**
posicionados nos passos onde o raciocínio realmente falha.

```
etapa: queixa principal
   └─ DP1  representação do problema        (chips de qualificadores)
   └─ DP2  hipóteses iniciais (até 3)       (vocabulário controlado)
etapa: história + exame físico
   └─ DP3  deslocamento de probabilidade    (formato SCT)
   └─ DP4  quais exames pedir               (seleção com custo)
etapa: resultados dos exames
   └─ DP5  hipótese final + evidências + justificativa livre
```

Nem todo caso usa todos os tipos. O autor escolhe onde estão os passos críticos **daquele** caso —
essa escolha é o trabalho pedagógico, e é ela que diferencia um caso bom de um formulário.

## 3. Os seis tipos de ponto de decisão

Cada tipo tem uma regra de correção determinística e um formato de chave.

### 3.1 `problem-representation` — chips de qualificadores semânticos
Estudante seleciona qualificadores (agudo/crônico, súbito/insidioso, localizado/difuso, …).
Chave: `expected[]`, `acceptable[]`, `misleading[]`.
Resultado: **nunca "errado"** — "sua representação contempla 3 de 4 atributos relevantes; faltou o
curso temporal". Coerente com a literatura: representações são *melhores*, não *certas*.

### 3.2 `hypothesis-list` — até N hipóteses, vocabulário controlado
Chave: mapa `conceptId → { credit: 0..1, tier: 'esperada' | 'aceitável' | 'perigosa-omissão' | 'implausível', feedback }`.
Regras:
- crédito por conceito, somado e normalizado (crédito parcial é do formato KF);
- **omitir um `cantMiss` é sinalizado explicitamente**, mesmo que o resto esteja perfeito;
- listar um conceito implausível gera comentário, **não** subtrai crédito de outro correto — o
  objetivo é ensinar amplitude do diferencial, não punir hipótese;
- excedente além de N é bloqueado na UI, não penalizado depois.

### 3.3 `probability-shift` — formato SCT
"Chegou este dado. Sua hipótese X fica mais ou menos provável?" Escala −2…+2.
Chave: `expectedDirection`, `acceptableRange`, `rationale` (texto autoral).
Correção pela **direção**, não pelo valor exato — intensidade sem painel de especialistas não tem
como ser calibrada, e fingir que tem seria fraude metodológica.

### 3.4 `evidence-selection` — a peça central da V2
Estudante marca, entre os achados já revelados, os que **sustentam** e os que **contradizem** sua
hipótese. Chave: matriz `finding × hypothesis → supports | contradicts | neutral | redFlag`.
Deriva-se, sem qualquer ambiguidade:

| Sinal | Significado pedagógico |
|---|---|
| marcou como "sustenta" algo que contradiz | **inversão de evidência** — o erro mais grave |
| não marcou um achado que contradiz | ponto cego / viés de confirmação |
| não marcou um `redFlag` | omissão de perigo |
| marcou achado neutro como sustentando | superinterpretação |
| marcou os achados-chave | reconhecimento correto do padrão |

Isto substitui o que a V1 pedia ao LLM ("a justificativa cita evidência que não existe?") — e faz
melhor, porque é exato e não custa nada.

### 3.5 `test-selection` — quais exames pedir
Chave: `{ testId → { value: 'essencial' | 'útil' | 'desnecessário' | 'inadequado', feedback } }`.
Permite ensinar **parcimônia**: pedir tudo não é bom raciocínio. Sinaliza excesso e omissão.

### 3.6 `final-hypothesis` — veredito + justificativa livre
Hipótese pelo vocabulário controlado → veredito de compatibilidade autoral. O texto livre
**não é avaliado**; é guardado na sessão e exibido lado a lado com a análise do autor
(autoexplicação seguida de feedback — §4 da pesquisa de formatos).

## 4. Os seis vereditos

`muito_compativel` · `compativel` · `parcialmente_compativel` · `pouco_compativel` ·
`incompativel` · `dados_insuficientes`

Regras:
- O veredito é **autoral por conceito**, declarado na chave. O motor não infere compatibilidade.
- O autor **não é obrigado** a preencher os seis níveis (briefing §15). Conceito sem veredito
  declarado cai em `naoPrevisto` (§6).
- `dados_insuficientes` pode ser o veredito **de maior crédito** de um caso. No caso obrigatório de
  dados insuficientes, escolher qualquer hipótese específica recebe, no máximo,
  `parcialmente_compativel` — com feedback explicando por que a resposta mais defensável era
  reconhecer o limite da informação.

## 5. Feedback é composto, não escolhido

O jeito ingênuo — quatro blocos de texto (`correct`, `partiallyCorrect`, `incorrect`,
`insufficientData`) como no rascunho do briefing §17 — produz feedback que parece genérico já no
terceiro caso. E a evidência diz que estudante **ignora** feedback elaborado que chega como muro de
texto.

O motor **compõe** a resposta a partir de fragmentos autorais, na ordem pedagógica:

```
1. VEREDITO                fragmento do conceito escolhido
2. O QUE VOCÊ FEZ          derivado da sessão, sem texto autoral
                           (revisou hipótese? quando se comprometeu? pediu quais exames?)
3. CONTRADIZ               um fragmento por achado contrário — os que ele não marcou primeiro
4. SUSTENTA                um fragmento por achado a favor
5. NÃO CONSIDERADO         red flags e cantMiss omitidos
6. CONSIDERE TAMBÉM        diferenciais, com o porquê de cada um
7. SEU RACIOCÍNIO × O DO AUTOR   textos lado a lado
8. PERGUNTA DE REFLEXÃO    fragmento do caso
```

Dois estudantes com a mesma hipótese final e caminhos diferentes recebem **feedbacks diferentes**,
porque as seções 2–5 dependem do que cada um marcou e deixou de marcar. O autor escreve fragmentos
pequenos e reutilizáveis; a combinação é do motor.

Custo de autoria disso: alto. É o trabalho real da V2 e não deve ser subestimado.

## 6. `naoPrevisto` — o estado que impede a mentira

O estudante escolhe um conceito válido que o autor não previu (risco N4). O motor **não inventa
veredito**. Retorna:

> "Esta hipótese não foi analisada pelo autor deste caso. Isso não significa que esteja errada —
> significa que o caso não a cobre. Veja abaixo as hipóteses analisadas."

Três razões: é honesto; é coerente com o princípio do projeto de admitir limite de informação; e
**produz dado de melhoria** — cada `naoPrevisto` registrado localmente vira item de backlog de
autoria. O sistema conta quantas vezes cada conceito não previsto foi escolhido.

## 7. Perfil, não nota

Cada caso termina com um **perfil de decisão** de quatro dimensões, cada uma com sua contagem
explícita e transparente:

| Dimensão | Medida |
|---|---|
| Amplitude do diferencial | hipóteses relevantes levantadas / esperadas |
| Ancoragem em evidência | achados corretamente classificados / relevantes |
| Reconhecimento de perigo | red flags e `cantMiss` identificados |
| Flexibilidade | revisou a hipótese diante de dado que a contradizia? |

**Sem nota agregada. Sem placar entre casos. Sem ranking.** Razões: (a) 8 casos não sustentam
confiabilidade de exame — a literatura de key features fala em 25–40; (b) um número único
esconde exatamente a informação diagnóstica que interessa; (c) número vira meta e o estudante passa
a otimizar o número. Contagens transparentes ("3 de 4 achados-chave") são informativas; um "72%" não é.

## 8. O motor não faz

- Não interpreta texto livre. Sem NLP, sem palavra-chave, sem similaridade de string em
  justificativa. Se não dá para avaliar de forma exata, não avaliamos e dizemos isso.
- Não infere compatibilidade não declarada pelo autor.
- Não gera texto. Todo texto exibido foi escrito e revisado por um humano.
- Não persiste nada fora da sessão do navegador.

## 9. Testabilidade

Sendo função pura sobre JSON, o motor admite:
- **teste tabular** — matriz sessão × chave → resultado esperado;
- **propriedades** — ex.: nenhuma sessão produz `muito_compativel` quando um `redFlag` foi ignorado;
  nenhum feedback contém fragmento de conceito não escolhido; toda combinação termina em veredito
  ou `naoPrevisto`;
- **exaustão** — o espaço de sessões relevantes por caso é pequeno o suficiente para varrer inteiro.

Cobertura exaustiva do motor de avaliação é viável aqui. Era impossível na V1.
