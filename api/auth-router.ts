import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findUserByEmail,
  createUser,
  markEmailVerified,
  touchSignIn,
  setPassword,
  createSession,
  deleteSession,
  deleteAllSessions,
  createEmailToken,
  consumeEmailToken,
} from "./queries/auth";
import { hashPassword, verifyPassword } from "./auth/password";
import { signSession, sessionCookie, clearSessionCookie } from "./auth/session";
import { sendEmail, emailCodigo } from "./lib/email";
import { rateLimit, ipDe } from "./lib/rate-limit";
import { env } from "./lib/env";

const emailSchema = z
  .string()
  .email("Informe um e-mail válido")
  .max(320)
  .transform((e) => e.toLowerCase().trim());

const senhaSchema = z
  .string()
  .min(8, "A senha precisa de pelo menos 8 caracteres")
  .max(128);

const codigoSchema = z
  .string()
  .regex(/^\d{6}$/, "O código tem 6 números");

function limite(chave: string, limiteMax: number) {
  if (!rateLimit({ chave, limite: limiteMax, janelaMs: 15 * 60 * 1000 })) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        "Muitas tentativas seguidas. Aguarde 15 minutos e tente de novo com calma.",
    });
  }
}

async function entrarComSessao(
  resHeaders: Headers,
  userId: number,
): Promise<void> {
  const sid = await createSession(userId);
  const jwt = await signSession({ sid, uid: userId });
  resHeaders.append("Set-Cookie", sessionCookie(jwt));
  await touchSignIn(userId);
}

