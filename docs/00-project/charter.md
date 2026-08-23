# Charter — Case Clinical AI (V2)

## Nome completo para fins acadêmicos

> **Case Clinical AI — Protótipo Educacional Experimental para Treinamento de Raciocínio Clínico
> por Meio de Casos Simulados**

## Problema

Praticar raciocínio clínico exige feedback individualizado sobre o **processo** de pensar. Esse
feedback depende de preceptor, tempo e caso disponível — recursos escassos. O estudante acaba
treinando "acertar o diagnóstico" e quase nunca treinando **testar a própria hipótese**.

## Proposta

Aplicação web estática que apresenta casos clínicos fictícios em etapas, interrompe o estudante nos
passos críticos da decisão e devolve feedback estruturado, escrito e revisado por humanos, sobre o
que sustenta e o que contradiz o raciocínio dele.

## O que torna o projeto defensável

1. **Formatos de avaliação com validação publicada** — *key features* e script concordance, não
   um quiz improvisado ([research/assessment-formats.md](../research/assessment-formats.md)).
2. **Rastreabilidade do conteúdo** — fonte por afirmação, revisor nomeado, status de revisão no
   próprio dado.
3. **Pipeline de autoria assistida por IA com revisão humana obrigatória** — documentado e
   **mensurável** ([authoring-pipeline.md](../03-architecture/authoring-pipeline.md)).
4. **Zero dependência de IA em runtime** — o produto funciona offline, indefinidamente, sem custo e
   sem risco de alucinação.
5. **Limites declarados** — o sistema diz quando uma hipótese não foi analisada, em vez de improvisar.

## Escopo do MVP

2 especialidades (Cardiologia, Pneumologia) · 8 casos (1 fácil, 2 intermediários, 1 avançado cada) ·
3–5 pontos de decisão por caso · avaliação determinística · feedback composto · sem contas, sem
banco, sem servidor. Detalhe em [mvp-scope.md](../05-roadmap/mvp-scope.md).

## Fora de escopo

Uso assistencial · pacientes reais · nota, ranking ou certificação · geração automática de casos ·
autenticação · banco de dados · **qualquer API de IA em runtime** · aplicativo nativo · chat ·
imagens médicas reais · prescrição.

## Stakeholders

| Papel | Responsabilidade | Status |
|---|---|---|
| Autor do projeto | Arquitetura, implementação, autoria, redação acadêmica | definido |
| **Revisor clínico (docente/médico)** | Aprovar cada caso e chave; responder pelo conteúdo | **pendente — decisão D2** |
| Orientador | Enquadramento acadêmico | a confirmar |
| Estudantes-piloto | Teste exploratório de usabilidade (fase 6, sem coleta formal) | a definir |

## Restrições

Prazo de disciplina · equipe pequena · **nenhum orçamento de API necessário** · sem infraestrutura ·
conteúdo em pt-BR · nenhum dado de usuário coletado.

## Critérios de aceitação do projeto

1. Um estudante completa um caso do início ao fim sem instrução externa.
2. Os 8 casos têm red team registrado e aprovação de revisor clínico nomeado.
3. O motor de avaliação tem cobertura exaustiva do espaço de sessões dos casos publicados.
4. A aplicação funciona sem rede após o primeiro carregamento, e sem nenhuma chave configurada.
5. A documentação permite reconstruir e justificar cada decisão — incluindo as abandonadas na V1.

## Mudanças desde a V1

O critério "nenhuma citação não verificada chega à tela" foi substituído: não há citação gerada
para verificar. Em seu lugar, o critério 2 — **conteúdo revisado por humano** — que é mais forte,
porque cobre a correção clínica e não apenas a ancoragem no texto.
