import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, PlayCircle } from "lucide-react";

export default function Aulas() {
  const { data: lessons, isLoading } = trpc.lessons.list.useQuery();

  const modulos = Array.from(new Set((lessons ?? []).map((l) => l.modulo)));

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Aulas do curso
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Curso completo de inteligência artificial, passo a passo. Assista no
          seu ritmo, pause, volte e reassista quantas vezes quiser.
        </p>
      </header>

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

      {modulos.map((modulo, mi) => (
        <section key={modulo} className="mt-14" aria-labelledby={`modulo-${mi}`}>
          <div className="flex items-baseline gap-4">
            <span className="font-display text-4xl font-semibold text-primary/30">
              {String(mi + 1).padStart(2, "0")}
            </span>
            <h2 id={`modulo-${mi}`} className="font-display text-3xl font-semibold">
              {modulo}
            </h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {(lessons ?? [])
              .filter((l) => l.modulo === modulo)
              .map((aula) => (
                <Card key={aula.id} className="card-hover">
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
                    <div className="mt-5 flex flex-wrap gap-3">
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
                            Material de apoio
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
