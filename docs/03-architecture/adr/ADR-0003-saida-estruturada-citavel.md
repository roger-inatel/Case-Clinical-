> ## ⚠️ SUBSTITUÍDO — ver [ADR-0009](ADR-0009-justificativa-por-selecao-de-evidencias.md)
> Não há saída de modelo para estruturar. **O princípio sobrevive:** evidência precisa estar
> ancorada em um achado identificável. Mudou quem ancora — antes o modelo em runtime, agora o autor,
> uma vez, com revisão humana (`evidenceMatrix` em [data-model.md](../data-model.md)).

# ADR-0003 — Saída estruturada com evidência citável e verificável

**Status:** proposta · **Data:** 2026-08-23

## Contexto

O briefing propõe um schema com `supportingEvidence: []`, `contradictingEvidence: []` etc. A
estrutura está certa em espírito, mas se os itens forem **strings livres**, a saída é estruturada
apenas na forma: continua impossível verificar se a evidência citada existe no caso.

Sem verificabilidade, o schema serve só para não quebrar o parser — perde a função que interessa.

## Opções

**A. Texto livre.** Sem parsing confiável, sem verificação, sem teste determinístico. Fora.

**B. Schema com strings.** Parsing resolvido, verificação impossível.

**C. Schema com itens citáveis:** cada evidência carrega `findingId` + `quote` verbatim; cada crítica
ao raciocínio carrega `excerpt` verbatim do texto do estudante.

## Decisão

**Opção C**, implementada com `output_config.format` (JSON Schema derivado do Zod) e **revalidada
com o mesmo Zod no servidor**.

A citação verbatim é o que transforma a resposta em objeto verificável: `quote` precisa ocorrer
literalmente no achado `findingId` do caso (comparação normalizada de caixa, acentos, espaços e
pontuação). Quem não cita, não entra na tela.

Duas escolhas subordinadas:

1. **Schema semanticamente natural.** A ordem dos campos segue o raciocínio clínico
   (evidência a favor → contra → lacunas → diferenciais → veredito), e não a conveniência de
   armazenamento. Há indicação na literatura de que schemas rígidos pensados para software podem
   degradar a qualidade do raciocínio; um schema que espelha a tarefa reduz esse atrito.
2. **Nada de campo livre "resposta".** Se existisse um campo de texto arbitrário, ele viraria a
   saída real do modelo e todo o resto seria decoração — além de abrir canal para prompt injection.

## Consequências

- O modelo precisa localizar o achado antes de argumentar. Isso é **desejável**: é a disciplina que
  queremos ensinar ao estudante, aplicada à própria IA.
- Itens que o modelo não conseguir citar são perdidos. Aceito: preferimos análise menor e ancorada.
- Precisamos manter um único Zod como fonte do JSON Schema — divergência entre os dois seria bug
  silencioso.
- A UI pode destacar, no texto do caso, exatamente o trecho citado — recurso pedagógico que só
  existe por causa dessa decisão.

## Reversibilidade

**Média.** O schema é contrato entre prompt, verificação, UI e testes. Mudanças exigem
`schemaVersion` e atualização das fixtures.
