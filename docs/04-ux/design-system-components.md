# Design System — Componentes

**Status: IMPLEMENTADO.** Fundações em [design-system.md](design-system.md); as regras R1–R5 de lá
valem aqui. A biblioteca de componentes é **shadcn/ui**
([ADR-0011](../03-architecture/adr/ADR-0011-shadcn-ui-como-design-system.md)).

> **Como ler este documento.** As seções abaixo descrevem o **comportamento e as regras** de cada
> componente — o que continua valendo. A *implementação* das primitivas não é mais nossa: vem do
> shadcn/ui e vive em `src/ui/shadcn/`. Onde este texto descreve aparência de primitiva, a fonte de
> verdade passou a ser a variante do componente.

---

## 0. Inventário

Ordem de preferência, sem exceção: **componente shadcn/ui → variante/token → componente de domínio.**

| Papel | Origem | Onde |
|---|---|---|
| Button · Card · Badge · Input · Textarea · Label · Checkbox · RadioGroup · Separator · Alert · Breadcrumb | **shadcn/ui** | `src/ui/shadcn/` |
| ButtonLink · Bullet · PageHeader · SectionHeading · EmptyState · CaseCard | composição sobre shadcn | `src/ui/` |
| DocumentBlock · CommentaryBlock · StepIndicator · OptionPill/Row/RadioRow/Toggle | domínio, compondo shadcn por dentro | `src/ui/` |
| DiagnosisCombobox · ActionBar · VerdictBand · EvidenceItem · DecisionProfile | domínio puro | `src/features/` |

Nomes que mudaram na implementação: `Chip` → `OptionPill`; `RadioScale` → `OptionRadioRow` dentro de
um `RadioGroup`; `EvidenceSelector` → `OptionToggle`; `InlineNotice` → `Alert` do shadcn;
`VerdictBanner` → `VerdictBand` + `Card`; `FieldGroup` → `fieldset`/`legend` nativos.
`Accordion`, `Popover` e `Skeleton` **não existem**: o motivo está em design-system.md §8.3.

Todo componente de domínio existe porque **codifica uma regra do produto**, não porque a tela ficou
bonita. Se um deles puder virar composição de primitivas sem perder a regra, deve virar.

---

## 1. Button

Variantes do shadcn/ui, com os nomes dele:

| Variante | Uso | Aparência |
|---|---|---|
| `default` | A ação que avança o fluxo. **Uma por tela** | Fundo `--primary`, texto `--primary-foreground` |
| `outline` | Ação alternativa ("voltar", "refazer") | Borda `--input`, fundo `--background` |
| `secondary` | Ação de igual peso, sem competir com a primária | Fundo `--secondary` |
| `ghost` | Ação terciária, dentro de blocos | Sem borda, hover muda superfície |
| `link` | Navegação inline | Sublinhado, cor `--primary` |

Todo `size` tem altura **≥ 44px**: `size` muda densidade horizontal e tipografia, nunca o alvo de
toque (A3). Verificado em `tests/quality/design-tokens.test.ts`.

**Não existe `destructive`.** Este produto não destrói nada — não há conta, não há histórico, não há
exclusão. A variante `destructive` do shadcn é removida na instalação para não ser usada por engano
como "resposta errada" (violaria R2).

| Tamanho | Altura | Onde |
|---|---|---|
| `sm` | 32px | Dentro de cards, ações auxiliares |
| `md` | 40px | Padrão em ≥sm |
| `lg` | **48px** | **Padrão no mobile** — garante alvo ≥44px (A3) |

Regras: rótulo sempre verbo no infinitivo ("Confirmar hipóteses", não "OK") · nunca só ícone, exceto
"remover chip", que leva `aria-label` · largura total apenas na barra de ação mobile · estado
`loading` desabilita e troca o rótulo por "Registrando…", mantendo a largura.

---

## 2. Card

**Cards são escassos de propósito** — o Discovery V2 proíbe "excesso de cards", e o runner do caso
**não usa nenhum**: ele é um documento.

| Variante | Onde | Anatomia |
|---|---|---|
| `case` | Catálogo | Título · badges (dificuldade, especialidade) · 1ª linha do objetivo · duração estimada · alvo clicável inteiro |
| `document` | Etapa do caso | `DocumentBlock`: `--paper` + filete `--paper-rule`, **sem sombra**. É o papel, não um `Card` |
| `commentary` | Comentário do autor | `CommentaryBlock`: `--commentary`, filete lateral 3px `--commentary-rule`, rótulo "Comentário do autor" |

