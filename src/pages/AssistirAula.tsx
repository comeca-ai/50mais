import { Link, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VideoPlayer from "@/components/VideoPlayer";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react";

export default function AssistirAula() {
  const { id } = useParams<{ id: string }>();
  const aulaId = Number(id);
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: lessons, isLoading } = trpc.lessons.list.useQuery();
  const { data: meuProgresso } = trpc.progress.my.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const alternar = trpc.progress.toggle.useMutation({
    onSuccess: () => {
      utils.progress.my.invalidate();
      utils.progress.summary.invalidate();
    },
  });
  const concluida = (meuProgresso ?? []).some((p) => p.lessonId === aulaId);

  if (isLoading) {
    return (
      <div className="container-page py-14">
        <p className="text-lg text-muted-foreground">Carregando aula…</p>
      </div>
    );
  }

  const lista = lessons ?? [];
  const indice = lista.findIndex((l) => l.id === aulaId);
  const aula = indice >= 0 ? lista[indice] : null;

  if (!aula) {
    return (
      <div className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold">
          Aula não encontrada
        </h1>
        <Button asChild variant="outline" size="lg" className="mt-6 text-base">
          <Link to="/aulas">
            <ArrowLeft className="mr-2 h-5 w-5" aria-hidden /> Voltar para as aulas
          </Link>
        </Button>
      </div>
    );
  }

  const anterior = indice > 0 ? lista[indice - 1] : null;
  const proxima = indice < lista.length - 1 ? lista[indice + 1] : null;

  return (
    <div className="container-page max-w-5xl py-10">
      <Button asChild variant="ghost" size="lg" className="mb-4 text-base">
        <Link to="/aulas">
          <ArrowLeft className="mr-2 h-5 w-5" aria-hidden /> Todas as aulas
        </Link>
      </Button>

      <p className="text-sm font-bold uppercase tracking-widest text-primary">
        {aula.modulo}
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold leading-tight md:text-4xl">
        {aula.titulo}
      </h1>
      {aula.duracaoMin && (
        <p className="mt-3 flex items-center gap-2 text-lg text-muted-foreground">
          <Clock className="h-5 w-5" aria-hidden />
          {aula.duracaoMin} minutos
        </p>
      )}

      <div className="mt-8">
        {aula.videoUrl ? (
          <VideoPlayer url={aula.videoUrl} titulo={aula.titulo} />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-secondary p-8 text-center">
            <p className="text-xl font-bold text-muted-foreground">
              O vídeo desta aula será publicado em breve.
            </p>
          </div>
        )}
      </div>

      {aula.descricao && (
        <Card className="mt-8">
          <CardContent className="p-7">
            <h2 className="text-xl font-bold">Sobre esta aula</h2>
            <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
              {aula.descricao}
            </p>
          </CardContent>
        </Card>
      )}

      {aula.materialUrl && (
        <Button
          asChild
          variant="outline"
          size="lg"
          className="mt-6 h-12 text-base font-bold"
        >
          <a href={aula.materialUrl} target="_blank" rel="noreferrer">
            <FileText className="mr-2 h-5 w-5" aria-hidden />
            Baixar material de apoio
            <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden />
          </a>
        </Button>
      )}

      {isAuthenticated && (
        <button
          onClick={() => alternar.mutate({ lessonId: aulaId, done: !concluida })}
          className={`mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl text-lg font-bold transition-colors ${
            concluida
              ? "bg-[hsl(150,50%,45%)] text-white"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
          aria-pressed={concluida}
        >
          {concluida ? (
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          ) : (
            <Circle className="h-6 w-6" aria-hidden />
          )}
          {concluida
            ? "Aula concluída! (toque para desmarcar)"
            : "Terminei esta aula — marcar como concluída"}
        </button>
      )}

      <nav
        className="mt-10 flex flex-wrap items-center justify-between gap-4"
        aria-label="Navegar entre aulas"
      >
        {anterior ? (
          <Button asChild variant="outline" size="lg" className="h-12 max-w-sm text-base font-bold">
            <Link to={`/aulas/${anterior.id}`}>
              <ArrowLeft className="mr-2 h-5 w-5 shrink-0" aria-hidden />
              <span className="truncate">{anterior.titulo}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {proxima && (
          <Button asChild size="lg" className="h-12 max-w-sm text-base font-bold">
            <Link to={`/aulas/${proxima.id}`}>
              <span className="truncate">Próxima: {proxima.titulo}</span>
              <ArrowRight className="ml-2 h-5 w-5 shrink-0" aria-hidden />
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
