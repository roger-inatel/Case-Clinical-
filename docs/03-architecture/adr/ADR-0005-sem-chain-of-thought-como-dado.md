# ADR-0005 — Raciocínio interno do modelo não é dado da aplicação

**Status:** aceita (restrição do briefing, §16) · **Data:** 2026-08-23

## Contexto

É tentador exibir o "raciocínio" do modelo a um estudante: parece transparência e parece
pedagógico. O briefing proíbe, e a proibição está certa por razões que vale registrar — porque a
tentação vai voltar.

## Razões

1. **Raciocínio interno não é justificativa auditável.** Ele não passa pelas nossas camadas de
   verificação: não tem `findingId`, não tem `quote`, não pode ser conferido contra o caso. Exibir
   texto não verificado ao lado de texto verificado destrói a distinção que o produto inteiro
   tenta construir.
2. **Ele é persuasivo na proporção errada.** Um estudante lendo raciocínio fluente tende a confiar
   mais, não menos — agrava o risco de automation bias (R4) exatamente onde a garantia é menor.
3. **Não é registro fiel do processo do modelo.** Tratá-lo como explicação causal é uma afirmação
   forte que não podemos sustentar.
4. **Persistir cria obrigação.** Guardar exige política de retenção, versionamento e explicação de
   por que aquilo aparece — custo sem contrapartida.

## Decisão

O *adaptive thinking* do modelo **permanece ligado** (a tarefa é raciocínio comparativo e se
beneficia dele), com `display: "omitted"`. O conteúdo do raciocínio não é recebido, exibido,
logado nem persistido.

O que a aplicação expõe como "transparência" é outra coisa, e melhor: evidências citadas com
trecho literal, o que a IA não conseguiu sustentar (itens removidos pela verificação), o que falta
no caso, e o veredito de verificação (ok / degradado / bloqueado).

## Consequências

- Depuração de prompt acontece em desenvolvimento, com a suíte de avaliação — não com logs de
  raciocínio em produção.
- Se um dia precisarmos de rastro para pesquisa, o que se registra é **entrada, saída estruturada e
  resultado da verificação** — dados que sustentam análise sem alegar acesso ao processo do modelo.

## Reversibilidade

**Alta**, tecnicamente. Mas reverter exigiria refutar as quatro razões acima — o que é o ponto de
existir este ADR.
