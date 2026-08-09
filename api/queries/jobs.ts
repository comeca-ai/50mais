import { requireDb } from "./connection";
import { jobs, applications, companies, users, profiles } from "@db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function listActiveJobs() {
  return requireDb()
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
  faixaSalarial?: string;
  requisitos?: string;
  etariaFriendly?: boolean;
  contato?: string;
  createdBy?: number;
}) {
  const [row] = await requireDb().insert(jobs).values(data).returning();
  return row;
}

export async function setJobActive(id: number, ativa: boolean) {
  await requireDb().update(jobs).set({ ativa }).where(eq(jobs.id, id));
}

export async function deleteJob(id: number) {
  const db = requireDb();
  await db.delete(applications).where(eq(applications.jobId, id));
  await db.delete(jobs).where(eq(jobs.id, id));
}

export async function applyToJob(data: {
  jobId: number;
  userId: number;
  mensagem?: string;
  curriculoUrl?: string;
}) {
  const db = requireDb();
  const existing = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.jobId, data.jobId),
        eq(applications.userId, data.userId),
      ),
    );
  if (existing.length > 0) return { already: true };
  await db.insert(applications).values(data);
  return { already: false };
}

export async function listApplicationsForJob(jobId: number) {
  return requireDb()
    .select({
      id: applications.id,
      mensagem: applications.mensagem,
      curriculoUrl: applications.curriculoUrl,
      status: applications.status,
      createdAt: applications.createdAt,
      userName: users.name,
      userEmail: users.email,
      cidade: profiles.cidade,
      profissaoAtual: profiles.profissaoAtual,
      faixaEtaria: profiles.faixaEtaria,
    })
    .from(applications)
    .leftJoin(users, eq(applications.userId, users.id))
    .leftJoin(profiles, eq(applications.userId, profiles.userId))
    .where(eq(applications.jobId, jobId))
    .orderBy(desc(applications.createdAt));
}

export async function setApplicationStatus(
  id: number,
  status: "enviada" | "vista" | "conversa" | "encerrada",
) {
  await requireDb()
    .update(applications)
    .set({ status })
    .where(eq(applications.id, id));
}

export async function listMyApplications(userId: number) {
  return requireDb()
    .select({
      id: applications.id,
      jobId: applications.jobId,
      status: applications.status,
      createdAt: applications.createdAt,
      titulo: jobs.titulo,
      empresa: jobs.empresa,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt));
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
  const [row] = await requireDb().insert(companies).values(data).returning();
  return row;
}

export async function listCompanies() {
  return requireDb()
    .select()
    .from(companies)
    .orderBy(desc(companies.createdAt));
}

export async function setCompanyStatus(
  id: number,
  status: "pendente" | "aprovada",
) {
  await requireDb()
    .update(companies)
    .set({ status })
    .where(eq(companies.id, id));
}
