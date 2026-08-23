# ADR-0008 — Hipótese por vocabulário controlado com autocomplete

**Status:** proposta · **Data:** 2026-08-23

## Contexto

Sem LLM, o sistema precisa reconhecer a hipótese do estudante de forma exata. "Infarto", "IAM",
"IAMCSST", "infarto agudo do miocárdio com supra", "síndrome coronariana aguda" e "enfarte" são a
mesma intenção clínica escrita de seis formas.

Há também uma questão pedagógica: em clínica, o médico **gera** hipóteses. Uma lista de quatro
alternativas avalia reconhecimento, que é uma tarefa cognitivamente diferente.

## Opções

**A. Múltipla escolha.** Trivial de corrigir. Transforma o exercício em reconhecimento; entrega o
diferencial pronto — justamente o que o estudante deveria produzir. A evidência sobre efeito de
teste é mais favorável a múltipla escolha do que o senso comum sugere, mas o argumento decisivo
aqui é **processamento apropriado à transferência**: o treino deve parecer a tarefa real.

**B. Texto livre com normalização e busca por similaridade.** Preserva a geração. Falha em erro de
digitação, sinonímia, negação ("não é pneumonia") e grafia regional. Cada falha é percebida como
defeito do sistema e destrói a confiança na interação.

**C. Combobox sobre vocabulário controlado**, com sugestões apenas após 2–3 caracteres digitados,
busca por rótulo e por sinônimo/sigla.

## Decisão

**Opção C.**

O estudante digita o que pensou (geração), o sistema resolve para um `conceptId` canônico (correção
exata). As sugestões não aparecem antes de alguns caracteres, o que impede varrer a lista — não é
para reconhecer, é para lembrar.

Três elementos obrigatórios do desenho:

1. **`aliases` é requisito funcional.** Toda sigla e sinônimo de uso corrente entra no vocabulário.
   Sinônimo faltando é bug de conteúdo, não limitação aceitável.
2. **"Não há dados suficientes" é conceito do vocabulário**, disponível em todo caso, com o mesmo
   peso visual das demais opções.
3. **Termo não encontrado tem saída honesta:** registra o termo digitado e responde "esta hipótese
   não foi analisada pelo autor deste caso" — nunca "resposta incorreta". Os termos registrados
   viram backlog de vocabulário.

## Consequências

- É preciso manter `content/vocabulary/diagnoses.json` — artefato novo, com custo de curadoria.
- O combobox é o componente de acessibilidade mais crítico da aplicação (teclado, leitor de tela,
  `aria-activedescendant`). Usar primitiva testada, não implementar do zero.
- O espaço de hipóteses é fechado por construção: o mecanismo `naoPrevisto` é obrigatório, não
  opcional.
- Ganho colateral: como o `conceptId` é estável entre casos, torna-se possível dizer "você já
  encontrou TEP no caso 3".

## Reversibilidade

**Alta.** O ponto de decisão é tipado; trocar por múltipla escolha é mudar um componente e o
formato da chave daquele tipo. O vocabulário continua útil de qualquer forma.
