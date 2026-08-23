# Escopo do MVP — V2

> Revisão da V1. Mudanças em §6.

## 1. Especialidades: Cardiologia + Pneumologia

Confirmado pelo briefing V2. A razão que já valia na V1 continua sendo a melhor:

> As duas **compartilham apresentações** — dor torácica e dispneia. Um catálogo com ambas força o
> estudante a discriminar entre causa cardíaca e pulmonar, em vez de deduzir a resposta pela pasta
> em que o caso está.

Consequência de desenho, agora explícita: **casos de uma especialidade têm `cantMiss` da outra**.
TEP num caso de dor torácica; síndrome coronariana num caso de dispneia. É o que impede que a
escolha da especialidade funcione como pista.

"Emergência" não é especialidade no catálogo — é a tag `emergencia`, que atravessa as duas.

## 2. Os 8 casos

Distribuição por dificuldade (briefing §19): **1 fácil · 2 intermediários · 1 avançado** por
especialidade. Racional: o fácil serve de tutorial do formato (o estudante precisa aprender a
interface antes de ser desafiado por ela); o avançado exige tolerar ambiguidade; os intermediários
carregam o peso pedagógico.

### Cardiologia

| # | Caso | Dificuldade | O que treina | `cantMiss` |
|---|---|---|---|---|
| **C1** | **Desconforto torácico com fator de confusão psicossocial** ✅ *autorado (piloto)* | intermediário | **Ancoragem em rótulo diagnóstico prévio e fechamento prematuro** | dissecção de aorta, TEP |
| C2 | Dor torácica típica com supra de ST | fácil | Reconhecimento de padrão; urgência da conduta | — |

> **Renumeração feita na Fase 1.** O caso intermediário passou a ser C1 porque o piloto precisava
> estressar o schema e medir o custo real de autoria; pilotar o caso mais barato mediria a coisa
> errada. Justificativa em [c1-educational-design.md §1](../phase-1/c1-educational-design.md).
> A ordem de exibição no catálogo continua sendo por dificuldade, não por id.
| C3 | Dispneia e desconforto torácico em pós-operatório | intermediário | Diferencial cruzado com Pneumologia | **TEP** |
| C4 | Dor torácica atípica em paciente jovem | avançado | Parcimônia: evitar excesso de investigação | — |

### Pneumologia

| # | Caso | Dificuldade | O que treina | `cantMiss` |
|---|---|---|---|---|
| **P1** | **Tosse e febre com achados de pneumonia** ✅ *autorado* (`pneumo-001`) | fácil | Reconhecimento de padrão; critérios de gravidade | TEP |
| P2 | Dispneia aguda com achado contraditório no exame | intermediário | **Revisão de hipótese diante de dado novo** | — |
| P3 | Dispneia crônica com múltiplas causas plausíveis | intermediário | Amplitude do diferencial; conclusão fraca é adequada | insuficiência cardíaca |
| P4 | **Caso de dados insuficientes** | avançado | Reconhecer o limite da informação | — |

### O caso P4 é obrigatório (briefing §16)

Nenhuma hipótese específica alcança `compativel` ou acima. Escolher qualquer diagnóstico recebe,
no máximo, `parcialmente_compativel`; escolher `dx.dados-insuficientes` é a resposta de maior
crédito. O fechamento explica por que reconhecer o limite era mais defensável do que concluir.

Sem esse caso, o sistema ensina implicitamente que sempre existe uma resposta — que é falso e
perigoso. Ele é a demonstração mais direta de um princípio do projeto, e não é negociável.

## 3. Pontos de decisão por caso

3 a 5 por caso, escolhidos pelo `educational-design` conforme os passos críticos **daquele** caso.
Não há gabarito de formato: um caso de parcimônia investigativa gira em torno de `test-selection`;
um caso de ancoragem gira em torno de `probability-shift` e `evidence-selection`.

Mínimo obrigatório em todo caso: **um `hypothesis-list` inicial** (compromisso antes dos exames) e
**um `final-hypothesis` com `evidence-selection`**. O resto varia.

## 4. Entra no MVP

- [x] Home com enquadramento e aviso de protótipo educacional
- [x] Catálogo por especialidade com filtro de dificuldade e tags
- [x] Visão geral do caso antes de iniciar
- [x] Simulação com etapas progressivas e revelação de exames sob demanda
- [x] Seis tipos de ponto de decisão implementados
- [x] Vocabulário controlado com autocomplete e sinônimos
- [x] Motor de avaliação determinístico com feedback composto
- [x] Estado `naoPrevisto` para hipótese fora da chave
- [x] Tela de resultado revelada por etapas, com "o que você fez"
- [x] Perfil de decisão em 4 dimensões, sem nota agregada
- [x] Fechamento com análise do autor, diferenciais, fontes e pergunta de reflexão
- [x] 8 casos com red team e revisão humana registrados
- [x] Validação de conteúdo em CI

## 5. Não entra no MVP

Login · cadastro · perfil · histórico · ranking · gamificação · banco · Supabase · RAG · chatbot ·
geração automática de casos · qualquer API de IA · imagens médicas reais · prontuário · prescrição ·
integração hospitalar · pagamento · i18n · PWA · nota agregada · comparação entre estudantes.

Ideia que aparecer durante o desenvolvimento e couber aqui: registrar como `FUTURE / OUT OF SCOPE`
em [roadmap.md](roadmap.md) e **não implementar**.

## 6. Mudanças desde a V1

| V1 | V2 | Motivo |
|---|---|---|
| 8 casos por arquétipo de **hipótese do estudante** (correta, absurda, sob pressão…) | 8 casos por **passo crítico e dificuldade** | Os arquétipos existiam para testar o LLM. Sem LLM, o eixo é pedagógico |
| Distribuição de dificuldade não definida | 1 fácil · 2 intermediários · 1 avançado por especialidade | Briefing V2 §19 |
| "Modo demonstração offline com respostas gravadas" | desnecessário | A aplicação **é** offline |
| Suíte adversarial como critério de pronto | red team + revisão humana por caso | [content-review-protocol.md](../06-quality/content-review-protocol.md) |
| Caso de dados insuficientes recomendado | **obrigatório** (P4) | Briefing V2 §16 |
