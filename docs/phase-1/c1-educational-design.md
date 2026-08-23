# Desenho Pedagógico — Caso Piloto C1

**Executado por:** agente `educational-design`. **Data:** 2026-08-23.
**Insumo:** [research-notes.md](../research/c1/research-notes.md).

---

## 1. Escolha do caso — justificativa

| Critério | Escolha | Por quê |
|---|---|---|
| **Especialidade** | Cardiologia | Critérios diagnósticos estáveis e consensuais, red flags bem codificados, alto valor pedagógico do erro, baixa ambiguidade ética ([mvp-scope §1](../05-roadmap/mvp-scope.md)) |
| **Tema** | Desconforto torácico agudo com fator de confusão psicossocial | Apresentação prevalente, diferencial rico, erro de atribuição documentado na literatura (S6–S8) |
| **Dificuldade** | **Intermediário** | Instrução explícita da Fase 1 |
| **Objetivo pedagógico central** | Sustentar suspeita de causa grave **apesar** de um rótulo prévio tranquilizador e de um exame não diagnóstico | É raciocínio, não reconhecimento de padrão |

### Por que este caso é adequado como piloto — e não o caso fácil

O roadmap original previa o caso **fácil** (dor torácica com supra de ST) como C1. **Mudamos.**

Um caso fácil é resolvido no reconhecimento de padrão: o achado decisivo aparece pronto no ECG. Ele
exercitaria pouco a `evidenceMatrix`, teria poucos diferenciais plausíveis e quase nenhum fragmento
de feedback interessante — e **subestimaria o custo de autoria**, que é exatamente a métrica que a
Fase 1 existe para medir. Pilotar o caso mais barato para estimar o custo dos outros seria medir a
coisa errada.

O caso intermediário estressa: distratores, deslocamento de probabilidade, matriz de evidências com
achados contraditórios, diferencial `cantMiss` que o exame físico **não** exclui, e um exame
complementar cujo resultado não fecha o diagnóstico sozinho.

**Consequência de catálogo:** este caso passa a ser `cardio-001`; o caso fácil de supra de ST vira
`cardio-002`. Atualizado em [mvp-scope.md](../05-roadmap/mvp-scope.md).

## 2. Público e pré-requisitos

Estudante do 3º ao 6º ano, com semiologia cardiovascular cursada. Espera-se que reconheça
sintomas autonômicos, saiba o que é fator de risco cardiovascular e conheça as emergências de dor
torácica. **Não** se espera que saiba interpretar ECG em detalhe — o laudo é descrito em texto.

## 3. Comportamento educacional que queremos estimular

1. Não encerrar o raciocínio diante de um rótulo diagnóstico prévio ("já disseram que é ansiedade").
2. Tratar um exame não diagnóstico como **não conclusivo**, não como negativo.
3. Distinguir achado que **reduz** probabilidade de achado que **exclui** hipótese.
4. Manter na lista o diagnóstico que mata, mesmo quando improvável.
5. Reconhecer que fator psicossocial presente **não é evidência contra** causa orgânica.

## 4. Sequência de etapas e os cinco *key features*

Os pontos de decisão estão nos passos onde o raciocínio falha — não em passos triviais.

| Etapa | Informação revelada | Ponto de decisão | Passo crítico que ele testa |
|---|---|---|---|
| **1. Queixa** | Caráter, localização, duração, relação com repouso | **DP1** representação do problema | Sintetizar antes de hipotetizar |
| | | **DP2** até 3 hipóteses iniciais | **Amplitude do diferencial com informação mínima** — inclui o `cantMiss`? |
| **2. História** | Sintomas autonômicos, fatores de risco, **estresse ocupacional**, **alta prévia por "ansiedade"**, negativas relevantes | **DP3** deslocamento de probabilidade sobre o rótulo prévio | **Ancoragem em rótulo diagnóstico alheio** |
| **3. Exame físico** | Sinais vitais, ausculta, simetria de pulsos, palpação torácica | **DP4** seleção de exames | **Parcimônia e priorização** |
| **4. Resultados** | ECG não diagnóstico, troponina us elevada, RX normal | **DP5** hipótese final + seleção de evidências + justificativa | **Sustentar conclusão em evidência explícita** |

