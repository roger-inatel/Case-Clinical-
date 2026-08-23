> ## ⚠️ OBSOLETO — substituído por [ADR-0006](ADR-0006-aplicacao-estatica-sem-llm.md)
> Não há mais chave de API a custodiar. A aplicação é estática.
> Um efeito colateral deste ADR era manter o gabarito fora do cliente — perdido na V2 e tratado
> em [ADR-0007](ADR-0007-gabarito-no-cliente.md).

# ADR-0001 — Um único endpoint server-side para custodiar a chave da API

**Status:** proposta · **Data:** 2026-08-23 · **Depende de:** decisão D1

## Contexto

O briefing pede explicitamente "sem backend próprio". Mas chamar a API do LLM exige uma chave
secreta, e qualquer chamada feita a partir do navegador expõe essa chave a qualquer visitante
(risco R6, impacto alto). Não existe forma de esconder um segredo em código cliente.

## Opções

**A. Route Handler do Next.js (serverless function).** Uma rota, sem estado, sem banco, sem sessão.
Deploy junto com o front. Custo: uma função e a necessidade de hospedar em plataforma com runtime
de servidor (Vercel, Netlify, Cloudflare).

**B. BYOK — o estudante cola a própria chave.** Zero servidor; a chave fica em `localStorage`.
Custo: barreira de entrada absurda para estudante de Medicina, e ainda expõe a chave *dele* no
cliente. Ganho pedagógico nenhum.

**C. Sem IA em produção; só respostas gravadas.** Elimina o risco e o custo. Elimina também o
produto.

**D. Backend separado (Express/Fastify).** Resolve, mas cria um segundo projeto, um segundo deploy,
CORS e configuração — exatamente a complexidade que o briefing rejeita.

## Decisão

**Opção A.** Uma rota (`app/api/evaluate/route.ts`), sem estado, sem persistência.

Reconciliação com "sem backend": o que o briefing rejeita é **serviço, banco, autenticação e
infraestrutura**. Nada disso entra. O que entra é o mínimo indivisível de servidor exigido pela
existência de um segredo. Chamamos de *custódia de chave*, não de backend, e a distinção é honesta:
a rota não guarda nada, não sabe quem é o usuário e pode ser apagada sem migração.

Benefício colateral que não é pequeno: como a rota roda no servidor, **a rubrica do caso nunca vai
para o cliente**. Na opção B seria impossível esconder o gabarito — o estudante leria a resposta no
DevTools. A opção A é, portanto, também um requisito de produto, não só de segurança.

## Consequências

- Deploy precisa de plataforma com função serverless. **Restringe** hospedagem estática pura.
- Casos são lidos no servidor; o cliente recebe só a `StudentCaseView`.
- Precisamos de rate limit e limite de tamanho de entrada (R7).
- Teste de build obrigatório: nenhuma variável `ANTHROPIC_*` no bundle cliente.
- Se a decisão D1 vier diferente, a mudança é local: `src/ai/client.ts` e a rota.

## Reversibilidade

**Alta.** Trocar por BYOK exige mudar o cliente da IA e mover o carregamento do caso — mas a
rubrica passaria a vazar, o que provavelmente inviabiliza a troca por outro motivo.
