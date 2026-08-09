import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Trash2, User } from "lucide-react";
import BotaoDenunciar from "@/components/BotaoDenunciar";

function dataLonga(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Post() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: post, isLoading } = trpc.forum.get.useQuery(
    { id: postId },
    { enabled: Number.isFinite(postId) },
  );
  const { data: comments } = trpc.forum.comments.useQuery(
    { postId },
    { enabled: Number.isFinite(postId) },
  );

  const [mensagem, setMensagem] = useState("");
  const comentar = trpc.forum.comment.useMutation({
    onSuccess: () => {
      utils.forum.comments.invalidate({ postId });
      utils.forum.list.invalidate();
      setMensagem("");
    },
  });
  const excluir = trpc.forum.delete.useMutation({
    onSuccess: () => navigate("/comunidade"),
  });

  if (isLoading) {
    return (
      <div className="container-page py-14">
        <p className="text-lg text-muted-foreground">Carregando conversa…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold">
          Conversa não encontrada
        </h1>
        <Button asChild variant="outline" size="lg" className="mt-6 text-base">
          <Link to="/comunidade">
            <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para a comunidade
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-14">
      <Button asChild variant="ghost" size="lg" className="mb-6 text-base">
        <Link to="/comunidade">
          <ArrowLeft className="mr-2 h-5 w-5" aria-hidden /> Voltar
        </Link>
      </Button>

      <Card>
        <CardContent className="p-8">
          <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
            {post.titulo}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <User className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-bold text-foreground">
                {post.authorName ?? "Membro da comunidade"}
              </p>
              <time className="text-sm">{dataLonga(post.createdAt)}</time>
            </div>
          </div>
          <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed">
            {post.conteudo}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {user?.role === "admin" && (
              <Button
                variant="destructive"
                size="lg"
                className="text-base"
                onClick={() => excluir.mutate({ id: postId })}
                disabled={excluir.isPending}
              >
                <Trash2 className="mr-2 h-5 w-5" aria-hidden /> Remover conversa
              </Button>
            )}
            <BotaoDenunciar alvo={{ postId: post.id, reportedUserId: post.authorId }} />
          </div>
        </CardContent>
      </Card>

      <h2 className="font-display mt-12 text-2xl font-semibold">
        Respostas ({(comments ?? []).length})
      </h2>

      <ul className="mt-6 space-y-4">
        {(comments ?? []).map((c) => (
          <li key={c.id}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <User className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-bold text-foreground">
                      {c.authorName ?? "Membro da comunidade"}
                    </p>
                    <time className="text-sm">{dataLonga(c.createdAt)}</time>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap leading-relaxed">
                  {c.conteudo}
                </p>
                <div className="mt-3">
                  <BotaoDenunciar
                    alvo={{ commentId: c.id, reportedUserId: c.authorId }}
                  />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="mt-8">
        <CardContent className="p-6">
          {isAuthenticated ? (
            <>
              <label
                htmlFor="resposta"
                className="text-lg font-bold"
              >
                Deixe sua resposta
              </label>
              <Textarea
                id="resposta"
                className="mt-3 min-h-28 text-base"
                placeholder="Escreva com calma…"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
              />
              <Button
                size="lg"
                className="mt-4 h-12 text-base font-bold"
                disabled={comentar.isPending || mensagem.trim().length === 0}
                onClick={() =>
                  comentar.mutate({ postId, conteudo: mensagem.trim() })
                }
              >
                <Send className="mr-2 h-5 w-5" aria-hidden />
                {comentar.isPending ? "Enviando…" : "Responder"}
              </Button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Entre na sua conta para participar da conversa.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-4 h-12 text-base font-bold"
              >
                <Link to="/login">Entrar</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
