import { requireDb } from "./connection";
import { courses, modules, lessons } from "@db/schema";
import { asc, eq } from "drizzle-orm";

export type AulaComModulo = {
  id: number;
  titulo: string;
  descricao: string | null;
  videoUrl: string | null;
  materialUrl: string | null;
  transcricao: string | null;
  duracaoMin: number | null;
  ordem: number;
  planoMinimo: "gratuito" | "membro";
  modulo: string;
  moduloId: number;
  moduloOrdem: number;
};

export async function listLessons(): Promise<AulaComModulo[]> {
  const rows = await requireDb()
    .select({
      id: lessons.id,
      titulo: lessons.titulo,
      descricao: lessons.descricao,
      videoUrl: lessons.videoUrl,
      materialUrl: lessons.materialUrl,
      transcricao: lessons.transcricao,
      duracaoMin: lessons.duracaoMin,
      ordem: lessons.ordem,
      planoMinimo: lessons.planoMinimo,
      modulo: modules.titulo,
      moduloId: modules.id,
      moduloOrdem: modules.ordem,
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(lessons.publicada, true))
    .orderBy(asc(modules.ordem), asc(lessons.ordem));
  return rows;
}

export async function listAllLessons(): Promise<AulaComModulo[]> {
  return requireDb()
    .select({
      id: lessons.id,
      titulo: lessons.titulo,
      descricao: lessons.descricao,
      videoUrl: lessons.videoUrl,
      materialUrl: lessons.materialUrl,
      transcricao: lessons.transcricao,
      duracaoMin: lessons.duracaoMin,
      ordem: lessons.ordem,
      planoMinimo: lessons.planoMinimo,
      modulo: modules.titulo,
      moduloId: modules.id,
      moduloOrdem: modules.ordem,
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .orderBy(asc(modules.ordem), asc(lessons.ordem));
}

export async function listModules() {
  return requireDb().select().from(modules).orderBy(asc(modules.ordem));
}

export async function listCourses() {
  return requireDb().select().from(courses).orderBy(asc(courses.id));
}

export async function createModule(data: {
  courseId: number;
  titulo: string;
  ordem: number;
}) {
  const [row] = await requireDb().insert(modules).values(data).returning();
  return row;
}

export async function createLesson(data: {
  moduleId: number;
  titulo: string;
  descricao?: string;
  videoUrl?: string;
  materialUrl?: string;
  transcricao?: string;
  duracaoMin?: number;
  ordem: number;
  planoMinimo?: "gratuito" | "membro";
}) {
  const [row] = await requireDb().insert(lessons).values(data).returning();
  return row;
}

export async function updateLesson(
  id: number,
  data: Partial<{
    titulo: string;
    descricao: string;
    videoUrl: string;
    materialUrl: string;
    transcricao: string;
    duracaoMin: number;
    ordem: number;
    planoMinimo: "gratuito" | "membro";
    publicada: boolean;
  }>,
) {
  await requireDb().update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  await requireDb().delete(lessons).where(eq(lessons.id, id));
}
