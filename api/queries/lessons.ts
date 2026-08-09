import { getDb } from "./connection";
import { lessons } from "@db/schema";
import { asc, eq } from "drizzle-orm";

export async function listLessons() {
  return getDb()
    .select()
    .from(lessons)
    .where(eq(lessons.publicada, true))
    .orderBy(asc(lessons.ordem));
}

export async function listAllLessons() {
  return getDb().select().from(lessons).orderBy(asc(lessons.ordem));
}

export async function createLesson(data: {
  modulo: string;
  titulo: string;
  descricao?: string;
  videoUrl?: string;
  materialUrl?: string;
  duracaoMin?: number;
  ordem: number;
}) {
  const [row] = await getDb().insert(lessons).values(data).$returningId();
  return row;
}

export async function updateLesson(
  id: number,
  data: Partial<{
    modulo: string;
    titulo: string;
    descricao: string;
    videoUrl: string;
    materialUrl: string;
    duracaoMin: number;
    ordem: number;
    publicada: boolean;
  }>,
) {
  await getDb().update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  await getDb().delete(lessons).where(eq(lessons.id, id));
}
