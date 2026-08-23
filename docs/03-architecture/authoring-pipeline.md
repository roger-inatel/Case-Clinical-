# Pipeline de Autoria — Onde a IA Vive na V2

> **Novo na V2.** Substitui [ai-strategy.md](ai-strategy.md) (obsoleto), que descrevia IA em runtime.
> A IA não sumiu do projeto — ela saiu do produto e virou ferramenta de produção de conteúdo.

## 1. Por que este documento é o mais importante da V2

Na V1, a qualidade tinha duas chances: um caso mediano ainda passava por verificação em runtime.
Na V2 **não há segunda chance**. O que sair da autoria é o que o estudante vê, sem filtro,
para sempre. Toda a confiabilidade do produto foi transferida para este pipeline.

Isso também é a oportunidade acadêmica da V2: o pipeline é **mensurável**. Quantos defeitos o red
team encontrou? Quantos escaparam e foram achados pelo revisor humano? Essa é uma contribuição
metodológica honesta, e não depende de nenhuma alegação sobre capacidade de modelo.

## 2. O fluxo

```
[1] PESQUISA               medical-research      → docs/research/, fontes com rótulo
        ↓
[2] DESENHO PEDAGÓGICO     educational-design    → quais são os passos críticos deste caso?
        ↓
[3] PROPOSTA DE CASO       case-authoring        → .case.json + .key.json  (reviewStatus: draft)
        ↓
[4] RED TEAM               medical-red-team      → relatório de defeitos; tenta quebrar o caso
        ↓
[5] CORREÇÃO               case-authoring        → responde item a item
        ↓
[6] VALIDAÇÃO AUTOMÁTICA   CI                    → schema, integridade, regras de completude
        ↓
[7] REVISÃO HUMANA         médico/docente        → reviewStatus: reviewed → approved
        ↓
[8] PUBLICAÇÃO             merge                 → o caso entra no catálogo
```

**Regras de trava:**
- Nenhum agente escreve `reviewStatus: "approved"`. Nunca. É campo de humano.
- Etapa 4 não pode ser executada pelo mesmo agente da etapa 3. Autor e crítico separados —
  princípio herdado da V1 e que continua valendo.
- Etapa 6 é automática e bloqueia *merge*; etapas 4 e 7 bloqueiam publicação.
- Um caso pode voltar de 4 para 3 quantas vezes for preciso. Voltar de 7 para 3 é normal e esperado.

## 3. O que a IA faz bem aqui — e o que não faz

| A IA é boa em | A IA é ruim em |
|---|---|
| Levantar diferenciais que o autor esqueceu | Garantir que um valor de exame é fisiologicamente coerente |
| Encontrar inconsistência interna no JSON ("febre ausente mas leucocitose citada") | Julgar se o caso reflete a prática clínica brasileira |
| Propor erros comuns de estudante | Afirmar que um critério diagnóstico está atualizado |
| Sugerir onde estão os passos críticos | Decidir se o caso é seguro para ensinar |
| Redigir fragmentos de feedback em linguagem pedagógica | Ser fonte médica |

Daí a divisão: a IA **propõe e critica**; o humano **aprova**. E toda afirmação clínica precisa de
fonte real, conforme [research/README.md](../research/README.md) e a skill
[`medical-sourcing`](../../.claude/skills/medical-sourcing/SKILL.md).

## 4. Um risco específico deste pipeline

**Autor e crítico são o mesmo modelo.** A literatura reunida na V1 mostra que auto-crítica
intrínseca não é confiável e que juízes LLM têm viés de autopreferência
([llm-reliability-in-medicine.md](../research/llm-reliability-in-medicine.md) §§3 e 5). Isso não
desaparece só porque saímos do runtime.

Mitigações concretas:
1. **O red team recebe o caso, não a conversa que o gerou.** Sem histórico, sem justificativas do
   autor — só o JSON, como um revisor externo receberia.
2. **O red team tem checklist de saída obrigatória**: ele precisa reportar em categorias fixas
   (§7 do briefing), não emitir parecer livre. "Caso aprovado" não é saída aceitável — se não
   encontrou nada em uma categoria, precisa dizer o que procurou.
3. **A revisão humana é a única aprovação.** Nenhum arranjo de agentes substitui isso, e o texto
   acadêmico deve dizer exatamente isso.
4. **Medimos a sobreposição:** defeitos achados pelo red team × achados pelo revisor humano. Se o
   revisor humano encontrar muito do que o red team não viu, sabemos o tamanho real da limitação —
   e isso é resultado publicável.

## 5. O que fica registrado por caso

```jsonc
"authoring": {
  "createdBy": "…",            // quem conduziu a autoria (pessoa, mesmo que assistida por IA)
  "aiAssisted": true,          // declarado, não escondido
  "redTeamPassedAt": "…",      // data do último relatório sem bloqueadores
  "reviewedBy": "…",           // médico/docente
  "reviewedAt": "…",
  "reviewStatus": "draft | reviewed | approved"
}
```

Declarar `aiAssisted: true` é decisão deliberada: esconder o uso de IA num trabalho acadêmico sobre
IA seria contraditório. O que importa não é se houve IA, é **se houve revisão humana**.

## 6. Artefatos de rastreabilidade

Por caso, em `docs/06-quality/case-reviews/<caseId>.md`:

- relatório do red team (achados, severidade, o que foi corrigido, o que foi aceito e por quê);
- checklist de revisão humana preenchido;
- decisões de conteúdo controversas e sua justificativa;
- fontes consultadas com nível de leitura.

Isso alimenta diretamente a seção de metodologia do trabalho acadêmico e é o registro que sustenta
qualquer afirmação sobre qualidade de conteúdo.

## 7. O que foi descartado da V1

| Elemento V1 | Destino |
|---|---|
| Prompt do avaliador, schema de resposta, `output_config.format` | Sem uso — não há chamada em runtime |
| Verificação de *groundedness* de citação da IA | Vira validação de integridade do JSON em CI |
| Crítico condicional por gatilho | Vira red team de conteúdo, sem gatilho: **todo caso passa** |
| Suíte adversarial de estímulos | Vira [content-review-protocol.md](../06-quality/content-review-protocol.md) |
| Estimativa de custo por avaliação | Custo de runtime é **zero**. O custo agora é hora de autoria e de revisão humana |
