import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ShieldCheck } from "lucide-react";

export default function Certificado() {
  const { isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });
  const utils = trpc.useUtils();

  const { data: elig } = trpc.learn.elegibilidade.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: certificados } = trpc.learn.meusCertificados.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const emitir = trpc.learn.emitirCertificado.useMutation({
    onSuccess: () => {
      utils.learn.meusCertificados.invalidate();
      utils.learn.elegibilidade.invalidate();
    },
  });

  return (
    <div className="container-page max-w-3xl py-14">
      <header className="text-center">
        <Award className="mx-auto h-14 w-14 text-primary" aria-hidden />
        <h1 className="font-display mt-4 text-4xl font-semibold">
          Seu certificado
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Conclua todas as aulas e passe nas avaliações dos módulos para
          receber seu certificado do curso Recomeça.
        </p>
      </header>

      {(certificados ?? []).map((c) => (
        <Card key={c.id} className="mt-10 border-4 border-primary">
          <CardContent className="p-10 text-center">
            <p className="text-lg text-muted-foreground">Certificado de conclusão</p>
            <p className="font-display mt-2 text-3xl font-semibold">
              {c.cursoTitulo}
            </p>
            <p className="mt-4 text-lg">
              Emitido em {new Date(c.createdAt).toLocaleDateString("pt-BR")}
              {c.cargaHoraria ? ` · ${c.cargaHoraria} horas` : ""}
            </p>
            <p className="mt-6 rounded-lg bg-secondary px-4 py-3 font-mono text-xl font-bold tracking-wider">
              {c.codigo}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Empresas podem conferir este código em{" "}
              <Link to="/verificar" className="underline underline-offset-4">
                recomeca.ia.br/verificar
              </Link>
            </p>
          </CardContent>
        </Card>
      ))}

      {(certificados ?? []).length === 0 && elig && (
        <Card className="mt-10">
          <CardContent className="p-8 text-center">
            {elig.elegivel ? (
              <>
                <ShieldCheck className="mx-auto h-12 w-12 text-primary" aria-hidden />
                <p className="mt-4 text-2xl font-bold">
                  Você concluiu tudo! 🎉
                </p>
                <p className="mt-2 text-lg text-muted-foreground">
                  Seu certificado está pronto para ser emitido.
                </p>
                <Button
                  size="lg"
                  className="mt-6 h-14 px-10 text-lg font-bold"
                  disabled={emitir.isPending}
                  onClick={() => emitir.mutate()}
                >
                  Emitir meu certificado
                </Button>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">Continue firme!</p>
                <p className="mt-3 text-lg text-muted-foreground">
                  {elig.faltamAulas > 0 &&
                    `Faltam ${elig.faltamAulas} aula(s) para concluir. `}
                  {elig.faltamQuizzes > 0 &&
                    `Falta passar em ${elig.faltamQuizzes} avaliação(ões) de módulo.`}
                </p>
                <Button size="lg" className="mt-6" asChild>
                  <Link to="/aulas">Voltar para as aulas</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
