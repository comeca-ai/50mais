import { getDb } from "./connection";
import {
  spaces,
  lessonProgress,
  lessons,
  events,
  eventRsvps,
  messages,
  users,
  profiles,
  forumPosts,
  forumComments,
} from "@db/schema";
import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Espaços
// ---------------------------------------------------------------------------
export async function listSpaces() {
  const db = getDb();
  return db
    .select({
      id: spaces.id,
      nome: spaces.nome,
      descricao: spaces.descricao,
      ordem: spaces.ordem,
      acesso: spaces.acesso,
      postCount: sql<number>`(select count(*) from ${forumPosts} where ${forumPosts.spaceId} = ${spaces.id})`,
    })
    .from(spaces)
    .orderBy(asc(spaces.ordem));
}

export async function createSpace(data: {
  nome: string;
  descricao?: string;
  ordem: number;
  acesso: "publico" | "membros";
}) {
  const [row] = await getDb().insert(spaces).values(data).$returningId();
  return row;
}

export async function updateSpace(
  id: number,
  data: Partial<{
    nome: string;
    descricao: string;
    ordem: number;
    acesso: "publico" | "membros";
  }>,
) {
  await getDb().update(spaces).set(data).where(eq(spaces.id, id));
}

export async function deleteSpace(id: number) {
  const db = getDb();
  await db
    .update(forumPosts)
    .set({ spaceId: null })
    .where(eq(forumPosts.spaceId, id));
  await db.delete(spaces).where(eq(spaces.id, id));
}

// ---------------------------------------------------------------------------
// Progresso no curso
// ---------------------------------------------------------------------------
export async function myProgress(userId: number) {
  return getDb()
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
}

export async function setLessonDone(
  userId: number,
  lessonId: number,
  done: boolean,
) {
  const db = getDb();
  if (done) {
    const existing = await db
      .select({ id: lessonProgress.id })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId),
        ),
      );
    if (existing.length === 0) {
      await db.insert(lessonProgress).values({ userId, lessonId });
    }
  } else {
    await db
      .delete(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId),
        ),
      );
  }
}

export async function progressSummary(userId: number) {
  const db = getDb();
  const total = await db.select({ id: lessons.id }).from(lessons);
  const feitas = await myProgress(userId);
  return {
    total: total.length,
    concluidas: feitas.length,
    percentual:
      total.length === 0 ? 0 : Math.round((feitas.length / total.length) * 100),
  };
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------
export async function listEvents(userId?: number) {
  const db = getDb();
  const rows = await db
    .select({
      id: events.id,
      titulo: events.titulo,
      descricao: events.descricao,
      dataHora: events.dataHora,
      duracaoMin: events.duracaoMin,
      link: events.link,
      local: events.local,
      createdAt: events.createdAt,
      totalVou: sql<number>`(select count(*) from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id} and ${eventRsvps.status} = 'vou')`,
      totalTalvez: sql<number>`(select count(*) from ${eventRsvps} where ${eventRsvps.eventId} = ${events.id} and ${eventRsvps.status} = 'talvez')`,
    })
    .from(events)
    .orderBy(asc(events.dataHora));

  if (!userId) return rows.map((r) => ({ ...r, meuRsvp: null as string | null }));

  const meus = await db
    .select({ eventId: eventRsvps.eventId, status: eventRsvps.status })
    .from(eventRsvps)
    .where(eq(eventRsvps.userId, userId));
  const mapa = new Map(meus.map((m) => [m.eventId, m.status]));
  return rows.map((r) => ({ ...r, meuRsvp: mapa.get(r.id) ?? null }));
}

export async function createEvent(data: {
  titulo: string;
  descricao?: string;
  dataHora: Date;
  duracaoMin?: number;
  link?: string;
  local?: string;
  createdBy?: number;
}) {
  const [row] = await getDb().insert(events).values(data).$returningId();
  return row;
}

export async function deleteEvent(id: number) {
  const db = getDb();
  await db.delete(eventRsvps).where(eq(eventRsvps.eventId, id));
  await db.delete(events).where(eq(events.id, id));
}

export async function rsvp(
  eventId: number,
  userId: number,
  status: "vou" | "talvez" | "remover",
) {
  const db = getDb();
  if (status === "remover") {
    await db
      .delete(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
    return;
  }
  const existing = await db
    .select({ id: eventRsvps.id })
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
  if (existing.length > 0) {
    await db
      .update(eventRsvps)
      .set({ status })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));
  } else {
    await db.insert(eventRsvps).values({ eventId, userId, status });
  }
}

// ---------------------------------------------------------------------------
// Diretório de membros
// ---------------------------------------------------------------------------
export async function listMembers() {
  return getDb()
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      cidade: profiles.cidade,
      profissaoAtual: profiles.profissaoAtual,
      areaInteresse: profiles.areaInteresse,
      faixaEtaria: profiles.faixaEtaria,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(users.createdAt));
}

export async function getMember(id: number) {
  const [row] = await getDb()
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      createdAt: users.createdAt,
      cidade: profiles.cidade,
      profissaoAtual: profiles.profissaoAtual,
      areaInteresse: profiles.areaInteresse,
      faixaEtaria: profiles.faixaEtaria,
      objetivo: profiles.objetivo,
      experienciaTech: profiles.experienciaTech,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(users.id, id));
  return row ?? null;
}

