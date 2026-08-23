# Modelo de Dados — V2

> Revisão da V1. O que mudou está em §7. Fundamentação dos formatos em
> [research/assessment-formats.md](../research/assessment-formats.md); regras de correção em
> [evaluation-engine.md](evaluation-engine.md).

## 1. Três artefatos de conteúdo

| Artefato | Onde | Chega ao navegador |
|---|---|---|
| **Caso** (`.case.json`) | `content/cases/<esp>/<id>.case.json` | ao abrir o caso |
| **Chave** (`.key.json`) | `content/cases/<esp>/<id>.key.json` | **só após a primeira submissão** (ADR-0007) |
| **Vocabulário** | `content/vocabulary/diagnoses.json` | com o catálogo |

A separação caso × chave não é mais garantia de sigilo — sem servidor, quem abrir o DevTools acha.
Ela continua valendo por três motivos que sobrevivem: evita spoiler acidental, mantém o *bundle*
inicial pequeno, e preserva a fronteira caso o projeto um dia ganhe servidor. Ver
[ADR-0007](adr/ADR-0007-gabarito-no-cliente.md).

## 2. Vocabulário controlado

```jsonc
// content/vocabulary/diagnoses.json
{
  "schemaVersion": 1,
  "concepts": [
    {
      "id": "dx.sca-csst",
      "label": "Síndrome coronariana aguda com supra de ST",
      "aliases": ["IAM com supra", "IAMCSST", "infarto com supra de ST", "STEMI"],
      "specialties": ["cardiologia"],
      "category": "isquemica"
    },
    { "id": "dx.tep", "label": "Tromboembolismo pulmonar",
      "aliases": ["TEP", "embolia pulmonar", "embolia de pulmão"],
      "specialties": ["pneumologia", "cardiologia"] },
    { "id": "dx.dados-insuficientes", "label": "Não há dados suficientes para uma hipótese",
      "aliases": ["não sei", "dados insuficientes", "informação insuficiente"],
      "special": true }
  ]
}
```

Decisões:
- **`aliases` é requisito funcional, não conveniência.** Sem sinônimo e sigla, o autocomplete trava
  a interação e o estudante culpa o sistema (risco N5). Toda sigla de uso corrente entra.
- `dx.dados-insuficientes` é um **conceito de primeira classe** do vocabulário, disponível em todo
  caso — não uma caixinha especial na UI. É o que permite ao caso obrigatório do briefing §16
  funcionar sem gambiarra.
- Vocabulário compartilhado entre casos: garante que o mesmo diagnóstico tenha o mesmo `id` em
  todos, o que torna possível dizer "você já viu TEP no caso 3".
- Cresce por demanda: só entra conceito usado por algum caso ou plausível como erro de estudante.

## 3. O caso

