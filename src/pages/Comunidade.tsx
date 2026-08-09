import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import ComunidadeNav from "@/components/ComunidadeNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Hash,
  Lock,
  MessageCircle,
  PenLine,
  Search,
  User,
} from "lucide-react";

function dataCurta(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Comunidade() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: espacos } = trpc.spaces.list.useQuery();
  const [espacoSel, setEspacoSel] = useState<number | null>(null);
  const { data: posts, isLoading } = trpc.forum.list.useQuery(
    espacoSel ? { spaceId: espacoSel } : undefined,
  );

  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");

  const criar = trpc.forum.create.useMutation({
    onSuccess: () => {
      utils.forum.list.invalidate();
      utils.spaces.list.invalidate();
      setAberto(false);
      setTitulo("");
      setConteudo("");
      setErro("");
    },
    onError: (e) => setErro(e.message),
  });

  const espacoAtivo = (espacos ?? []).find((e) => e.id === espacoSel);
  const espacoDestino = espacoAtivo ?? (espacos ?? [])[0];

  return (
    <div className="container-page py-10">
      <ComunidadeNav />

      <div className="mt-4">
        <form
          action="/buscar"
          className="flex max-w-xl gap-3"
          onSubmit={(e) => {
            const alvo = e.currentTarget.elements.namedItem("q") as HTMLInputElement;
            if (!alvo.value || alvo.value.trim().length < 2) e.preventDefault();
          }}
        >
          <Input
            name="q"
            className="h-12 text-lg"
            placeholder="Buscar na comunidade…"
            aria-label="Buscar na comunidade"
          />
          <Button type="submit" variant="outline" size="lg" className="h-12 gap-2">
            <Search className="h-5 w-5" aria-hidden />
            Buscar
          </Button>
        </form>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr]">
        {/* Lista de espaços — estilo Circle */}
        <aside aria-label="Espaços da comunidade">
          <Card>
            <CardContent className="p-4">
              <button
                onClick={() => setEspacoSel(null)}
                className={`w-full rounded-xl px-4 py-3 text-left text-lg font-bold transition-colors ${
                  espacoSel === null ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                Todos os assuntos
              </button>
              <ul className="mt-2 space-y-1">
                {(espacos ?? []).map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => setEspacoSel(e.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left transition-colors ${
                        espacoSel === e.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {e.tipo === "membros" ? (
                          <Lock className="h-4 w-4 shrink-0" aria-label="Espaço para membros" />
                        ) : (
                          <Hash className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                        <span className="truncate font-bold">{e.nome}</span>
                      </span>
                      <span className="shrink-0 text-sm opacity-75">
                        {Number(e.postCount)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {espacoAtivo?.descricao && (
            <p className="mt-4 rounded-xl bg-secondary p-4 text-muted-foreground">
              {espacoAtivo.descricao}
            </p>
          )}
        </aside>

        {/* Feed */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-3xl font-semibold">
              {espacoAtivo ? espacoAtivo.nome : "Todos os assuntos"}
            </h1>
            <Button
              size="lg"
              className="h-12 px-6 text-base font-bold"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                  return;
                }
                setAberto(true);
              }}
            >
              <PenLine className="mr-2 h-5 w-5" aria-hidden />
              Nova conversa
            </Button>
          </div>

          {isLoading && (
            <p className="mt-10 text-lg text-muted-foreground">
              Carregando conversas…
            </p>
          )}

          {!isLoading && (posts ?? []).length === 0 && (
            <Card className="mt-8 border-2 border-dashed">
              <CardContent className="p-10 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-primary" aria-hidden />
                <h2 className="font-display mt-4 text-2xl font-semibold">
                  Seja a primeira pessoa a puxar assunto aqui
                </h2>
                <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
                  Apresente-se, conte sua história ou faça a primeira pergunta.
                </p>
              </CardContent>
            </Card>
          )}

          <ul className="mt-6 space-y-5">
            {(posts ?? []).map((p) => (
              <li key={p.id}>
                <Link to={`/comunidade/post/${p.id}`} className="block">
                  <Card className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        {p.spaceNome && (
                          <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-bold">
                            <Hash className="h-3.5 w-3.5" aria-hidden />
                            {p.spaceNome}
                          </span>
                        )}
                        <time className="text-sm text-muted-foreground">
                          {dataCurta(p.createdAt)}
                        </time>
                      </div>
                      <h2 className="mt-3 text-2xl font-bold leading-snug">
                        {p.titulo}
                      </h2>
                      <p className="mt-2 line-clamp-2 leading-relaxed text-muted-foreground">
                        {p.conteudo}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                            <User className="h-5 w-5" aria-hidden />
                          </span>
                          {p.authorName ?? "Membro da comunidade"}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <MessageCircle className="h-5 w-5" aria-hidden />
                          {Number(p.commentCount)}{" "}
                          {Number(p.commentCount) === 1 ? "resposta" : "respostas"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>

          {user?.role === "admin" && (
            <p className="mt-8 text-sm text-muted-foreground">
              Você é administrador: dentro de cada conversa é possível removê-la.
              Gerencie os espaços no painel do administrador.
            </p>
          )}
        </div>
      </div>

      {/* Nova conversa */}
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Nova conversa em{" "}
              <span className="text-primary">{espacoDestino?.nome ?? "…"}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            {!espacoSel && (espacos ?? []).length > 0 && (
              <div>
                <Label className="text-base font-bold">Escolha o espaço</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(espacos ?? []).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEspacoSel(e.id)}
                      className="rounded-full bg-secondary px-4 py-2 text-sm font-bold hover:bg-border"
                    >
                      {e.nome}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  A conversa será publicada no primeiro espaço se você não
                  escolher.
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="titulo" className="text-base font-bold">
                Título
              </Label>
              <Input
                id="titulo"
                className="mt-2 h-12 text-base"
                placeholder="Ex.: Como faço para a IA me ajudar com currículo?"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="conteudo" className="text-base font-bold">
                Sua mensagem
              </Label>
              <Textarea
                id="conteudo"
                className="mt-2 min-h-32 text-base"
                placeholder="Escreva com calma, do seu jeito…"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
              />
            </div>
            {erro && (
              <p role="alert" className="font-bold text-destructive">
                {erro}
              </p>
            )}
            <Button
              size="lg"
              className="h-12 w-full text-lg font-bold"
              disabled={criar.isPending}
              onClick={() => {
                setErro("");
                criar.mutate({
                  spaceId: espacoDestino?.id,
                  titulo,
                  conteudo,
                });
              }}
            >
              {criar.isPending ? "Publicando…" : "Publicar na comunidade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
