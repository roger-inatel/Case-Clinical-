# Participação da IA na Autoria do C1

Registro exigido pelo enquadramento acadêmico do projeto: um trabalho *sobre* uso responsável de IA
não pode ser omisso sobre o próprio uso de IA. `authoring.aiAssisted` está marcado como `true` no
caso.

## 1. Onde a IA participou

| Etapa | Papel da IA | Papel humano nesta etapa |
|---|---|---|
| **Pesquisa** | Localizou guidelines, registros e artigos por busca web; extraiu afirmações e as rotulou por força de evidência | Definir a pergunta de pesquisa; decidir o que entra no caso |
| **Síntese** | Organizou os achados em [research-notes.md](../research/c1/research-notes.md) com nível de leitura declarado por fonte | Aceitar ou rejeitar cada afirmação |
| **Desenho pedagógico** | Propôs os passos críticos, o tipo de cada ponto de decisão e a estrutura dos distratores | Escolher dificuldade, público e objetivo |
| **Proposta de caso** | Redigiu achados, sinais vitais, laudos e a sequência de etapas | Julgar plausibilidade clínica |
| **Diagnósticos diferenciais** | Propôs a lista, incluindo os `cantMiss` | Confirmar que nenhum diferencial relevante falta |
| **`evidenceMatrix`** | Preencheu as 38 células com relação e justificativa | Verificar cada classificação contestável |
| **Feedback** | Redigiu os 80 fragmentos | Verificar correção clínica de cada um |
| **Estruturação** | Produziu o JSON conforme o schema; identificou as insuficiências do schema | Decidir se as extensões propostas são aceitas |
| **Red team** | Executado por subagente em **contexto isolado**, recebendo apenas os JSON | Julgar a severidade real dos achados |
| **Validação estrutural** | Script descartável de integridade referencial e regra temporal | — |

## 2. Onde a IA **não** teve autoridade

| Decisão | Quem decide | Estado |
|---|---|---|
| **Aprovação médica do conteúdo** | Médico ou docente identificado | **PENDENTE** — `reviewStatus: pending_human_review` |
| Publicação do caso no catálogo | Humano, após aprovação | Não ocorreu |
| Definição do diagnóstico como clinicamente correto | Revisor clínico | Não verificado |
| Aceitação de uma fonte como suficiente | Revisor clínico | Nenhuma fonte lida na íntegra |
| Decisão de escopo do projeto | Autor do projeto | — |

Nenhum nome de revisor foi inventado. Nenhuma caixa do
[human-review.md](../reviews/c1/human-review.md) foi marcada. Nenhuma aprovação foi simulada.

## 3. Separação de contextos observada

O red team **não recebeu** a conversa de autoria. Foi executado como subagente com contexto próprio,
recebendo apenas: a definição do seu papel, o protocolo de revisão, o schema e os três arquivos JSON.
Isso implementa literalmente a regra de
[agent-architecture §4](../03-architecture/agent-architecture.md): *"o red team recebe o JSON, não a
conversa que o gerou"*.

**Limitação que permanece:** autor e crítico são o **mesmo modelo base**. O isolamento de contexto
reduz a contaminação por justificativas do autor, mas não elimina o viés compartilhado — um erro que
o modelo tende a cometer é um erro que ele tende a não enxergar. Isso é exatamente o que a métrica
"defeitos encontrados pelo revisor humano que o red team não encontrou" existe para dimensionar
([content-review-protocol §5](../06-quality/content-review-protocol.md)), e ela só poderá ser
calculada quando a decisão D2 for resolvida.

## 4. Momentos em que a IA se conteve — e por quê

Registro dos pontos em que uma afirmação plausível **não** entrou no caso por falta de fonte lida.
São observações de custo, não de virtude: cada uma delas é conteúdo pedagógico perdido.

| Afirmação candidata | Onde entraria | Destino |
|---|---|---|
| "Crise de pânico tipicamente atinge o pico em minutos e cede em menos de uma hora" — discriminador temporal | `f2` → `dx.ansiedade` | Célula rebaixada para **neutro**. Sem fonte lida |
| "Hipertensão é o fator de risco mais frequente na dissecção aórtica" | `f6` → `dx.dissecao-aorta` | Célula **não autorada**. Sem fonte lida |
| "TEP eleva troponina por sobrecarga de ventrículo direito" | `f17` → `dx.tep` | Célula rebaixada para **neutro** com justificativa genérica |
| Disparidade por sexo na atribuição de sintomas cardíacos a ansiedade | Eixo alternativo do caso | **Descartado**. Única fonte encontrada era comercial |

Três células de 38 foram enfraquecidas e uma linha de desenho foi abandonada por essa regra.
É o custo direto da política de sourcing — e ele é aceitável.
