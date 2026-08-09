import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle, PenLine, User } from "lucide-react";

const CATEGORIAS = [
  { value: "duvidas", label: "Dúvidas das aulas" },
  { value: "experiencias", label: "Experiências e histórias" },
  { value: "oportunidades", label: "Oportunidades" },
  { value: "geral", label: "Papo geral" },
] as const;

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.value, c.label]),
);

const CAT_COR: Record<string, string> = {
  duvidas: "bg-[hsl(168,62%,24%)] text-primary-foreground",
  experiencias: "bg-[hsl(33,92%,46%)] text-white",
  oportunidades: "bg-[hsl(210,60%,40%)] text-white",
  geral: "bg-secondary text-secondary-foreground",
};

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
  const { data: posts, isLoading } = trpc.forum.list.useQuery();

  const [aberto, setAberto] = useState(false);
  const [categoria, setCategoria] = useState<string>("geral");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");

  const criar = trpc.forum.create.useMutation({
    onSuccess: () => {
      utils.forum.list.invalidate();
      setAberto(false);
      setTitulo("");
      setConteudo("");
      setErro("");
    },
    onError: (e) => setErro(e.message),
  });

  function publicar() {
    setErro("");
    criar.mutate({
      categoria: categoria as "duvidas" | "experiencias" | "oportunidades" | "geral",
      titulo,
      conteudo,
    });
  }

  return (
    <div className="container-page py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">
            Comunidade
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Espaço para tirar dúvidas, trocar experiências e se apoiar. Toda
            pergunta é bem-vinda — ninguém nasce sabendo.
          </p>
        </header>

        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-bold"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
            >
              <PenLine className="mr-2 h-5 w-5" aria-hidden />
              Nova conversa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Começar uma nova conversa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div>
                <Label htmlFor="cat" className="text-base font-bold">
                  Sobre o que você quer falar?
                </Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger id="cat" className="mt-2 h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-base">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                onClick={publicar}
                disabled={criar.isPending}
              >
                {criar.isPending ? "Publicando…" : "Publicar na comunidade"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <p className="mt-12 text-lg text-muted-foreground">
          Carregando conversas…
        </p>
      )}

      {!isLoading && (posts ?? []).length === 0 && (
        <Card className="mt-12 border-2 border-dashed">
          <CardContent className="p-10 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-primary" aria-hidden />
            <h2 className="font-display mt-4 text-2xl font-semibold">
              Seja a primeira pessoa a puxar assunto
            </h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
              Apresente-se, conte sua história ou faça a primeira pergunta. A
              comunidade cresce a cada conversa.
            </p>
          </CardContent>
        </Card>
      )}

      <ul className="mt-10 space-y-5">
        {(posts ?? []).map((p) => (
          <li key={p.id}>
            <Link to={`/comunidade/${p.id}`} className="block">
              <Card className="card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3.5 py-1 text-sm font-bold ${CAT_COR[p.categoria] ?? CAT_COR.geral}`}
                    >
                      {CAT_LABEL[p.categoria] ?? p.categoria}
                    </span>
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
        </p>
      )}
    </div>
  );
}
