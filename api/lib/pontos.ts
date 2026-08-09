import { requireDb } from "../queries/connection";
import { pointsLedger } from "@db/schema";
import { eq, sql } from "drizzle-orm";

export const PONTOS = {
  post: 10,
  comentario: 5,
  aulaConcluida: 15,
  presencaEvento: 3,
} as const;

/** Registra pontos no razão (append-only). O saldo é sempre derivado. */
export async function registrarPontos(
  userId: number,
  acao: keyof typeof PONTOS,
  refTipo?: string,
  refId?: number,
) {
  try {
    await requireDb()
      .insert(pointsLedger)
      .values({ userId, acao, pontos: PONTOS[acao], refTipo, refId });
  } catch (err) {
    console.error("Falha ao registrar pontos:", err);
  }
}

export async function saldoPontos(userId: number): Promise<number> {
  const [r] = await requireDb()
    .select({
      total: sql<number>`coalesce(sum(${pointsLedger.pontos}), 0)`,
    })
    .from(pointsLedger)
    .where(eq(pointsLedger.userId, userId));
  return Number(r?.total ?? 0);
}

export function nivelDe(pontos: number) {
  if (pontos >= 600)
    return { nome: "Referência", emoji: "🌳🌳", proximo: null as number | null };
  if (pontos >= 300) return { nome: "Ajudando", emoji: "🌳", proximo: 600 };
  if (pontos >= 150) return { nome: "Praticando", emoji: "🌿", proximo: 300 };
  if (pontos >= 50) return { nome: "Chegando", emoji: "🌱", proximo: 150 };
  return { nome: "Semente", emoji: "🫘", proximo: 50 };
}
