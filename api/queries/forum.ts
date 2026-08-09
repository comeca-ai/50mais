import { getDb } from "./connection";
import { forumPosts, forumComments, spaces, users } from "@db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function listPosts(spaceId?: number) {
  const db = getDb();
  const base = db
    .select({
      id: forumPosts.id,
      categoria: forumPosts.categoria,
      titulo: forumPosts.titulo,
      conteudo: forumPosts.conteudo,
      createdAt: forumPosts.createdAt,
      authorId: forumPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
      spaceId: forumPosts.spaceId,
      spaceNome: spaces.nome,
      commentCount: sql<number>`(select count(*) from ${forumComments} where ${forumComments.postId} = ${forumPosts.id})`,
    })
    .from(forumPosts)
    .leftJoin(users, eq(forumPosts.authorId, users.id))
    .leftJoin(spaces, eq(forumPosts.spaceId, spaces.id))
    .orderBy(desc(forumPosts.createdAt));

  if (spaceId) {
    return base.where(eq(forumPosts.spaceId, spaceId));
  }
  return base;
}

export async function getPost(id: number) {
  const db = getDb();
  const [post] = await db
    .select({
      id: forumPosts.id,
      categoria: forumPosts.categoria,
      titulo: forumPosts.titulo,
      conteudo: forumPosts.conteudo,
      createdAt: forumPosts.createdAt,
      authorId: forumPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(forumPosts)
    .leftJoin(users, eq(forumPosts.authorId, users.id))
    .where(eq(forumPosts.id, id));
  return post ?? null;
}

export async function listComments(postId: number) {
  return getDb()
    .select({
      id: forumComments.id,
      conteudo: forumComments.conteudo,
      createdAt: forumComments.createdAt,
      authorId: forumComments.authorId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(forumComments)
    .leftJoin(users, eq(forumComments.authorId, users.id))
    .where(eq(forumComments.postId, postId))
    .orderBy(forumComments.createdAt);
}

export async function createPost(data: {
  authorId: number;
  categoria: "duvidas" | "experiencias" | "oportunidades" | "geral";
  titulo: string;
  conteudo: string;
}) {
  const [row] = await getDb().insert(forumPosts).values(data).$returningId();
  return row;
}

export async function createComment(data: {
  postId: number;
  authorId: number;
  conteudo: string;
}) {
  const [row] = await getDb().insert(forumComments).values(data).$returningId();
  return row;
}

export async function deletePost(id: number) {
  const db = getDb();
  await db.delete(forumComments).where(eq(forumComments.postId, id));
  await db.delete(forumPosts).where(eq(forumPosts.id, id));
}
