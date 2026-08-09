import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";

function hora(d: Date | string) {
  return new Date(d).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Conversa() {
  const { id } = useParams<{ id: string }>();
  const parceiroId = Number(id);
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });
  const utils = trpc.useUtils();

  const { data: parceiro } = trpc.members.get.useQuery(
    { id: parceiroId },
    { enabled: Number.isFinite(parceiroId) },
  );
  const { data: mensagens } = trpc.messages.thread.useQuery(
    { parceiroId },
    {
      enabled: !!user && Number.isFinite(parceiroId),
      refetchInterval: 8000,
    },
  );

  const [texto, setTexto] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  const enviar = trpc.messages.send.useMutation({
    onSuccess: () => {
      utils.messages.thread.invalidate({ parceiroId });
      utils.messages.conversations.invalidate();
      setTexto("");
    },
  });

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  if (authLoading) {
    return (
      <div className="container-page py-14">
        <p className="text-lg text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="container-page flex max-w-3xl flex-col py-6" style={{ minHeight: "70vh" }}>
      <div className="flex items-center gap-4 border-b pb-4">
        <Button asChild variant="ghost" size="lg" className="text-base">
          <Link to="/mensagens">
            <ArrowLeft className="mr-2 h-5 w-5" /> Voltar
          </Link>
        </Button>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {(parceiro?.name ?? "M").trim().charAt(0).toUpperCase()}
        </span>
        <h1 className="text-2xl font-bold">{parceiro?.name ?? "Membro"}</h1>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-6" aria-live="polite">
        {(mensagens ?? []).length === 0 && (
          <p className="py-10 text-center text-lg text-muted-foreground">
            Comece a conversa! Diga um olá para{" "}
            {parceiro?.name?.split(" ")[0] ?? "o membro"}.
          </p>
        )}
        {(mensagens ?? []).map((m) => {
          const minha = m.deUserId === user?.id;
          return (
            <div
              key={m.id}
              className={`flex ${minha ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-lg ${
                  minha
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.conteudo}</p>
                <p
                  className={`mt-1 text-right text-xs ${
                    minha ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {hora(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>

      <div className="flex items-end gap-3 border-t pt-4">
        <Textarea
          className="min-h-14 flex-1 text-lg"
          placeholder="Escreva sua mensagem…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (texto.trim()) {
                enviar.mutate({ paraUserId: parceiroId, conteudo: texto.trim() });
              }
            }
          }}
          aria-label="Escreva sua mensagem"
        />
        <Button
          size="lg"
          className="h-14 px-6 text-base font-bold"
          disabled={enviar.isPending || texto.trim().length === 0}
          onClick={() =>
            enviar.mutate({ paraUserId: parceiroId, conteudo: texto.trim() })
          }
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
    </div>
  );
}
