---
name: medical-sourcing
description: Procedimento para buscar, avaliar e citar fonte clínica ou científica neste projeto, com rotulagem de força de evidência. Use sempre que uma afirmação clínica, um critério diagnóstico, um red flag ou um dado empírico sobre LLMs precisar entrar em docs/ ou em content/cases/.
---

# Sourcing de afirmação clínica ou empírica

## Quando usar

Antes de escrever qualquer frase que um estudante possa aprender como verdade, ou que apareça num
texto acadêmico. Inclui: critérios diagnósticos, red flags, plausibilidade de diferencial, e
também afirmações empíricas sobre comportamento de LLMs.

## Procedimento

### 1. Formule a pergunta

Respondível, com população, intervenção e desfecho quando aplicável. "Dor torácica" não é pergunta.
"Quais achados discriminam SCA de dor musculoesquelética em adulto no PS?" é.

### 2. Busque

- Inglês **e** português quando houver literatura nacional relevante (SBC, SBPT, MS).
- Prefira, nesta ordem: guideline de sociedade → revisão sistemática/meta-análise → estudo primário
  → livro-texto de referência → material institucional.
- Não são fonte: blog, portal de notícias, conteúdo gerado por IA, resumo de terceiros sem link
  para o original.

### 3. Leia antes de citar

Registre honestamente o nível de leitura: `[IL]` integral · `[AB]` abstract · `[RB]` resumo de busca.
**É obrigatório declarar.** `[RB]` não sustenta afirmação em texto final.

### 4. Extraia com limites

Anote: o que a fonte afirma · desenho e população · limitações · **o que ela não permite concluir**.
Nunca extrapole de população diferente sem dizer que está extrapolando.

### 5. Rotule

| Rótulo | Quando | URL |
|---|---|---|
| `[EVIDÊNCIA]` | Estudo primário, revisão sistemática, guideline | obrigatória |
| `[BOA PRÁTICA]` | Consenso sem medição direta | obrigatória |
| `[HIPÓTESE]` | Proposta não testada neste projeto | não |
| `[OPINIÃO]` | Julgamento de engenharia | não |

Preprint recebe `(preprint, sem revisão por pares)`.

### 6. Registre

- Documento em `docs/research/` com a afirmação rotulada.
- Linha em `docs/research/sources.md` com status de leitura.
- Se for para um caso: campo `sources` do próprio JSON, junto do `claim` correspondente.

### 7. Quando não encontrar

Escreva "não encontrado" e abra item em `docs/01-discovery/open-questions.md`.
**Não preencha a lacuna com conhecimento de memória.** Uma lacuna declarada é um resultado; uma
afirmação inventada é um defeito que sobrevive ao projeto.

## Erros que este procedimento existe para impedir

- Citar fonte que não foi aberta.
- Inventar DOI, autor, ano ou magnitude de efeito.
- Transformar `[HIPÓTESE]` em `[EVIDÊNCIA]` sem fonte nova.
- Usar preprint como se fosse revisado por pares.
- Extrapolar de outra população sem declarar.