```jsonc
{
  "id": "cardio-001",
  "schemaVersion": 1,
  "specialty": "cardiologia",
  "difficulty": "facil | intermediario | avancado",
  "title": "Dor torácica aguda em homem de 58 anos",
  "estimatedMinutes": 12,
  "tags": ["dor-toracica", "emergencia"],

  "learningObjectives": [
    "Reconhecer a apresentação típica de síndrome coronariana aguda",
    "Evitar ancoragem em fator de confusão psicossocial"
  ],

  "patient": { "age": 58, "sex": "masculino", "context": "pronto-socorro" },

  "stages": [
    {
      "id": "s1", "label": "Queixa principal",
      "findings": [
        { "id": "f1", "text": "Dor torácica opressiva iniciada há 40 minutos, em repouso.",
          "category": "sintoma" }
      ],
      "decisionPoints": ["dp1", "dp2"]
    },
    {
      "id": "s2", "label": "História clínica",
      "findings": [
        { "id": "f2", "text": "Sudorese fria e náusea associadas.", "category": "sintoma" },
        { "id": "f3", "text": "Hipertenso, em uso irregular de losartana.", "category": "antecedente" },
        { "id": "f4", "text": "Refere estar sob forte estresse no trabalho.",
          "category": "contexto", "isDistractor": true }
      ],
      "decisionPoints": ["dp3"]
    },
    {
      "id": "s3", "label": "Exame físico",
      "vitals": { "pa": "150/95 mmHg", "fc": "98 bpm", "fr": "20 irpm",
                  "sato2": "96% em ar ambiente", "tax": "36,4 °C" },
      "findings": [
        { "id": "f5", "text": "Ausculta cardíaca sem sopros; pulmonar sem alterações.",
          "category": "exame-fisico" }
      ],
      "decisionPoints": ["dp4"]
    },
    {
      "id": "s4", "label": "Exames complementares",
      "findings": [
        { "id": "f6", "text": "ECG: supradesnivelamento de ST em DII, DIII e aVF.",
          "category": "exame-complementar", "revealedBy": "t.ecg" }
      ],
      "decisionPoints": ["dp5"]
    }
  ],

  "availableTests": [
    { "id": "t.ecg", "name": "Eletrocardiograma", "turnaround": "imediato", "revealsFindings": ["f6"] },
    { "id": "t.troponina", "name": "Troponina", "turnaround": "1 hora", "revealsFindings": ["f7"] },
    { "id": "t.rx-torax", "name": "Radiografia de tórax", "turnaround": "30 min", "revealsFindings": ["f8"] }
  ],

  "decisionPoints": [
    { "id": "dp1", "type": "problem-representation",
      "prompt": "Como você resumiria este problema?", "maxSelections": 5 },
    { "id": "dp2", "type": "hypothesis-list",
      "prompt": "Quais suas hipóteses iniciais?", "maxSelections": 3, "required": true },
    { "id": "dp3", "type": "probability-shift",
      "prompt": "O relato de estresse no trabalho altera a probabilidade da sua principal hipótese?",
      "aboutFinding": "f4" },
    { "id": "dp4", "type": "test-selection",
      "prompt": "Quais exames você solicita agora?", "maxSelections": 3 },
    { "id": "dp5", "type": "final-hypothesis",
      "prompt": "Qual sua hipótese diagnóstica principal?",
      "requiresEvidenceSelection": true, "requiresRationaleText": true }
  ],

  "disclaimer": "Caso fictício, elaborado para fins educacionais.",

  "authoring": {
    "createdBy": "<nome>", "reviewedBy": "<médico/docente>", "reviewStatus": "draft | reviewed | approved",
    "reviewedAt": "2026-08-20", "redTeamPassedAt": "2026-08-18", "fictional": true
  },

  "sources": [
    { "title": "…", "organization": "Sociedade Brasileira de Cardiologia", "year": 2026,
      "url": "https://…", "usedFor": ["diagnosticCriteria", "redFlags"] }
  ]
}
```

Notas:
- **`findings` fora de `stages` não existe.** Todo achado pertence a uma etapa, o que define o que o
  estudante sabia em cada ponto de decisão. É o que impede avaliar alguém por informação que ele
  ainda não tinha.
- `isDistractor` é marcação de autoria e alimenta a validação: **todo caso precisa de pelo menos um**.
- `revealedBy` liga achado a exame: o achado só aparece se o exame foi pedido.
- `sources` segue o formato pedido no briefing §24, com `usedFor` para rastreabilidade por afirmação.

## 4. A chave

```jsonc
{
  "caseId": "cardio-001",
  "schemaVersion": 1,

  "evidenceMatrix": {
    // findingId → conceptId → relação. Só o que não é neutro precisa ser declarado.
    "f1": { "dx.sca-csst": "supports", "dx.ansiedade": "neutral", "dx.pneumonia": "contradicts" },
    "f2": { "dx.sca-csst": "supports", "dx.ansiedade": "supports" },
    "f4": { "dx.ansiedade": "supports", "dx.sca-csst": "neutral" },
    "f6": { "dx.sca-csst": "supports", "dx.ansiedade": "contradicts", "dx.tep": "contradicts" }
  },

  "redFlags": [
    { "id": "rf1", "findingIds": ["f1", "f2"], "critical": true,
      "text": "Dor torácica em repouso com sintomas autonômicos em paciente com fator de risco",
      "whyDangerous": "Atraso na reperfusão aumenta mortalidade" }
  ],

  "decisionKeys": {
    "dp1": { "expected": ["agudo", "opressivo", "em-repouso"], "acceptable": ["subito"],
             "misleading": ["cronico"],
             "authorRepresentation": "Homem de 58 anos, hipertenso, com dor torácica opressiva aguda em repouso, acompanhada de sintomas autonômicos." },
    "dp2": {
      "concepts": {
        "dx.sca-csst":  { "credit": 1.0, "tier": "esperada",
                          "feedback": "Apresentação e fatores de risco tornam SCA a hipótese que precisa ser afastada primeiro." },
        "dx.dissecao-aorta": { "credit": 0.7, "tier": "aceitavel", "cantMiss": true,
                          "feedback": "Diferencial obrigatório: muda a conduta e é fatal se ignorado." },
        "dx.ansiedade": { "credit": 0.0, "tier": "implausivel",
                          "feedback": "Diagnóstico de exclusão. Considerá-lo antes de afastar causa isquêmica é o erro que este caso treina." }
      },
      "minExpected": 2
    },
    "dp3": { "aboutConcept": "dx.sca-csst", "expectedDirection": "neutral", "acceptableRange": [-1, 0],
             "rationale": "Estresse psicossocial não reduz a probabilidade de causa isquêmica; é fator de confusão, não evidência contrária." },
    "dp4": { "tests": {
      "t.ecg":       { "value": "essencial",     "feedback": "ECG em até 10 minutos é o passo que define a conduta." },
      "t.troponina": { "value": "util",          "feedback": "Complementa, mas não deve atrasar o ECG." },
      "t.rx-torax":  { "value": "desnecessario", "feedback": "Não altera a conduta imediata neste cenário." } },
      "essentialMissedMessage": "Você não solicitou o exame que define a conduta." },
    "dp5": {
      "verdicts": {
        "dx.sca-csst":  { "verdict": "muito_compativel" },
        "dx.tep":       { "verdict": "pouco_compativel" },
        "dx.ansiedade": { "verdict": "incompativel" }
      },
      "authorReasoning": "Análise do autor, exibida lado a lado com a justificativa do estudante.",
      "reflectionQuestion": "Se o ECG fosse normal, sua conduta mudaria? Por quê?"
    }
  },

  "commonMistakes": [
    { "trap": "Ancorar no relato de estresse (f4)", "why": "Distrator saliente induz fechamento prematuro",
      "triggeredWhen": { "selectedConcept": "dx.ansiedade" } }
  ],

  "differentialsToConsider": [
    { "conceptId": "dx.dissecao-aorta", "why": "Muda a conduta e é fatal se ignorada", "cantMiss": true }
  ]
}
```

