import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  MessagesSquare,
  Users,
} from "lucide-react";

const PASSOS = [
  {
    icon: Users,
    titulo: "1. Cadastre-se na comunidade",
    texto:
      "Crie sua conta e conte para a gente quem você é, sua experiência e o que busca. Sem burocracia, sem julgamento.",
  },
  {
    icon: GraduationCap,
    titulo: "2. Aprenda IA no seu ritmo",
    texto:
      "Curso completo de inteligência artificial em videoaulas, com linguagem simples e direta — feito para quem está começando do zero.",
  },
  {
    icon: Briefcase,
    titulo: "3. Candidate-se às vagas",
    texto:
      "Empresas parceiras publicam oportunidades pensadas para profissionais maduros. Você se candidata com um clique.",
  },
];

const PUBLICO = [
  "Tem 50 anos ou mais e quer se reinventar profissionalmente",
  "Foi desligado, está aposentado ou quer mudar de área",
  "Sente que a tecnologia passou rápido demais — e quer recuperar o tempo",
  "Tem décadas de experiência e quer somar IA a ela, não começar do zero",
];

export default function Home() {
  const { data: memberCount } = trpc.profile.count.useQuery();
  const { data: lessons } = trpc.lessons.list.useQuery();
  const { data: jobs } = trpc.jobs.list.useQuery();

  const modulos = Array.from(new Set((lessons ?? []).map((l) => l.modulo)));

  return (
    <div>
      {/* Hero */}
      <section className="hero-band text-primary-foreground">
        <div className="container-page flex flex-col items-start gap-8 py-24 md:py-32">
          <span className="rounded-full bg-primary-foreground/15 px-5 py-2 text-base font-bold tracking-wide">
            Comunidade de requalificação em IA para profissionais 50+
          </span>
          <h1 className="font-display max-w-3xl text-5xl font-semibold leading-[1.1] md:text-6xl">
            Nunca é tarde para{" "}
            <span className="text-[hsl(38,95%,62%)]">recomeçar</span>.
          </h1>
          <p className="max-w-2xl text-xl leading-relaxed text-primary-foreground/90 md:text-2xl">
            Um curso completo de inteligência artificial, uma comunidade que
            acolhe e empresas de verdade esperando pela sua experiência.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 bg-[hsl(33,92%,46%)] px-8 text-lg font-bold text-white hover:bg-[hsl(33,92%,40%)]"
            >
              <Link to="/perfil">
                Quero participar <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 border-primary-foreground/40 bg-transparent px-8 text-lg font-bold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/aulas">Conhecer o curso</Link>
            </Button>
          </div>

          {/* Números */}
          <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { numero: memberCount ?? "…", rotulo: "membros cadastrados" },
              { numero: lessons?.length ?? "…", rotulo: "aulas no curso" },
              { numero: jobs?.length ?? "…", rotulo: "vagas abertas" },
            ].map((s) => (
              <div
                key={s.rotulo}
                className="rounded-2xl bg-primary-foreground/10 px-6 py-4"
              >
                <dt className="sr-only">{s.rotulo}</dt>
                <dd className="font-display text-4xl font-semibold">{s.numero}</dd>
                <dd className="text-base text-primary-foreground/85">{s.rotulo}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Para quem é */}
      <section className="container-page py-20">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight">
              Esta comunidade é para você que…
            </h2>
            <ul className="mt-8 space-y-4">
              {PUBLICO.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg">
                  <Heart
                    className="mt-1 h-6 w-6 shrink-0 text-[hsl(33,92%,46%)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="card-hover border-2">
            <CardContent className="p-8">
              <MessagesSquare className="h-10 w-10 text-primary" aria-hidden />
              <h3 className="font-display mt-4 text-2xl font-semibold">
                Ninguém recomeça sozinho
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                No nosso fórum, você tira dúvidas das aulas, compartilha
                conquistas, troca experiências com pessoas da sua geração e
                descobre oportunidades antes de todo mundo.
              </p>
              <Button asChild variant="outline" size="lg" className="mt-6 text-base font-bold">
                <Link to="/comunidade">Visitar a comunidade</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-secondary/60 py-20">
        <div className="container-page">
          <h2 className="font-display text-center text-4xl font-semibold">
            Como funciona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Três passos simples, do primeiro cadastro até a sua próxima vaga.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PASSOS.map((p) => (
              <Card key={p.titulo} className="card-hover">
                <CardContent className="p-8">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <p.icon className="h-7 w-7" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{p.titulo}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {p.texto}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curso */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-semibold">
              O curso de IA
            </h2>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">
              Videoaulas gravadas com calma e clareza. Você assiste quando
              quiser, quantas vezes precisar.
            </p>
          </div>
          <Button asChild size="lg" className="text-base font-bold">
            <Link to="/aulas">
              <BookOpen className="mr-2 h-5 w-5" aria-hidden /> Ver todas as aulas
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.length === 0 && (
            <p className="col-span-full text-lg text-muted-foreground">
              Os módulos do curso estão sendo organizados e aparecerão aqui em
              breve.
            </p>
          )}
          {modulos.map((m, i) => (
            <Card key={m} className="card-hover border-l-4 border-l-primary">
              <CardContent className="flex items-center gap-4 p-6">
                <span className="font-display text-3xl font-semibold text-primary/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{m}</h3>
                  <p className="text-muted-foreground">
                    {(lessons ?? []).filter((l) => l.modulo === m).length} aulas
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Empresas */}
      <section className="container-page pb-20">
        <div className="hero-band overflow-hidden rounded-3xl text-primary-foreground">
          <div className="grid items-center gap-8 p-10 md:grid-cols-[1fr_auto] md:p-14">
            <div>
              <Building2 className="h-10 w-10" aria-hidden />
              <h2 className="font-display mt-4 text-3xl font-semibold md:text-4xl">
                Sua empresa quer contratar experiência?
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-primary-foreground/90">
                Nossos membros unem décadas de vivência profissional a novas
                habilidades em IA. Cadastre-se como empresa parceira e publique
                vagas para essa geração.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-14 bg-[hsl(33,92%,46%)] px-8 text-lg font-bold text-white hover:bg-[hsl(33,92%,40%)]"
            >
              <Link to="/empresas">Quero ser parceiro</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
