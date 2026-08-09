import { getDb } from "./connection";
import { jobs, jobInterests, companies, users, profiles } from "@db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function listActiveJobs() {
  return getDb()
    .select()
    .from(jobs)
    .where(eq(jobs.ativa, true))
    .orderBy(desc(jobs.createdAt));
}

export async function createJob(data: {
  titulo: string;
  empresa: string;
  descricao: string;
  local?: string;
  modelo: "presencial" | "hibrido" | "remoto";
  contato?: string;
  createdBy?: number;
}) {
  const [row] = await getDb().insert(jobs).values(data).$returningId();
  return row;
}

export async function setJobActive(id: number, ativa: boolean) {
  await getDb().update(jobs).set({ ativa }).where(eq(jobs.id, id));
}

export async function deleteJob(id: number) {
  const db = getDb();
  await db.delete(jobInterests).where(eq(jobInterests.jobId, id));
  await db.delete(jobs).where(eq(jobs.id, id));
}

export async function expressInterest(data: {
  jobId: number;
  userId: number;
  mensagem?: string;
}) {
  const db = getDb();
  const existing = await db
    .select()
    .from(jobInterests)
    .where(
      and(
        eq(jobInterests.jobId, data.jobId),
        eq(jobInterests.userId, data.userId),
      ),
    );
  if (existing.length > 0) return { already: true };
  await db.insert(jobInterests).values(data);
  return { already: false };
}

export async function listInterestsForJob(jobId: number) {
  return getDb()
    .select({
      id: jobInterests.id,
      mensagem: jobInterests.mensagem,
      createdAt: jobInterests.createdAt,
      userName: users.name,
      userEmail: users.email,
      cidade: profiles.cidade,
      profissaoAtual: profiles.profissaoAtual,
      faixaEtaria: profiles.faixaEtaria,
    })
    .from(jobInterests)
    .leftJoin(users, eq(jobInterests.userId, users.id))
    .leftJoin(profiles, eq(jobInterests.userId, profiles.userId))
    .where(eq(jobInterests.jobId, jobId))
    .orderBy(desc(jobInterests.createdAt));
}

export async function listMyInterests(userId: number) {
  return getDb()
    .select({ jobId: jobInterests.jobId })
    .from(jobInterests)
    .where(eq(jobInterests.userId, userId));
}

// ---------------------------------------------------------------------------
// Empresas parceiras
// ---------------------------------------------------------------------------
export async function registerCompany(data: {
  nome: string;
  contatoNome: string;
  email: string;
  segmento?: string;
  descricao?: string;
}) {
  const [row] = await getDb().insert(companies).values(data).$returningId();
  return row;
}

export async function listCompanies() {
  return getDb().select().from(companies).orderBy(desc(companies.createdAt));
}

export async function setCompanyStatus(
  id: number,
  status: "pendente" | "aprovada",
) {
  await getDb().update(companies).set({ status }).where(eq(companies.id, id));
}
