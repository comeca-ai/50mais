import { requireDb } from "./connection";
import { posts, comments, reactions, spaces, users } from "@db/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export type OrdemFeed = "recentes" | "comentados";

const COMENTARIOS_SUB = sql<number>`(select count(*) from ${comments} where ${comments.postId} = ${posts.id} and ${comments.deletedAt} is null)`;

export async function listPosts(spaceId?: number, ordem: OrdemFeed = "recentes") {
  const db = requireDb();
  const condicoes = [isNull(posts.deletedAt)];
  if (spaceId) condicoes.push(eq(posts.spaceId, spaceId));

  return db
    .select({
      id: posts.id,
      titulo: posts.titulo,
      conteudo: posts.conteudo,
      fixado: posts.fixado,
      resolvido: posts.resolvido,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
      spaceId: posts.spaceId,
      spaceNome: spaces.nome,
      commentCount: COMENTARIOS_SUB,
      reactionCount: sql<number>`(select count(*) from ${reactions} where ${reactions.postId} = ${posts.id})`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(spaces, eq(posts.spaceId, spaces.id))
    .where(and(...condicoes))
    .orderBy(
      desc(posts.fixado),
      ...(ordem === "comentados" ? [desc(COMENTARIOS_SUB)] : []),
      desc(posts.createdAt),
    );
}

export async function getPost(id: number) {
  const [post] = await requireDb()
    .select({
      id: posts.id,
      titulo: posts.titulo,
      conteudo: posts.conteudo,
      fixado: posts.fixado,
      resolvido: posts.resolvido,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
      spaceId: posts.spaceId,
      spaceNome: spaces.nome,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(spaces, eq(posts.spaceId, spaces.id))
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)));
  return post ?? null;
}

export async function listComments(postId: number) {
  return requireDb()
    .select({
      id: comments.id,
      parentId: comments.parentId,
      conteudo: comments.conteudo,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(and(eq(comments.postId, postId), isNull(comments.deletedAt)))
    .orderBy(comments.createdAt);
}

export async function createPost(data: {
  authorId: number;
  spaceId?: number;
  titulo: string;
  conteudo: string;
}) {
  const [row] = await requireDb().insert(posts).values(data).returning();
  return row;
}

export async function createComment(data: {
  postId: number;
  parentId?: number;
  authorId: number;
  conteudo: string;
}) {
  const [row] = await requireDb().insert(comments).values(data).returning();
  return row;
}

/** Exclusão lógica (LGPD/moderação) */
export async function deletePost(id: number) {
  await requireDb()
    .update(posts)
    .set({ deletedAt: new Date() })
    .where(eq(posts.id, id));
}

export async function setPostFlags(
  id: number,
  data: Partial<{ fixado: boolean; resolvido: boolean }>,
) {
  await requireDb().update(posts).set(data).where(eq(posts.id, id));
}

// ---------------------------------------------------------------------------
// Reações
// ---------------------------------------------------------------------------
export async function toggleReaction(data: {
  postId?: number;
  commentId?: number;
  userId: number;
  tipo: "curtir" | "aplaudir" | "coracao" | "ideia";
}) {
  const db = requireDb();
  const where = and(
    data.postId ? eq(reactions.postId, data.postId) : isNull(reactions.postId),
    data.commentId
      ? eq(reactions.commentId, data.commentId)
      : isNull(reactions.commentId),
    eq(reactions.userId, data.userId),
    eq(reactions.tipo, data.tipo),
  );
  const existente = await db.select({ id: reactions.id }).from(reactions).where(where);
  if (existente.length > 0) {
    await db.delete(reactions).where(eq(reactions.id, existente[0].id));
    return { ativa: false };
  }
  await db.insert(reactions).values(data);
  return { ativa: true };
}

export async function listReactions(postId: number, userId?: number) {
  const db = requireDb();
  const rows = await db
    .select({ tipo: reactions.tipo, userId: reactions.userId })
    .from(reactions)
    .where(eq(reactions.postId, postId));

  const contagem: Record<string, number> = {};
  const minhas: string[] = [];
  for (const r of rows) {
    contagem[r.tipo] = (contagem[r.tipo] ?? 0) + 1;
    if (userId && r.userId === userId) minhas.push(r.tipo);
  }
  return { contagem, minhas };
}
