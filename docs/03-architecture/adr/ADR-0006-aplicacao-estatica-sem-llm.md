# ADR-0006 — Aplicação estática, sem LLM em runtime

**Status:** aceita (decisão do briefing V2) · **Data:** 2026-08-23 · **Substitui:** ADR-0001

## Contexto

A V1 colocava um LLM no caminho crítico e construía uma arquitetura de contenção em torno dele:
saída estruturada, verificação de citação, crítico condicional, endpoint custodiando chave. Aquilo
resolvia o problema, mas o problema era autoinfligido — existia porque escolhemos ter um modelo
gerando texto para o estudante.

A decisão V2 é remover a causa: **nenhuma chamada a LLM em produção**.

## Opções

**A. Manter o LLM em runtime com contenção (V1).** Feedback adaptável a qualquer justificativa em
texto livre. Custo: chave, endpoint, custo por uso, latência, indisponibilidade de terceiros, e um
risco residual de erro clínico que nenhuma verificação elimina inteiramente.

**B. Estático puro, avaliação determinística.** Feedback limitado ao que foi previsto pelo autor.
Zero custo, zero latência de terceiros, zero risco de alucinação, funciona offline. Toda a carga de
qualidade migra para a autoria.

**C. Híbrido — determinístico com "explicação extra" opcional por LLM.** Some as vantagens e as
desvantagens: continua exigindo chave, custo e contenção, para um enfeite.

## Decisão

**Opção B.** Aplicação Next.js com `output: 'export'`, publicável em qualquer host estático.

O que se perde é real e deve ser dito: **o sistema não consegue mais responder a um raciocínio que
o autor não previu**. É o preço, e ele é pago com o mecanismo `naoPrevisto`
([evaluation-engine.md](../evaluation-engine.md) §6), que responde com honestidade em vez de
improvisar.

O que se ganha, além do óbvio: seis riscos da V1 (alucinação, sycophancy, prompt injection,
vazamento de chave, custo descontrolado, indisponibilidade de API) **deixam de existir por
construção** — não são mitigados, são eliminados. Nenhuma quantidade de engenharia de contenção
alcança esse resultado.

## Consequências

- `output: 'export'` remove Route Handlers e middleware: a restrição passa a ser verificada pelo
  build, não por disciplina. Tentar adicionar uma rota quebra o build.
- Deploy em GitHub Pages passa a ser possível.
- A qualidade do produto passa a ser **exatamente** a qualidade dos 8 casos.
- O gabarito chega ao navegador (ver ADR-0007).
- `evaluate()` é função pura: se um dia houver servidor, ela roda lá sem reescrita.

## Reversibilidade

**Média.** Voltar a ter IA exigiria reintroduzir servidor, chave e toda a contenção da V1 — que está
documentada e não foi apagada. Mas o desenho de conteúdo da V2 (pontos de decisão, chave, matriz de
evidências) permaneceria válido: ele não depende da ausência de IA. Se um dia entrar, entra
**depois** do motor determinístico, como comentário adicional rotulado — nunca como avaliador.
