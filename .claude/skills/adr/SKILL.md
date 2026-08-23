---
name: adr
description: Registrar uma decisão arquitetural no formato do projeto. Use ao adicionar dependência, adicionar chamada de rede, alterar schema do caso ou da resposta da IA, ou aumentar custo por interação — e sempre que uma escolha relevante for feita entre alternativas.
---

# Escrever um ADR

## Quando é obrigatório

A mudança (a) adiciona dependência, (b) adiciona chamada de rede, (c) altera o schema do caso ou da
resposta da IA, ou (d) aumenta o custo por interação. Também quando uma alternativa razoável foi
descartada e alguém no futuro vai perguntar por quê.

**Não é obrigatório** para mudanças que removem código ou simplificam.

## Procedimento

1. Numere sequencialmente: `docs/03-architecture/adr/ADR-NNNN-slug-curto.md`.
2. Escreva **antes** de implementar. ADR escrito depois é justificativa, não decisão.
3. Use o formato abaixo, na íntegra.

## Formato

```markdown
# ADR-NNNN — <decisão em uma linha, no imperativo>

**Status:** proposta | aceita | substituída por ADR-XXXX · **Data:** AAAA-MM-DD

## Contexto
Qual é a força que exige uma decisão? Que restrição do projeto está em jogo?
Sem "seria bom ter". Um problema concreto.

## Opções
Ao menos duas alternativas reais, cada uma com custo, complexidade e modo de falha.
Uma opção que ninguém consideraria de verdade não conta como opção.

## Decisão
O que foi escolhido e o critério que decidiu. Se houve uma restrição decisiva, nomeie-a.

## Consequências
O que fica mais fácil, o que fica mais difícil, o que passa a ser obrigatório manter.
Inclua as consequências ruins — um ADR só com vantagens não foi pensado.

## Reversibilidade
Alta / média / baixa, e **o que exatamente** seria preciso mudar para reverter.
```

## Padrões de qualidade

- **Opção rejeitada precisa parecer tentadora.** Se as alternativas foram descritas como
  obviamente ruins, a análise foi feita depois da decisão.
- **Consequência negativa é obrigatória.** Toda decisão custa algo.
- **Reversibilidade é o campo mais útil no futuro.** É o que permite decidir rápido agora:
  decisão reversível não precisa de consenso; irreversível precisa.
- Prefira uma página. ADR longo não é lido, e ADR não lido não existe.

## Depois de escrever

- Referencie o ADR no documento de arquitetura afetado.
- Se substituir um ADR anterior, marque o antigo como `substituída por ADR-NNNN` — nunca o apague.
  O histórico de decisões descartadas é parte do valor acadêmico do projeto.
