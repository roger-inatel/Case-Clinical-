# Proposta de UX — V2

> Revisão da V1. Mudanças em §8.

## 1. A regra visual mudou de objeto

Na V1, a separação crítica era *dado do caso × interpretação da IA*. Não há mais IA. A separação
continua existindo, com outros nomes — e ainda é a regra que governa a tela:

| | Dado do caso | Comentário do autor |
|---|---|---|
| O que é | O que o paciente fictício apresenta | Análise pedagógica escrita e revisada por humano |
| Fundo | superfície neutra do documento | superfície deslocada, com borda lateral |
| Tipografia | serifada, medida ~65ch | sans-serif, corpo menor |
| Rótulo | nenhum | "Comentário do autor" |
| Quando aparece | durante a simulação | **só depois** da resposta do estudante |

O ganho de honestidade da V2: agora esse rótulo é literalmente verdadeiro. Um humano escreveu
aquele texto, e o nome dele está em `authoring.reviewedBy`.

## 2. Fluxo

```
HOME                      o que é · o que não é · aviso de protótipo educacional
  ↓
ESPECIALIDADE             Cardiologia · Pneumologia
  ↓
CATÁLOGO                  filtro por dificuldade e tag; objetivos de aprendizagem visíveis
  ↓
VISÃO GERAL DO CASO       contexto, duração estimada, o que será exigido, aviso de caso fictício
  ↓
┌─ SIMULAÇÃO ───────────────────────────────────────────────────────────┐
│  Etapa 1 · Queixa principal                                            │
│     ▸ DP1  Representação do problema      (chips de qualificadores)    │
│     ▸ DP2  Hipóteses iniciais (até 3)     (autocomplete)               │
│  ─────────────────────────────────────────────────────────────────     │
│  Etapa 2 · História clínica                                            │
│     ▸ DP3  Este dado muda sua hipótese?   (mais provável ↔ menos)      │
│  ─────────────────────────────────────────────────────────────────     │
│  Etapa 3 · Exame físico                                                │
│     ▸ DP4  Quais exames você solicita?    (seleção limitada)           │
│  ─────────────────────────────────────────────────────────────────     │
│  Etapa 4 · Resultados                                                  │
│     ▸ DP5  Hipótese final                                              │
│            + marque os achados que sustentam e os que contradizem      │
│            + escreva seu raciocínio (não avaliado)                     │
└────────────────────────────────────────────────────────────────────────┘
  ↓
RESULTADO                 feedback revelado progressivamente (§4)
  ↓
FECHAMENTO                análise do autor · diferenciais · fontes · pergunta de reflexão
```

**Uma vez respondido, um ponto de decisão não é editável.** É o que dá sentido ao registro de
"quando você se comprometeu" e ao sinal de revisão de hipótese. Sem trava, todo mundo volta e
conserta, e o exercício perde o objeto. A UI avisa isso **antes** da primeira submissão, não depois.

## 3. Feedback imediato ou no fim?

Escolha: **imediato por ponto de decisão para pontos processuais (DP1, DP3, DP4), e consolidado no
fim para os diagnósticos (DP2, DP5)**.

Razão: dar o veredito diagnóstico logo após DP2 encerraria o raciocínio — o estudante saberia a
resposta e as etapas seguintes viram formalidade. Já segurar o feedback sobre representação do
problema ou escolha de exames não protege nada e perde o momento em que ele é útil.

`[HIPÓTESE]` — este equilíbrio é julgamento pedagógico, não resultado medido. Registrado como
questão em aberto para o teste com estudantes.

## 4. A tela de resultado: revelada, não despejada

A evidência de que estudantes ignoram feedback elaborado extenso
([pesquisa §6](../research/assessment-formats.md)) tem consequência direta de interface: **o
feedback não é uma página que se rola**. É uma sequência curta, uma seção por vez, com um clique
entre elas.

Ordem, e cada passo exige interação:

1. **Veredito** da hipótese final, em linguagem, sem número.
2. **O que você fez** — derivado da sessão, sem texto autoral: quando se comprometeu, se revisou a
   hipótese, quais exames pediu. Aparece **sempre**.
