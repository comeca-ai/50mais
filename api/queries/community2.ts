import { requireDb } from "./connection";
import {
  spaces,
  lessonProgress,
  lessons,
  events,
  eventRsvps,
  messages,
  users,
  profiles,
  posts,
  pointsLedger,
} from "@db/schema";
import { and, asc, desc, eq, isNull, ne, or, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Espaços
// ---------------------------------------------------------------------------
export async function listSpaces() {
  return requireDb()
    .select({
      id: spaces.id,
      nome: spaces.nome,
      descricao: spaces.descricao,
      icone: spaces.icone,
      ordem: spaces.ordem,
      tipo: spaces.tipo,
      formato: spaces.formato,
      postCount: sql<number>`(select count(*) from ${posts} where ${posts.spaceId} = ${spaces.id} and ${posts.deletedAt} is null)`,
    })
    .from(spaces)
    .where(isNull(spaces.deletedAt))
    .orderBy(asc(spaces.ordem));
}

export async function createSpace(data: {
  nome: string;
  descricao?: string;
  icone?: string;
  ordem: number;
  tipo: "publicado" | "membros" | "convite";
  formato?: "forum" | "curso" | "eventos" | "chat" | "links";
}) {
  const [row] = await requireDb().insert(spaces).values(data).returning();
  return row;
}

export async function updateSpace(
  id: number,
  data: Partial<{
    nome: string;
    descricao: string;
    icone: string;
    ordem: number;
    tipo: "publicado" | "membros" | "convite";
  }>,
) {
  await requireDb().update(spaces).set(data).where(eq(spaces.id, id));
}

export async function deleteSpace(id: number) {
  // Exclusão lógica: publicações são mantidas sem espaço
  const db = requireDb();
  await db.update(posts).set({ spaceId: null }).where(eq(posts.spaceId, id));
  await db
    .update(spaces)
    .set({ deletedAt: new Date() })
    .where(eq(spaces.id, id));
}

// ---------------------------------------------------------------------------
// Progresso no curso
// ---------------------------------------------------------------------------
export async function myProgress(userId: number) {
  return requireDb()
    .select({
      lessonId: lessonProgress.lessonId,
      status: lessonProgress.status,
    })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
}

export async function setLessonStatus(
  userId: number,
  lessonId: number,
  status: "nao_iniciado" | "assistindo" | "concluido",
) {
  const db = requireDb();
  const [existente] = await db
    .select({ id: lessonProgress.id })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    );
  if (status === "nao_iniciado") {
    if (existente) {
      await db
        .delete(lessonProgress)
        .where(eq(lessonProgress.id, existente.id));
    }
    return;
  }
  if (existente) {
    await db
      .update(lessonProgress)
      .set({ status })
      .where(eq(lessonProgress.id, existente.id));
  } else {
    await db.insert(lessonProgress).values({ userId, lessonId, status });
  }
}

export async function progressSummary(userId: number) {
  const db = requireDb();
  const total = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.publicada, true));
  const feitas = await db
    .select({ id: lessonProgress.id })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.status, "concluido"),
      ),
    );
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
  const db = requireDb();
  const rows = await db
    .select({
      id: events.id,
      titulo: events.titulo,
      descricao: events.descricao,
      dataHora: events.dataHora,
      duracaoMin: events.duracaoMin,
      link: events.link,
      local: events.local,
      limiteVagas: events.limiteVagas,
      gravacaoUrl: events.gravacaoUrl,
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
  limiteVagas?: number;
  recorrencia?: string;
  createdBy?: number;
}) {
  const [row] = await requireDb().insert(events).values(data).returning();
  return row;
}

export async function deleteEvent(id: number) {
  const db = requireDb();
  await db.delete(eventRsvps).where(eq(eventRsvps.eventId, id));
  await db.delete(events).where(eq(events.id, id));
}

export async function rsvp(
  eventId: number,
  userId: number,
  status: "vou" | "talvez" | "nao_vou" | "remover",
) {
  const db = requireDb();
  const [existente] = await db
    .select({ id: eventRsvps.id })
    .from(eventRsvps)
    .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)));

  if (status === "remover") {
    if (existente) {
      await db.delete(eventRsvps).where(eq(eventRsvps.id, existente.id));
    }
    return { lotado: false };
  }

  // Respeita limite de vagas
  const [ev] = await db
    .select({ limiteVagas: events.limiteVagas })
    .from(events)
    .where(eq(events.id, eventId));
  if (status === "vou" && ev?.limiteVagas) {
    const [c] = await db
      .select({ n: sql<number>`count(*)` })
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.status, "vou")));
    if (!existente && Number(c.n) >= ev.limiteVagas) {
      return { lotado: true };
    }
  }

  if (existente) {
    await db
      .update(eventRsvps)
      .set({ status })
      .where(eq(eventRsvps.id, existente.id));
  } else {
    await db.insert(eventRsvps).values({ eventId, userId, status });
  }
  return { lotado: false };
}

