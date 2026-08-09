import { Link, useNavigate, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  MessageSquareText,
  User,
} from "lucide-react";

const NIVEIS = [
  { min: 600, nome: "Floresta", emoji: "🌳🌳" },
  { min: 300, nome: "Árvore", emoji: "🌳" },
  { min: 150, nome: "Arbusto", emoji: "🌿" },
  { min: 50, nome: "Broto", emoji: "🌱" },
  { min: 0, nome: "Semente", emoji: "🫘" },
];

function nivel(pontos: number) {
  return NIVEIS.find((n) => pontos >= n.min) ?? NIVEIS[4];
}

export default function Membro() {
  const { id } = useParams<{ id: string }>();
  const membroId = Number(id);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const { data: membro, isLoading } = trpc.members.get.useQuery(
    { id: membroId },
    { enabled: Number.isFinite(membroId) },
  );
  const { data: posts } = trpc.members.posts.useQuery(
    { id: membroId },
    { enabled: Number.isFinite(membroId) },
  );
  const { data: ranking } = trpc.gamification.leaderboard.useQuery();

  const pontos = (ranking ?? []).find((r) => r.id === membroId)?.pontos ?? 0;
  const nv = nivel(pontos);
  const souEu = user?.id === membroId;

  if (isLoading) {
    return (
      <div className="container-page py-14">
        <p className="text-lg text-muted-foreground">Carregando perfil…</p>
      </div>
    );
  }

  if (!membro) {
    return (
      <div className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold">
          Membro não encontrado
        </h1>
        <Button asChild variant="outline" size="lg" className="mt-6 text-base">
          <Link to="/comunidade/membros">
            <ArrowLeft className="mr-2 h-5 w-5" /> Voltar ao diretório
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-10">
      <Button asChild variant="ghost" size="lg" className="mb-6 text-base">
        <Link to="/comunidade/membros">
          <ArrowLeft className="mr-2 h-5 w-5" /> Diretório de membros
        </Link>
      </Button>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                {(membro.name ?? "M").trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display text-3xl font-semibold">
                  {membro.name ?? "Membro"}
                </h1>
                {membro.profissaoAtual && (
                  <p className="mt-1 text-lg text-muted-foreground">
                    {membro.profissaoAtual}
                  </p>
                )}
                <p className="mt-2 flex items-center gap-2 font-bold text-primary">
                  <span aria-hidden>{nv.emoji}</span> Nível {nv.nome} · {pontos}{" "}
                  pontos
                </p>
              </div>
            </div>
            {!souEu && (
              <Button
                size="lg"
                className="h-12 text-base font-bold"
                onClick={() =>
                  isAuthenticated
                    ? navigate(`/mensagens/${membroId}`)
                    : navigate("/login")
                }
              >
                <MessageSquareText className="mr-2 h-5 w-5" />
                Enviar mensagem
              </Button>
            )}
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {membro.cidade && (
              <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <dt className="text-sm font-bold text-muted-foreground">Cidade</dt>
                  <dd className="font-bold">{membro.cidade}</dd>
                </div>
              </div>
            )}
            {membro.faixaEtaria && (
              <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <dt className="text-sm font-bold text-muted-foreground">Faixa etária</dt>
                  <dd className="font-bold">{membro.faixaEtaria} anos</dd>
                </div>
              </div>
            )}
            {membro.areaInteresse && (
              <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <dt className="text-sm font-bold text-muted-foreground">
                    Quer trabalhar com
                  </dt>
                  <dd className="font-bold">{membro.areaInteresse}</dd>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <dt className="text-sm font-bold text-muted-foreground">
                  Na comunidade desde
                </dt>
                <dd className="font-bold">
                  {new Date(membro.createdAt).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </div>
          </dl>

          {membro.objetivo && (
            <div className="mt-6 rounded-xl border-2 p-5">
              <h2 className="font-bold">O que busco ao recomeçar</h2>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {membro.objetivo}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {(posts ?? []).length > 0 && (
        <>
          <h2 className="font-display mt-10 text-2xl font-semibold">
            Conversas recentes de {membro.name?.split(" ")[0]}
          </h2>
          <ul className="mt-4 space-y-3">
            {(posts ?? []).map((p) => (
              <li key={p.id}>
                <Link
                  to={`/comunidade/post/${p.id}`}
                  className="block rounded-xl border p-4 font-bold hover:bg-secondary"
                >
                  {p.titulo}
                  <span className="ml-3 text-sm font-normal text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
