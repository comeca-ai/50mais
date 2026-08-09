import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import ComunidadeNav from "@/components/ComunidadeNav";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const NIVEIS = [
  { min: 600, nome: "Floresta", emoji: "🌳🌳", desc: "600+ pontos — referência da comunidade" },
  { min: 300, nome: "Árvore", emoji: "🌳", desc: "300+ pontos — presença constante" },
  { min: 150, nome: "Arbusto", emoji: "🌿", desc: "150+ pontos — crescendo firme" },
  { min: 50, nome: "Broto", emoji: "🌱", desc: "50+ pontos — começando a florescer" },
  { min: 0, nome: "Semente", emoji: "🫘", desc: "Todo mundo começa aqui" },
];

function nivel(pontos: number) {
  return NIVEIS.find((n) => pontos >= n.min) ?? NIVEIS[4];
}

const COMO_GANHAR = [
  { acao: "Iniciar uma conversa na comunidade", pontos: 10 },
  { acao: "Responder e ajudar outro membro", pontos: 5 },
  { acao: "Concluir uma aula do curso", pontos: 15 },
  { acao: "Confirmar presença em um evento", pontos: 3 },
];

export default function Ranking() {
  const { user, isAuthenticated } = useAuth();
  const { data: ranking, isLoading } = trpc.gamification.leaderboard.useQuery();

  const minhaPosicao = (ranking ?? []).findIndex((r) => r.id === user?.id);

  return (
    <div className="container-page py-10">
      <ComunidadeNav />

      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold">Ranking da comunidade</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Quem mais participa, aprende e ajuda aparece aqui. Os pontos mostram
          para as empresas parceiras quem está realmente engajado.
        </p>
      </header>

      {isAuthenticated && minhaPosicao >= 0 && (
        <Card className="mt-8 border-2 border-primary">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <p className="text-lg font-bold">
              Sua posição: #{minhaPosicao + 1} —{" "}
              {(ranking ?? [])[minhaPosicao].pontos} pontos · Nível{" "}
              {nivel((ranking ?? [])[minhaPosicao].pontos).nome}{" "}
              {nivel((ranking ?? [])[minhaPosicao].pontos).emoji}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-0">
            {isLoading && (
              <p className="p-8 text-lg text-muted-foreground">
                Carregando ranking…
              </p>
            )}
            <ol>
              {(ranking ?? []).map((r, i) => {
                const nv = nivel(r.pontos);
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-4 border-b p-5 last:border-0 ${
                      r.id === user?.id ? "bg-secondary" : ""
                    }`}
                  >
                    <span className="font-display w-10 text-center text-2xl font-semibold text-primary/60">
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                    </span>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {(r.name ?? "M").trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold">
                        {r.name ?? "Membro"}
                        {r.id === user?.id && " (você)"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {nv.emoji} {nv.nome}
                        {r.cidade ? ` · ${r.cidade}` : ""}
                      </p>
                    </div>
                    <span className="font-display text-2xl font-semibold text-primary">
                      {r.pontos}
                    </span>
                  </li>
                );
              })}
            </ol>
            {!isLoading && (ranking ?? []).length === 0 && (
              <p className="p-8 text-lg text-muted-foreground">
                O ranking começa quando os primeiros membros participarem.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Trophy className="h-6 w-6 text-[hsl(33,92%,46%)]" />
                Como ganhar pontos
              </h2>
              <ul className="mt-4 space-y-3">
                {COMO_GANHAR.map((c) => (
                  <li key={c.acao} className="flex items-center justify-between gap-3">
                    <span>{c.acao}</span>
                    <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                      +{c.pontos}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold">Níveis</h2>
              <ul className="mt-4 space-y-3">
                {NIVEIS.map((n) => (
                  <li key={n.nome} className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{n.emoji}</span>
                    <div>
                      <p className="font-bold">{n.nome}</p>
                      <p className="text-sm text-muted-foreground">{n.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
