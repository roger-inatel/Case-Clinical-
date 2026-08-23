# Changelog de Correção — C1, revisão 1 → 2

Entrada: [red-team-report.md](red-team-report.md) · Classificação: [findings-classification.md](findings-classification.md)
Revalidação: **0 erros, 0 avisos** (script ampliado, §4).

**28 achados corrigidos · 18 não corrigidos · 3 sem ação · 1 falso positivo.**

---

## 1. Alterações que mudam conteúdo clínico

Registradas separadamente porque exigem atenção do revisor humano — são as únicas que mexem no que
o estudante lê como fato clínico.

| # | Achado | Alteração | Direção |
|---|---|---|---|
| 1 | R7, O9 | `f1` ganhou "de instalação gradual ao longo de alguns minutos" | **Acréscimo.** Move para s1 a informação de instalação que `dp1` já cobrava. Cria a célula `f1 → dx.dissecao-aorta` (instalação gradual reduz a probabilidade) |
| 2 | R7 | `f9` perdeu "nega início súbito de dor de forte intensidade", ficando só "nega irradiação para o dorso" | **Remoção.** O negativo composto era ambíguo (O9) e a informação migrou para f1 |
| 3 | R6 | `f5` dividido em `f5a` (episódio semelhante prévio) e `f5b` (rótulo de ansiedade) | **Separação.** Os dois fatos deslocam a probabilidade em direções opostas |
| 4 | R2 | Novo `f21`: "Reavaliação realizada cerca de três horas após o início do desconforto" | **Acréscimo.** Declara o instante da reavaliação, que os turnaround implicavam sem dizer |
| 5 | B3 | `f16 → dx.sca-csst`: "afasta o diagnóstico" → "reduz de forma importante… porém um traçado isolado não a exclui" | **Redução de afirmação.** Conservadora |
| 6 | R23 | `f16 → dx.sca-ssst`: `supports` → **`neutral`**, com why explicando critério definicional × evidência | **Redução de afirmação.** Conservadora |
| 7 | R20 | Removidos os três números ("cerca de 8%", "cerca de 15%" ×3, "parcela relevante") | **Redução de afirmação.** As lições foram preservadas sem os números |
| 8 | R26 | `f19 → dx.tep`: `contradicts` → **`neutral`**, com why sobre exame que não muda conduta | **Redução de afirmação.** Alinha os três pontos onde o D-dímero aparece |
| 9 | R16 | Feedback de miocardite em `dp5` passou a admitir que o caso não oferece dados para discriminá-la | **Redução de pretensão.** Conservadora |
| 10 | B4 | Alias "angina instavel" removido de `dx.sca-ssst` | **Remoção.** Eliminava um acerto falso silencioso |

**Todas as alterações de substância são reduções de afirmação ou reorganizações — nenhuma cria
conteúdo clínico novo.** Foi regra deliberada: criar conteúdo clínico sem revisor seria o autor
decidindo medicina sozinho.

## 2. Alterações estruturais e de coerência

