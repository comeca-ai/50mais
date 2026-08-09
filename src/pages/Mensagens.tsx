import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";

function horaCurta(d: Date | string) {
  const dt = new Date(d);
  const hoje = new Date();
  const mesmoDia = dt.toDateString() === hoje.toDateString();
  return mesmoDia
    ? dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : dt.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export default function Mensagens() {
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });
  const { data: conversas, isLoading } = trpc.messages.conversations.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 15000 },
  );

  if (authLoading) {
    return (
      <div className="container-page py-14">
        <p className="text-lg text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <header>
        <h1 className="font-display text-4xl font-semibold">Mensagens</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Conversas particulares com outros membros da comunidade.
        </p>
      </header>

      {isLoading && (
        <p className="mt-10 text-lg text-muted-foreground">
          Carregando conversas…
        </p>
      )}

      {!isLoading && (conversas ?? []).length === 0 && (
        <Card className="mt-8 border-2 border-dashed">
          <CardContent className="p-10 text-center">
            <MessageSquareText className="mx-auto h-12 w-12 text-primary" />
            <h2 className="font-display mt-4 text-2xl font-semibold">
              Nenhuma conversa ainda
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
              Visite o diretório de membros e envie a primeira mensagem para
              alguém da turma.
            </p>
            <Button asChild size="lg" className="mt-6 h-12 text-base font-bold">
              <Link to="/comunidade/membros">Ver membros</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <ul className="mt-6 space-y-3">
        {(conversas ?? []).map((c) => (
          <li key={c.parceiroId}>
            <Link to={`/mensagens/${c.parceiroId}`} className="block">
              <Card className="card-hover">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {c.parceiroNome.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate text-lg font-bold">
                        {c.parceiroNome}
                      </h2>
                      <time className="shrink-0 text-sm text-muted-foreground">
                        {horaCurta(c.dataHora)}
                      </time>
                    </div>
                    <p className="mt-1 truncate text-muted-foreground">
                      {c.enviadaPorMim ? "Você: " : ""}
                      {c.ultimaMensagem}
                    </p>
                  </div>
                  {c.naoLidas > 0 && (
                    <span
                      className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(33,92%,46%)] px-2 text-sm font-bold text-white"
                      aria-label={`${c.naoLidas} mensagens não lidas`}
                    >
                      {c.naoLidas}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
