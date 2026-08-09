/**
 * Busca em texto completo (Postgres, idioma português).
 */
import { requireDb } from "./connection";
import { posts, lessons, modules, users, profiles } from "@db/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export async function buscar(termo: string) {
  const db = requireDb();
  const q = termo.trim();
  if (q.length < 2) return { publicacoes: [], aulas: [], membros: [] };

  // plainto_tsquery trata o texto digitado como frase simples (seguro, sem sintaxe especial)
  const tsq = sql`plainto_tsquery('portuguese', ${q})`;

  const publicacoes = await db
    .select({
      id: posts.id,
      titulo: posts.titulo,
      conteudo: posts.conteudo,
      authorName: users.name,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(
      and(
        isNull(posts.deletedAt),
        sql`to_tsvector('portuguese', ${posts.titulo} || ' ' || ${posts.conteudo}) @@ ${tsq}`,
      ),
    )
    .orderBy(
      desc(
        sql`ts_rank(to_tsvector('portuguese', ${posts.titulo} || ' ' || ${posts.conteudo}), ${tsq})`,
      ),
    )
    .limit(10);

  const aulas = await db
    .select({
      id: lessons.id,
      titulo: lessons.titulo,
      descricao: lessons.descricao,
      modulo: modules.titulo,
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(
      and(
        eq(lessons.publicada, true),
        sql`to_tsvector('portuguese', ${lessons.titulo} || ' ' || coalesce(${lessons.descricao}, '')) @@ ${tsq}`,
      ),
    )
    .limit(10);

  const membros = await db
    .select({
      id: users.id,
      name: users.name,
      cidade: profiles.cidade,
      profissaoAtual: profiles.profissaoAtual,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(
      and(
        isNull(users.deletedAt),
        sql`to_tsvector('portuguese', coalesce(${users.name}, '') || ' ' || coalesce(${profiles.profissaoAtual}, '') || ' ' || coalesce(${profiles.cidade}, '') || ' ' || coalesce(${profiles.podeEnsinar}, '')) @@ ${tsq}`,
      ),
    )
    .limit(10);

  return { publicacoes, aulas, membros };
}
