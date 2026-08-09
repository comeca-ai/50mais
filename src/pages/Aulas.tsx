import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import AvaliacaoModulo from "@/components/AvaliacaoModulo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  PlayCircle,
} from "lucide-react";

export default function Aulas() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: lessons, isLoading } = trpc.lessons.list.useQuery();
  const { data: meuProgresso } = trpc.progress.my.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const { data: resumo } = trpc.progress.summary.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const feitas = new Set((meuProgresso ?? []).map((p) => p.lessonId));
  const alternar = trpc.progress.toggle.useMutation({
    onSuccess: () => {
      utils.progress.my.invalidate();
      utils.progress.summary.invalidate();
    },
  });

  const modulos = Array.from(new Set((lessons ?? []).map((l) => l.modulo)));

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Aulas do curso
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Curso completo de inteligência artificial, passo a passo. Assista no
          seu ritmo e marque cada aula concluída para acompanhar seu progresso.
        </p>
      </header>

      {isAuthenticated && resumo && (
        <Card className="mt-8 border-2 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xl font-bold">Seu progresso no curso</p>
              <p className="font-display text-3xl font-semibold text-primary">
                {resumo.percentual}%
              </p>
            </div>
            <Progress value={resumo.percentual} className="mt-3 h-4" />
            <p className="mt-2 text-muted-foreground">
              {resumo.concluidas} de {resumo.total} aulas concluídas
              {resumo.percentual === 100 && " — parabéns, curso completo! 🎉"}
            </p>
            {resumo.percentual === 100 && (
              <Button size="lg" className="mt-4 gap-2" asChild>
                <Link to="/certificado">
                  <Award className="h-5 w-5" aria-hidden />
                  Pegar meu certificado
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <p className="mt-12 text-lg text-muted-foreground">Carregando aulas…</p>
      )}

      {!isLoading && (lessons ?? []).length === 0 && (
        <Card className="mt-12 border-2 border-dashed">
          <CardContent className="p-10 text-center">
            <PlayCircle className="mx-auto h-12 w-12 text-primary" aria-hidden />
            <h2 className="font-display mt-4 text-2xl font-semibold">
              As aulas estão chegando
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
              Estamos organizando todo o material do curso. Cadastre-se na
              comunidade para ser avisado quando as aulas forem publicadas.
            </p>
          </CardContent>
        </Card>
      )}

      {modulos.map((modulo, mi) => {
        const aulasModulo = (lessons ?? []).filter((l) => l.modulo === modulo);
        const feitasModulo = aulasModulo.filter((a) => feitas.has(a.id)).length;
        const pctModulo =
          aulasModulo.length === 0
            ? 0
            : Math.round((feitasModulo / aulasModulo.length) * 100);

        return (
          <section key={modulo} className="mt-14" aria-labelledby={`modulo-${mi}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-4xl font-semibold text-primary/30">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <h2 id={`modulo-${mi}`} className="font-display text-3xl font-semibold">
                  {modulo}
                </h2>
              </div>
              {isAuthenticated && aulasModulo.length > 0 && (
                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                  <div className="flex items-center gap-3">
                    <Progress value={pctModulo} className="h-3 w-32" />
                    <span className="text-sm font-bold text-muted-foreground">
                      {feitasModulo}/{aulasModulo.length}
                    </span>
                  </div>
                  <AvaliacaoModulo moduleId={aulasModulo[0].moduloId} />
                </div>
              )}
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {aulasModulo.map((aula) => {
                const concluida = feitas.has(aula.id);
                return (
                  <Card
                    key={aula.id}
                    className={`card-hover ${concluida ? "border-2 border-[hsl(150,50%,45%)]" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold leading-snug">
                          {aula.titulo}
                        </h3>
                        {aula.duracaoMin && (
                          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-bold">
                            <Clock className="h-4 w-4" aria-hidden />
                            {aula.duracaoMin} min
                          </span>
                        )}
                      </div>
                      {aula.descricao && (
                        <p className="mt-3 leading-relaxed text-muted-foreground">
                          {aula.descricao}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Button asChild size="lg" className="text-base font-bold">
                          <Link to={`/aulas/${aula.id}`}>
                            <PlayCircle className="mr-2 h-5 w-5" aria-hidden />
                            {aula.videoUrl ? "Assistir aula" : "Ver aula"}
                          </Link>
                        </Button>
                        {aula.materialUrl && (
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="text-base font-bold"
                          >
                            <Link to={`/aulas/${aula.id}`}>
                              <FileText className="mr-2 h-5 w-5" aria-hidden />
                              Material
                            </Link>
                          </Button>
                        )}
                        {isAuthenticated && (
                          <button
                            onClick={() =>
                              alternar.mutate({
                                lessonId: aula.id,
                                concluida: !concluida,
                              })
                            }
                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold transition-colors ${
                              concluida
                                ? "bg-[hsl(150,50%,45%)] text-white"
                                : "bg-secondary hover:bg-border"
                            }`}
                            aria-pressed={concluida}
                          >
                            {concluida ? (
                              <CheckCircle2 className="h-5 w-5" aria-hidden />
                            ) : (
                              <Circle className="h-5 w-5" aria-hidden />
                            )}
                            {concluida ? "Concluída" : "Marcar concluída"}
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      {!isAuthenticated && (
        <Card className="mt-12 bg-secondary">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <p className="text-lg font-bold">
              Entre na sua conta para marcar aulas concluídas e acompanhar seu
              progresso.
            </p>
            <Button asChild size="lg" className="h-12 text-base font-bold">
              <Link to="/login">Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
