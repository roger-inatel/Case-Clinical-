> ## ✅ VÁLIDO na V2 — com novo papel
> Este documento não descreve mais um risco a ser contido no produto: ele **justifica a decisão de
> não haver LLM no produto** ([ADR-0006](../03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md)).
> As §§3–5 (limites de auto-crítica, multi-agente e juiz LLM) continuam aplicáveis — agora ao
> **pipeline de autoria**, onde autor e crítico são o mesmo modelo
> ([authoring-pipeline.md](../03-architecture/authoring-pipeline.md) §4).

# Pesquisa: Confiabilidade de LLMs em Medicina

> Mesma nota de honestidade do arquivo anterior: fontes localizadas por busca; onde só o resumo
> foi consultado, está declarado. Números precisam de conferência no texto integral antes de irem
> para um artigo.

## 1. Alucinação — a magnitude depende brutalmente da tarefa

| Tipo de tarefa | O que a literatura sugere |
|---|---|
| **Sumarização ancorada** (o texto está no prompt) | Taxas baixas. Framework com 12.999 sentenças anotadas por clínicos reportou ~1,47% de alucinação e ~3,45% de **omissão** — [npj Digital Medicine 2025](https://www.nature.com/articles/s41746-025-01670-7) |
| **Geração aberta / diagnóstico "de memória"** | Taxas muito mais altas e difíceis de detectar; benchmarks dedicados existem justamente porque o problema persiste — [MedHallu, EMNLP 2025](https://aclanthology.org/2025.emnlp-main.143/), [Medical Hallucinations in Foundation Models (arXiv 2503.05777)](https://arxiv.org/pdf/2503.05777) *(preprint)* |
| **Aderência a guideline** | Omissão de recomendações é tão relevante quanto invenção — [PMC13110572](https://pmc.ncbi.nlm.nih.gov/articles/PMC13110572/) |

**Conclusão de projeto (`[OPINIÃO]` fundamentada):** a diferença entre ~1% e dezenas de por cento
não está no modelo — está no **enquadramento da tarefa**. Toda a arquitetura de IA deste projeto
existe para transformar "diagnostique este paciente" (geração aberta) em "compare esta afirmação
com este texto" (tarefa ancorada). Ver `docs/03-architecture/ai-strategy.md`.

**Consequência subestimada:** no estudo ancorado, a taxa de **omissão** foi maior que a de
alucinação. Para nós, omitir um diferencial perigoso é pior que citar um a mais — por isso a
cobertura de red flags é verificada por código contra a rubrica do caso, e não confiada ao modelo.

## 2. Sycophancy — o risco central deste produto

- `[EVIDÊNCIA]` Cinco LLMs de fronteira aceitaram cumprir solicitações **logicamente inválidas** em
  contexto médico (equivalência falsa entre medicamentos), com conformidade chegando a 100%, mesmo
  possuindo o conhecimento necessário para recusar. Prompting simples e fine-tuning reduziram o
  comportamento de forma marcante, sem prejuízo de desempenho —
  ["When helpfulness backfires", npj Digital Medicine](https://www.nature.com/articles/s41746-025-02008-z).
- `[EVIDÊNCIA]` Em conversas médicas **multi-turno** com pressão progressiva do usuário,
  comportamento sicofântico foi observado em ~58% dos casos, e sycophancy "regressiva" (abandono de
  uma resposta correta) em ~15% — [ACL 2026, HEALING workshop](https://aclanthology.org/2026.healing-1.2/).
- `[EVIDÊNCIA]` Desafiar o modelo ("tem certeza?") degrada desempenho de forma sistemática —
  [FlipFlop experiment (arXiv 2311.08596)](https://arxiv.org/pdf/2311.08596) *(preprint)*.

**Três decisões derivam disto:**

1. **Interação single-turn.** O vetor mais forte documentado é a *insistência ao longo de turnos*.
   Não expor um chat **elimina** o vetor, em vez de tentar resistir a ele. Se um dia houver diálogo,
   ele precisa de mitigação explícita e testada — não é um "detalhe de UI".
2. **A hipótese não é uma fala.** Ela entra no prompt como campo de dados delimitado
   (`hipotese_sob_teste`), com instrução explícita de que a origem é um estudante em treinamento e
   de que a afirmação **não** constitui informação clínica sobre o caso.
3. **Prompting anti-sycophancy funciona.** A fonte acima mostra redução marcante por prompt. É
   barato e é o primeiro instrumento — não o último.

## 3. O modelo não conserta a si mesmo de graça

- `[EVIDÊNCIA]` Revisão crítica: LLMs **não** corrigem confiavelmente erros de raciocínio por
  auto-crítica intrínseca; sem sinal externo confiável, a auto-correção frequentemente **piora** o
  resultado. Funciona quando há feedback externo verificável —
  [TACL, "When Can LLMs Actually Correct Their Own Mistakes?"](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00713/125177/When-Can-LLMs-Actually-Correct-Their-Own-Mistakes).

**Implicação para o "agente crítico" pedido no briefing:** um segundo LLM criticando o primeiro
*sem informação nova* é auto-crítica cara com outro nome. Um verificador que compara a resposta
com o **JSON do caso** é feedback externo verificável — e pode ser código determinístico.
Portanto: primeiro o verificador; o crítico LLM só onde o código não alcança. Ver ADR-0004.

## 4. Multi-agente: ganho real, mas com modos de falha documentados

- `[EVIDÊNCIA/preprint]` Frameworks de debate multi-agente superam baselines em fact-checking, mas
  a literatura documenta *degeneration of thought*, juízes enviesados, ganhos atribuíveis ao **voto
  majoritário** e não ao debate, e queda de acurácia ao longo das rodadas por **consenso sicofântico
  entre agentes** — [MAD-Fact (arXiv 2510.22967)](https://arxiv.org/pdf/2510.22967) e correlatos.
  O custo cresce aproximadamente N× em chamadas de LLM.

**Leitura:** multi-agente não é automaticamente mais confiável nem barato. Para um MVP acadêmico,
o ganho marginal não justifica N× de custo e latência **antes** de esgotarmos a verificação
determinística. Registrado em ADR-0004.

## 5. LLM-como-juiz: para avaliação offline, com ressalvas

- `[EVIDÊNCIA/preprint]` Juízes LLM exibem **self-preference** (favorecem a própria saída),
  **position bias** e **verbosity bias** —
  [survey (arXiv 2411.15594)](https://arxiv.org/pdf/2411.15594),
  [position bias (arXiv 2406.07791)](https://arxiv.org/html/2406.07791v5).

**Implicação:** a suíte de avaliação **não** pode se apoiar principalmente em LLM-juiz. As métricas
primárias precisam ser determinísticas. LLM-juiz entra apenas como triagem, com randomização de
ordem, e nunca como número reportado isoladamente. Ver `docs/06-quality/ai-eval-suite.md`.

## 6. Confiança verbalizada é mal calibrada

- `[EVIDÊNCIA/preprint]` Modelos são sistematicamente **superconfiantes**: intervalos declarados
  como 99% cobrem a resposta correta ~65% das vezes —
  [FermiEval (arXiv 2510.26995)](https://arxiv.org/html/2510.26995v1). Métodos baseados em tokens
  calibram melhor que confiança auto-verbalizada —
  [On Verbalized Confidence Scores (arXiv 2412.14737)](https://arxiv.org/html/2412.14737v2).
- Análise específica de confiança autorreportada em gastroenterologia —
  [arXiv 2503.18562](https://arxiv.org/pdf/2503.18562) *(preprint)*.

**Implicação:** exibir "87% de confiança" seria enganoso. O schema usa **três níveis grosseiros**
(`baixa | moderada | alta`); a UI os traduz em linguagem ("os dados disponíveis sustentam
fracamente…"); e o sistema **rebaixa** a confiança automaticamente quando o verificador encontra
problema. A calibração exibida é, em parte, regra de código — não auto-relato do modelo.

## 7. Saída estruturada: benefício com uma ressalva

- `[EVIDÊNCIA/preprint]` Decodificação restrita entrega validade sintática alta, mas há **tensão
  documentada entre formato rígido e qualidade de raciocínio** quando o schema força estados
  intermediários pensados para o software e não para a tarefa —
  [JSONSchemaBench (arXiv 2501.10868)](https://arxiv.org/pdf/2501.10868),
  ["The Constraint Tax" (arXiv 2605.26128)](https://arxiv.org/pdf/2605.26128).

**Implicação de desenho:** manter o schema **semanticamente natural** para a tarefa clínica
(evidência a favor → evidência contra → lacunas → diferenciais → veredito) em vez de campos
otimizados para armazenamento; e permitir que o modelo raciocine antes de preencher, usando o
*adaptive thinking* do modelo — cujo conteúdo **não** é persistido nem exibido (princípio 8 do
CLAUDE.md).

## 8. Síntese: o que realmente reduz risco aqui

Ordenado por relação custo/benefício **neste projeto**:

1. **Ancorar a tarefa no texto fornecido** (o caso), em vez do conhecimento paramétrico — maior ganho.
2. **Rubrica autoral por caso** injetada no prompt — remove a necessidade de o modelo "saber" o
   diagnóstico.
3. **Verificação determinística de citação** contra o JSON do caso — feedback externo real, custo ~zero.
4. **Prompting anti-sycophancy + hipótese como dado** — eficácia sugerida por evidência, custo zero.
5. **Saída estruturada com schema semântico** — é o que torna (3) e (4) verificáveis.
6. **Confiança grosseira + rebaixamento por regra** — corrige superconfiança conhecida.
7. **Crítico LLM condicional** — só quando (3) dispara ou o veredito é forte. Último recurso.
8. **RAG** — fora do MVP; ver `grounding-strategies-comparison.md`.
