import { getDb } from "./queries/connection";
import { users, sessions, type User } from "@db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { readSessionCookie, verifySession } from "./auth/session";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  sessionId?: number;
};

export async function createContext(opts: {
  req: Request;
  resHeaders: Headers;
}): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  const token = readSessionCookie(opts.req.headers.get("cookie"));
  if (!token) return ctx;

  const payload = await verifySession(token);
  if (!payload) return ctx;

  const db = getDb();
  if (!db) return ctx;

  try {
    // Sessão precisa existir e não estar expirada (permite "sair de tudo")
    const [sessao] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(
        and(eq(sessions.id, payload.sid), gt(sessions.expiresAt, new Date())),
      );
    if (!sessao) return ctx;

    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, payload.uid), isNull(users.deletedAt)));
    if (user) {
      ctx.user = user;
      ctx.sessionId = payload.sid;
    }
  } catch (err) {
    console.error("Falha ao resolver sessão:", err);
  }
  return ctx;
}