3. **O que contradiz sua hipótese** — um achado por vez. Os que o estudante **não** marcou vêm
   primeiro, e cada um exige reconhecimento antes de seguir.
4. **O que sustenta** — depois, nunca antes.
5. **O que você não considerou** — red flags e diferenciais `cantMiss` omitidos.
6. **Seu raciocínio × o do autor** — lado a lado, sem julgamento automático. O texto do estudante
   aparece exatamente como ele escreveu.
7. **Perfil de decisão** — quatro dimensões com contagens explícitas, sem nota agregada.
8. **Pergunta de reflexão** — fecha sem resposta.

Ponto 3 antes do ponto 4 é decisão pedagógica: começar pelo que apoia o estudante encerra a leitura.

## 5. Como o estudante informa a hipótese

**Combobox sobre vocabulário controlado**, não lista de alternativas:

- sugestões só depois de 2–3 caracteres — não é para reconhecer numa lista, é para lembrar;
- busca por rótulo **e** por sinônimo/sigla ("IAM", "STEMI", "embolia de pulmão");
- até 3 hipóteses em DP2, ordenadas por prioridade;
- **"Não há dados suficientes"** sempre disponível como opção legítima, com o mesmo peso visual;
- termo não encontrado → campo livre que **não é avaliado**, registra o termo e responde com
  honestidade: "esta hipótese não foi analisada pelo autor deste caso" (nunca "resposta errada").

O último ponto importa mais do que parece: é a diferença entre um sistema que admite seu limite e um
que finge cobrir tudo — que é o mesmo princípio da V1, aplicado a um sistema sem IA.

## 6. Como mostrar incerteza

Mantido da V1 e reforçado. Sem percentual, sem barra, sem medidor.

- `muito_compativel` → "Os dados disponíveis são **fortemente compatíveis** com esta hipótese."
- `parcialmente_compativel` → "Parte dos dados sustenta esta hipótese; **outra parte não**."
- `dados_insuficientes` → "**Não há informação suficiente** para sustentar ou afastar esta
  hipótese" — mesmo peso visual dos demais, jamais apresentado como falha.

No caso obrigatório de dados insuficientes, o fechamento diz explicitamente: reconhecer o limite da
informação era a resposta mais defensável.

## 7. Mobile-first, acessibilidade e microcópia

Uma coluna · medida de leitura confortável · etapas em acordeão · caso completo sempre alcançável ·
alvos ≥ 44px · contraste AA · **cor nunca como único portador de significado** (sustenta/contradiz
levam ícone e rótulo) · headings hierárquicos reais · foco visível · teclado completo (o combobox é
o componente crítico aqui) · `prefers-reduced-motion` · transições ≤ 150ms · tema escuro pelo sistema.

Microcópia: nunca "Correto!"/"Errado!" → "compatível com os dados"/"não sustentado pelos dados".
Nunca "a IA analisou" → "o autor deste caso comenta". Aviso de **protótipo educacional experimental**
e de **caso fictício** na home, na visão geral do caso e no rodapé do resultado.
Zero gamificação: sem pontos, streak, troféu ou placar.

## 8. Mudanças desde a V1

| V1 | V2 | Motivo |
|---|---|---|
| "Análise da IA" como bloco distinto | "Comentário do autor" | Não há IA em runtime; o rótulo passou a ser literal |
| Hipótese e justificativa em texto livre | Combobox + seleção de evidências + texto livre não avaliado | Correção determinística ([ADR-0008](../03-architecture/adr/ADR-0008-vocabulario-controlado-de-hipoteses.md), [ADR-0009](../03-architecture/adr/ADR-0009-justificativa-por-selecao-de-evidencias.md)) |
| Dois momentos de hipótese | 3–5 pontos de decisão tipados | Formato *key features* |
| Estados ok/degradado/bloqueado | Não existem mais | Não há resposta de modelo para degradar |
| Tela de análise única, rolável | Feedback revelado por etapas com interação | Evidência de que feedback extenso é ignorado |
| Incerteza em linguagem | **mantido** | Continua certo |
| "O que você fez" sempre visível | **mantido** | Continua sendo o que garante valor mesmo no pior caso |
