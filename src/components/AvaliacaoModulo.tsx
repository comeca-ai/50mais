import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClipboardCheck, PartyPopper, RotateCcw } from "lucide-react";

export default function AvaliacaoModulo({ moduleId }: { moduleId: number }) {
  const utils = trpc.useUtils();
  const [aberto, setAberto] = useState(false);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<{
    acertos: number;
    total: number;
    passou: boolean;
    notaMinima: number;
  } | null>(null);

  const { data: quiz, isLoading } = trpc.learn.quiz.useQuery(
    { moduleId },
    { enabled: aberto },
  );

  const enviar = trpc.learn.responderQuiz.useMutation({
    onSuccess: (r) => {
      setResultado(r);
      utils.learn.tentativas.invalidate();
      utils.learn.elegibilidade.invalidate();
    },
  });

  if (!aberto) {
    return (
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2">
            <ClipboardCheck className="h-5 w-5" aria-hidden />
            Avaliação do módulo
          </Button>
        </DialogTrigger>
        <DialogContent />
      </Dialog>
    );
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(o) => {
        setAberto(o);
        if (!o) {
          setRespostas({});
          setResultado(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <ClipboardCheck className="h-5 w-5" aria-hidden />
          Avaliação do módulo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {quiz?.titulo ?? "Avaliação do módulo"}
          </DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-lg text-muted-foreground">Carregando…</p>}

        {!isLoading && !quiz && (
          <p className="text-lg text-muted-foreground">
            Este módulo ainda não tem avaliação. Conclua as aulas e volte em
            breve!
          </p>
        )}

        {quiz && !resultado && (
          <div className="max-h-[60vh] space-y-8 overflow-y-auto pr-2">
            {quiz.perguntas.map((p, pi) => (
              <fieldset key={pi} className="space-y-3">
                <legend className="text-lg font-bold">
                  {pi + 1}. {p.pergunta}
                </legend>
                <div className="grid gap-2">
                  {p.opcoes.map((op, oi) => (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-lg transition ${
                        respostas[pi] === oi
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`pergunta-${pi}`}
                        checked={respostas[pi] === oi}
                        onChange={() =>
                          setRespostas((r) => ({ ...r, [pi]: oi }))
                        }
                        className="h-5 w-5"
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <Button
              size="lg"
              className="h-12 w-full text-lg font-bold"
              disabled={
                enviar.isPending ||
                Object.keys(respostas).length < quiz.perguntas.length
              }
              onClick={() =>
                enviar.mutate({
                  quizId: quiz.id,
                  respostas: quiz.perguntas.map((_, i) => respostas[i] ?? -1),
                })
              }
            >
              Enviar respostas
            </Button>
          </div>
        )}

        {quiz && resultado && (
          <div className="space-y-5 text-center">
            {resultado.passou ? (
              <>
                <PartyPopper className="mx-auto h-14 w-14 text-primary" aria-hidden />
                <p className="text-2xl font-bold">
                  Parabéns, você passou! 🎉
                </p>
                <p className="text-lg text-muted-foreground">
                  Você acertou {resultado.acertos} de {resultado.total}{" "}
                  perguntas.
                </p>
                <Button size="lg" className="w-full" onClick={() => setAberto(false)}>
                  Continuar o curso
                </Button>
              </>
            ) : (
              <>
                <RotateCcw className="mx-auto h-14 w-14 text-muted-foreground" aria-hidden />
                <p className="text-2xl font-bold">Quase lá!</p>
                <p className="text-lg text-muted-foreground">
                  Você acertou {resultado.acertos} de {resultado.total}. Para
                  passar, é preciso acertar pelo menos {resultado.notaMinima}.
                  Assista às aulas de novo e tente outra vez — sem pressa.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setResultado(null);
                    setRespostas({});
                  }}
                >
                  Tentar de novo
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