| Achado | Alteração |
|---|---|
| **B1, R3, R24** | **Vereditos de `dp5` reescritos** sem afirmar resultados de exame. As afirmações dependentes migraram para a `evidenceMatrix`, **que já é condicional por construção** — o motor só compõe fragmentos de achados revelados. Nenhuma estrutura nova foi necessária para isso |
| **B1, R3** | **EXT-8** (`requiresFindings` + `verdictWhenMissing`) em 5 dos 10 vereditos. No percurso sem troponina, `dx.dados-insuficientes` passa a receber **`muito_compativel`** — invertendo o incentivo que R3 apontava |
| **B2** | `verdicts["dx.tep"].feedback` usa apenas f10 e f14. A menção ao D-dímero saiu |
| **B5** | `commonMistakes[2].triggeredWhen` **removido**. O gatilho usava `markedAs: "excludes"`, estado inexistente no motor. Item mantido como material de feedback, com nota explicando por que não há gatilho |
| **B6** | `case.learningObjectives` → 3 itens temáticos sem resolução. Os cinco explícitos migraram para `key.learningOutcomes` (fechamento). Tag `vies-de-ancoragem` → `raciocinio-diagnostico` |
| **R8, R7** | As 14 opções de `dp1` agora estão **todas classificadas**. `q.subito` → `misleading` (f1 diz gradual); `q.insidioso` → `acceptable`; `q.lancinante` → `misleading` |
| **R22** | `dp1.feedback` estático substituído por `feedbackByOption` — 14 fragmentos (`whenMissing` / `whenSelected`) + `summaryTemplate` |
| **R9** | `dp3.acceptableRange` `[0,1]` → `[0,2]` |
| **R10** | `dp3.directionScale` declara o mapeamento inteiro↔rótulo; chaves de `feedbackByDirection` passaram a numéricas; `expectedDirection` passou a `0` |
| **R11** | `rf2.requiresFindings: ["f17"]` (EXT-9) |
| **R25** | Crédito de miocardite em `dp2`: 0.2 → **0.5** |
| **R18** | `dp4.prompt`: "Esta é sua única oportunidade de solicitação neste caso" |
| **R19** | `schemaExtensions` no `.case.json`; lista da chave completada (10 extensões); EXT-5/EXT-6 declarados inexistentes |
| **O2** | Feedback do RX: "a solicitação do RX não deve postergar a coleta da troponina" |
| **O4** | `rf1.findingIds` inclui f6, f7, f8 |
| **O8** | `dp5.prompt` pede a formulação mais precisa que os dados permitirem |
| **O10** | "em ordem de prioridade" removido de `dp2.prompt` |
| **O11** | `essentialMissedMessage` genérica; o motor compõe com o feedback de cada exame |
| **O12** | Feedback de miocardite em `dp2` não insinua mais lesão miocárdica |
| **O13** | `dp1.maxSelections` 5 → 6 |
| **O14** | `dx.dre` → **`dx.drge`** (8 referências atualizadas) |
| **O15** | "somatizacao" removida dos aliases |
| **O16** | "costocondrite" removida; aliases acrescentados; **regra de normalização declarada** no vocabulário |
| **O18** | Grafia dos tiers padronizada sem acento |
| **O20** | `dp2.maxSelections` 3 → **4** |
| **O21** | Labels dos subtipos com "SEM"/"COM" em destaque |

## 3. Correções que introduziram novos problemas

Verificação exigida pelo protocolo. **Nenhum erro estrutural novo** (revalidação limpa), mas duas
consequências reais:

1. **A chave cresceu 29%** — de 2.271 para **2.938 palavras**. As correções custaram prosa:
   `verdictWhenMissing` (5 textos novos) e `feedbackByOption` (14 fragmentos novos). A razão
   chave/estudante subiu de **4,8× para 6,5×**. Corrigir defeitos **aumenta** o custo de autoria,
   e isso precisa entrar na projeção do catálogo.
2. **`f9` ficou mais fraco.** Ao mover "início súbito" para f1, o negativo pertinente de dissecção
   perdeu metade da força. A compensação está na nova célula `f1 → dx.dissecao-aorta`, mas o
   equilíbrio do diferencial mudou e **isso é substância clínica que o revisor precisa olhar**.

## 4. Revalidação

Script ampliado de 11 para **12 famílias de verificação**. A nova é a que importa:

> **Verificação de regressão de B1:** todo `verdicts[*].feedback` é varrido por palavras de
> resultado de exame (troponina, supradesnivelamento, D-dímero, mediastino, radiografia,
> angiotomografia, percentil 99). Se aparecerem sem o `requiresFindings` correspondente, falha.

É a automatização direta do defeito que o red team descreveu como **não detectável por validação
automática**. Ele estava certo sobre a versão original da regra; a regra pôde ser estendida.

Também novas: cobertura total das opções de `dp1`; `requiresFindings` obrigando `verdictWhenMissing`;
`markedAs` validado contra os estados reais do motor; red flag condicional exigindo `requiresFindings`;
colisão de alias com normalização; `redTeamPassedAt` obrigatoriamente `null`.

**Resultado: 0 erros, 0 avisos.**

## 5. Estado após a correção

| | Revisão 1 | Revisão 2 |
|---|---|---|
| Achados | 20 | 22 |
| Células da matriz | 38 | 40 |
| Fragmentos de feedback | 88 | **113** |
| Palavras da chave | 2.271 | **2.938** |
| Texto do estudante | 473 | 455 |
| Razão chave/estudante | 4,8× | **6,5×** |
| Vereditos condicionais | 0 | **5 de 10** |
| `key.json` | 22,6 KB | 34,1 KB |
| `reviewStatus` | `pending_human_review` | `pending_human_review` |
| `redTeamPassedAt` | `null` | **`null`** |

**`redTeamPassedAt` permanece `null`.** Seis bloqueadores foram corrigidos, mas o relatório
condiciona a aprovação também às onze questões clínicas — e nenhuma foi respondida.
