import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  listSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  setLessonStatus,
  myProgress,
  progressSummary,
  listEvents,
  createEvent,
  deleteEvent,
  rsvp,
  listMembers,
  getMember,
  memberPosts,
  leaderboard,
  listConversations,
  listThread,
  sendMessage,
  unreadCount,
} from "./queries/community2";
import { requireDb } from "./queries/connection";
import { notificar } from "./queries/notifications";
import { saldoPontos, registrarPontos, PONTOS } from "./lib/pontos";
import { limitar } from "./lib/rate-limit";

/** Espaços "membros" e "convite" exigem login. */
export async function assertSpaceAccess(spaceId: number | null, logado: boolean) {
  if (!spaceId) return;
  const db = requireDb();
  const s = await db.query.spaces.findFirst({
    where: (t, { and, eq, isNull }) => and(eq(t.id, spaceId), isNull(t.deletedAt)),
  });
  if (!s) return; // espaço apagado: não bloqueia
  if ((s.tipo === "membros" || s.tipo === "convite") && !logado) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Este espaço é para membros. Entre com sua conta.",
    });
  }
}

export const spacesRouter = createRouter({
  list: publicQuery.query(() => listSpaces()),
  create: adminQuery
    .input(
      z.object({
        nome: z.string().min(3).max(120),
        descricao: z.string().max(1000).optional(),
        icone: z.string().max(8).optional(),
        tipo: z.enum(["publicado", "membros", "convite"]).optional(),
        formato: z.enum(["forum", "curso", "eventos", "chat", "links"]).optional(),
        ordem: z.number().int().optional(),
      }),
    )
    .mutation(({ input }) =>
      createSpace({
        nome: input.nome,
        descricao: input.descricao,
        icone: input.icone,
        tipo: input.tipo ?? "publicado",
        formato: input.formato,
        ordem: input.ordem ?? 99,
      }),
    ),
  update: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        nome: z.string().min(3).max(120).optional(),
        descricao: z.string().max(1000).optional(),
        icone: z.string().max(8).optional(),
        tipo: z.enum(["publicado", "membros", "convite"]).optional(),
        ordem: z.number().int().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateSpace(id, data);
    }),
  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => deleteSpace(input.id)),
});

export const progressRouter = createRouter({
  my: authedQuery.query(({ ctx }) => myProgress(ctx.user.id)),
  summary: authedQuery.query(({ ctx }) => progressSummary(ctx.user.id)),
  toggle: authedQuery
    .input(
      z.object({
        lessonId: z.number().int().positive(),
        concluida: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const antes = await progressSummary(ctx.user.id);
      await setLessonStatus(
        ctx.user.id,
        input.lessonId,
        input.concluida ? "concluido" : "nao_iniciado",
      );
      const depois = await progressSummary(ctx.user.id);
      // Pontos só quando o total de concluídas aumenta (evita farm desmarcando)
      if (input.concluida && depois.concluidas > antes.concluidas) {
        await registrarPontos(ctx.user.id, "aulaConcluida", "lesson", input.lessonId);
      }
      return depois;
    }),
});

export const eventsRouter = createRouter({
  list: publicQuery.query(({ ctx }) => listEvents(ctx.user?.id)),
  create: adminQuery
    .input(
      z.object({
        titulo: z.string().min(3).max(200),
        descricao: z.string().max(4000).optional(),
        dataHora: z.string().datetime(),
        duracaoMin: z.number().int().positive().optional(),
        link: z.string().max(500).optional(),
        local: z.string().max(200).optional(),
        limiteVagas: z.number().int().positive().optional(),
        recorrencia: z.string().max(120).optional(),
        spaceId: z.number().int().positive().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createEvent({
        titulo: input.titulo,
        descricao: input.descricao,
        dataHora: new Date(input.dataHora),
        duracaoMin: input.duracaoMin,
        link: input.link,
        local: input.local,
        limiteVagas: input.limiteVagas,
        recorrencia: input.recorrencia,
        createdBy: ctx.user.id,
      }),
    ),
  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => deleteEvent(input.id)),
  rsvp: authedQuery
    .input(
      z.object({
        eventId: z.number().int().positive(),
        status: z.enum(["vou", "talvez", "nao_vou", "remover"]),
      }),
    )
    .mutation(({ ctx, input }) => rsvp(input.eventId, ctx.user.id, input.status)),
});

export const membersRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          cidade: z.string().max(100).optional(),
          objetivo: z.string().max(60).optional(),
        })
        .optional(),
    )
    .query(({ input }) => listMembers(input ?? {})),
  get: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ input }) => getMember(input.id)),
  posts: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ input }) => memberPosts(input.id)),
});

export const gamificationRouter = createRouter({
  leaderboard: publicQuery
    .input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional())
    .query(({ input }) => leaderboard(input?.limit ?? 20)),
  myPoints: authedQuery.query(({ ctx }) => saldoPontos(ctx.user.id)),
  tabela: publicQuery.query(() =>
    Object.entries(PONTOS).map(([acao, pontos]) => ({ acao, pontos })),
  ),
});

export const messagesRouter = createRouter({
  conversations: authedQuery.query(({ ctx }) => listConversations(ctx.user.id)),
  thread: authedQuery
    .input(z.object({ userId: z.number().int().positive() }))
    .query(({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode conversar consigo mesmo.",
        });
      }
      return listThread(ctx.user.id, input.userId);
    }),
  send: authedQuery
    .input(
      z.object({
        paraUserId: z.number().int().positive(),
        texto: z.string().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.paraUserId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode conversar consigo mesmo.",
        });
      }
      limitar({ chave: `msg:${ctx.user.id}`, limite: 40, janelaMs: 10 * 60 * 1000 });
      const msg = await sendMessage(ctx.user.id, input.paraUserId, input.texto);
      await notificar(
        input.paraUserId,
        "mensagem",
        `${ctx.user.name ?? "Alguém"} te enviou uma mensagem`,
        input.texto.slice(0, 120),
        `/mensagens/${ctx.user.id}`,
      );
      return msg;
    }),
  unread: authedQuery.query(({ ctx }) => unreadCount(ctx.user.id)),
});
