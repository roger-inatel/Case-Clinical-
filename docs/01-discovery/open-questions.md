# Questões em Aberto — V2

Legenda: **[D]** decisão humana antes de implementar · **[P]** precisa de pesquisa · **[A]** assumido.

## Resolvidas pelo briefing V2

| V1 | Resolução |
|---|---|
| D1 — onde fica a chave da API | **Não há chave.** Aplicação estática ([ADR-0006](../03-architecture/adr/ADR-0006-aplicacao-estatica-sem-llm.md)) |
| D5 — orçamento de API | **Zero em runtime.** O custo virou hora de autoria e de revisão |
| D6 — crítico LLM no MVP | **Não existe em runtime.** Virou red team de conteúdo, obrigatório |
| D3 — especialidades | Cardiologia + Pneumologia (confirmado) |
| D4 — número de casos | 8, com distribuição 1 fácil / 2 intermediários / 1 avançado por especialidade |

## Bloqueiam a implementação

| # | Questão | Opções | Recomendação |
|---|---|---|---|
| **D2** | **Quem é o revisor clínico?** | (a) docente/médico nomeado; (b) estudante avançado; (c) ninguém | **(a).** Continua sendo a decisão mais importante do projeto — e na V2 é ainda mais crítica: não há verificação em runtime, e `reviewStatus: "approved"` é campo exclusivo de humano |
| D7 | Idioma do conteúdo e da interface | pt-BR / en | **pt-BR** |
| **D8** | Público-alvo preciso | (a) 3º–4º ano; (b) 5º–6º ano/internato; (c) ambos | **(c) com o caso fácil como tutorial.** A escolha muda a dificuldade dos casos e a granularidade das etapas |
| **D9** | Quantos pontos de decisão por caso | 3 / 5 / variável | **Variável (3–5), definido por caso pelo `educational-design`.** Fixar o número produziria pontos de decisão artificiais em passos não críticos |
| D10 | O texto livre de justificativa é obrigatório ou opcional? | obrigatório / opcional | **Obrigatório no `final-hypothesis`, opcional nos demais.** O benefício da autoexplicação vem de escrever; torná-lo opcional em todo lugar significa que quase ninguém escreve |
| D11 | Feedback imediato por ponto de decisão ou consolidado no fim? | imediato / fim / misto | **Misto:** imediato nos pontos processuais (representação, exames, deslocamento de probabilidade), consolidado nos diagnósticos. Ver [ux-flow.md](../04-ux/ux-flow.md) §3 |
| D12 | Casos aprovados podem ser editados depois? | livre / exige nova revisão | **Exige nova revisão.** Mudar um achado pode invalidar a chave inteira. `approved` volta a `draft` |

## Precisam de pesquisa antes de decidir

| # | Questão | Como resolver |
|---|---|---|
| **P6** | Qual granularidade de etapa mantém o raciocínio ativo sem virar burocracia? 4 etapas × 5 pontos de decisão pode cansar antes de ensinar | Piloto do C1 na fase 1 + teste exploratório com 2–3 estudantes na fase 6 |
| **P7** | Chips de qualificadores semânticos funcionam com estudante brasileiro de graduação, ou o vocabulário é pouco familiar? | Testar no piloto; se falhar, o ponto de decisão `problem-representation` vira opcional |
| P2 | Serial-cue favorece quem já tem *illness scripts* formados — como não punir iniciante? | Mantido da V1: "ver caso completo" sempre disponível; caso fácil como tutorial. Ligado a D8 |
| P3 | A escala de compatibilidade em 6 níveis é defensável? | Resolvido em parte: é **descritiva, não nota** ([ADR-0010](../03-architecture/adr/ADR-0010-perfil-sem-nota-agregada.md)). Falta declarar isso na UI |
| P1 | A Resolução CFM 2.454/2026 alcança software educacional? | Nossa leitura: trata da prática assistencial, não menciona ensino. **Menos relevante na V2** — não há IA no produto. Segue como registro |
| P4 | Precisa de CEP se houver teste com estudantes? | O teste exploratório de usabilidade da fase 6 não coleta dado de sujeito para pesquisa. Se virar estudo de aprendizagem, **provavelmente sim** |

## Pendências abertas por `pneumo-001` *(2026-08-23)*

| # | Questão | Como resolver |
|---|---|---|
| **PN-A** | Nenhum caso do catálogo passou por **red team independente**. `cardio-001` e `pneumo-001` estão os dois em `pending_human_review`, com `redTeamPassedAt: null` | Rodar o agente `medical-red-team` recebendo só o JSON, e depois revisão humana. Bloqueia `approved` (CLAUDE.md §10.3) |
| **PN-B** | O caso ensina **critérios de gravidade** sem dizer onde a paciente deveria ser tratada, porque conduta está fora de escopo (§10.6). O tema fica pela metade | Decisão de escopo humana: ou aceitar a metade, ou tirar gravidade do caso, ou abrir uma exceção declarada para "local de cuidado" |
| **PN-C** | `dx.pac` cobre pneumonia bacteriana e viral no mesmo conceito; quem responder "pneumonia viral" não tem como registrar | Decidir se o vocabulário distingue etiologia — efeito em todos os casos futuros |
| **PN-D** | O vocabulário agora tem conceitos de duas áreas e é compartilhado. O autocomplete do caso de cardiologia sugere diagnósticos pneumológicos e vice-versa | Comportamento por desenho (ADR-0008): hipótese fora da chave recebe "não analisada por este caso". Confirmar com estudante no piloto |

## Assumidos (revisáveis)

- **[A]** Uso individual, assíncrono, fora de sala.
- **[A]** Sem persistência entre sessões (`sessionStorage` apenas).
- **[A]** Mobile-first, com leitura longa.
- **[A]** Vocabulário cresce por demanda: só entra conceito usado por algum caso.
- **[A]** Nenhum dado do estudante sai do navegador — nem telemetria anônima.

## Explicitamente desconhecido (UNKNOWN)

- Se o formato de 3–5 pontos de decisão **melhora aprendizado** — não medimos e não vamos medir no MVP.
- Quanto tempo leva autorar um caso completo com chave e feedback composto. **A fase 1 existe para
  responder isso**, e a resposta pode reduzir o escopo.
- Se estudantes vão espiar o gabarito no DevTools, e se isso importa na prática.
- Se o red team de IA encontra defeitos que um revisor humano não encontraria — a métrica está
  prevista em [content-review-protocol.md](../06-quality/content-review-protocol.md) §5.
