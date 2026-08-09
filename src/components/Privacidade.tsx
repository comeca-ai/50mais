import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, KeyRound, LogOut, Trash2 } from "lucide-react";

/** Seção "Privacidade e conta" da página de Perfil (LGPD). */
export default function Privacidade() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [msgSenha, setMsgSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);

  const exportar = trpc.account.exportarDados.useQuery(undefined, {
    enabled: false,
  });

  async function baixarDados() {
    const { data } = await exportar.refetch();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados-recomeca.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const trocarSenha = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setMsgSenha("Senha trocada com sucesso! ✅");
      setSenhaAtual("");
      setNovaSenha("");
    },
    onError: (e) => setMsgSenha(e.message),
  });

  const sairDeTudo = trpc.auth.logoutAll.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/entrar");
    },
  });

  const excluir = trpc.account.excluirConta.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/");
      window.location.reload();
    },
  });

  return (
    <section className="mt-14" aria-labelledby="privacidade">
      <h2 id="privacidade" className="font-display text-3xl font-semibold">
        Privacidade e conta
      </h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Seus dados são seus. Baixe, troque a senha ou exclua quando quiser.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <KeyRound className="h-5 w-5 text-primary" aria-hidden />
              Trocar senha
            </h3>
            <div className="space-y-2">
              <Label htmlFor="senhaAtual">Senha atual</Label>
              <Input
                id="senhaAtual"
                type="password"
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Senha nova (8+ caracteres)</Label>
              <Input
                id="novaSenha"
                type="password"
                autoComplete="new-password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={trocarSenha.isPending || !senhaAtual || novaSenha.length < 8}
              onClick={() => trocarSenha.mutate({ senhaAtual, novaSenha })}
            >
              Salvar senha nova
            </Button>
            {msgSenha && (
              <p role="status" className="rounded-lg bg-secondary p-3">
                {msgSenha}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Download className="h-5 w-5 text-primary" aria-hidden />
              Seus dados (LGPD)
            </h3>
            <p className="text-muted-foreground">
              Baixe um arquivo com tudo o que guardamos sobre você: perfil,
              publicações, mensagens, progresso no curso e pontos.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              disabled={exportar.isFetching}
              onClick={baixarDados}
            >
              {exportar.isFetching ? "Preparando arquivo…" : "Baixar meus dados"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              disabled={sairDeTudo.isPending}
              onClick={() => sairDeTudo.mutate()}
            >
              <LogOut className="h-5 w-5" aria-hidden />
              Sair de todos os aparelhos
            </Button>

            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="lg" className="w-full gap-2">
                  <Trash2 className="h-5 w-5" aria-hidden />
                  Excluir minha conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    Excluir sua conta?
                  </DialogTitle>
                </DialogHeader>
                <p className="text-lg text-muted-foreground">
                  Sua conta sai do ar na hora e seus dados pessoais são
                  apagados. Esta ação não tem volta. Para confirmar, digite{" "}
                  <strong>EXCLUIR</strong> abaixo.
                </p>
                <Input
                  className="h-12 text-lg"
                  placeholder="Digite EXCLUIR"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value.toUpperCase())}
                />
                <Button
                  variant="destructive"
                  size="lg"
                  disabled={confirmacao !== "EXCLUIR" || excluir.isPending}
                  onClick={() => excluir.mutate({ confirmacao: "EXCLUIR" })}
                >
                  {excluir.isPending ? "Excluindo…" : "Excluir definitivamente"}
                </Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