export const authRouter = createRouter({
  me: authedQuery.query(({ ctx }) => ctx.user),

  // ---- Cadastro com e-mail + senha ----
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2, "Conte seu nome").max(255),
        email: emailSchema,
        senha: senhaSchema,
        aceitouTermos: z.literal(true, {
          error: "É preciso aceitar os termos para participar",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      limite(`register:${ipDe(ctx.req)}`, 10);

      const existente = await findUserByEmail(input.email);
      if (existente) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Este e-mail já tem cadastro. Tente entrar ou recuperar a senha.",
        });
      }

      const passwordHash = await hashPassword(input.senha);
      const user = await createUser({
        email: input.email,
        name: input.name,
        passwordHash,
        aceitouTermos: true,
      });

      // Envia código de verificação de e-mail
      const codigo = await createEmailToken(input.email, "verificacao");
      await sendEmail({
        para: input.email,
        assunto: "Seu código de verificação — Recomeça",
        texto: emailCodigo(codigo, "confirmar seu e-mail"),
      });

      await entrarComSessao(ctx.resHeaders, user.id);
      return { ok: true, precisaVerificar: true };
    }),

  // ---- Login com e-mail + senha ----
  login: publicQuery
    .input(z.object({ email: emailSchema, senha: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      limite(`login:${ipDe(ctx.req)}`, 10);
      limite(`login:${input.email}`, 8);

      const user = await findUserByEmail(input.email);
      const ok =
        user?.passwordHash &&
        (await verifyPassword(user.passwordHash, input.senha));
      if (!user || !ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "E-mail ou senha não conferem. Confira os dados ou peça um código por e-mail.",
        });
      }

      await entrarComSessao(ctx.resHeaders, user.id);
      return { ok: true, precisaVerificar: !user.emailVerificadoEm };
    }),

  // ---- Link mágico: pedir código ----
  requestMagic: publicQuery
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ ctx, input }) => {
      limite(`magic:${ipDe(ctx.req)}`, 8);
      limite(`magic:${input.email}`, 5);

      const codigo = await createEmailToken(input.email, "magic");
      await sendEmail({
        para: input.email,
        assunto: "Seu código de entrada — Recomeça",
        texto: emailCodigo(codigo, "entrar na comunidade"),
      });
      // Resposta igual exista ou não o cadastro (não vaza informação)
      return { ok: true };
    }),

  // ---- Link mágico: confirmar código ----
  verifyMagic: publicQuery
    .input(z.object({ email: emailSchema, codigo: codigoSchema }))
    .mutation(async ({ ctx, input }) => {
      limite(`verify:${ipDe(ctx.req)}`, 12);

      const valido = await consumeEmailToken(
        input.email,
        input.codigo,
        "magic",
      );
      if (!valido) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "Código inválido ou vencido. Peça um novo código e tente de novo.",
        });
      }

      let user = await findUserByEmail(input.email);
      if (!user) {
        // Primeiro acesso por código: cria a conta
        user = await createUser({ email: input.email, aceitouTermos: false });
      }
      await markEmailVerified(user.id);
      await entrarComSessao(ctx.resHeaders, user.id);
      return { ok: true, novoCadastro: !user.name };
    }),

  // ---- Verificar e-mail após cadastro com senha ----
  verifyEmail: publicQuery
    .input(z.object({ email: emailSchema, codigo: codigoSchema }))
    .mutation(async ({ input }) => {
      const valido = await consumeEmailToken(
        input.email,
        input.codigo,
        "verificacao",
      );
      if (!valido) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Código inválido ou vencido. Peça um novo código.",
        });
      }
      const user = await findUserByEmail(input.email);
      if (user) await markEmailVerified(user.id);
      return { ok: true };
    }),

  resendVerification: publicQuery
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ ctx, input }) => {
      limite(`resend:${ipDe(ctx.req)}`, 5);
      const user = await findUserByEmail(input.email);
      if (user && !user.emailVerificadoEm) {
        const codigo = await createEmailToken(input.email, "verificacao");
        await sendEmail({
          para: input.email,
          assunto: "Seu código de verificação — Recomeça",
          texto: emailCodigo(codigo, "confirmar seu e-mail"),
        });
      }
      return { ok: true };
    }),

  // ---- Recuperação de senha ----
  requestReset: publicQuery
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ ctx, input }) => {
      limite(`reset:${ipDe(ctx.req)}`, 6);
      const user = await findUserByEmail(input.email);
      if (user) {
        const codigo = await createEmailToken(input.email, "recuperacao");
        await sendEmail({
          para: input.email,
          assunto: "Recuperar sua senha — Recomeça",
          texto: emailCodigo(codigo, "criar uma nova senha"),
        });
      }
      return { ok: true };
    }),

  resetPassword: publicQuery
    .input(
      z.object({
        email: emailSchema,
        codigo: codigoSchema,
        novaSenha: senhaSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const valido = await consumeEmailToken(
        input.email,
        input.codigo,
        "recuperacao",
      );
      if (!valido) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Código inválido ou vencido. Peça um novo código.",
        });
      }
      const user = await findUserByEmail(input.email);
      if (user) {
        await setPassword(user.id, await hashPassword(input.novaSenha));
        await deleteAllSessions(user.id); // segurança: derruba sessões antigas
      }
      return { ok: true };
    }),

  changePassword: authedQuery
    .input(
      z.object({ senhaAtual: z.string().min(1), novaSenha: senhaSchema }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (user.passwordHash) {
        const ok = await verifyPassword(user.passwordHash, input.senhaAtual);
        if (!ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "A senha atual não confere.",
          });
        }
      }
      await setPassword(user.id, await hashPassword(input.novaSenha));
      return { ok: true };
    }),

  // ---- Sair ----
  logout: authedQuery.mutation(async ({ ctx }) => {
    if (ctx.sessionId) await deleteSession(ctx.sessionId);
    ctx.resHeaders.append("Set-Cookie", clearSessionCookie());
    return { ok: true };
  }),

  logoutAll: authedQuery.mutation(async ({ ctx }) => {
    await deleteAllSessions(ctx.user.id);
    ctx.resHeaders.append("Set-Cookie", clearSessionCookie());
    return { ok: true };
  }),

  // ---- Diagnóstico de capacidades (para a UI degradar com elegância) ----
  capabilities: publicQuery.query(() => ({
    email: env.emailEnabled,
    upload: env.uploadEnabled,
    banco: env.dbEnabled,
  })),
});
