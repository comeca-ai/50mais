export default function Termos() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="font-display text-4xl font-semibold">
        Termos de uso e privacidade
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Escrito em português claro, como deve ser. Última atualização: agosto
        de 2026.
      </p>

      <div className="mt-10 space-y-8 text-lg leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold">1. O que é o Recomeça</h2>
          <p className="mt-2">
            O Recomeça é uma comunidade gratuita de requalificação em
            inteligência artificial para pessoas com 50 anos ou mais. Aqui
            você assiste a aulas, conversa com outros membros, participa de
            eventos e encontra oportunidades de trabalho.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">2. Seus dados</h2>
          <p className="mt-2">
            Guardamos apenas o necessário para a comunidade funcionar: seu
            nome, e-mail, as respostas dos primeiros passos e o que você
            publica. Não vendemos seus dados para ninguém. Nunca.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Sua senha é guardada de forma embaralhada (ninguém consegue ler).</li>
            <li>Os e-mails que enviamos são só sobre a sua conta e a comunidade.</li>
            <li>Você pode pedir uma cópia de todos os seus dados a qualquer momento.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">3. Seus direitos (LGPD)</h2>
          <p className="mt-2">
            Pela Lei Geral de Proteção de Dados, você pode, na página{" "}
            <strong>Perfil → Privacidade</strong>:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>Baixar todos os seus dados em um arquivo.</li>
            <li>Corrigir suas informações.</li>
            <li>Excluir sua conta e seus dados pessoais.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">4. Convivência</h2>
          <p className="mt-2">
            Respeito acima de tudo. Não aceitamos ofensas, golpes, propaganda
            enganosa ou conteúdo que maltrate qualquer pessoa. Publicações
            assim podem ser removidas e a conta, suspensa. Se algo te
            incomodar, use o botão <strong>Denunciar</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">5. Conteúdo do curso</h2>
          <p className="mt-2">
            As aulas são gratuitas para uso pessoal. Você pode compartilhar o
            que aprendeu, mas não pode revender o curso nem se passar por
            outra pessoa.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">6. Fale com a gente</h2>
          <p className="mt-2">
            Dúvidas sobre estes termos ou sobre seus dados? Escreva para{" "}
            <a
              href="mailto:ola@recomeca.ia.br"
              className="text-primary underline underline-offset-4"
            >
              ola@recomeca.ia.br
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