Proibido: card dentro de card · card só para agrupar dois parágrafos · sombra em `document` ·
card no fluxo de simulação.

---

## 3. Inputs

### 3.1 Textarea (justificativa)
Mínimo 5 linhas, cresce até 12 · contador de caracteres **sem limite rígido** (informativo) ·
placeholder descreve a tarefa, não dá exemplo (exemplo enviesaria a resposta) ·
rótulo obrigatório e explícito: **"Escreva seu raciocínio. Este texto não é corrigido automaticamente
— ele será exibido ao lado da análise do autor."**

Essa frase é requisito, não microcópia opcional: prometer análise e entregar comparação seria
enganar o estudante ([ADR-0009](../03-architecture/adr/ADR-0009-justificativa-por-selecao-de-evidencias.md)).

### 3.2 Chip / ChipGroup (qualificadores semânticos)
Seleção múltipla, alvo ≥44px, quebra em linhas, contador "3 de 5 selecionados" ·
implementado como `checkbox` visualmente estilizado, dentro de `<fieldset>` com `<legend>` ·
selecionado = fundo `--accent` + borda `--primary/40` + **marca de seleção**
(nunca só cor) · **sem** ordenação por relevância — ordem fixa, para não sugerir resposta.

### 3.3 Checkbox (seleção de exames)
Lista vertical com nome + tempo de resultado · limite máximo com contador · ao atingir o limite, as
demais ficam `aria-disabled` com motivo lido ("limite de 3 exames atingido"), **não** somem.

### 3.4 RadioScale (deslocamento de probabilidade)
Cinco opções, sempre com **rótulo textual**, nunca só números:

`muito menos provável` · `menos provável` · `não altera` · `mais provável` · `muito mais provável`

Horizontal em ≥sm, vertical no mobile · **sem cor semântica antes de responder** — colorir as
extremidades sugeriria qual é a resposta certa · `<fieldset>` + `<legend>` com o enunciado completo.

### 3.5 FieldGroup
Envelope comum: rótulo · descrição opcional · campo · contador · mensagem de erro ligada por
`aria-describedby`. Erro de preenchimento usa `--text-secondary` + ícone, **nunca vermelho** (R2).

---

## 4. DiagnosisCombobox — o componente crítico

O de maior risco de acessibilidade e o que carrega a interação central do produto. Base: `command`
+ `popover` do shadcn, com comportamento adicional especificado abaixo.

### Comportamento

| Regra | Valor | Por quê |
|---|---|---|
| Caracteres mínimos para sugerir | **2** | Não é para reconhecer numa lista, é para lembrar ([ADR-0008](../03-architecture/adr/ADR-0008-vocabulario-controlado-de-hipoteses.md)) |
| Sugestões visíveis | máximo 8 | Lista longa vira menu de escolha |
| Busca | rótulo **e** aliases, com dobra de acento e caixa | "IAM", "iam", "IAMCSST", "embolia de pulmão" |
| Lista completa ao focar | **nunca** | Despejar o vocabulário entrega o diferencial pronto |
| Ordenação | prefixo > início de palavra > substring | Previsível |
| Seleção | vira chip removível, com ordem de prioridade | Até N conforme o ponto de decisão |
| Limite atingido | campo desabilita com motivo lido | Não some silenciosamente |
| **Termo sem correspondência** | **"Não encontramos esse termo no vocabulário do sistema. Você pode registrá-lo e seguir."** | Registra o termo; **nunca** diz "resposta inválida" |
| `dx.dados-insuficientes` | aparece como opção normal, sem destaque e sem penalização visual | R4 |

### Acessibilidade — critérios de aceite

- `role="combobox"`, `aria-expanded`, `aria-controls`, **`aria-activedescendant`** apontando para a
  opção destacada.
- Teclado completo: ↑ ↓ navega · Enter seleciona · Esc fecha sem perder o texto ·
  Backspace em campo vazio remove o último chip · Tab sai sem selecionar acidentalmente.
- `aria-live="polite"` anuncia a contagem: "3 sugestões disponíveis".
- Chips selecionados são uma lista navegável por teclado, cada um com botão de remoção rotulado.
- Foco visível em opção destacada **e** no campo, simultaneamente distinguíveis.
- Testado com leitor de tela antes do release. **É requisito, não desejável.**

