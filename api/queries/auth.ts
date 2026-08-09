import { requireDb } from "./connection";
import { users, sessions, emailTokens, type User } from "@db/schema";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { SESSION_MAX_AGE_MS } from "../auth/session";
import { env } from "../lib/env";

export async function findUserByEmail(email: string): Promise<User | null> {
  const [u] = await requireDb()
    .select()
    .from(users)
    .where(and(eq(users.email, email.toLowerCase()), isNull(users.deletedAt)));
  return u ?? null;
}

export async function createUser(data: {
  email: string;
  name?: string;
  passwordHash?: string;
  aceitouTermos?: boolean;
}): Promise<User> {
  const email = data.email.toLowerCase();
  const role = email === env.ownerEmail && env.ownerEmail ? "admin" : "membro";
  const [u] = await requireDb()
    .insert(users)
    .values({
      email,
      name: data.name ?? null,
      passwordHash: data.passwordHash ?? null,
      role,
      aceitouTermosEm: data.aceitouTermos ? new Date() : null,
    })
    .returning();
  return u;
}

export async function markEmailVerified(userId: number) {
  await requireDb()
    .update(users)
    .set({ emailVerificadoEm: new Date() })
    .where(eq(users.id, userId));
}

export async function touchSignIn(userId: number) {
  await requireDb()
    .update(users)
    .set({ lastSignInAt: new Date() })
    .where(eq(users.id, userId));
}

export async function setPassword(userId: number, passwordHash: string) {
  await requireDb()
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
}

// ---------------------------------------------------------------------------
// Sessões
// ---------------------------------------------------------------------------
export async function createSession(userId: number): Promise<number> {
  const [s] = await requireDb()
    .insert(sessions)
    .values({
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS),
    })
    .returning();
  return s.id;
}

export async function deleteSession(sessionId: number) {
  await requireDb().delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteAllSessions(userId: number) {
  await requireDb().delete(sessions).where(eq(sessions.userId, userId));
}

// ---------------------------------------------------------------------------
// Tokens de e-mail (link mágico / verificação / recuperação)
// ---------------------------------------------------------------------------
export async function createEmailToken(
  email: string,
  tipo: "magic" | "verificacao" | "recuperacao",
): Promise<string> {
  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  await requireDb()
    .insert(emailTokens)
    .values({
      email: email.toLowerCase(),
      codigo,
      tipo,
      expiraEm: new Date(Date.now() + 15 * 60 * 1000),
    });
  return codigo;
}

/** Consome o token: válido, não usado, não expirado, máx. 5 tentativas. */
export async function consumeEmailToken(
  email: string,
  codigo: string,
  tipo: "magic" | "verificacao" | "recuperacao",
): Promise<boolean> {
  const db = requireDb();
  const [token] = await db
    .select()
    .from(emailTokens)
    .where(
      and(
        eq(emailTokens.email, email.toLowerCase()),
        eq(emailTokens.tipo, tipo),
        isNull(emailTokens.usadoEm),
        gt(emailTokens.expiraEm, new Date()),
      ),
    )
    .orderBy(desc(emailTokens.createdAt))
    .limit(1);

  if (!token || token.tentativas >= 5) return false;

  if (token.codigo !== codigo) {
    await db
      .update(emailTokens)
      .set({ tentativas: token.tentativas + 1 })
      .where(eq(emailTokens.id, token.id));
    return false;
  }

  await db
    .update(emailTokens)
    .set({ usadoEm: new Date() })
    .where(eq(emailTokens.id, token.id));
  return true;
}
