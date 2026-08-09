import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BrainCircuit,
  CheckCircle2,
  Gem,
  Handshake,
  Target,
} from "lucide-react";

const BENEFICIOS = [
  {
    icon: Gem,
    titulo: "Experiência que não se compra",
    texto:
      "Profissionais com 20, 30 anos de estrada em gestão, vendas, operações, saúde, educação e muito mais.",
  },
  {
    icon: BrainCircuit,
    titulo: "Experiência + IA",
    texto:
      "Nossos membros são treinados em inteligência artificial aplicada ao trabalho real — não é só teoria.",
  },
  {
    icon: Target,
    titulo: "Motivação genuína",
    texto:
      "Quem escolhe recomeçar aos 50+ chega com comprometimento, maturidade emocional e vontade de entregar.",
  },
];

export default function Empresas() {
  const [form, setForm] = useState({
    nome: "",
    contatoNome: "",
    email: "",
    segmento: "",
    descricao: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const cadastrar = trpc.companies.register.useMutation({
    onSuccess: () => setEnviado(true),
    onError: (e) => setErro(e.message),
  });

  function campo(id: keyof typeof form, label: string, props = {}) {
    return (
      <div>
        <Label htmlFor={id} className="text-base font-bold">
          {label}
        </Label>
        <Input
          id={id}
          className="mt-2 h-12 text-base"
          value={form[id]}
          onChange={(e) => setForm({ ...form, [id]: e.target.value })}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Contrate quem tem história — e agora também tem IA
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-muted-foreground">
          A Recomeça conecta empresas a profissionais 50+ requalificados em
          inteligência artificial. Cadastre-se como parceira e tenha acesso a
          esse banco de talentos.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {BENEFICIOS.map((b) => (
          <Card key={b.titulo} className="card-hover">
            <CardContent className="p-7">
              <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary p-3 text-primary-foreground">
                <b.icon className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="mt-4 text-xl font-bold">{b.titulo}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {b.texto}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 grid items-start gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-semibold">
            Como funciona a parceria
          </h2>
          <ol className="mt-6 space-y-5 text-lg">
            {[
              "Você cadastra sua empresa no formulário ao lado.",
              "Nossa equipe valida o cadastro e entra em contato.",
              "Suas vagas passam a aparecer para todos os membros da comunidade.",
              "Você recebe os perfis dos candidatos interessados, com experiência e formação em IA.",
            ].map((passo, i) => (
              <li key={passo} className="flex items-start gap-4">
                <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="pt-1.5">{passo}</span>
              </li>
            ))}
          </ol>
        </div>

        <Card className="border-2">
          <CardContent className="p-8">
            {enviado ? (
              <div className="py-8 text-center">
                <CheckCircle2
                  className="mx-auto h-14 w-14 text-primary"
                  aria-hidden
                />
                <h2 className="font-display mt-4 text-2xl font-semibold">
                  Cadastro recebido!
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Obrigado por querer contratar experiência. Entraremos em
                  contato pelo e-mail informado em breve.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Handshake className="h-8 w-8 text-primary" aria-hidden />
                  <h2 className="font-display text-2xl font-semibold">
                    Cadastro de empresa parceira
                  </h2>
                </div>
                <div className="mt-6 space-y-5">
                  {campo("nome", "Nome da empresa", {
                    placeholder: "Ex.: Padaria Estrela Ltda.",
                  })}
                  {campo("contatoNome", "Seu nome (pessoa de contato)", {
                    placeholder: "Ex.: Maria Silva",
                  })}
                  {campo("email", "E-mail de contato", {
                    type: "email",
                    placeholder: "voce@empresa.com.br",
                  })}
                  {campo("segmento", "Segmento (opcional)", {
                    placeholder: "Ex.: Varejo, Saúde, Indústria…",
                  })}
                  <div>
                    <Label htmlFor="descricao" className="text-base font-bold">
                      Conte um pouco sobre a empresa (opcional)
                    </Label>
                    <Textarea
                      id="descricao"
                      className="mt-2 min-h-28 text-base"
                      placeholder="O que a empresa faz, que tipo de vagas costuma ter…"
                      value={form.descricao}
                      onChange={(e) =>
                        setForm({ ...form, descricao: e.target.value })
                      }
                    />
                  </div>
                  {erro && (
                    <p role="alert" className="font-bold text-destructive">
                      {erro}
                    </p>
                  )}
                  <Button
                    size="lg"
                    className="h-13 w-full text-lg font-bold"
                    disabled={cadastrar.isPending}
                    onClick={() => {
                      setErro("");
                      cadastrar.mutate({
                        nome: form.nome,
                        contatoNome: form.contatoNome,
                        email: form.email,
                        segmento: form.segmento || undefined,
                        descricao: form.descricao || undefined,
                      });
                    }}
                  >
                    {cadastrar.isPending
                      ? "Enviando…"
                      : "Quero ser empresa parceira"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
