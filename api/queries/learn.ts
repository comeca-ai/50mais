/**
 * Avaliações (quiz) e certificados.
 */
import { requireDb } from "./connection";
import {
  quizzes,
  quizAttempts,
  certificates,
  lessons,
  lessonProgress,
  courses,
} from "@db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export type Pergunta = {
  pergunta: string;
  opcoes: string[];
  correta: number; // índice da opção certa (não vai para o cliente)
};

const NOTA_MINIMA = 0.7; // 70% de acertos

/** Corrige as respostas contra o gabarito (função pura — testável). */
export function corrigirQuiz(
  gabarito: Array<{ correta: number }>,
  respostas: number[],
) {
  let acertos = 0;
  gabarito.forEach((p, i) => {
    if (respostas[i] === p.correta) acertos++;
  });
  return {
    acertos,
    total: gabarito.length,
    passou: gabarito.length > 0 && acertos / gabarito.length >= NOTA_MINIMA,
    notaMinima: Math.ceil(gabarito.length * NOTA_MINIMA),
  };
}

export async function getQuizDoModulo(moduleId: number) {
  const [q] = await requireDb()
    .select()
    .from(quizzes)
    .where(eq(quizzes.moduleId, moduleId))
    .limit(1);
  if (!q) return null;
  const perguntas = JSON.parse(q.perguntas) as Pergunta[];
  return {
    id: q.id,
    moduleId: q.moduleId,
    titulo: q.titulo,
    // sem o gabarito:
    perguntas: perguntas.map((p) => ({
      pergunta: p.pergunta,
      opcoes: p.opcoes,
    })),
  };
}

export async function responderQuiz(
  userId: number,
  quizId: number,
  respostas: number[],
) {
  const db = requireDb();
  const [q] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
  if (!q) throw new Error("Avaliação não encontrada.");
  const gabarito = JSON.parse(q.perguntas) as Pergunta[];
  const resultado = corrigirQuiz(gabarito, respostas);
  await db.insert(quizAttempts).values({
    quizId,
    userId,
    acertos: resultado.acertos,
    total: resultado.total,
  });
  return resultado;
}

export async function minhasTentativas(userId: number, quizId: number) {
  return requireDb()
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)))
    .orderBy(desc(quizAttempts.createdAt));
}

/** Aulas publicadas da trilha agrupadas por módulo. */
async function aulasDaTrilha() {
  const db = requireDb();
  return db
    .select({
      lessonId: lessons.id,
      moduleId: lessons.moduleId,
    })
    .from(lessons)
    .where(eq(lessons.publicada, true));
}

/**
 * Elegibilidade ao certificado: todas as aulas concluídas e, para cada
 * módulo que tenha avaliação, uma tentativa aprovada (≥70%).
 */
export async function elegibilidadeCertificado(userId: number) {
  const db = requireDb();
  const aulas = await aulasDaTrilha();
  if (aulas.length === 0) return { elegivel: false, faltamAulas: 0, faltamQuizzes: 0 };

  const concluidas = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(
      and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "concluido")),
    );
  const feitas = new Set(concluidas.map((c) => c.lessonId));
  const faltamAulas = aulas.filter((a) => !feitas.has(a.lessonId)).length;

  const quizzesDaTrilha = await db.select().from(quizzes);
  let faltamQuizzes = 0;
  for (const q of quizzesDaTrilha) {
    const [melhor] = await db
      .select({ acertos: quizAttempts.acertos, total: quizAttempts.total })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, q.id)))
      .orderBy(desc(quizAttempts.acertos))
      .limit(1);
    if (!melhor || melhor.acertos / melhor.total < NOTA_MINIMA) faltamQuizzes++;
  }

  return {
    elegivel: faltamAulas === 0 && faltamQuizzes === 0,
    faltamAulas,
    faltamQuizzes,
  };
}

export async function emitirCertificado(userId: number) {
  const db = requireDb();
  const elig = await elegibilidadeCertificado(userId);
  if (!elig.elegivel) return { certificado: null, ...elig };

  const [curso] = await db.select().from(courses).limit(1);
  if (!curso) return { certificado: null, ...elig };

  const [existente] = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.userId, userId), eq(certificates.courseId, curso.id)));
  if (existente) return { certificado: existente, ...elig };

  const codigo = `REC-${nanoid(10).toUpperCase().replace(/[-_]/g, "X")}`;
  const [cert] = await db
    .insert(certificates)
    .values({ userId, courseId: curso.id, codigo })
    .returning();
  return { certificado: cert, ...elig };
}

export async function meusCertificados(userId: number) {
  const db = requireDb();
  return db
    .select({
      id: certificates.id,
      codigo: certificates.codigo,
      createdAt: certificates.createdAt,
      cursoTitulo: courses.titulo,
      cargaHoraria: courses.cargaHoraria,
    })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.createdAt));
}

/** Verificação pública do código (para empregadores). */
export async function verificarCertificado(codigo: string) {
  const db = requireDb();
  const [row] = await db
    .select({
      codigo: certificates.codigo,
      createdAt: certificates.createdAt,
      cursoTitulo: courses.titulo,
      membroNome: sql<string>`(select name from users where id = ${certificates.userId})`,
    })
    .from(certificates)
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.codigo, codigo.toUpperCase()));
  return row ?? null;
}
