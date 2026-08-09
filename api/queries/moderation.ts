/**
 * Denúncias, ações de moderação e trilha de auditoria.
 */
import { requireDb, getDb } from "./connection";
import { reports, moderationActions, auditLog, users } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export async function denunciar(
  reporterId: number,
  alvo: { postId?: number; commentId?: number; messageId?: number; reportedUserId?: number },
  motivo: string,
) {
  await requireDb().insert(reports).values({
    reporterId,
    postId: alvo.postId,
    commentId: alvo.commentId,
    messageId: alvo.messageId,
    reportedUserId: alvo.reportedUserId,
    motivo,
  });
}

export async function listReports(status?: "aberto" | "resolvido" | "descartado") {
  const db = requireDb();
  const base = db
    .select({
      id: reports.id,
      motivo: reports.motivo,
      status: reports.status,
      postId: reports.postId,
      commentId: reports.commentId,
      messageId: reports.messageId,
      reportedUserId: reports.reportedUserId,
      createdAt: reports.createdAt,
      reporterNome: users.name,
    })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .orderBy(desc(reports.createdAt));
  if (status) return base.where(eq(reports.status, status));
  return base;
}

export async function setReportStatus(
  id: number,
  status: "resolvido" | "descartado",
  moderatorId: number,
  motivo?: string,
) {
  const db = requireDb();
  await db.update(reports).set({ status }).where(eq(reports.id, id));
  await db.insert(moderationActions).values({
    moderatorId,
    acao: status === "resolvido" ? "resolver_denuncia" : "descartar_denuncia",
    alvoTipo: "report",
    alvoId: id,
    motivo,
  });
}

/** Registro de auditoria — nunca lança erro. */
export async function auditar(
  userId: number,
  acao: string,
  detalhe?: Record<string, unknown>,
) {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(auditLog).values({
      userId,
      acao,
      detalhe: detalhe ? JSON.stringify(detalhe) : undefined,
    });
  } catch (e) {
    console.error("[auditar] falhou:", String(e).slice(0, 200));
  }
}
