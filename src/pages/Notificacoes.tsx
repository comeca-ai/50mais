import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCheck } from "lucide-react";

export default function Notificacoes() {
  const { isAuthenticated, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: avisos, isLoading } = trpc.notifications.list.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  const marcarTodas = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
    },
  });

  const marcarLida = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unread.invalidate();
    },
  });

  if (authLoading) return null;

  return (
    <div className="container-page max-w-3xl py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Avisos</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Respostas, mensagens e novidades da comunidade.
          </p>
        </div>
        {(avisos ?? []).some((a) => !a.lidaEm) && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => marcarTodas.mutate()}
            disabled={marcarTodas.isPending}
          >
            <CheckCheck className="mr-2 h-5 w-5" aria-hidden />
            Marcar todas como lidas
          </Button>
        )}
      </header>

      {isLoading && (
        <p className="mt-10 text-lg text-muted-foreground">Carregando avisos…</p>
      )}

      {!isLoading && (avisos ?? []).length === 0 && (
        <Card className="mt-10 border-2 border-dashed">
          <CardContent className="p-10 text-center">
            <BellOff className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold">Nenhum aviso por aqui</h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
              Quando alguém responder você ou enviar uma mensagem, aparece
              aqui.
            </p>
          </CardContent>
        </Card>
      )}

      <ul className="mt-8 space-y-3">
        {(avisos ?? []).map((a) => (
          <li key={a.id}>
            <button
              type="button"
              className={`flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-colors hover:bg-secondary ${
                a.lidaEm ? "opacity-70" : "border-primary/40 bg-accent"
              }`}
              onClick={() => {
                if (!a.lidaEm) marcarLida.mutate({ id: a.id });
                if (a.link) navigate(a.link);
              }}
            >
              <Bell
                className={`mt-1 h-6 w-6 shrink-0 ${a.lidaEm ? "text-muted-foreground" : "text-primary"}`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-bold">
                  {a.titulo}
                </span>
                {a.corpo && (
                  <span className="block truncate text-muted-foreground">
                    {a.corpo}
                  </span>
                )}
                <span className="mt-1 block text-sm text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("pt-BR")}
                </span>
              </span>
              {!a.lidaEm && (
                <span className="mt-2 h-3 w-3 shrink-0 rounded-full bg-primary" aria-label="Não lido" />
              )}
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center">
        <Link to="/comunidade" className="text-primary underline underline-offset-4">
          Voltar para a comunidade
        </Link>
      </p>
    </div>
  );
}
