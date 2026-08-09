import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(...roles: string[]) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

/** Exige plano "membro" (ou papel de moderador/admin). Base do paywall futuro. */
const requirePlanoMembro = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }
  const liberado =
    ctx.user.plano === "membro" ||
    ctx.user.role === "moderador" ||
    ctx.user.role === "admin";
  if (!liberado) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Este conteúdo é do plano Membro. Faça upgrade para liberar o acesso completo.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const authedQuery = t.procedure.use(requireAuth);
export const moderatorQuery = t.procedure.use(
  requireRole("moderador", "admin"),
);
export const adminQuery = t.procedure.use(requireRole("admin"));
export const memberPlanQuery = t.procedure.use(requirePlanoMembro);
