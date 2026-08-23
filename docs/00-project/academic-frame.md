# Enquadramento Acadêmico — V2

Esqueleto do texto final (TCC/artigo). Mudanças em §9.

## 1. Problema

Feedback sobre o **processo** de raciocínio clínico é escasso e caro. O estudante treina produzir
diagnóstico; treina pouco **testar a própria hipótese**. Fechamento prematuro é erro de processo
documentado como frequente em estudantes `[EVIDÊNCIA — E4]`.

## 2. Hipótese

Um simulador de decisão clínica com **casos fictícios estruturados em passos críticos** e
**avaliação determinística** pode oferecer feedback formativo útil, com risco de erro clínico
controlável e sem depender de IA generativa em tempo de execução.

Estado: `[HIPÓTESE]`. Não medimos desfecho de aprendizagem.

## 3. Metodologia

Discovery com rotulagem de evidência → análise de risco → decisões registradas em ADR → **revisão
completa de arquitetura (Discovery V2)** quando uma premissa mudou → implementação em fases →
autoria de conteúdo com pipeline assistido por IA e revisão humana → validação automática e revisão
clínica.

O registro da própria mudança de arquitetura é resultado metodológico: a V1 está preservada, com
cada decisão marcada como mantida, modificada ou obsoleta
([v2-migration-status.md](../01-discovery/v2-migration-status.md)). Um trabalho que só mostra o
caminho que deu certo esconde a parte mais instrutiva.

## 4. Fundamentação dos formatos de avaliação

O sistema não inventa forma de avaliar raciocínio clínico. Ele usa formatos com validação publicada:

| Formato | Uso no sistema | Ressalva declarada |
|---|---|---|
| **Key features** | Estrutura de 3–5 pontos de decisão por caso, com crédito parcial | Confiabilidade de exame exige 25–40 casos; temos 8 → **formativo, não somativo** |
| **Script concordance** (formato) | "Este dado torna sua hipótese mais ou menos provável?" | Sem painel de especialistas: direção definida pelo autor. **Não é SCT psicométrico** |
| **Representação do problema** | Chips de qualificadores semânticos | Avaliado como "mais ou menos completo", nunca certo/errado |
| **Autoexplicação** | Texto livre não avaliado, comparado depois com a análise do autor | O benefício vem de escrever; **não prometemos analisar o texto** |
| **Feedback elaborado** | Fragmentos compostos, revelados com interação | Evidência mista sobre superioridade; estudantes tendem a ignorar feedback extenso |

Detalhe e fontes em [research/assessment-formats.md](../research/assessment-formats.md).

## 5. Arquitetura

Aplicação Next.js com exportação estática. Conteúdo em JSON versionado, separado em caso e chave.
Núcleo de avaliação como **função pura** — sem rede, sem estado, sem aleatoriedade. Nenhuma chamada
a serviço externo em runtime. Detalhe em [03-architecture/](../03-architecture/).

## 6. Papel da IA

IA generativa é usada **exclusivamente durante o desenvolvimento**: pesquisa de literatura, proposta
de casos, crítica adversarial (red team), revisão de consistência, geração de testes. Nenhuma
chamada a modelo ocorre em produção. Todo conteúdo clínico passa por revisão humana obrigatória,
e o uso de IA na autoria é declarado no próprio dado (`authoring.aiAssisted`).

A decisão de manter a IA fora do runtime é **fundamentada**, não estética: a pesquisa reunida sobre
alucinação, sycophancy, auto-correção e calibração em contexto médico
([research/llm-reliability-in-medicine.md](../research/llm-reliability-in-medicine.md)) descreve
riscos que só são plenamente mitigáveis removendo o modelo do caminho crítico.

## 7. Avaliação

Não avaliamos acurácia de modelo — não há modelo. Avaliamos **qualidade do conteúdo e do processo
de produzi-lo**:

| Métrica | Fonte |
|---|---|
| Defeitos por caso encontrados pelo red team, por categoria e severidade | relatórios de red team |
| **Defeitos encontrados pelo revisor humano que o red team não encontrou** | comparação dos dois relatórios |
| Defeitos que passaram pelas três barreiras | registro posterior |
| Rodadas de correção até aprovação | histórico por caso |
| Horas de autoria e revisão por caso | fase 1 e fase 5 |
| Cobertura do motor (espaço de sessões varrido) | suíte de testes |
| Taxa de `naoPrevisto` no teste exploratório | sessões dos estudantes-piloto |

A segunda linha é o achado mais interessante e mais honesto do trabalho: ela mede **o limite da IA
como revisora de conteúdo médico**, e é publicável em qualquer direção.

## 8. Limitações (declarar no texto final)

1. Casos fictícios e autorais — validade externa limitada.
2. Espaço de hipóteses fechado: o sistema não responde ao que o autor não previu (mitigado por
   `naoPrevisto`, não eliminado).
3. 8 casos não sustentam inferência psicométrica sobre competência — o instrumento é formativo.
4. O formato "script concordance" é usado sem painel de especialistas; não herda a validade do SCT.
5. Nenhuma medição de desfecho de aprendizagem; sem grupo controle.
6. Revisão clínica por um único revisor, amostra pequena, sem cálculo de concordância entre juízes.
7. A aplicação não impede acesso ao gabarito pelo navegador (consequência aceita do desenho estático).
8. Risco residual de erro clínico que as três barreiras não capturaram.

## 9. Mudanças desde a V1

| V1 | V2 |
|---|---|
| Contribuição = arquitetura de contenção de LLM em runtime | Contribuição = **pipeline de autoria assistida por IA com revisão humana** + uso de formatos de avaliação validados |
| Avaliação = taxa de ancoragem, Δ sycophancy, recall de red flag pela IA | Avaliação = defeitos por barreira, sobreposição red team × humano, custo de autoria |
| Limitações centradas no comportamento do modelo | Limitações centradas em cobertura de conteúdo e validade do instrumento |
| Pesquisa sobre LLMs era fundamento do produto | Pesquisa sobre LLMs é **justificativa para não usá-los no produto** |

## 10. Conclusão (a preencher)

A preencher após a fase 6. Resultados negativos são esperados e devem ser relatados — em especial
se o red team de IA se mostrar pouco eficaz frente ao revisor humano, ou se o custo de autoria
inviabilizar o catálogo planejado. O projeto está desenhado para que isso seja detectável.
