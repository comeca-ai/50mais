import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function Cadastro() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<"dados" | "confirmar">("dados");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aceitei, setAceitei] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");

  const cadastrar = trpc.auth.register.useMutation({
    onSuccess: () => {
      setErro("");
      setEtapa("confirmar");
    },
    onError: (e) => setErro(e.message),
  });

  const confirmar = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => navigate("/entrar?confirmado=1"),
    onError: (e) => setErro(e.message),
  });

  const reenviar = trpc.auth.resendVerification.useMutation({
    onError: (e) => setErro(e.message),
  });

  const carregando =
    cadastrar.isPending || confirmar.isPending || reenviar.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">
            {etapa === "dados" ? "Criar sua conta" : "Confirme seu e-mail"}
          </CardTitle>
          <p className="text-muted-foreground">
            {etapa === "dados"
              ? "Grátis, sem pegadinha. Leva menos de 1 minuto."
              : `Enviamos um código de 6 números para ${email}.`}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {etapa === "dados" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nome">Como você se chama?</Label>
                <Input
                  id="nome"
                  autoComplete="name"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Seu e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Crie uma senha</Label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Pelo menos 8 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Use pelo menos 8 caracteres. Prefira uma frase fácil de
                  lembrar.
                </p>
              </div>
              <label
                htmlFor="termos"
                className="flex items-start gap-3 cursor-pointer rounded-lg border p-4"
              >
                <Checkbox
                  id="termos"
                  checked={aceitei}
                  onCheckedChange={(v) => setAceitei(v === true)}
                  className="mt-1 h-6 w-6"
                />
                <span>
                  Li e aceito os{" "}
                  <Link to="/termos" className="underline underline-offset-4">
                    termos de uso
                  </Link>{" "}
                  e autorizo o tratamento dos meus dados conforme a lei (LGPD).
                </span>
              </label>
              <Button
                className="w-full"
                size="lg"
                disabled={carregando || !nome || !email || senha.length < 8 || !aceitei}
                onClick={() => {
                  setErro("");
                  cadastrar.mutate({
                    name: nome,
                    email,
                    senha,
                    aceitouTermos: true,
                  });
                }}
              >
                Criar minha conta
              </Button>
            </>
          )}

          {etapa === "confirmar" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de 6 números</Label>
                <Input
                  id="codigo"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) =>
                    setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="h-12 text-lg text-center tracking-[0.5em]"
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={carregando || codigo.length !== 6}
                onClick={() => {
                  setErro("");
                  confirmar.mutate({ email, codigo });
                }}
              >
                Confirmar e-mail
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                disabled={carregando}
                onClick={() => reenviar.mutate({ email })}
              >
                Reenviar código
              </Button>
              <Button
                variant="link"
                className="w-full"
                onClick={() => navigate("/entrar")}
              >
                Confirmar depois — ir para entrar
              </Button>
            </>
          )}

          {erro && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
              {erro}
            </p>
          )}

          {etapa === "dados" && (
            <p className="text-center text-muted-foreground">
              Já tem conta?{" "}
              <Link
                to="/entrar"
                className="text-primary font-medium underline underline-offset-4"
              >
                Entrar
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
