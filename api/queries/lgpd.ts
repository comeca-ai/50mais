/**
 * LGPD: exportação completa dos dados do membro e exclusão da conta.
 */
import { requireDb } from "./connection";
import {
  users,
  profiles,
  sessions,
  emailTokens,
  posts,
  comments,
  reactions,
  messages,
  lessonProgress,
  quizAttempts,
  certificates,
  eventRsvps,
  applications,
  pointsLedger,
  notifications,
  notificationPrefs,
  follows,
  spaceMembers,
} from "@db/schema";
import { eq } from "drizzle-orm";

/** Junta TUDO o que o banco guarda sobre o membro. */
export async function exportarDados(userId: number) {
  const db = requireDb();

  const [usuario] = await db.select().from(users).where(eq(users.id, userId));
  const [perfil] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  const publicacoes = await db.select().from(posts).where(eq(posts.authorId, userId));
  const comentarios = await db.select().from(comments).where(eq(comments.authorId, userId));
  const reacoes = await db.select().from(reactions).where(eq(reactions.userId, userId));
  const mensagensEnviadas = await db.select().from(messages).where(eq(messages.deUserId, userId));
  const mensagensRecebidas = await db.select().from(messages).where(eq(messages.paraUserId, userId));
  const progresso = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
  const tentativas = await db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId));
  const certificados = await db.select().from(certificates).where(eq(certificates.userId, userId));
  const presencas = await db.select().from(eventRsvps).where(eq(eventRsvps.userId, userId));
  const candidaturas = await db.select().from(applications).where(eq(applications.userId, userId));
  const pontos = await db.select().from(pointsLedger).where(eq(pointsLedger.userId, userId));
  const avisos = await db.select().from(notifications).where(eq(notifications.userId, userId));
  const [preferencias] = await db.select().from(notificationPrefs).where(eq(notificationPrefs.userId, userId));
  const seguindo = await db.select().from(follows).where(eq(follows.deUserId, userId));
  const espacos = await db.select().from(spaceMembers).where(eq(spaceMembers.userId, userId));

  return {
    exportadoEm: new Date().toISOString(),
    conta: usuario
      ? {
          email: usuario.email,
          nome: usuario.name,
          papel: usuario.role,
          plano: usuario.plano,
          criadoEm: usuario.createdAt,
          aceitouTermosEm: usuario.aceitouTermosEm,
        }
      : null,
    perfil,
    publicacoes,
    comentarios,
    reacoes,
    mensagensEnviadas,
    mensagensRecebidas,
    progressoNoCurso: progresso,
    avaliacoes: tentativas,
    certificados,
    presencasEmEventos: presencas,
    candidaturas,
    historicoDePontos: pontos,
    notificacoes: avisos,
    preferenciasDeNotificacao: preferencias ?? null,
    seguindo,
    espacos,
  };
}

/**
 * Exclusão lógica: a conta sai do ar imediatamente (login bloqueado,
 * nome some das listas), sessões e códigos de e-mail são apagados.
 */
export async function excluirConta(userId: number) {
  const db = requireDb();
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(emailTokens).where(
    eq(
      emailTokens.email,
      (await db.select({ email: users.email }).from(users).where(eq(users.id, userId)))[0]?.email ?? "",
    ),
  );
  await db.delete(profiles).where(eq(profiles.userId, userId));
  await db
    .update(users)
    .set({
      name: "Conta excluída",
      avatar: null,
      passwordHash: null,
      deletedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
