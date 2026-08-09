import { requireDb } from "./connection";
import { profiles } from "@db/schema";
import { eq } from "drizzle-orm";

export async function getProfileByUser(userId: number) {
  const [row] = await requireDb()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));
  return row ?? null;
}

export async function upsertProfile(
  userId: number,
  data: {
    faixaEtaria?: "45-49" | "50-54" | "55-59" | "60-64" | "65+";
    cidade?: string;
    profissaoAtual?: string;
    areaInteresse?: string;
    objetivoTipo?: "recolocacao" | "freelance" | "empreender" | "curiosidade";
    objetivo?: string;
    experienciaTech?: "iniciante" | "basico" | "intermediario" | "avancado";
    disponivelParaVagas?: boolean;
    bio?: string;
    podeEnsinar?: string;
    estaAprendendo?: string;
    links?: string;
    concluido?: boolean;
  },
) {
  const db = requireDb();
  const existente = await getProfileByUser(userId);
  if (existente) {
    await db.update(profiles).set(data).where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, ...data });
  }
  return getProfileByUser(userId);
}

export async function countProfiles() {
  const rows = await requireDb()
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.concluido, true));
  return rows.length;
}
