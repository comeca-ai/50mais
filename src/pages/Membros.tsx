import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import ComunidadeNav from "@/components/ComunidadeNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, User } from "lucide-react";

export default function Membros() {
  const { data: membros, isLoading } = trpc.members.list.useQuery();
  const [busca, setBusca] = useState("");

  const filtrados = (membros ?? []).filter((m) => {
    const texto = `${m.name ?? ""} ${m.profissaoAtual ?? ""} ${m.cidade ?? ""} ${m.areaInteresse ?? ""}`.toLowerCase();
    return texto.includes(busca.toLowerCase());
  });

  return (
    <div className="container-page py-10">
      <ComunidadeNav />

      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold">
          Diretório de membros
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Conheça a turma, encontre pessoas da sua área ou da sua cidade e
          faça conexões.
        </p>
      </header>

      <div className="relative mt-8 max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          className="h-14 pl-12 text-lg"
          placeholder="Buscar por nome, profissão ou cidade…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar membros"
        />
      </div>

      {isLoading && (
        <p className="mt-10 text-lg text-muted-foreground">Carregando membros…</p>
      )}

      {!isLoading && filtrados.length === 0 && (
        <p className="mt-10 text-lg text-muted-foreground">
          Nenhum membro encontrado com essa busca.
        </p>
      )}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((m) => (
          <li key={m.id}>
            <Link to={`/comunidade/membros/${m.id}`} className="block">
              <Card className="card-hover h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                      {(m.name ?? "M").trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold">
                        {m.name ?? "Membro"}
                      </h2>
                      {m.profissaoAtual && (
                        <p className="truncate text-muted-foreground">
                          {m.profissaoAtual}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.faixaEtaria && (
                      <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-bold">
                        <User className="h-3.5 w-3.5" /> {m.faixaEtaria} anos
                      </span>
                    )}
                    {m.cidade && (
                      <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-bold">
                        <MapPin className="h-3.5 w-3.5" /> {m.cidade}
                      </span>
                    )}
                  </div>
                  {m.areaInteresse && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Quer trabalhar com: {m.areaInteresse}
                    </p>
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