### Proibições
Sem busca fuzzy que aceite erro grosseiro (aceitar "infato" como "infarto" mascara imprecisão
terminológica que o estudante precisa perceber) · sem autocompletar por Tab · sem seleção automática
do primeiro item ao digitar · sem criação de conceito novo pelo estudante no vocabulário.

---

## 5. Badge

Pequeno, baixa saturação, `text-xs`. **Máximo 2 por linha.**

| Tipo | Aparência | Onde |
|---|---|---|
| `difficulty` | Neutro com ponto colorido | Catálogo |
| `specialty` | Neutro | Catálogo |
| `tag` | Neutro, contorno | Catálogo |
| `cantMiss` | **`--danger`**, com ícone | Diferenciais no feedback |
| `redFlag` | **`--danger`**, com ícone | Bloco de red flag |
| `stageState` | Neutro / com marca de concluído | Indicador de etapas |
| `authored` | Neutro, com ícone de documento | Rótulo "Comentário do autor" |

`cantMiss` e `redFlag` são os **únicos** badges vermelhos, e por isso são os únicos que o olho
aprende a procurar. Nenhum badge indica acerto ou erro.

---

## 6. StepIndicator (o "progress" possível)

**Não é barra de progresso.** Barra percentual é gamificação (R5) e sugere que existe uma pontuação.

Anatomia: `Etapa 2 de 4 · História clínica`, com marcadores das quatro etapas.

| Estado da etapa | Marca |
|---|---|
| concluída | preenchida + ícone de verificado |
| atual | contorno forte + rótulo visível |
| futura | contorno fraco, **sem rótulo** (não antecipa o que vem) |

Sem percentual, sem tempo restante, sem "80% concluído". `aria-current="step"` na atual.
Skeleton só é usado para carregamento de conteúdo (raro — os dados são locais).

---

## 7. Componentes de feedback clínico

Aqui mora a identidade do produto. Todos vivem dentro de `CommentaryBlock`.

### 7.1 CommentaryBlock
Contêiner de tudo que é interpretação do autor. `--commentary` · filete lateral 3px ·
cabeçalho fixo com badge `authored` + "Comentário do autor" · tipografia **sans** (o caso é serif).
É a metade visual da regra R1 e nunca é omitido, nem em bloco curto.

### 7.2 VerdictBanner
Faixa que abre o resultado.

Anatomia: faixa de cor do veredito · rótulo textual do veredito · frase em linguagem, **sem número**.
- `parcialmente_compativel` → **faixa dividida** teal/laranja.
- `dados_insuficientes` → matiz índigo, **sem** ícone de alerta e **sem** tom de falha.

Proibido: percentual, medidor, estrelas, emoji, "parabéns", "que pena".

### 7.3 EvidenceItem
Unidade atômica do feedback. Um por achado comentado.

Anatomia: ícone de relação · rótulo textual (`Sustenta` / `Contradiz` / `Não discrimina`) ·
citação do achado em `<blockquote>` **com a serif do caso** · justificativa do autor em sans ·
marca de "você não selecionou este achado" quando aplicável.

Três regras:
1. **Ícone + rótulo sempre** (R3). Cor é o terceiro sinal, nunca o primeiro.
2. A citação do achado usa a tipografia do caso — é texto do paciente aparecendo dentro do
   comentário, e a voz precisa continuar distinguível.
3. Os itens que o estudante **não** marcou vêm **antes** dos que marcou, e dentro do grupo
   "contradiz" antes de "sustenta" ([ux-flow §4](ux-flow.md)).

### 7.4 EvidenceSelector
Onde o estudante marca achados como sustenta/contradiz. Lista dos achados **já revelados**, cada um
com três opções mutuamente exclusivas (`sustenta` / `contradiz` / `não marcar`).

Sem cor semântica antes da submissão · sem contagem de "quantos você acertou" durante o
preenchimento · achados de etapas não reveladas **não aparecem** (regra temporal).

### 7.5 DecisionProfile
As quatro dimensões do perfil, **em contagem explícita**:

`Amplitude do diferencial — 2 de 3 hipóteses esperadas`

Sem barra, sem percentual, sem soma entre dimensões, sem comparação com outros estudantes.
Cada dimensão leva uma frase do que aquilo significa. Dimensão com denominador zero **não é exibida**
(nunca "0 de 0").

### 7.6 Alert (era `InlineNotice`)
Aviso dentro do fluxo, para três casos: disclaimer de protótipo educacional · aviso de submissão
irreversível · hipótese não prevista pelo autor.

