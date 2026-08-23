> ## ⚠️ OBSOLETO como decisão — mantido como registro
> A comparação supunha um LLM em runtime a ser ancorado. A V2 elimina o runtime
> ([ADR-0006](../03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md)).
> **A conclusão, porém, foi levada ao limite:** a V1 já concluíra que "a rubrica do caso é a base de
> conhecimento" (opção D). A V2 mantém só isso — sem modelo, sem recuperação, sem verificação de
> citação em runtime. Vale a leitura pelo registro de por que RAG foi descartado: o argumento
> continua de pé.

# Estratégias de Grounding: comparação A–F

Pergunta: **qual combinação reduz alucinação a um nível aceitável com o menor custo e complexidade
para um MVP acadêmico?**

Antes da tabela, o fato que reordena tudo: neste produto **a verdade clínica não precisa vir do
modelo**. Ela já existe, escrita por um humano, no JSON do caso. A tarefa do LLM é *comparação de
texto*, não *recuperação de conhecimento médico*. Isso muda a resposta para "qual grounding usar":
o grounding mais forte disponível é o **próprio caso**.

## Opção A — Prompt engineering

| Aspecto | Avaliação |
|---|---|
| Benefício | Alto onde importa: reduz sycophancy (evidência direta), fixa papel cético, proíbe linguagem de certeza |
| Custo | Zero em execução |
| Complexidade | Baixa — mas prompt sem teste é ilusão de controle |
| Confiabilidade | **Não verificável sozinha.** Instrução não é garantia |
| Implementação | Trivial |
| Adequação ao MVP | **Essencial, insuficiente sozinha** |

## Opção B — Structured output (JSON Schema)

| Aspecto | Avaliação |
|---|---|
| Benefício | Elimina parsing frágil; **e é o que torna a verificação automática possível** — sem campos, não há o que verificar |
| Custo | Zero adicional |
| Complexidade | Baixa (suportado nativamente via `output_config.format`) |
| Confiabilidade | Garante *forma*, não *conteúdo*. Ressalva do "constraint tax" (schema rígido demais pode piorar raciocínio) |
| Implementação | Fácil; schema espelhado em Zod para validar de novo no servidor |
| Adequação ao MVP | **Essencial** |

## Opção C — RAG (recuperação em corpus médico)

| Aspecto | Avaliação |
|---|---|
| Benefício | Real para perguntas médicas abertas. **Não é o nosso caso de uso** |
| Custo | Corpus licenciado, embeddings, vector store, pipeline de ingestão, avaliação de recuperação |
| Complexidade | Alta. Adiciona um modo de falha novo: recuperar trecho irrelevante e ancorar o erro nele |
| Confiabilidade | Ganhos relatados na ordem de poucos pontos percentuais em benchmarks de QA médico; avaliações sistemáticas recentes são mais sóbrias que o entusiasmo do mercado |
| Implementação | Semanas. Sozinha, consumiria o prazo do projeto |
| Adequação ao MVP | **Não.** Resolveria um problema que não temos |

Fontes: [Rationale-Guided RAG, NAACL 2025](https://aclanthology.org/2025.naacl-long.635/);
[Rethinking RAG for Medicine (arXiv 2511.06738)](https://arxiv.org/pdf/2511.06738) *(preprint)*.

## Opção D — Base de conhecimento médica estática

| Aspecto | Avaliação |
|---|---|
| Benefício | **É a nossa escolha, na forma mais enxuta possível:** a base é o conjunto de casos + a rubrica de cada caso (illness script, red flags, diferenciais *can't-miss*, discriminadores), com fontes declaradas |
| Custo | Trabalho humano de autoria — que é justamente o trabalho acadêmico do projeto |
| Complexidade | Baixa: arquivos JSON versionados, validados por schema em CI |
| Confiabilidade | Alta **para o escopo do caso** e nula fora dele — o que é aceitável, porque o sistema nunca sai do caso |
| Implementação | Já é o modelo de dados |
| Adequação ao MVP | **Sim — núcleo da estratégia** |

## Opção E — Verificação multi-agente

| Aspecto | Avaliação |
|---|---|
| Benefício | Pode capturar erro semântico que código não vê (ex.: conclusão forte demais dada a evidência listada) |
| Custo | ~2× por avaliação; latência somada |
| Complexidade | Média — e traz modos de falha próprios (consenso sicofântico, juiz enviesado) |
| Confiabilidade | Incerta sem informação nova; auto-crítica intrínseca não é confiável |
| Implementação | Média |
| Adequação ao MVP | **Condicional** — só disparada por gatilho. Ver ADR-0004 |

## Opção F — Combinação

**Escolhida.** Combinação = **A + B + D + verificação determinística + E condicional**.

A peça que falta nas opções do briefing, e que é a mais valiosa aqui:

### Opção G (proposta) — Verificação determinística de citação

Cada item de evidência produzido pela IA carrega `field` (caminho no JSON do caso) e `quote`
(trecho **verbatim**). Antes de renderizar, o código confere que `quote` ocorre literalmente no
campo indicado (normalizando espaços/acentos/caixa).

| Aspecto | Avaliação |
|---|---|
| Benefício | Detecta invenção de evidência sobre o caso com **precisão determinística**, não probabilística |
| Custo | Zero em execução (é `string.includes` normalizado) |
| Complexidade | Muito baixa |
| Confiabilidade | Alta para o que se propõe: pega evidência inexistente e paráfrase inventada. **Não** detecta erro de julgamento clínico |
| Implementação | Horas |
| Adequação ao MVP | **Sim — é a espinha dorsal da estratégia de validação** |

Isso transforma "confie no modelo" em "verifique o modelo", que é a diferença entre um trabalho
acadêmico defensável e uma demo bonita. É também um **resultado mensurável** para o artigo:
taxa de citações rejeitadas por caso e por versão de prompt.

## Decisão

```
A (prompt cético)  +  B (schema)  +  D (rubrica do caso como base de conhecimento)
                   +  G (verificação determinística de citação)
                   +  E condicional (crítico LLM só sob gatilho)
                   −  C (RAG fora do MVP)
```

Registrado em [ADR-0002](../03-architecture/adr/ADR-0002-sem-rag-no-mvp.md) e
[ADR-0004](../03-architecture/adr/ADR-0004-verificacao-em-camadas.md).
