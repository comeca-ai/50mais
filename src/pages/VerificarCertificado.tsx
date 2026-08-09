import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeCheck, SearchX } from "lucide-react";

export default function VerificarCertificado() {
  const [codigo, setCodigo] = useState("");
  const [consultado, setConsultado] = useState("");

  const { data, isFetching } = trpc.learn.verificarCertificado.useQuery(
    { codigo: consultado },
    { enabled: consultado.length >= 4, retry: false },
  );

  return (
    <div className="container-page max-w-xl py-14">
      <h1 className="font-display text-4xl font-semibold">
        Verificar certificado
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Digite o código que está no certificado para confirmar que ele é
        verdadeiro.
      </p>

      <div className="mt-8 space-y-2">
        <Label htmlFor="codigo">Código do certificado</Label>
        <div className="flex gap-3">
          <Input
            id="codigo"
            className="h-14 font-mono text-lg uppercase"
            placeholder="REC-XXXXXXXXXX"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={(e) =>
              e.key === "Enter" && codigo.length >= 4 && setConsultado(codigo)
            }
          />
          <Button
            size="lg"
            className="h-14 px-6"
            disabled={isFetching || codigo.length < 4}
            onClick={() => setConsultado(codigo)}
          >
            Verificar
          </Button>
        </div>
      </div>

      {consultado && !isFetching && (
        <Card className={`mt-8 border-2 ${data ? "border-primary" : "border-destructive"}`}>
          <CardContent className="p-8 text-center">
            {data ? (
              <>
                <BadgeCheck className="mx-auto h-14 w-14 text-primary" aria-hidden />
                <p className="mt-4 text-2xl font-bold">Certificado válido ✅</p>
                <p className="mt-3 text-lg">
                  <strong>{data.membroNome}</strong> concluiu o curso{" "}
                  <strong>{data.cursoTitulo}</strong> em{" "}
                  {new Date(data.createdAt).toLocaleDateString("pt-BR")}.
                </p>
              </>
            ) : (
              <>
                <SearchX className="mx-auto h-14 w-14 text-destructive" aria-hidden />
                <p className="mt-4 text-2xl font-bold">Código não encontrado</p>
                <p className="mt-3 text-lg text-muted-foreground">
                  Confira se o código foi digitado certinho, com letras e
                  números.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
