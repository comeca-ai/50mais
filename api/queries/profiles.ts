import { getDb } from "./connection";
import { profiles } from "@db/schema";
import { eq } from "drizzle-orm";

export async function getProfileByUser(userId: number) {
  const [row] = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
  return row ?? null;
}

export async function upsertProfile(
  userId: number,
  data: {
    faixaEtaria: "45-49" | "50-54" | "55-59" | "60-64" | "65+";
    cidade?: string;
    profissaoAtual?: string;
    areaInteresse?: string;
    objetivo?: string;
    experienciaTech: "iniciante" | "basico" | "intermediario" | "avancado";
    disponivelParaVagas: boolean;
  },
) {
  await getDb()
    .insert(profiles)
    .values({ userId, ...data, concluido: true })
    .onDuplicateKeyUpdate({ set: { ...data, concluido: true } });
  return getProfileByUser(userId);
}

export async function countProfiles() {
  const rows = await getDb().select({ id: profiles.id }).from(profiles);
  return rows.length;
}