export async function memberPosts(userId: number) {
  return getDb()
    .select({
      id: forumPosts.id,
      titulo: forumPosts.titulo,
      createdAt: forumPosts.createdAt,
    })
    .from(forumPosts)
    .where(eq(forumPosts.authorId, userId))
    .orderBy(desc(forumPosts.createdAt))
    .limit(5);
}

// ---------------------------------------------------------------------------
// Gamificação — pontos por atividade
// post = 10 | comentário = 5 | aula concluída = 15 | presença em evento = 3
// ---------------------------------------------------------------------------
export async function computePoints(userId: number): Promise<number> {
  const db = getDb();
  const [r] = await db
    .select({
      posts: sql<number>`(select count(*) from ${forumPosts} where ${forumPosts.authorId} = ${userId})`,
      comentarios: sql<number>`(select count(*) from ${forumComments} where ${forumComments.authorId} = ${userId})`,
      aulas: sql<number>`(select count(*) from ${lessonProgress} where ${lessonProgress.userId} = ${userId})`,
      presencas: sql<number>`(select count(*) from ${eventRsvps} where ${eventRsvps.userId} = ${userId})`,
    })
    .from(users)
    .where(eq(users.id, userId));
  if (!r) return 0;
  return (
    Number(r.posts) * 10 +
    Number(r.comentarios) * 5 +
    Number(r.aulas) * 15 +
    Number(r.presencas) * 3
  );
}

export function nivelDe(pontos: number) {
  if (pontos >= 600)
    return { nome: "Floresta", emoji: "🌳🌳", proximo: null as number | null };
  if (pontos >= 300) return { nome: "Árvore", emoji: "🌳", proximo: 600 };
  if (pontos >= 150) return { nome: "Arbusto", emoji: "🌿", proximo: 300 };
  if (pontos >= 50) return { nome: "Broto", emoji: "🌱", proximo: 150 };
  return { nome: "Semente", emoji: "🫘", proximo: 50 };
}

export async function leaderboard(limit = 20) {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      cidade: profiles.cidade,
      posts: sql<number>`(select count(*) from ${forumPosts} where ${forumPosts.authorId} = ${users.id})`,
      comentarios: sql<number>`(select count(*) from ${forumComments} where ${forumComments.authorId} = ${users.id})`,
      aulas: sql<number>`(select count(*) from ${lessonProgress} where ${lessonProgress.userId} = ${users.id})`,
      presencas: sql<number>`(select count(*) from ${eventRsvps} where ${eventRsvps.userId} = ${users.id})`,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId));

  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      cidade: r.cidade,
      pontos:
        Number(r.posts) * 10 +
        Number(r.comentarios) * 5 +
        Number(r.aulas) * 15 +
        Number(r.presencas) * 3,
    }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Mensagens diretas
// ---------------------------------------------------------------------------
export async function listConversations(userId: number) {
  const db = getDb();
  // última mensagem de cada conversa
  const msgs = await db
    .select()
    .from(messages)
    .where(or(eq(messages.deUserId, userId), eq(messages.paraUserId, userId)))
    .orderBy(desc(messages.createdAt));

  const porParceiro = new Map<
    number,
    { ultima: (typeof msgs)[number]; naoLidas: number }
  >();
  for (const m of msgs) {
    const parceiro = m.deUserId === userId ? m.paraUserId : m.deUserId;
    const atual = porParceiro.get(parceiro);
    const naoLida = m.paraUserId === userId && !m.lidaEm ? 1 : 0;
    if (!atual) {
      porParceiro.set(parceiro, { ultima: m, naoLidas: naoLida });
    } else {
      atual.naoLidas += naoLida;
    }
  }

  if (porParceiro.size === 0) return [];

  const parceiros = await db
    .select({ id: users.id, name: users.name, avatar: users.avatar })
    .from(users)
    .where(ne(users.id, userId));
  const mapaUsers = new Map(parceiros.map((u) => [u.id, u]));

  return Array.from(porParceiro.entries())
    .map(([parceiroId, info]) => ({
      parceiroId,
      parceiroNome: mapaUsers.get(parceiroId)?.name ?? "Membro",
      parceiroAvatar: mapaUsers.get(parceiroId)?.avatar ?? null,
      ultimaMensagem: info.ultima.conteudo,
      enviadaPorMim: info.ultima.deUserId === userId,
      dataHora: info.ultima.createdAt,
      naoLidas: info.naoLidas,
    }))
    .sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
}

export async function listThread(userId: number, parceiroId: number) {
  const db = getDb();
  const thread = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.deUserId, userId), eq(messages.paraUserId, parceiroId)),
        and(eq(messages.deUserId, parceiroId), eq(messages.paraUserId, userId)),
      ),
    )
    .orderBy(asc(messages.createdAt));

  // marca como lidas as mensagens recebidas desse parceiro
  await db
    .update(messages)
    .set({ lidaEm: new Date() })
    .where(
      and(
        eq(messages.deUserId, parceiroId),
        eq(messages.paraUserId, userId),
        sql`${messages.lidaEm} is null`,
      ),
    );

  return thread;
}

export async function sendMessage(
  deUserId: number,
  paraUserId: number,
  conteudo: string,
) {
  const [row] = await getDb()
    .insert(messages)
    .values({ deUserId, paraUserId, conteudo })
    .$returningId();
  return row;
}

export async function unreadCount(userId: number) {
  const db = getDb();
  const rows = await db
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.paraUserId, userId), sql`${messages.lidaEm} is null`));
  return rows.length;
}
