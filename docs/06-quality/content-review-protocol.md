# Protocolo de Revisão de Conteúdo

> **Novo na V2.** Substitui [ai-eval-suite.md](ai-eval-suite.md) (obsoleto). Na V1, a qualidade
> era medida na saída de um modelo. Na V2, ela é medida **no conteúdo** — e é a única medição de
> qualidade que o produto tem.

## 1. Por que este documento carrega o peso do projeto

Um caso publicado não tem verificação em runtime, não tem segunda opinião, não tem estado
"degradado". O que estiver no JSON é o que o estudante lê como verdade. **Este protocolo é a única
coisa entre um erro de autoria e um estudante aprendendo algo errado.**

## 2. As três barreiras

```
[1] VALIDAÇÃO AUTOMÁTICA (CI)   →  estrutura e integridade  →  bloqueia merge
[2] RED TEAM (agente)           →  coerência clínica e pedagógica  →  bloqueia publicação
[3] REVISÃO HUMANA (médico)     →  correção e segurança  →  única aprovação válida
```

Nenhuma substitui a outra. A barreira 1 é a mais barata e pega o que é mecânico. A 2 é sistemática
e infatigável. A 3 é a única que tem autoridade.

## 3. Barreira 2 — checklist do red team

Saída obrigatória em categorias fixas. **"Caso aprovado" não é resposta aceitável**: se nada foi
encontrado em uma categoria, o relatório declara o que foi procurado. Um crítico que só elogia não
está criticando.

### A. Coerência clínica
- Sinais vitais compatíveis entre si e com o quadro descrito?
- Valores fisiologicamente plausíveis (e plausíveis **para este paciente**, idade e comorbidades)?
- Resultados de exame coerentes com achados de história e exame físico?
- Evolução temporal faz sentido (início, duração, progressão)?
- Sintoma contraditório sem explicação?

### B. Diagnóstico e diferencial
- O diagnóstico esperado é o mais provável **dados os achados**, ou o autor "sabia a resposta antes"?
- Falta algum diferencial que um clínico consideraria?
- Falta algum `cantMiss` — o diagnóstico que mata se ignorado?
- Algum conceito marcado como implausível é, na verdade, defensável?
- A `evidenceMatrix` classifica algum achado de forma discutível?

### C. Red flags
- Existe algum sinal de alarme no caso que **não** está declarado como red flag?
- Algum red flag declarado é, na verdade, achado banal?

### D. Qualidade pedagógica
- As pistas são óbvias demais (o caso se resolve na queixa principal)?
- São insuficientes (nem um clínico resolveria)?
- Existe distrator, e ele é plausível o bastante para funcionar?
- Os pontos de decisão estão nos passos **críticos**, ou em passos triviais?
- Alguma pergunta admite mais de uma leitura razoável?
- O feedback explica o **porquê**, ou só declara o veredito?

### E. Consistência interna do JSON
- Feedback contradiz a `evidenceMatrix`?
- Achado citado no feedback pertence a etapa já revelada naquele ponto?
- `commonMistakes` corresponde a algo que a chave realmente detecta?

### F. Linguagem e segurança
- Alguma frase soa como orientação clínica real, e não como comentário educacional?
- Alguma recomendação de conduta, dose ou prognóstico escapou?
- O caso é reconhecidamente fictício?

**Formato do achado:** o que está errado · onde (campo do JSON) · por que importa · severidade
(bloqueador / relevante / observação) · correção sugerida.

## 4. Barreira 3 — checklist da revisão humana

Preenchido pelo revisor clínico (decisão D2) e arquivado em
`docs/06-quality/case-reviews/<caseId>.md`:

| Item | Resposta |
|---|---|
| O caso é clinicamente plausível? | sim / com ressalvas / não |
| O diagnóstico esperado é defensável com os dados apresentados? | sim / não |
| Falta algum diferencial relevante? | quais |
| Falta algum red flag? | quais |
| Algum feedback está clinicamente incorreto? | quais |
| As fontes sustentam as afirmações? | sim / parcial / não |
| Você deixaria um estudante do 4º ano usar este caso sem supervisão? | **sim / não** |

A última pergunta é a que decide. Um "não" impede `reviewStatus: "approved"`, independentemente
das anteriores.

## 5. Métricas do protocolo *(e a contribuição acadêmica da V2)*

Registradas por caso e consolidadas ao final:

| Métrica | Por que importa |
|---|---|
| Defeitos encontrados pelo red team, por categoria e severidade | Mede a utilidade do agente crítico |
| Defeitos encontrados pelo revisor **humano** que o red team **não** encontrou | **Mede o limite real da IA como revisora** |
| Defeitos que passaram pelas três barreiras (achados depois) | Mede o limite do protocolo inteiro |
| Rodadas de correção até aprovação, por caso | Mede maturidade do processo de autoria |
| Horas de autoria e de revisão por caso | Mede a viabilidade de escalar o catálogo |

A segunda linha é o resultado mais interessante do trabalho — e é honesto em qualquer direção. Se o
red team encontrar pouco do que o humano encontra, isso é uma conclusão publicável sobre os limites
de IA na revisão de conteúdo médico. Se encontrar muito, também.

## 6. Cadência

- Barreira 1: a cada *commit*.
- Barreira 2: a cada caso novo **e** a cada alteração de conteúdo em caso aprovado — mudar um achado
  pode invalidar a chave inteira.
- Barreira 3: antes de aprovar; e revisão de amostra ao final da fase 5.

## 7. O que este protocolo não cobre

Não mede aprendizagem. Não mede usabilidade. Não valida o instrumento psicometricamente. Mede
**qualidade de conteúdo**, que é o que está sob nosso controle — e as três lacunas estão declaradas
em [academic-frame.md](../00-project/academic-frame.md) §6.
