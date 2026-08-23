# Fontes — Caso Piloto C1

Nível de leitura: **[IL]** integral · **[AB]** abstract · **[RB]** apenas resumo de busca.

> **Nenhuma fonte deste caso foi lida na íntegra.** Todas estão em `[RB]`. Isso é declarado
> deliberadamente e é um **item bloqueador** na revisão humana
> ([human-review.md](../../reviews/c1/human-review.md)).

| # | Fonte | Tipo | Usado para | Nível |
|---|---|---|---|---|
| S1 | [Diretrizes da SBC sobre Angina Instável e IAM sem Supradesnível do Segmento ST — 2021 (SciELO)](https://www.scielo.br/j/abc/a/QvqxLFycJhLvNGFzPhsbZPF/?lang=pt) · [espelho PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8294740/) | Diretriz de sociedade médica (BR) | ECG em até 10 min; troponina; valor de exames essenciais; contexto brasileiro | [RB] |
| S2 | [2021 AHA/ACC/ASE/CHEST/SAEM/SCCT/SCMR Guideline for the Evaluation and Diagnosis of Chest Pain (Circulation)](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001029) · [Executive Summary (JACC)](https://www.jacc.org/doi/10.1016/j.jacc.2021.07.052) | Diretriz de sociedade médica | Emergências a excluir primeiro (SCA, dissecção, TEP); preferência por troponina ultrassensível | [RB] |
| S3 | [High-Sensitivity Cardiac Troponin and the 2021 Chest Pain Guidelines (PubMed 35775423)](https://pubmed.ncbi.nlm.nih.gov/35775423/) | Artigo de revisão | Papel da troponina ultrassensível | [RB] |
| S4 | [Clinical characteristics and diagnostic challenges of NSTE-ACS patients with normal electrocardiograms (Frontiers Cardiovasc Med)](https://www.frontiersin.org/journals/cardiovascular-medicine/articles/10.3389/fcvm.2026.1835982/full) | Revisão | **ECG normal não exclui SCA**; ~8% dos IAM com ECG normal; mecanismos | [RB] |
| S5 | [Diagnosis of Acute Coronary Syndrome — AAFP (2005)](https://www.aafp.org/pubs/afp/issues/2005/0701/p119.html) | Revisão narrativa (secundária, antiga) | Série de 775 pacientes citada em §3 da pesquisa. ⚠️ **rastrear original** | [RB] |
| S6 | [Panic attack and its correlation with acute coronary syndrome — more than just a diagnosis of exclusion (PubMed 20372755)](https://pubmed.ncbi.nlm.nih.gov/20372755/) | Artigo | Sobreposição pânico × SCA; SCA deve ser afastada antes do rótulo psicogênico; pânico não é fator protetor | [RB] |
| S7 | [Anxiety about anxiety: ED provider beliefs and practices regarding anxiety-associated low risk chest pain (PMC5853064)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5853064/) | Estudo (survey) | Contexto do viés de atribuição em emergência | [RB] |
| S8 | [Prehospital Misdiagnosed Acute Coronary Syndrome — Incidence, Discriminating Features, and Differential Diagnoses (PMC11263978)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11263978/) | Estudo observacional | SCA diagnosticada erroneamente; diferenciais confundidores | [RB] |
| S9 | [Presentation, Diagnosis, and Outcomes of Acute Aortic Dissection: 17-Year Trends from IRAD (JACC 2015)](https://www.jacc.org/doi/10.1016/j.jacc.2015.05.029) | Registro multicêntrico | Dissecção como `cantMiss`; **achados clássicos frequentemente ausentes** (déficit de pulso ~15%, IAo ~32%); descritores clássicos pouco comuns | [RB] |
| S10 | [The International Registry of Acute Aortic Dissection (IRAD): new insights into an old disease (PubMed 10685714)](https://pubmed.ncbi.nlm.nih.gov/10685714/) | Registro multicêntrico | Idem | [RB] |
| S11 | [The HEART score: a multinational validation study (PubMed 23892941)](https://pubmed.ncbi.nlm.nih.gov/23892941/) | Estudo de validação | Contexto de estratificação de risco (não usado como ponto de decisão) | [RB] |
| S12 | [Elevated MACE Risk With a HEART Score of 3 (PMC12151265)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12151265/) | Estudo retrospectivo | Ressalva ao limiar de baixo risco do HEART | [RB] |

## Mapeamento fonte → campo do caso

| Campo | Fontes |
|---|---|
| `availableTests` valores `essencial` (ECG, troponina us) | S1, S2, S3 |
| Achado `f16` (ECG não diagnóstico) e o feedback correspondente | S4, S5 |
| Distratores `f4` e `f5`; chave de `dp3` | S6, S7, S8 |
| `dx.dissecao-aorta` como `cantMiss`; feedback sobre simetria de pulsos | S9, S10 |
| `differentialsToConsider` | S2, S8, S9 |
| Contexto de risco (não usado como ponto de decisão) | S11, S12 |

## Fontes rejeitadas

| Fonte | Motivo |
|---|---|
| `amfmtreatment.com` — "5 Heart Conditions Misdiagnosed as Panic Attacks" | Conteúdo comercial. Não é fonte aceitável ([research/README.md](../README.md)) |
| Post em rede social sobre ECG normal e SCA | Não é fonte aceitável |
| `sanarmed.com` (resumo da diretriz SBC) | Resumo de terceiros; usar a diretriz original (S1) |
| `mdtools.org` (calculadora HEART) | Ferramenta, não fonte |
