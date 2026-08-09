import { z } from "zod";
import {
  createRouter,
  publicQuery,
  authedQuery,
  moderatorQuery,
} from "./middleware";
import {
  getQuizDoModulo,
  responderQuiz,
  minhasTentativas,
  elegibilidadeCertificado,
  emitirCertificado,
  meusCertificados,
  verificarCertificado,
} from "./queries/learn";
import {
  listNotifications,
  unreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getPrefs,
  savePrefs,
} from "./queries/notifications";
import { buscar } from "./queries/search";
import { denunciar, listReports, setReportStatus } from "./queries/moderation";
import { exportarDados, excluirConta } from "./queries/lgpd";
import { limitar, ipDe } from "./lib/rate-limit";

export const learnRouter = createRouter({
  quiz: publicQuery
    .input(z.object({ moduleId: z.number().int().positive() }))
    .query(({ input }) => getQuizDoModulo(input.moduleId)),
  responderQuiz: authedQuery
    .input(
      z.object({
        quizId: z.number().int().positive(),
        respostas: z.array(z.number().int().min(0)).max(50),
      }),
    )
    .mutation(({ ctx, input }) =>
      responderQuiz(ctx.user.id, input.quizId, input.respostas),
    ),
  tentativas: authedQuery
    .input(z.object({ quizId: z.number().int().positive() }))
    .query(({ ctx, input }) => minhasTentativas(ctx.user.id, input.quizId)),
  elegibilidade: authedQuery.query(({ ctx }) =>
    elegibilidadeCertificado(ctx.user.id),
  ),
  emitirCertificado: authedQuery.mutation(({ ctx }) =>
    emitirCertificado(ctx.user.id),
  ),
  meusCertificados: authedQuery.query(({ ctx }) => meusCertificados(ctx.user.id)),
  verificarCertificado: publicQuery
    .input(z.object({ codigo: z.string().min(4).max(32) }))
    .query(({ input }) => verificarCertificado(input.codigo)),
});

export const notificationsRouter = createRouter({
  list: authedQuery.query(({ ctx }) => listNotifications(ctx.user.id)),
  unread: authedQuery.query(({ ctx }) => unreadNotifications(ctx.user.id)),
  markRead: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ ctx, input }) => markNotificationRead(ctx.user.id, input.id)),
  markAllRead: authedQuery.mutation(({ ctx }) =>
    markAllNotificationsRead(ctx.user.id),
  ),
  prefs: authedQuery.query(({ ctx }) => getPrefs(ctx.user.id)),
  savePrefs: authedQuery
    .input(
      z.object({
        resposta: z.boolean().optional(),
        mencao: z.boolean().optional(),
        mensagem: z.boolean().optional(),
        evento: z.boolean().optional(),
        vaga: z.boolean().optional(),
        digest: z.enum(["nunca", "semanal", "diario"]).optional(),
      }),
    )
    .mutation(({ ctx, input }) => savePrefs(ctx.user.id, input)),
});

export const searchRouter = createRouter({
  query: publicQuery
    .input(z.object({ termo: z.string().min(2).max(120) }))
    .query(({ input }) => buscar(input.termo)),
});

export const moderationRouter = createRouter({
  report: authedQuery
    .input(
      z.object({
        postId: z.number().int().positive().optional(),
        commentId: z.number().int().positive().optional(),
        messageId: z.number().int().positive().optional(),
        reportedUserId: z.number().int().positive().optional(),
        motivo: z.string().min(5).max(1000),
      }),
    )
    .mutation(({ ctx, input }) => {
      limitar({ chave: `report:${ctx.user.id}`, limite: 10, janelaMs: 60 * 60 * 1000 });
      const { motivo, ...alvo } = input;
      return denunciar(ctx.user.id, alvo, motivo);
    }),
  list: moderatorQuery
    .input(
      z
        .object({ status: z.enum(["aberto", "resolvido", "descartado"]).optional() })
        .optional(),
    )
    .query(({ input }) => listReports(input?.status)),
  setStatus: moderatorQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["resolvido", "descartado"]),
        motivo: z.string().max(500).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      setReportStatus(input.id, input.status, ctx.user.id, input.motivo),
    ),
});

export const accountRouter = createRouter({
  exportarDados: authedQuery.query(({ ctx }) => {
    limitar({ chave: `export:${ipDe(ctx.req)}`, limite: 5, janelaMs: 60 * 60 * 1000 });
    return exportarDados(ctx.user.id);
  }),
  excluirConta: authedQuery
    .input(z.object({ confirmacao: z.literal("EXCLUIR") }))
    .mutation(async ({ ctx, input: _ }) => {
      await excluirConta(ctx.user.id);
      const { clearSessionCookie } = await import("./auth/session");
      ctx.resHeaders.append("Set-Cookie", clearSessionCookie());
      return { ok: true };
    }),
});
