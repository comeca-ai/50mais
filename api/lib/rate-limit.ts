import { TRPCError } from "@trpc/server";

/**
 * Rate limit simples em memória (por instância).
 * Suficiente para o estágio atual; se escalar para múltiplas instâncias,
 * trocar por armazenamento compartilhado (Redis).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(opts: {
  chave: string;
  limite: number;
  janelaMs: number;
}): boolean {
  const agora = Date.now();
  const b = buckets.get(opts.chave);
  if (!b || b.resetAt < agora) {
    buckets.set(opts.chave, { count: 1, resetAt: agora + opts.janelaMs });
    return true;
  }
  if (b.count >= opts.limite) return false;
  b.count += 1;
  return true;
}

export function ipDe(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "desconhecido"
  );
}

/** Versão que lança erro amigável quando estoura o limite. */
export function limitar(opts: {
  chave: string;
  limite: number;
  janelaMs: number;
  mensagem?: string;
}): void {
  if (!rateLimit(opts)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        opts.mensagem ??
        "Muitas tentativas seguidas. Aguarde um pouquinho e tente de novo com calma.",
    });
  }
}
