import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Home as HomeIcon,
  MapPin,
  Shuffle,
} from "lucide-react";

const MODELO: Record<string, { label: string; icon: typeof MapPin }> = {
  remoto: { label: "Remoto", icon: HomeIcon },
  hibrido: { label: "Híbrido", icon: Shuffle },
  presencial: { label: "Presencial", icon: MapPin },
};

export default function Vagas() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: jobs, isLoading } = trpc.jobs.list.useQuery();
  const { data: myInterests } = trpc.jobs.myApplications.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const [vagaAberta, setVagaAberta] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [confirmada, setConfirmada] = useState<number | null>(null);

  const jaCandidatou = (jobId: number) =>
    (myInterests ?? []).some((i) => i.jobId === jobId);

  const candidatar = trpc.jobs.apply.useMutation({
    onSuccess: (_r, vars) => {
      utils.jobs.myApplications.invalidate();
      setVagaAberta(null);
      setMensagem("");
      setConfirmada(vars.jobId);
    },
  });

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Vagas para você
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Oportunidades de empresas parceiras que valorizam a experiência de
          profissionais 50+. Complete seu perfil e candidate-se com um clique.
        </p>
      </header>

      {isLoading && (
        <p className="mt-12 text-lg text-muted-foreground">Carregando vagas…</p>
      )}

      {!isLoading && (jobs ?? []).length === 0 && (
        <Card className="mt-12 border-2 border-dashed">
          <CardContent className="p-10 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary" aria-hidden />
            <h2 className="font-display mt-4 text-2xl font-semibold">
              As primeiras vagas estão a caminho
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
              Estamos conversando com empresas parceiras. Cadastre-se e
              complete seu perfil para ser avisado assim que as vagas abrirem.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 text-base font-bold">
              <Link to="/perfil">Completar meu perfil</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <ul className="mt-10 grid gap-6 lg:grid-cols-2">
        {(jobs ?? []).map((v) => {
          const m = MODELO[v.modelo] ?? MODELO.remoto;
          const candidatado = jaCandidatou(v.id);
          return (
            <li key={v.id}>
              <Card className="card-hover h-full">
                <CardContent className="flex h-full flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-bold leading-snug">{v.titulo}</h2>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-sm font-bold">
                      <m.icon className="h-4 w-4" aria-hidden />
                      {m.label}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-lg font-bold text-primary">
                    <Building2 className="h-5 w-5" aria-hidden />
                    {v.empresa}
                  </p>
                  {v.local && (
                    <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" aria-hidden />
                      {v.local}
                    </p>
                  )}
                  <p className="mt-4 flex-1 whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {v.descricao}
                  </p>

                  {confirmada === v.id && (
                    <p
                      role="status"
                      className="mt-5 flex items-center gap-2 rounded-xl bg-[hsl(140,40%,92%)] p-4 font-bold text-[hsl(150,60%,22%)]"
                    >
                      <CheckCircle2 className="h-6 w-6" aria-hidden />
                      Candidatura enviada! A empresa receberá seu interesse.
                    </p>
                  )}

                  <div className="mt-6">
                    {candidatado ? (
                      <span className="flex items-center gap-2 font-bold text-primary">
                        <CheckCircle2 className="h-5 w-5" aria-hidden />
                        Você já se candidatou a esta vaga
                      </span>
                    ) : (
                      <Button
                        size="lg"
                        className="h-12 text-base font-bold"
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate("/login");
                            return;
                          }
                          setVagaAberta(v.id);
                        }}
                      >
                        Quero me candidatar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={vagaAberta !== null}
        onOpenChange={(o) => !o && setVagaAberta(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Candidatar-se à vaga
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Escreva uma breve apresentação (opcional). Seu perfil da comunidade
            será enviado junto.
          </p>
          <Textarea
            className="min-h-32 text-base"
            placeholder="Ex.: Tenho 30 anos de experiência em vendas e terminei o módulo de IA generativa…"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
          <Button
            size="lg"
            className="h-12 w-full text-lg font-bold"
            disabled={candidatar.isPending}
            onClick={() =>
              vagaAberta !== null &&
              candidatar.mutate({
                jobId: vagaAberta,
                mensagem: mensagem.trim() || undefined,
              })
            }
          >
            {candidatar.isPending ? "Enviando…" : "Enviar candidatura"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