## 5. Sessão (memória do navegador, efêmera)

```ts
type Session = {
  caseId: string;
  startedAt: number;
  stagesRevealed: string[];
  testsRequested: string[];
  answers: Record<DecisionPointId, Answer>;   // inclui o instante de cada resposta
  rationaleText?: string;                      // nunca avaliado automaticamente
  result?: Result;
};
```

Fica em `sessionStorage`, sobrevive a recarregar a página, some ao fechar a aba. Nada sai do
navegador. Sem contas, sem histórico, sem telemetria remota.

## 6. Validação (em CI, não em runtime)

Regras que rodam sobre todo caso e são condição de *merge*:

- schema Zod válido para `.case.json`, `.key.json` e vocabulário;
- `findingId` únicos; toda referência (`revealsFindings`, `aboutFinding`, `evidenceMatrix`,
  `redFlags.findingIds`) aponta para achado existente;
- todo `conceptId` existe no vocabulário; todo `alias` é único no vocabulário inteiro;
- todo `decisionPoint` referenciado por uma etapa tem chave em `decisionKeys`, e vice-versa;
- todo conceito com `tier: "esperada"` tem `feedback`; nenhum feedback vazio;
- ≥ 1 `isDistractor`, ≥ 1 red flag, ≥ 3 conceitos em `dp2`, ≥ 1 `cantMiss` por caso;
- `reviewStatus: "approved"` exige `reviewedBy` + `reviewedAt` + `redTeamPassedAt` preenchidos;
- nenhum achado de etapa posterior é referenciado por ponto de decisão de etapa anterior —
  **impede avaliar o estudante por informação que ele não tinha**;
- `sources` não vazio e com `url` válida em todo caso `approved`.

## 7. Mudanças desde a V1

| V1 | V2 | Motivo |
|---|---|---|
| `rubric` embutida no caso, nunca enviada ao cliente | arquivo `.key.json` separado, carregado tarde | Sem servidor, sigilo não é garantido ([ADR-0007](adr/ADR-0007-gabarito-no-cliente.md)) |
| Rubrica como *illness script* em prosa | `evidenceMatrix` + `decisionKeys` estruturados | O motor precisa de dado operável, não de texto |
| Um momento de hipótese (inicial e final) | 3–5 **pontos de decisão** tipados | Formato *key features* ([pesquisa §1](../research/assessment-formats.md)) |
| Justificativa em texto livre avaliada por LLM | `evidence-selection` avaliada + texto livre **não avaliado** | Não há avaliador em runtime ([ADR-0009](adr/ADR-0009-justificativa-por-selecao-de-evidencias.md)) |
| Hipótese em texto livre | vocabulário controlado com aliases | Correção determinística ([ADR-0008](adr/ADR-0008-vocabulario-controlado-de-hipoteses.md)) |
| 4 blocos de feedback (`correct`/`incorrect`/…) | fragmentos compostos pelo motor | Evita feedback genérico (risco N3) |
| `authoring.status` (draft/in_review/published) | `reviewStatus` (draft/reviewed/approved) + `redTeamPassedAt` | Alinha ao briefing §25 e registra a passagem pelo red team |