Neutro por padrão. **Nunca vermelho, nunca amarelo de alerta.** Nenhum dos três é erro.

---

## 8. Estados de erro

Distinção que o sistema precisa fazer e a maioria dos produtos não faz:

| Tipo | Cor | Tom | Exemplo |
|---|---|---|---|
| **Erro de sistema** | Neutro (slate) | Honesto e específico | "Não foi possível carregar este caso." |
| **Preenchimento incompleto** | Neutro + ícone | Instrutivo | "Selecione ao menos 2 hipóteses para continuar." |
| **Perigo clínico** | **`--danger`** | Informativo | Red flag no feedback |

**Erro de sistema não é vermelho.** Vermelho é perigo clínico (R2). Um erro de carregamento não é
perigoso — é chato.

Regras: nunca "algo deu errado" · sempre diz o que falhou e o que fazer · ação de recuperação
presente e rotulada · falha de carregamento do caso mostra o que já existe (catálogo) em vez de
tela em branco · **nunca** conteúdo parcial silencioso.

## 9. Estados de sucesso

**Sucesso é do sistema, nunca do raciocínio.**

Permitido: confirmação discreta de que a resposta foi registrada (marca de verificado, sem cor
comemorativa, sem animação).

Proibido: "Parabéns!" · "Correto!" · confete · som · badge de conquista · **qualquer tratamento de
sucesso aplicado a um veredito**. `muito_compativel` é um veredito, não uma vitória — usa a cor do
veredito, não uma cor de sucesso.

Consequência direta: **não existe token `--success`.** Se ele existisse, alguém acabaria aplicando
num veredito.

---

## 10. Onde cada componente aparece

| Tela | Componentes |
|---|---|
| Home | PageHeader, SectionHeading, Card, Badge, Alert, Bullet, ButtonLink |
| Catálogo · Área | PageHeader, CaseCard, Badge, EmptyState, Breadcrumb |
| Visão geral do caso | Breadcrumb, PageHeader, Badge, DocumentBlock, SectionHeading, Bullet, Alert, Card, Separator, ButtonLink |
| Simulação | Breadcrumb, StepIndicator, DocumentBlock, Card, OptionPill, DiagnosisCombobox, OptionRadioRow, OptionRow, OptionToggle, Textarea, Label, ActionBar, Button, Alert |
| Resultado | PageHeader, SectionHeading, VerdictBand, Card, CommentaryBlock, Badge, Bullet, Alert, Separator, Button, ButtonLink |
| 404 | PageHeader, ButtonLink |

Nenhum componente do inventário fica sem uso. Nenhuma tela precisa de componente fora dele.

---

## 11. Ordem de implementação *(executada)*

1. Tokens + tema restrito + primitivas shadcn/ui.
2. `DocumentBlock`, `CommentaryBlock`, `StepIndicator` — as duas vozes e a posição no caso.
3. As quatro formas de opção sobre Radix Checkbox/RadioGroup.
4. `DiagnosisCombobox` — apresentação refeita, contrato ARIA e teclado **intactos**.
5. Telas, da simulação para fora.
6. QA visual em navegador real: 1440 · 1280 · 430 · 390 · 200% de zoom, claro e escuro.

O combobox foi tratado por último de propósito nesta rodada — ao contrário da ordem original. A
lógica dele já estava validada por 15 testes, e o risco aqui era o inverso: **quebrá-la** ao trocar
a aparência. Por isso a mudança foi só de apresentação.

---

## 12. Questões em aberto para sua decisão

| # | Questão | Recomendação |
|---|---|---|
| **DS1** | Serif para o texto clínico — confirma? Aumenta o peso de fontes e é a decisão estética mais visível | **Sim.** É metade da execução de R1 |
| **DS2** | Eixo teal↔laranja em vez de verde/vermelho | **Sim.** Verde/vermelho lê como certo/errado e é o pior par para daltonismo |
| **DS3** | Alternador de tema claro/escuro no MVP | **Não.** Só `prefers-color-scheme` |
| **DS4** | `parcialmente_compativel` com faixa bicolor | **Sim.** Uma cor intermediária esconderia a informação |
| **DS5** | Sem `--success` e sem `destructive` | **Sim.** Ambos seriam usados errado com o tempo |
| **DS6** | Ordem de implementação com o combobox em 3º | **Sim.** Falhar cedo no componente de maior risco |
