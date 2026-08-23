# Regras de Pesquisa

## Rótulos obrigatórios

Toda afirmação em `docs/` recebe um dos rótulos abaixo. Sem rótulo = afirmação inválida.

| Rótulo | Significa | Exige URL? |
|---|---|---|
| `[EVIDÊNCIA]` | Estudo primário, revisão sistemática, meta-análise ou guideline de sociedade médica | Sim |
| `[BOA PRÁTICA]` | Consenso institucional/profissional sem medição direta do efeito | Sim |
| `[HIPÓTESE]` | Proposta de engenharia plausível, não testada neste projeto | Não |
| `[OPINIÃO]` | Julgamento de engenharia | Não |

## Hierarquia de fontes clínicas (mais forte → mais fraca)

1. Guidelines de sociedades (SBC, AHA/ACC, ESC, SBPT, BTS, IDSA, OMS) e protocolos do MS.
2. Revisões sistemáticas / meta-análises (Cochrane, JAMA, Lancet, NEJM).
3. Estudos primários em periódicos indexados com revisão por pares.
4. Livros-texto de referência (Harrison, Cecil, Sabiston, Nelson) e UpToDate.
5. Material didático institucional de escola médica reconhecida.

**Não são fonte aceitável:** blog, portal de notícias, conteúdo gerado por IA, resposta de LLM,
resumo de terceiros sem link para o original, post em rede social.

## Regras duras

- **Nunca cite o que não foi lido.** Se só o abstract foi lido, escreva "(abstract)".
- **Nunca invente** DOI, autor, ano, número de participantes ou magnitude de efeito.
- Se a fonte for preprint (arXiv, medRxiv), rotule **`(preprint, sem revisão por pares)`**.
- Divergência entre fontes é registrada, não resolvida por preferência.
- Toda afirmação clínica que entra num **caso** (`content/cases/*.json`) carrega sua fonte no
  campo `sources` do próprio caso — a rastreabilidade fica no dado, não só na documentação.
- Ao migrar uma afirmação de `[HIPÓTESE]` para `[EVIDÊNCIA]`, cite a fonte nova **no mesmo commit**.

## Sobre pesquisa feita por LLM

Um agente de pesquisa pode **encontrar** fontes; não pode **substituí-las**. Todo `[EVIDÊNCIA]`
precisa de URL verificável. Se a busca falhou, o correto é escrever "não encontrado" e abrir
questão em `docs/01-discovery/open-questions.md` — não preencher com conhecimento paramétrico.

## Arquivos

- `clinical-reasoning-education.md` — como se ensina e se avalia raciocínio clínico.
- `llm-reliability-in-medicine.md` — limitações de LLM em Medicina e o que as mitiga.
- `grounding-strategies-comparison.md` — comparação das estratégias A–F com custo e adequação.
- `sources.md` — bibliografia consolidada.
