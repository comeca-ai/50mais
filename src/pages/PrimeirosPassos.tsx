import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LOGIN_PATH } from "@/const";

const FAIXAS = [
  { valor: "45-49", rotulo: "45 a 49 anos" },
  { valor: "50-54", rotulo: "50 a 54 anos" },
  { valor: "55-59", rotulo: "55 a 59 anos" },
  { valor: "60-64", rotulo: "60 a 64 anos" },
  { valor: "65+", rotulo: "65 anos ou mais" },
] as const;

const OBJETIVOS = [
  { valor: "recolocacao", rotulo: "Voltar ao mercado de trabalho", desc: "Quero um emprego novo" },
  { valor: "freelance", rotulo: "Trabalhar por conta", desc: "Quero fazer serviços e bicos" },
  { valor: "empreender", rotulo: "Tocar meu próprio negócio", desc: "Quero abrir ou crescer um negócio" },
  { valor: "curiosidade", rotulo: "Aprender por prazer", desc: "Quero entender a IA no meu ritmo" },
] as const;

const EXPERIENCIAS = [
  { valor: "iniciante", rotulo: "Bem no começo", desc: "Uso o celular para o básico" },
  { valor: "basico", rotulo: "Básico", desc: "Uso WhatsApp, e-mail e redes sociais" },
  { valor: "intermediario", rotulo: "Intermediário", desc: "Me viro com planilhas e documentos" },
  { valor: "avancado", rotulo: "Avançado", desc: "Já mexi com tecnologia no trabalho" },
] as const;

const ETAPAS = ["Sobre você", "Seu objetivo", "Sua experiência", "Compartilhar"];

export default function PrimeirosPassos() {
  const navigate = useNavigate();
  useAuth({ redirectOnUnauthenticated: true, redirectPath: LOGIN_PATH });

  const [etapa, setEtapa] = useState(0);
  const [faixa, setFaixa] = useState<string>("");
  const [cidade, setCidade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [objetivo, setObjetivo] = useState<string>("");
  const [objetivoTexto, setObjetivoTexto] = useState("");
  const [experiencia, setExperiencia] = useState<string>("");
  const [ensina, setEnsina] = useState("");
  const [aprende, setAprende] = useState("");
  const [erro, setErro] = useState("");

  const salvar = trpc.profile.save.useMutation({
    onSuccess: () => navigate("/"),
    onError: (e) => setErro(e.message),
  });

  const podeAvancar =
    (etapa === 0 && faixa && cidade.trim()) ||
    (etapa === 1 && objetivo) ||
    (etapa === 2 && experiencia) ||
    etapa === 3;

  function concluir() {
    setErro("");
    salvar.mutate({
      faixaEtaria: (faixa || undefined) as
        | "45-49"
        | "50-54"
        | "55-59"
        | "60-64"
        | "65+"
        | undefined,
      cidade: cidade || undefined,
      profissaoAtual: profissao || undefined,
      objetivoTipo: (objetivo || undefined) as
        | "recolocacao"
        | "freelance"
        | "empreender"
        | "curiosidade"
        | undefined,
      objetivo: objetivoTexto || undefined,
      experienciaTech: (experiencia || undefined) as
        | "iniciante"
        | "basico"
        | "intermediario"
        | "avancado"
        | undefined,
      podeEnsinar: ensina || undefined,
      estaAprendendo: aprende || undefined,
      concluido: true,
    });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Primeiros passos</h1>
          <p className="text-muted-foreground text-lg">
            Só 4 perguntinhas para a comunidade te conhecer. Sem pressa.
          </p>
        </header>

        <ol className="flex justify-center gap-2" aria-label="Progresso">
          {ETAPAS.map((nome, i) => (
            <li
              key={nome}
              aria-current={i === etapa ? "step" : undefined}
              className={`h-3 w-16 rounded-full ${
                i <= etapa ? "bg-primary" : "bg-muted"
              }`}
              title={`${i + 1}. ${nome}`}
            />
          ))}
        </ol>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {etapa + 1}. {ETAPAS[etapa]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {etapa === 0 && (
              <>
                <div className="space-y-3">
                  <Label>Sua faixa de idade</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {FAIXAS.map((f) => (
                      <Button
                        key={f.valor}
                        variant={faixa === f.valor ? "default" : "outline"}
                        size="lg"
                        onClick={() => setFaixa(f.valor)}
                      >
                        {f.rotulo}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Sua cidade</Label>
                  <Input
                    id="cidade"
                    placeholder="Ex.: Campinas, SP"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profissao">
                    Sua profissão (atual ou anterior) — opcional
                  </Label>
                  <Input
                    id="profissao"
                    placeholder="Ex.: Professora aposentada"
                    value={profissao}
                    onChange={(e) => setProfissao(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </>
            )}

            {etapa === 1 && (
              <>
                <div className="space-y-3">
                  <Label>O que você busca no Recomeça?</Label>
                  <div className="grid gap-2">
                    {OBJETIVOS.map((o) => (
                      <button
                        key={o.valor}
                        type="button"
                        onClick={() => setObjetivo(o.valor)}
                        className={`rounded-xl border-2 p-4 text-left transition ${
                          objetivo === o.valor
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="block font-semibold text-lg">
                          {o.rotulo}
                        </span>
                        <span className="text-muted-foreground">{o.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objetivoTexto">
                    Quer contar mais? — opcional
                  </Label>
                  <Textarea
                    id="objetivoTexto"
                    placeholder="Ex.: Quero voltar a trabalhar meio período, de preferência de casa."
                    value={objetivoTexto}
                    onChange={(e) => setObjetivoTexto(e.target.value)}
                    rows={3}
                    className="text-lg"
                  />
                </div>
              </>
            )}

            {etapa === 2 && (
              <div className="space-y-3">
                <Label>Como é sua experiência com tecnologia?</Label>
                <div className="grid gap-2">
                  {EXPERIENCIAS.map((x) => (
                    <button
                      key={x.valor}
                      type="button"
                      onClick={() => setExperiencia(x.valor)}
                      className={`rounded-xl border-2 p-4 text-left transition ${
                        experiencia === x.valor
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="block font-semibold text-lg">
                        {x.rotulo}
                      </span>
                      <span className="text-muted-foreground">{x.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {etapa === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ensina">
                    O que você pode ensinar para a comunidade? — opcional
                  </Label>
                  <Input
                    id="ensina"
                    placeholder="Ex.: Organização financeira, culinária, vendas..."
                    value={ensina}
                    onChange={(e) => setEnsina(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aprende">
                    O que você quer aprender? — opcional
                  </Label>
                  <Input
                    id="aprende"
                    placeholder="Ex.: Usar a IA para conseguir clientes"
                    value={aprende}
                    onChange={(e) => setAprende(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <p className="text-muted-foreground">
                  Essas respostas aparecem no seu perfil para outros membros
                  encontrarem você.
                </p>
              </>
            )}

            {erro && (
              <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
                {erro}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              {etapa > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setEtapa(etapa - 1)}
                >
                  Voltar
                </Button>
              )}
              {etapa < 3 ? (
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!podeAvancar}
                  onClick={() => setEtapa(etapa + 1)}
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={salvar.isPending}
                  onClick={concluir}
                >
                  Concluir e entrar na comunidade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
