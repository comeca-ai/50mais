import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Flag } from "lucide-react";
import { LOGIN_PATH } from "@/const";
import { useNavigate } from "react-router";

type Alvo = {
  postId?: number;
  commentId?: number;
  messageId?: number;
  reportedUserId?: number;
};

export default function BotaoDenunciar({ alvo, rotulo }: { alvo: Alvo; rotulo?: string }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const denunciar = trpc.moderation.report.useMutation({
    onSuccess: () => {
      setEnviado(true);
      setErro("");
    },
    onError: (e) => setErro(e.message),
  });

  return (
    <Dialog
      open={aberto}
      onOpenChange={(o) => {
        setAberto(o);
        if (!o) {
          setMotivo("");
          setEnviado(false);
          setErro("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Flag className="h-4 w-4" aria-hidden />
          {rotulo ?? "Denunciar"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Denunciar conteúdo</DialogTitle>
        </DialogHeader>
        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg text-muted-foreground">
              É preciso entrar na sua conta para denunciar.
            </p>
            <Button size="lg" className="w-full" onClick={() => navigate(LOGIN_PATH)}>
              Entrar
            </Button>
          </div>
        ) : enviado ? (
          <p className="rounded-lg bg-accent p-4 text-lg">
            Obrigado por avisar. A moderação vai olhar com carinho. 💚
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Conte em poucas palavras o que aconteceu. A moderação analisa
              toda denúncia.
            </p>
            <Textarea
              rows={4}
              className="text-lg"
              placeholder="Ex.: Esta publicação tem propaganda enganosa…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            {erro && (
              <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
                {erro}
              </p>
            )}
            <Button
              size="lg"
              className="w-full"
              disabled={motivo.trim().length < 5 || denunciar.isPending}
              onClick={() => denunciar.mutate({ ...alvo, motivo: motivo.trim() })}
            >
              Enviar denúncia
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
