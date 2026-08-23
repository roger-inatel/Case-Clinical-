# Registro de Riscos — V2

> Revisão da V1. Escala: Impacto (I) e Probabilidade (P). Ordenado por severidade.

## Primeiro: o que a V2 eliminou

Seis riscos da V1 **deixaram de existir por construção** — não foram mitigados, foram removidos com
a causa ([ADR-0006](../03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md)):

| V1 | Estado |
|---|---|
| R1 — IA inventa evidência clínica | ❌ eliminado (não há geração em runtime) |
| R2 — IA concorda com o estudante (sycophancy) | ❌ eliminado |
| R5 — Prompt injection | ❌ eliminado (não há prompt) |
| R6 — Vazamento da API key | ❌ eliminado (não há chave) |
| R7 — Custo descontrolado / abuso | ❌ eliminado (custo de runtime é zero) |
| R10 — Indisponibilidade da API | ❌ eliminado (nenhuma dependência externa) |

Esse é o ganho central da V2 e vale registrar com clareza no texto acadêmico. **O que sobrou, e o
que surgiu, está abaixo — e concentra-se todo em um lugar: o conteúdo.**

---

## N1 — Qualidade e gargalo de autoria · I: Alto · P: **Alta**
*(era R3 na V1, promovido ao topo)*

Toda a confiabilidade do produto agora está na autoria. Um caso ruim não tem rede: nenhuma
verificação em runtime vai perceber, e o estudante aprende o erro com a confiança de quem leu um
material revisado.

E há o gargalo: 8 casos × (pesquisa + desenho + autoria + red team + correção + revisão humana) é a
maior linha de esforço do projeto — e a mais fácil de subestimar, porque "escrever um caso" soa
rápido até você preencher a primeira `evidenceMatrix`.

**Mitigação [MVP]:** as três barreiras de [content-review-protocol.md](../06-quality/content-review-protocol.md) ·
red team obrigatório em **todo** caso · nenhum caso `approved` sem revisor humano nomeado ·
**fase 1 do roadmap autora um único caso ponta a ponta para medir o custo real antes de assumir 8** ·
reduzir o catálogo é decisão legítima e prevista.

## N2 — Erro clínico não detectado pelas três barreiras · I: Alto · P: Média

O caso passa em CI, o red team não vê, o revisor humano não vê — e há um erro. É o risco residual
que nenhum processo elimina.

**Mitigação [MVP]:** fontes rastreáveis por afirmação (`sources.usedFor`), de modo que o erro seja
**auditável depois** · aviso de protótipo educacional experimental em pontos visíveis · canal
declarado para reportar erro de conteúdo · política de correção: erro reportado invalida
`approved` até nova revisão.
**Aceito explicitamente:** um protótipo revisado por um docente não tem a garantia de um material
didático editorado. O texto acadêmico deve dizer isso, não escondê-lo.

## N3 — Feedback percebido como genérico · I: Médio · P: **Alta**

Feedback pré-escrito repete. No terceiro caso, o estudante reconhece o padrão e para de ler — e a
evidência mostra que estudantes já ignoram feedback elaborado mesmo quando ele é bom.

**Mitigação [MVP]:** feedback **composto** de fragmentos, não escolhido em bloco — dois estudantes
com a mesma hipótese e caminhos diferentes recebem textos diferentes
([evaluation-engine.md](../03-architecture/evaluation-engine.md) §5) · seção "o que você fez"
derivada da sessão, sempre diferente · revelação por etapas com interação obrigatória em vez de
muro de texto · fragmentos escritos **por achado**, não por veredito.

## N4 — Hipótese válida não prevista pelo autor · I: Médio · P: **Alta**

O espaço de hipóteses é fechado. O estudante vai propor algo razoável que não está na chave — é
questão de tempo, não de possibilidade.

**Mitigação [MVP]:** estado `naoPrevisto` explícito e honesto ("esta hipótese não foi analisada pelo
autor deste caso — isso não significa que esteja errada") · registro local dos conceitos não
previstos, que vira backlog de autoria · red team obrigado a listar diferenciais faltantes.
**Não mitigável integralmente** — é o preço direto do ADR-0006 e está declarado como limitação.

## N5 — Rigidez do vocabulário controlado · I: Médio · P: Média

Sinônimo ou sigla faltando trava a interação, e o estudante culpa o sistema — com razão.

**Mitigação [MVP]:** `aliases` tratado como requisito funcional, não como conveniência · teste que
falha se um conceito tiver menos de 2 aliases · busca tolerante a acento e caixa · saída sempre
disponível para termo não encontrado · termos digitados sem correspondência ficam registrados.

## N6 — Gabarito visível no cliente · I: Baixo · P: **Alta**

Sem servidor, o `.key.json` chega ao navegador.

**Mitigação [MVP]:** carregamento tardio (só após a primeira submissão) · aviso honesto na
documentação. **Aceito**: não há nota, ranking ou certificado em jogo — o único prejudicado por
espiar é quem espia ([ADR-0007](../03-architecture/adr/ADR-0007-gabarito-no-cliente.md)).

## N7 — Estudante trata o conteúdo como verdade absoluta · I: Médio · P: Média
*(era R4, automation bias — mudou de natureza)*

O risco não é mais confiar demais na IA; é confiar demais num material de protótipo. Em certo
sentido é pior: o texto agora **é** de um humano, o que aumenta a autoridade percebida.

**Mitigação [MVP]:** aviso de protótipo educacional experimental na home, na visão geral do caso e
no rodapé do resultado · fontes visíveis no fechamento de cada caso · linguagem de compatibilidade
("compatível com os dados"), nunca de certeza diagnóstica · nenhum caso apresenta conduta ou
tratamento.

## N8 — Escopo do produto confundido com ferramenta clínica · I: Alto · P: Baixa
*(era R11)*

**Mitigação [MVP]:** enquadramento educacional explícito · casos rotulados como fictícios · não
existe campo para "meus sintomas" · o estudante só formula hipótese **sobre um caso do catálogo**.

## N9 — Sobrecarga cognitiva da interface · I: Médio · P: Média *(novo)*

A V2 tem seis tipos de ponto de decisão. Chips de qualificadores, combobox, escala de probabilidade,
seleção de evidências, escolha de exames. Se o estudante gastar energia entendendo **a interface**,
sobra menos para raciocinar — e o exercício perde o objeto.

**Mitigação [MVP]:** o caso fácil de cada especialidade funciona como tutorial do formato · um tipo
novo de ponto de decisão é introduzido por vez · microcópia explicando o que se espera em cada um ·
teste exploratório com estudantes na fase 6 focado exatamente nisso.

## N10 — Prazo acadêmico · I: Alto · P: Média *(novo, explicitado)*

A fase 5 (catálogo) é a fase longa e vem por último. Se atrasar, atrasa a entrega.

**Mitigação [MVP]:** cada caso é incremento entregável · a fase 1 mede o custo antes do
compromisso · reduzir de 8 para 6 casos é decisão prevista e sem prejuízo estrutural · o produto
está funcional ao fim da fase 4, com um caso.
