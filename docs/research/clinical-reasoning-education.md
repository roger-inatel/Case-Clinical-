# Pesquisa: Raciocínio Clínico e Educação Médica

> Nota de honestidade: as fontes abaixo foram localizadas por busca web. Onde só o resumo de
> busca ou o abstract foi consultado, isso está declarado. Antes de qualquer uso em artigo
> acadêmico, o texto integral precisa ser lido.

## 1. Como se estrutura o raciocínio diagnóstico

O modelo dominante em educação médica descreve o conhecimento clínico organizado em **illness
scripts**: representações mentais que agrupam epidemiologia, fisiopatologia, sinais e sintomas,
exames e condutas de uma doença. O diagnóstico é, em boa parte, **casamento de padrão** entre o
caso e os scripts disponíveis, complementado por raciocínio analítico quando o padrão não fecha.

- `[EVIDÊNCIA]` Ensino explícito por *illness script* melhorou desempenho em teste de raciocínio
  clínico em estudantes do 4º ano (ECR) — [BMC Med Educ 2021](https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-021-02522-0)
  *(abstract e resumo de busca; texto integral não lido)*.
- `[BOA PRÁTICA]` Compêndio sobre educação em raciocínio clínico baseada em casos —
  [NCBI Bookshelf NBK543763](https://www.ncbi.nlm.nih.gov/books/NBK543763/).

**Implicação para o produto:** a rubrica interna do caso deve ser estruturada **como um illness
script** (achados típicos, atípicos, discriminadores, o que torna o diagnóstico improvável).
Isso dá ao avaliador um alvo explícito para comparar, em vez de deixá-lo raciocinar do zero.

## 2. Apresentação progressiva (serial-cue) × caso completo (whole-case)

- `[EVIDÊNCIA]` Revisão de estratégias de ensino de raciocínio clínico identifica dois desenhos
  dominantes: **serial-cue** (informação entregue em blocos, com raciocínio a cada passo) e
  **whole-case**. O serial-cue tende a beneficiar estudantes com conhecimento prévio maior, que já
  possuem illness scripts funcionais — [BMC Med Educ 2020](https://link.springer.com/article/10.1186/s12909-020-1987-y)
  *(resumo de busca; texto integral não lido)*.

**Implicação:** serial-cue é adequado ao público assumido (3º–6º ano), mas **não é gratuito** para
iniciantes. Decisão: serial-cue como padrão, com o caso completo acessível a qualquer momento
("ver caso completo") — o custo de oferecer os dois modos é baixo e desarma a questão P2.

## 3. Premature closure: o alvo pedagógico principal

- `[EVIDÊNCIA]` Experimento randomizado com 58 estudantes do 4º ano: achados distratores salientes
  apresentados **no início** do caso reduziram substancialmente a acurácia diagnóstica e diminuíram
  o tempo de processamento por palavra — padrão consistente com fechamento prematuro —
  [Al Essa et al., Medical Education](https://asmepublications.onlinelibrary.wiley.com/doi/full/10.1111/medu.70229)
  *(resumo de busca; magnitude do efeito precisa ser conferida no texto integral antes de citar número)*.
- `[BOA PRÁTICA]` Estratégias propostas contra fechamento prematuro incluem checklists,
  reconsideração explícita da hipótese inicial e exposição experiencial ao próprio viés —
  [Perspect Med Educ](https://pmejournal.org/articles/10.1007/S40037-016-0274-4).

**Implicação (decisão de design):** capturar a hipótese **antes** dos exames complementares e
permitir revisão depois. A comparação hipótese-inicial × hipótese-final é calculada **em código,
sem IA** — é o sinal pedagógico mais barato e mais confiável do sistema. Quando o estudante não
revisa diante de dado que contradiz, isso é mostrado como observação de processo.

## 4. IA generativa como fonte de feedback: o que já foi medido

- `[EVIDÊNCIA]` ECR: simulação de paciente com LLM **acompanhada de feedback estruturado** melhorou
  a tomada de decisão clínica de estudantes, com efeito relatado como forte —
  [PMC11605890](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11605890/) *(resumo de busca)*.
  Note-se: o ganho é atribuído ao **feedback estruturado**, não à simulação em si.
- `[EVIDÊNCIA]` Estudo quasi-experimental (Karolinska, 2025): feedback gerado por IA após interação
  com paciente virtual melhorou desempenho em OSCE, como **suplemento** ao ensino conduzido por
  especialista — [JMIR Med Educ 2026;e90368](https://mededu.jmir.org/2026/1/e90368).
- `[EVIDÊNCIA]` ECR cruzado multicêntrico: treino conduzido por IA foi **ligeiramente inferior** ao
  treino com atores em habilidades de consulta, com satisfação menor, porém custo muito menor —
  [JMIR Formative 2025;e71667](https://formative.jmir.org/2025/1/e71667).

**Leitura honesta:** há sinal positivo para **feedback estruturado**, e sinal de que IA é
complemento, não substituto. Nada disso mede o nosso desenho específico (avaliação crítica de
hipótese). Portanto, o efeito educacional do Case Clinical AI é `[HIPÓTESE]`, não `[EVIDÊNCIA]`,
e o texto acadêmico deve dizer isso.

## 5. Enquadramento institucional e regulatório

- `[BOA PRÁTICA]` A AAMC publica princípios para uso responsável de IA em educação médica
  (v1.0 jan/2025, v2.0 jul/2025), com ênfase em abordagem centrada no humano, uso ético,
  acesso equitativo e supervisão docente —
  [AAMC](https://www.aamc.org/about-us/mission-areas/medical-education/principles-ai-use).
- `[EVIDÊNCIA]` (normativa) **Resolução CFM nº 2.454/2026** normatiza o uso de IA na medicina no
  Brasil: a responsabilidade e a autoridade sobre diagnóstico e conduta permanecem do médico; IA é
  ferramenta de apoio — [texto oficial](https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2026/2454_2026.pdf).
  **Nossa leitura** é que a resolução trata da **prática assistencial** e não menciona software
  educacional; isso é interpretação nossa e está registrado como questão P1, não como conclusão.

**Implicação:** o projeto se alinha ao princípio central da norma — a decisão clínica é ato
humano — ao posicionar a IA como testadora do raciocínio do estudante, jamais como decisora.

## 6. O que ficou sem resposta

- Nenhuma fonte encontrada mede especificamente **avaliação crítica de hipótese diagnóstica de
  estudante por LLM** com desfecho de aprendizagem. Esta é a lacuna que o projeto ocupa — e é
  também o motivo pelo qual não podemos prometer efeito.
- Escalas de "compatibilidade" de hipótese (muito compatível → incompatível) não têm validação
  psicométrica identificada. Usar como **linguagem descritiva**, nunca como nota (ver P3).
