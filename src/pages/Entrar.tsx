import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Entrar() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [modo, setModo] = useState<"senha" | "codigo">("senha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const entrarSenha = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/");
    },
    onError: (e) => setErro(e.message),
  });

  const pedirCodigo = trpc.auth.requestMagic.useMutation({
    onSuccess: () => {
      setCodigoEnviado(true);
      setErro("");
      setAviso(
        "Se este e-mail estiver cadastrado, você receberá um código de 6 números. Olhe sua caixa de entrada (e o lixo eletrônico).",
      );
    },
    onError: (e) => setErro(e.message),
  });

  const entrarCodigo = trpc.auth.verifyMagic.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/");
    },
    onError: (e) => setErro(e.message),
  });

  const carregando =
    entrarSenha.isPending || pedirCodigo.isPending || entrarCodigo.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Entrar no Recomeça</CardTitle>
          <p className="text-muted-foreground">
            A comunidade de quem tem 50+ e está recomeçando com inteligência
            artificial.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-2" role="tablist">
            <Button
              variant={modo === "senha" ? "default" : "outline"}
              size="lg"
              onClick={() => {
                setModo("senha");
                setErro("");
              }}
            >
              Com senha
            </Button>
            <Button
              variant={modo === "codigo" ? "default" : "outline"}
              size="lg"
              onClick={() => {
                setModo("codigo");
                setErro("");
              }}
            >
              Com código
            </Button>
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

          {modo === "senha" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="senha">Sua senha</Label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-12 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && email && senha) {
                      setErro("");
                      entrarSenha.mutate({ email, senha });
                    }
                  }}
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={carregando || !email || !senha}
                onClick={() => {
                  setErro("");
                  entrarSenha.mutate({ email, senha });
                }}
              >
                Entrar
              </Button>
              <p className="text-center">
                <Link
                  to="/recuperar"
                  className="text-primary underline underline-offset-4"
                >
                  Esqueci minha senha
                </Link>
              </p>
            </>
          )}

          {modo === "codigo" && !codigoEnviado && (
            <>
              <p className="text-muted-foreground">
                Sem senha: a gente envia um código de 6 números para o seu
                e-mail. É só digitar aqui para entrar.
              </p>
              <Button
                className="w-full"
                size="lg"
                disabled={carregando || !email}
                onClick={() => {
                  setErro("");
                  pedirCodigo.mutate({ email });
                }}
              >
                Enviar código para meu e-mail
              </Button>
            </>
          )}

          {modo === "codigo" && codigoEnviado && (
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
                  entrarCodigo.mutate({ email, codigo });
                }}
              >
                Entrar com o código
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                disabled={carregando}
                onClick={() => {
                  setErro("");
                  pedirCodigo.mutate({ email });
                }}
              >
                Reenviar código
              </Button>
            </>
          )}

          {aviso && (
            <p className="rounded-lg bg-accent p-3 text-accent-foreground">
              {aviso}
            </p>
          )}
          {erro && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
              {erro}
            </p>
          )}

          <p className="text-center text-muted-foreground">
            Ainda não participa?{" "}
            <Link
              to="/cadastro"
              className="text-primary font-medium underline underline-offset-4"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
