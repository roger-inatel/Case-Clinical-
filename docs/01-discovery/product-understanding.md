# Entendimento do Produto — V2

> Revisão da V1. Mudanças em §7.

## 1. O problema educacional (inalterado)

Estudantes de Medicina precisam praticar **raciocínio diagnóstico**. A prática real exige paciente,
tempo de preceptor e feedback individualizado sobre o *processo* — os três são escassos.

O alvo não é "não saber a doença". É o **erro de processo**:

- fechar a hipótese cedo demais (*premature closure*) `[EVIDÊNCIA]`;
- não buscar evidência contrária à própria hipótese;
- ignorar *red flags* que tornam uma hipótese perigosa;
- não perceber que a informação disponível é insuficiente para concluir.

## 2. O que o sistema é

Um **simulador de decisão clínica** com casos fictícios, apresentados em etapas, em que o estudante
é interrompido nos **passos críticos** e precisa se comprometer: como você resume este problema?
quais suas hipóteses? este dado novo muda alguma coisa? quais achados sustentam sua hipótese e
quais a contradizem? quais exames você pede?

A correção é determinística, contra uma chave escrita e revisada por um humano.

## 3. O que mudou de fundo em relação à V1

A V1 tinha um problema difícil: **conter um LLM probabilístico no caminho crítico**. Toda a
arquitetura girava em torno disso.

A V2 remove o LLM do produto. O problema difícil passa a ser **autorar conteúdo clínico e
pedagógico de qualidade**. A infraestrutura ficou trivial; o trabalho não diminuiu — mudou de lugar.

Isso tem uma consequência que vale dizer sem rodeio: **a V2 é mais honesta**. Na V1, o sistema
podia responder a qualquer justificativa, mas ninguém — nem nós — conseguia garantir que a resposta
estivesse clinicamente correta. Na V2, o sistema responde a menos coisas, e cada resposta tem nome
e sobrenome de quem a escreveu e revisou.

## 4. O que o sistema não é

| Não é | Por quê |
|---|---|
| Ferramenta de diagnóstico | Casos fictícios, sem paciente, sem validação clínica |
| Chatbot médico | Não há IA em runtime. Nenhuma |
| Fonte de verdade médica | A fonte é o caso autoral e as referências dele |
| Avaliador somativo | 8 casos não sustentam confiabilidade de exame ([ADR-0010](../03-architecture/adr/ADR-0010-perfil-sem-nota-agregada.md)) |
| Cobertura exaustiva de raciocínio | O espaço de hipóteses é fechado; o sistema admite isso ao estudante |

## 5. O que o usuário faz (visão de 30 segundos)

Escolhe especialidade → escolhe caso → lê a queixa → **resume o problema** → **compromete-se com até
3 hipóteses** → recebe história e exame físico → diz se o dado novo muda sua hipótese → **escolhe
quais exames pedir** → vê os resultados → dá a hipótese final, **marca os achados que a sustentam e
os que a contradizem**, escreve seu raciocínio → recebe feedback revelado por etapas → compara seu
raciocínio com o do autor.

O compromisso antes dos exames continua sendo o que permite medir, **sem IA**, se o estudante
revisou a hipótese diante de dado novo. Era verdade na V1 e agora é ainda mais central, porque
virou um dos quatro eixos do perfil de decisão.

## 6. Critério de sucesso do MVP

1. Um estudante completa um caso do início ao fim sem instrução externa.
2. Os 8 casos passam pelas três barreiras de revisão, com registro.
3. Um docente responde "sim" a *"você deixaria um estudante do 4º ano usar este caso sem
   supervisão?"* em todos os casos publicados.
4. Nenhuma hipótese razoável é respondida com "errado" — no máximo, com "não analisada por este caso".
5. O estudante consegue explicar, depois do feedback, **por que** sua hipótese era frágil.

## 7. Mudanças desde a V1

| V1 | V2 |
|---|---|
| "Testador de hipóteses" com LLM confrontando texto livre | "Simulador de decisão clínica" com pontos de decisão tipados e chave autoral |
| A inversão de papel (estudante afirma, sistema testa) | **Mantida** — só mudou quem testa |
| Um momento de hipótese inicial e um final | 3–5 pontos de decisão (formato *key features*) |
| O risco central era a IA errar | O risco central é o **caso** errar |
| "Não sei" como veredito possível | **Um caso inteiro dedicado a isso** (P4, obrigatório) |
