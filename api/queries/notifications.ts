/**
 * Notificações dentro do site.
 */
import { requireDb, getDb } from "./connection";
import { notifications, notificationPrefs } from "@db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";

type TipoNotificacao = "resposta" | "mencao" | "mensagem" | "evento" | "vaga" | "sistema";

/** Cria notificação respeitando as preferências do membro. Nunca lança erro. */
export async function notificar(
  userId: number,
  tipo: TipoNotificacao,
  titulo: string,
  corpo?: string,
  link?: string,
) {
  const db = getDb();
  if (!db) return;
  try {
    const [pref] = await db
      .select()
      .from(notificationPrefs)
      .where(eq(notificationPrefs.userId, userId));
    const chave = { resposta: "resposta", mencao: "mencao", mensagem: "mensagem", evento: "evento", vaga: "vaga" } as const;
    if (tipo !== "sistema" && pref && tipo in chave) {
      const k = chave[tipo as keyof typeof chave];
      if (pref[k] === false) return;
    }
    await db.insert(notifications).values({ userId, tipo, titulo, corpo, link });
  } catch (e) {
    console.error("[notificar] falhou:", String(e).slice(0, 200));
  }
}

export async function listNotifications(userId: number) {
  return requireDb()
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30);
}

export async function unreadNotifications(userId: number) {
  const rows = await requireDb()
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.lidaEm)));
  return rows.length;
}

export async function markNotificationRead(userId: number, id: number) {
  await requireDb()
    .update(notifications)
    .set({ lidaEm: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  await requireDb()
    .update(notifications)
    .set({ lidaEm: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.lidaEm)));
}

export async function getPrefs(userId: number) {
  const db = requireDb();
  const [pref] = await db
    .select()
    .from(notificationPrefs)
    .where(eq(notificationPrefs.userId, userId));
  return pref ?? null;
}

export async function savePrefs(
  userId: number,
  data: Partial<{
    resposta: boolean;
    mencao: boolean;
    mensagem: boolean;
    evento: boolean;
    vaga: boolean;
    digest: string;
  }>,
) {
  const db = requireDb();
  const existente = await getPrefs(userId);
  if (existente) {
    await db
      .update(notificationPrefs)
      .set(data)
      .where(eq(notificationPrefs.userId, userId));
  } else {
    await db.insert(notificationPrefs).values({ userId, ...data });
  }
}
