import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/const";
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
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, UserRound } from "lucide-react";
import Privacidade from "@/components/Privacidade";

type Faixa = "45-49" | "50-54" | "55-59" | "60-64" | "65+";
type Exp = "iniciante" | "basico" | "intermediario" | "avancado";

const FAIXAS: { value: Faixa; label: string }[] = [
  { value: "45-49", label: "45 a 49 anos" },
  { value: "50-54", label: "50 a 54 anos" },
  { value: "55-59", label: "55 a 59 anos" },
  { value: "60-64", label: "60 a 64 anos" },
  { value: "65+", label: "65 anos ou mais" },
];

const EXPERIENCIAS: { value: Exp; label: string }[] = [
  { value: "iniciante", label: "Estou começando do zero" },
  { value: "basico", label: "Uso o básico (WhatsApp, e-mail, redes sociais)" },
  { value: "intermediario", label: "Me viro bem com computador e internet" },
  { value: "avancado", label: "Já trabalho com tecnologia" },
];

export default function Perfil() {
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: LOGIN_PATH,
  });
  const utils = trpc.useUtils();
  const { data: perfil, isLoading } = trpc.profile.me.useQuery(undefined, {
    enabled: !!user,
  });

  const [faixaEtaria, setFaixaEtaria] = useState<Faixa>("50-54");
  const [cidade, setCidade] = useState("");
  const [profissao, setProfissao] = useState("");
  const [area, setArea] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [experiencia, setExperiencia] = useState<Exp>("iniciante");
  const [disponivel, setDisponivel] = useState(true);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (perfil) {
      setFaixaEtaria(perfil.faixaEtaria ?? "50-54");
      setCidade(perfil.cidade ?? "");
      setProfissao(perfil.profissaoAtual ?? "");
      setArea(perfil.areaInteresse ?? "");
      setObjetivo(perfil.objetivo ?? "");
      setExperiencia(perfil.experienciaTech ?? "iniciante");
      setDisponivel(perfil.disponivelParaVagas);
    }
  }, [perfil]);

  const salvar = trpc.profile.save.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      utils.profile.count.invalidate();
      setSalvo(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  if (authLoading || (user && isLoading)) {
    return (
      <div className="container-page py-14">
        <p className="text-lg text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-14">
      <header>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          {perfil?.concluido ? "Meu perfil" : "Bem-vindo(a) à Recomeça!"}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {perfil?.concluido
            ? "Mantenha seus dados atualizados para as empresas encontrarem você."
            : "Conte um pouco sobre você. Essas informações ajudam as empresas parceiras a encontrarem seu perfil — e levam menos de 2 minutos."}
        </p>
      </header>

      {salvo && (
        <p
          role="status"
          className="mt-6 flex items-center gap-2 rounded-xl bg-[hsl(140,40%,92%)] p-4 font-bold text-[hsl(150,60%,22%)]"
        >
          <CheckCircle2 className="h-6 w-6" aria-hidden />
          Perfil salvo com sucesso! Agora você já faz parte da comunidade.
        </p>
      )}

      <Card className="mt-8 border-2">
        <CardContent className="space-y-7 p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <UserRound className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="text-xl font-bold">{user?.name ?? "Membro"}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="faixa" className="text-base font-bold">
              Qual é a sua faixa etária?
            </Label>
            <Select
              value={faixaEtaria}
              onValueChange={(v) => setFaixaEtaria(v as Faixa)}
            >
              <SelectTrigger id="faixa" className="mt-2 h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FAIXAS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-base">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cidade" className="text-base font-bold">
              Onde você mora?
            </Label>
            <Input
              id="cidade"
              className="mt-2 h-12 text-base"
              placeholder="Ex.: São Paulo — SP"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="profissao" className="text-base font-bold">
              Qual é (ou era) a sua profissão?
            </Label>
            <Input
              id="profissao"
              className="mt-2 h-12 text-base"
              placeholder="Ex.: Gerente de vendas, professora, contador…"
              value={profissao}
              onChange={(e) => setProfissao(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="area" className="text-base font-bold">
              Em que área você gostaria de trabalhar com IA?
            </Label>
            <Input
              id="area"
              className="mt-2 h-12 text-base"
              placeholder="Ex.: Atendimento, marketing, administração…"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="exp" className="text-base font-bold">
              Como você se considera com tecnologia?
            </Label>
            <Select
              value={experiencia}
              onValueChange={(v) => setExperiencia(v as Exp)}
            >
              <SelectTrigger id="exp" className="mt-2 h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCIAS.map((e) => (
                  <SelectItem key={e.value} value={e.value} className="text-base">
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="objetivo" className="text-base font-bold">
              O que você busca ao recomeçar? (opcional)
            </Label>
            <Textarea
              id="objetivo"
              className="mt-2 min-h-28 text-base"
              placeholder="Conte do seu jeito: um novo emprego, renda extra, um projeto próprio…"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-6 rounded-xl bg-secondary p-5">
            <Label htmlFor="disponivel" className="text-base font-bold leading-snug">
              Estou disponível para receber propostas de vagas
            </Label>
            <Switch
              id="disponivel"
              checked={disponivel}
              onCheckedChange={setDisponivel}
              className="scale-125"
            />
          </div>

          <Button
            size="lg"
            className="h-14 w-full text-lg font-bold"
            disabled={salvar.isPending}
            onClick={() => {
              setSalvo(false);
              salvar.mutate({
                faixaEtaria,
                cidade: cidade || undefined,
                profissaoAtual: profissao || undefined,
                areaInteresse: area || undefined,
                objetivo: objetivo || undefined,
                experienciaTech: experiencia,
                disponivelParaVagas: disponivel,
              });
            }}
          >
            {salvar.isPending ? "Salvando…" : "Salvar meu perfil"}
          </Button>
        </CardContent>
      </Card>

      <Privacidade />
    </div>
  );
}
