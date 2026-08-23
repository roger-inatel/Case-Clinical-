# ADR-0007 — O gabarito fica visível no cliente, e isso é aceito

**Status:** proposta · **Data:** 2026-08-23 · **Depende de:** ADR-0006

## Contexto

Sem servidor, todo dado que a aplicação usa chega ao navegador. Isso inclui a chave de correção:
diagnóstico esperado, matriz de evidências, feedback de cada opção. Quem abrir o DevTools e olhar a
aba de rede encontra a resposta.

Na V1 isso era impossível — o Route Handler carregava a rubrica no servidor e nunca a enviava. Era,
inclusive, um argumento a favor daquela arquitetura. A V2 abre mão disso deliberadamente.

## Opções

**A. Ignorar.** JSON servido junto com o caso. Spoiler acontece até por acidente (o *bundle* do caso
contém a resposta; qualquer curioso vê).

**B. Carregamento tardio.** `.key.json` em arquivo separado, buscado por `import()` dinâmico só
depois da primeira submissão. Elimina o spoiler acidental e reduz o *bundle* inicial. Não impede
quem procura.

**C. Ofuscação (base64, XOR, cifra com chave no bundle).** Aumenta o esforço de "abrir a aba de
rede" para "abrir a aba de rede e decodificar". Não é segurança — a chave está no cliente. Em
trabalho acadêmico, apresentar isso como proteção seria indefensável.

**D. Voltar a ter servidor.** Resolve, e contradiz a decisão fundadora da V2.

## Decisão

**Opção B**, com a limitação declarada em voz alta na documentação acadêmica.

O raciocínio que sustenta aceitar: **não há nada em jogo**. Não há nota, não há certificado, não há
ranking, não há comparação entre estudantes ([ADR-0010](ADR-0010-perfil-sem-nota-agregada.md)). O
único prejudicado por espiar o gabarito é quem espia. Investir engenharia contra trapaça num
instrumento formativo é resolver um problema que não existe — e criar a impressão errada de que
existe algo a proteger.

**Opção C fica registrada como disponível**: se o projeto um dia for usado em avaliação com peso,
codificação em base64 é uma linha de código. Mas nesse cenário a resposta certa é a opção D, não a C.

## Consequências

- Documentação e texto acadêmico declaram: *a aplicação não impede a consulta ao gabarito; é um
  instrumento formativo e essa é uma consequência aceita da arquitetura sem servidor.*
- O `.key.json` separado precisa existir mesmo sem garantir sigilo — pelo carregamento tardio, pelo
  tamanho do bundle e pela fronteira arquitetural.
- Se algum dia houver avaliação com peso, este ADR é o primeiro a ser revisado.

## Reversibilidade

**Alta.** A separação caso × chave já está feita; mover a correção para o servidor exige apenas um
endpoint que chame `evaluate()`, que é função pura. O desenho não impede a mudança — só a adia.