// ---------------------------------------------------------------------------
// Diretório de membros (com filtros)
// ---------------------------------------------------------------------------
export async function listMembers(filtros?: {
  cidade?: string;
  objetivo?: string;
}) {
  const db = requireDb();
  const condicoes = [isNull(users.deletedAt)];
  if (filtros?.cidade) {
    condicoes.push(sql`lower(${profiles.cidade}) like ${"%" + filtros.cidade.toLowerCase() + "%"}`);
  }
  if (filtros?.objetivo) {
    condicoes.push(
      sql`${profiles.objetivoTipo} = ${filtros.objetivo}`,
    );
  }
  return db
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      cidade: profiles.cidade,
      profissaoAtual: profiles.profissaoAtual,
      areaInteresse: profiles.areaInteresse,
      faixaEtaria: profiles.faixaEtaria,
      objetivoTipo: profiles.objetivoTipo,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(...condicoes))
    .orderBy(desc(users.createdAt));
}

export async function getMember(id: number) {
  const [row] = await requireDb()
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      createdAt: users.createdAt,
      cidade: profiles.cidade,
      profissaoAtual: profiles.profissaoAtual,
      areaInteresse: profiles.areaInteresse,
      faixaEtaria: profiles.faixaEtaria,
      objetivoTipo: profiles.objetivoTipo,
      objetivo: profiles.objetivo,
      bio: profiles.bio,
      podeEnsinar: profiles.podeEnsinar,
      estaAprendendo: profiles.estaAprendendo,
      experienciaTech: profiles.experienciaTech,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(users.id, id), isNull(users.deletedAt)));
  return row ?? null;
}

export async function memberPosts(userId: number) {
  return requireDb()
    .select({
      id: posts.id,
      titulo: posts.titulo,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(and(eq(posts.authorId, userId), isNull(posts.deletedAt)))
    .orderBy(desc(posts.createdAt))
    .limit(5);
}

// ---------------------------------------------------------------------------
// Gamificação — saldo derivado do razão (append-only)
// ---------------------------------------------------------------------------
export async function leaderboard(limit = 20) {
  const db = requireDb();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      avatar: users.avatar,
      cidade: profiles.cidade,
      pontos: sql<number>`coalesce((select sum(${pointsLedger.pontos}) from ${pointsLedger} where ${pointsLedger.userId} = ${users.id}), 0)`,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(isNull(users.deletedAt));

  return rows
    .map((r) => ({ ...r, pontos: Number(r.pontos) }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Mensagens diretas
// ---------------------------------------------------------------------------
export async function listConversations(userId: number) {
  const db = requireDb();
  const msgs = await db
    .select()
    .from(messages)
    .where(
      and(
        or(eq(messages.deUserId, userId), eq(messages.paraUserId, userId)),
        isNull(messages.deletedAt),
      ),
    )
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
  const db = requireDb();
  const thread = await db
    .select()
    .from(messages)
    .where(
      and(
        or(
          and(eq(messages.deUserId, userId), eq(messages.paraUserId, parceiroId)),
          and(eq(messages.deUserId, parceiroId), eq(messages.paraUserId, userId)),
        ),
        isNull(messages.deletedAt),
      ),
    )
    .orderBy(asc(messages.createdAt));

  await db
    .update(messages)
    .set({ lidaEm: new Date() })
    .where(
      and(
        eq(messages.deUserId, parceiroId),
        eq(messages.paraUserId, userId),
        isNull(messages.lidaEm),
      ),
    );

  return thread;
}

export async function sendMessage(
  deUserId: number,
  paraUserId: number,
  conteudo: string,
) {
  const [row] = await requireDb()
    .insert(messages)
    .values({ deUserId, paraUserId, conteudo })
    .returning();
  return row;
}

export async function unreadCount(userId: number) {
  const rows = await requireDb()
    .select({ id: messages.id })
    .from(messages)
    .where(
      and(
        eq(messages.paraUserId, userId),
        isNull(messages.lidaEm),
        isNull(messages.deletedAt),
      ),
    );
  return rows.length;
}
