import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ErrorMessages } from "@contracts/constants";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  listSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
  myProgress,
  setLessonDone,
  progressSummary,
  listEvents,
  createEvent,
  deleteEvent,
  rsvp,
  listMembers,
  getMember,
  memberPosts,
  computePoints,
  leaderboard,
  listConversations,
  listThread,
  sendMessage,
  unreadCount,
} from "./queries/community2";
import { spaces } from "@db/schema";
import { getDb } from "./queries/connection";
import { eq } from "drizzle-orm";

async function assertSpaceAccess(spaceId: number, logado: boolean) {
  const [space] = await getDb()
    .select()
    .from(spaces)
    .where(eq(spaces.id, spaceId));
  if (space?.acesso === "membros" && !logado) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }
}

export const spacesRouter = createRouter({
  list: publicQuery.query(() => listSpaces()),
  create: adminQuery
    .input(
      z.object({
        nome: z.string().min(1),
        descricao: z.string().optional(),
        ordem: z.number().int(),
        acesso: z.enum(["publico", "membros"]),
      }),
    )
    .mutation(({ input }) => createSpace(input)),
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        ordem: z.number().int().optional(),
        acesso: z.enum(["publico", "membros"]).optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateSpace(id, data);
    }),
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteSpace(input.id)),
});

export const progressRouter = createRouter({
  my: authedQuery.query(({ ctx }) => myProgress(ctx.user.id)),
  summary: authedQuery.query(({ ctx }) => progressSummary(ctx.user.id)),
  toggle: authedQuery
    .input(z.object({ lessonId: z.number(), done: z.boolean() }))
    .mutation(({ ctx, input }) =>
      setLessonDone(ctx.user.id, input.lessonId, input.done),
    ),
});

export const eventsRouter = createRouter({
  list: publicQuery.query(({ ctx }) => listEvents(ctx.user?.id)),
  create: adminQuery
    .input(
      z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        dataHora: z.coerce.date(),
        duracaoMin: z.number().int().positive().optional(),
        link: z.string().optional(),
        local: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => createEvent({ ...input, createdBy: ctx.user.id })),
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteEvent(input.id)),
  rsvp: authedQuery
    .input(
      z.object({
        eventId: z.number(),
        status: z.enum(["vou", "talvez", "remover"]),
      }),
    )
    .mutation(({ ctx, input }) => rsvp(input.eventId, ctx.user.id, input.status)),
});

export const membersRouter = createRouter({
  directory: publicQuery.query(() => listMembers()),
  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getMember(input.id)),
  posts: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => memberPosts(input.id)),
});

export const gamificationRouter = createRouter({
  leaderboard: publicQuery.query(() => leaderboard()),
  myPoints: authedQuery.query(({ ctx }) => computePoints(ctx.user.id)),
});

export const messagesRouter = createRouter({
  conversations: authedQuery.query(({ ctx }) => listConversations(ctx.user.id)),
  thread: authedQuery
    .input(z.object({ parceiroId: z.number() }))
    .query(({ ctx, input }) => listThread(ctx.user.id, input.parceiroId)),
  send: authedQuery
    .input(
      z.object({
        paraUserId: z.number(),
        conteudo: z.string().min(1, "Escreva algo para enviar"),
      }),
    )
    .mutation(({ ctx, input }) =>
      sendMessage(ctx.user.id, input.paraUserId, input.conteudo),
    ),
  unread: authedQuery.query(({ ctx }) => unreadCount(ctx.user.id)),
});

export { assertSpaceAccess };
