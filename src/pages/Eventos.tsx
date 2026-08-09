import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import ComunidadeNav from "@/components/ComunidadeNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

function dataEvento(d: Date | string) {
  const dt = new Date(d);
  return {
    dia: dt.toLocaleDateString("pt-BR", { day: "2-digit" }),
    mes: dt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    completo: dt.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function Eventos() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { data: eventos, isLoading } = trpc.events.list.useQuery();

  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    data: "",
    hora: "",
    duracaoMin: "",
    link: "",
    local: "",
  });

  const criar = trpc.events.create.useMutation({
    onSuccess: () => {
      utils.events.list.invalidate();
      setFormAberto(false);
      setForm({ titulo: "", descricao: "", data: "", hora: "", duracaoMin: "", link: "", local: "" });
    },
  });
  const excluir = trpc.events.delete.useMutation({
    onSuccess: () => utils.events.list.invalidate(),
  });
  const responder = trpc.events.rsvp.useMutation({
    onSuccess: () => utils.events.list.invalidate(),
  });

  const agora = new Date();
  const futuros = (eventos ?? []).filter((e) => new Date(e.dataHora) >= agora);
  const passados = (eventos ?? []).filter((e) => new Date(e.dataHora) < agora);

  function botaoPresenca(e: { id: number; meuRsvp: string | null }) {
    if (!isAuthenticated) {
      return (
        <Button size="lg" className="h-12 text-base font-bold" onClick={() => navigate("/login")}>
          Entrar para confirmar presença
        </Button>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          variant={e.meuRsvp === "vou" ? "default" : "outline"}
          className="h-12 text-base font-bold"
          disabled={responder.isPending}
          onClick={() =>
            responder.mutate({
              eventId: e.id,
              status: e.meuRsvp === "vou" ? "remover" : "vou",
            })
          }
        >
          {e.meuRsvp === "vou" ? "✓ Vou participar" : "Vou participar"}
        </Button>
        <Button
          size="lg"
          variant={e.meuRsvp === "talvez" ? "secondary" : "outline"}
          className="h-12 text-base font-bold"
          disabled={responder.isPending}
          onClick={() =>
            responder.mutate({
              eventId: e.id,
              status: e.meuRsvp === "talvez" ? "remover" : "talvez",
            })
          }
        >
          {e.meuRsvp === "talvez" ? "✓ Talvez" : "Talvez"}
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <ComunidadeNav />

      <div className="flex flex-wrap items-end justify-between gap-6">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold">Eventos</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Encontros ao vivo da comunidade: aulas abertas, palestras com
            empresas e rodas de conversa. Confirme presença e receba o link.
          </p>
        </header>
        {user?.role === "admin" && (
          <Button size="lg" className="h-12 text-base font-bold" onClick={() => setFormAberto(!formAberto)}>
            <Plus className="mr-2 h-5 w-5" /> Novo evento
          </Button>
        )}
      </div>

      {formAberto && user?.role === "admin" && (
        <Card className="mt-8 border-2">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-base font-bold">Título do evento</Label>
              <Input className="mt-1.5 h-11 text-base" value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-base font-bold">Descrição</Label>
              <Textarea className="mt-1.5 min-h-20 text-base" value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div>
              <Label className="text-base font-bold">Data</Label>
              <Input type="date" className="mt-1.5 h-11 text-base" value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div>
              <Label className="text-base font-bold">Hora</Label>
              <Input type="time" className="mt-1.5 h-11 text-base" value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            </div>
            <div>
              <Label className="text-base font-bold">Duração (min)</Label>
              <Input type="number" className="mt-1.5 h-11 text-base" value={form.duracaoMin}
                onChange={(e) => setForm({ ...form, duracaoMin: e.target.value })} />
            </div>
            <div>
              <Label className="text-base font-bold">Local (se presencial)</Label>
              <Input className="mt-1.5 h-11 text-base" value={form.local}
                onChange={(e) => setForm({ ...form, local: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-base font-bold">Link do encontro (YouTube Ao Vivo, Zoom, Meet…)</Label>
              <Input className="mt-1.5 h-11 text-base" placeholder="https://…" value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </div>
            <Button
              size="lg"
              className="h-12 text-base font-bold sm:col-span-2"
              disabled={criar.isPending || !form.titulo || !form.data || !form.hora}
              onClick={() =>
                criar.mutate({
                  titulo: form.titulo,
                  descricao: form.descricao || undefined,
                  dataHora: new Date(`${form.data}T${form.hora}:00`),
                  duracaoMin: form.duracaoMin ? Number(form.duracaoMin) : undefined,
                  link: form.link || undefined,
                  local: form.local || undefined,
                })
              }
            >
              {criar.isPending ? "Publicando…" : "Publicar evento"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="mt-10 text-lg text-muted-foreground">Carregando eventos…</p>}

      {!isLoading && futuros.length === 0 && (
        <Card className="mt-10 border-2 border-dashed">
          <CardContent className="p-10 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-primary" />
            <h2 className="font-display mt-4 text-2xl font-semibold">
              Nenhum evento marcado ainda
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
              Em breve teremos encontros ao vivo. Fique de olho!
            </p>
          </CardContent>
        </Card>
      )}

      <ul className="mt-8 space-y-6">
        {futuros.map((e) => {
          const d = dataEvento(e.dataHora);
          return (
            <li key={e.id}>
              <Card className="card-hover">
                <CardContent className="flex flex-wrap gap-6 p-7">
                  <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <span className="font-display text-4xl font-semibold leading-none">{d.dia}</span>
                    <span className="mt-1 text-lg font-bold uppercase">{d.mes}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-snug">{e.titulo}</h2>
                    <p className="mt-1 capitalize text-muted-foreground">{d.completo}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-muted-foreground">
                      {e.duracaoMin && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" /> {e.duracaoMin} min
                        </span>
                      )}
                      {e.local && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {e.local}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {Number(e.totalVou)} confirmados
                        {Number(e.totalTalvez) > 0 && ` · ${Number(e.totalTalvez)} em dúvida`}
                      </span>
                    </div>
                    {e.descricao && (
                      <p className="mt-3 whitespace-pre-wrap leading-relaxed">{e.descricao}</p>
                    )}
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {botaoPresenca(e)}
                      {e.link && (e.meuRsvp === "vou" || user?.role === "admin") && (
                        <Button asChild size="lg" variant="secondary" className="h-12 text-base font-bold">
                          <a href={e.link} target="_blank" rel="noreferrer">
                            Entrar no encontro ao vivo
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {user?.role === "admin" && (
                        <Button
                          variant="destructive" size="icon" className="h-11 w-11"
                          aria-label={`Excluir evento ${e.titulo}`}
                          onClick={() => excluir.mutate({ id: e.id })}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    {e.link && isAuthenticated && e.meuRsvp !== "vou" && user?.role !== "admin" && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Confirme presença em “Vou participar” para liberar o link do encontro.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      {passados.length > 0 && (
        <details className="mt-12">
          <summary className="cursor-pointer text-lg font-bold text-muted-foreground">
            Eventos passados ({passados.length})
          </summary>
          <ul className="mt-4 space-y-3 opacity-70">
            {passados.map((e) => (
              <li key={e.id} className="rounded-xl border p-4">
                <span className="font-bold">{e.titulo}</span>{" "}
                <span className="text-muted-foreground">
                  — {dataEvento(e.dataHora).completo}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