**Verificação da regra temporal** — nenhum ponto de decisão depende de informação posterior:

| DP | Etapa | Achados disponíveis | A chave usa apenas eles? |
|---|---|---|---|
| DP1 | 1 | f1, f2 | ✅ |
| DP2 | 1 | f1, f2 | ✅ |
| DP3 | 2 | f1–f10 | ✅ (pergunta sobre f5) |
| DP4 | 3 | f1–f15 | ✅ |
| DP5 | 4 | f1–f19 | ✅ |

Consequência assumida: em **DP2** o estudante tem pouquíssima informação. É deliberado — é o
momento em que a amplitude do diferencial importa, e é onde o fechamento prematuro nasce.

## 5. Onde está o risco de fechamento prematuro

Dois distratores, em camadas, com forças diferentes:

| # | Distrator | Por que é atraente | O que o enfraquece | Erro que representa | Quando reconsiderar |
|---|---|---|---|---|---|
| **D1** | Estresse ocupacional intenso e insônia (f4) | Oferece explicação causal imediata e socialmente plausível | Não explica sintomas autonômicos em repouso; não é evidência sobre o coração | **Viés de disponibilidade / raciocínio causal preguiçoso** | Já na etapa 2, ao ver f3 (náusea e sudorese) |
| **D2** | Alta prévia com diagnóstico de "crise de ansiedade" há 8 meses (f5) | Vem com autoridade médica — outro profissional já decidiu | Rótulo prévio não é evidência sobre o episódio atual; transtorno de pânico **não é fator protetor** e associa-se a maior prevalência de coronariopatia (S6) | **Ancoragem em diagnóstico alheio / deferência à autoridade** | Em DP3, explicitamente |

D2 é o distrator mais forte e é o motivo de existir o DP3. Ele não pode ser detectado por
"prestar mais atenção" — exige o raciocínio explícito de que um rótulo anterior não carrega
informação sobre o episódio de hoje.

**Contrapeso obrigatório:** o caso não pode ensinar que ansiedade é sempre a resposta errada. O
fechamento (§7) diz explicitamente que ansiedade é diagnóstico **legítimo**, porém de exclusão
neste contexto — e que os dois podem coexistir.

## 6. Diferenciais que precisam ser considerados

| Hipótese | Papel no caso |
|---|---|
| Síndrome coronariana aguda | Esperada |
| **Dissecção de aorta** | `cantMiss` — e o exame físico **não** a exclui (S9, S10) |
| **Tromboembolismo pulmonar** | `cantMiss` — diferencial cruzado com Pneumologia |
| Transtorno de ansiedade / pânico | Distrator; diagnóstico de exclusão |
| Doença do refluxo gastroesofágico | Plausível, baixa prioridade |
| Dor musculoesquelética | Implausível: palpação não reproduz o desconforto |
| Miocardite | Reconhece quem lembra que troponina elevada ≠ SCA automaticamente |

## 7. Desenho do feedback

Ordem herdada de [ux-flow §4](../04-ux/ux-flow.md), com três exigências específicas deste caso:

1. **A evidência contrária vem primeiro**, e os achados que o estudante **não** marcou vêm antes dos
   que marcou.
2. **Distinguir "reduz" de "exclui"** ao comentar dissecção — se o feedback disser que pulsos
   simétricos afastam dissecção, o caso ensina algo clinicamente errado (S9).
3. **Não punir cautela**: quem manteve dissecção ou TEP na lista final não erra — recebe comentário
   sobre priorização, não sobre erro.

**Pergunta de reflexão (fecha sem responder):**
> "Se a troponina inicial tivesse voltado normal, o que mudaria na sua conduta — e o que **não**
> mudaria?"

Ela ataca exatamente o eixo do caso: exame tranquilizador não encerra raciocínio.

## 8. O que este desenho **não** faz

- Não usa escore HEART como ponto de decisão (exigiria informação da última etapa; viraria
  aplicação de fórmula).
- Não pede conduta, tratamento ou dose — regra do projeto.
- Não usa imagem (ECG ou radiografia reais) — laudo em texto. Multimodal está fora do MVP.
- Não explora disparidade por sexo na atribuição de sintomas: não temos fonte aceitável lida.
  Registrado como candidato a caso futuro **com sourcing próprio**.
