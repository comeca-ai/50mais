import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Recuperar() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<"pedir" | "trocar">("pedir");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const pedir = trpc.auth.requestReset.useMutation({
    onSuccess: () => {
      setEtapa("trocar");
      setErro("");
      setAviso(
        "Se este e-mail estiver cadastrado, você receberá um código de 6 números.",
      );
    },
    onError: (e) => setErro(e.message),
  });

  const trocar = trpc.auth.resetPassword.useMutation({
    onSuccess: () => navigate("/entrar?senha=nova"),
    onError: (e) => setErro(e.message),
  });

  const carregando = pedir.isPending || trocar.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Recuperar senha</CardTitle>
          <p className="text-muted-foreground">
            {etapa === "pedir"
              ? "Informe seu e-mail para receber um código."
              : "Digite o código recebido e escolha uma senha nova."}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
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
              disabled={etapa === "trocar"}
            />
          </div>

          {etapa === "pedir" && (
            <Button
              className="w-full"
              size="lg"
              disabled={carregando || !email}
              onClick={() => {
                setErro("");
                pedir.mutate({ email });
              }}
            >
              Enviar código
            </Button>
          )}

          {etapa === "trocar" && (
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
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Senha nova</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Pelo menos 8 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={carregando || codigo.length !== 6 || novaSenha.length < 8}
                onClick={() => {
                  setErro("");
                  trocar.mutate({ email, codigo, novaSenha });
                }}
              >
                Salvar senha nova
              </Button>
            </>
          )}

          {aviso && (
            <p className="rounded-lg bg-accent p-3 text-accent-foreground">{aviso}</p>
          )}
          {erro && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
              {erro}
            </p>
          )}

          <p className="text-center">
            <Link to="/entrar" className="text-primary underline underline-offset-4">
              Voltar para entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
