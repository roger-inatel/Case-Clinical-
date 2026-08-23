import { ButtonLink, PageHeader } from '@/ui';

/**
 * Erro de sistema NÃO é vermelho (design-system R2): vermelho é perigo clínico.
 * E a mensagem diz o que falhou e o que fazer — nunca "algo deu errado".
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-app flex-col justify-center px-4 py-16 sm:px-6">
      <PageHeader
        eyebrow="Erro 404"
        title="Página não encontrada"
        lead="O endereço que você abriu não corresponde a nenhuma área ou caso do catálogo. Pode ser um link antigo, ou um caso que ainda não foi publicado."
        actions={
          <>
            <ButtonLink href="/casos/" size="lg">
              Ver todos os casos
            </ButtonLink>
            <ButtonLink href="/" variant="outline" size="lg">
              Voltar ao início
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
