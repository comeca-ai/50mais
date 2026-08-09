import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, MessagesSquare, Search, User } from "lucide-react";

export default function Buscar() {
  const [params, setParams] = useSearchParams();
  const termo = params.get("q") ?? "";
  const [digitado, setDigitado] = useState(termo);

  const { data, isFetching } = trpc.search.query.useQuery(
    { termo },
    { enabled: termo.trim().length >= 2 },
  );

  function pesquisar() {
    if (digitado.trim().length >= 2) setParams({ q: digitado.trim() });
  }

  const total =
    (data?.publicacoes.length ?? 0) +
    (data?.aulas.length ?? 0) +
    (data?.membros.length ?? 0);

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="font-display text-4xl font-semibold">Buscar</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Encontre publicações, aulas e pessoas da comunidade.
      </p>

      <div className="mt-6 flex gap-3">
        <Input
          className="h-14 text-lg"
          placeholder="Digite pelo menos 2 letras…"
          value={digitado}
          onChange={(e) => setDigitado(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pesquisar()}
          aria-label="Termo de busca"
        />
        <Button size="lg" className="h-14 px-6" onClick={pesquisar} disabled={isFetching}>
          <Search className="h-5 w-5" aria-hidden />
          <span className="sr-only">Buscar</span>
        </Button>
      </div>

      {termo && !isFetching && data && (
        <p className="mt-6 text-lg text-muted-foreground" role="status">
          {total === 0
            ? `Nada encontrado para "${termo}". Tente outras palavras.`
            : `${total} resultado(s) para "${termo}"`}
        </p>
      )}

      {(data?.publicacoes.length ?? 0) > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <MessagesSquare className="h-6 w-6 text-primary" aria-hidden />
            Publicações
          </h2>
          <ul className="mt-4 space-y-3">
            {data!.publicacoes.map((p) => (
              <li key={p.id}>
                <Link to={`/comunidade/post/${p.id}`} className="block">
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <p className="text-lg font-bold">{p.titulo}</p>
                      <p className="mt-1 line-clamp-2 text-muted-foreground">
                        {p.conteudo}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        por {p.authorName ?? "Membro"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(data?.aulas.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <BookOpen className="h-6 w-6 text-primary" aria-hidden />
            Aulas
          </h2>
          <ul className="mt-4 space-y-3">
            {data!.aulas.map((a) => (
              <li key={a.id}>
                <Link to={`/aulas/${a.id}`} className="block">
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <p className="text-lg font-bold">{a.titulo}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {a.modulo}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(data?.membros.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <User className="h-6 w-6 text-primary" aria-hidden />
            Pessoas
          </h2>
          <ul className="mt-4 space-y-3">
            {data!.membros.map((m) => (
              <li key={m.id}>
                <Link to={`/comunidade/membros/${m.id}`} className="block">
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <p className="text-lg font-bold">{m.name}</p>
                      <p className="mt-1 text-muted-foreground">
                        {[m.profissaoAtual, m.cidade].filter(Boolean).join(" · ")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
