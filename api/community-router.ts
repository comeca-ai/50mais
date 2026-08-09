import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  listLessons,
  listAllLessons,
  listModules,
  listCourses,
  createModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./queries/lessons";
import {
  listPosts,
  getPost,
  listComments,
  createPost,
  createComment,
  deletePost,
  setPostFlags,
  toggleReaction,
  listReactions,
} from "./queries/forum";
import {
  listActiveJobs,
  createJob,
  setJobActive,
  deleteJob,
  applyToJob,
  listApplicationsForJob,
  setApplicationStatus,
  listMyApplications,
  registerCompany,
  listCompanies,
  setCompanyStatus,
} from "./queries/jobs";
import {
  getProfileByUser,
  upsertProfile,
  countProfiles,
} from "./queries/profiles";
import { registrarPontos } from "./lib/pontos";
import { notificar } from "./queries/notifications";
import { assertSpaceAccess } from "./community2-router";
import { rateLimit, ipDe } from "./lib/rate-limit";
import { TRPCError } from "@trpc/server";

const faixaEtariaEnum = z.enum(["45-49", "50-54", "55-59", "60-64", "65+"]);
const experienciaEnum = z.enum([
  "iniciante",
  "basico",
  "intermediario",
  "avancado",
]);
const objetivoEnum = z.enum([
  "recolocacao",
  "freelance",
  "empreender",
  "curiosidade",
]);

export const lessonsRouter = createRouter({
  list: publicQuery.query(() => listLessons()),
  listAll: adminQuery.query(() => listAllLessons()),
  modules: publicQuery.query(() => listModules()),
  courses: publicQuery.query(() => listCourses()),
  createModule: adminQuery
    .input(
      z.object({
        courseId: z.number(),
        titulo: z.string().min(1),
        ordem: z.number().int(),
      }),
    )
    .mutation(({ input }) => createModule(input)),
  create: adminQuery
    .input(
      z.object({
        moduleId: z.number(),
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        videoUrl: z.string().optional(),
        materialUrl: z.string().optional(),
        transcricao: z.string().optional(),
        duracaoMin: z.number().int().positive().optional(),
        ordem: z.number().int(),
        planoMinimo: z.enum(["gratuito", "membro"]).optional(),
      }),
    )
    .mutation(({ input }) =>
      createLesson({
        ...input,
        videoUrl: input.videoUrl || undefined,
        materialUrl: input.materialUrl || undefined,
        transcricao: input.transcricao || undefined,
      }),
    ),
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().min(1).optional(),
        descricao: z.string().optional(),
        videoUrl: z.string().optional(),
        materialUrl: z.string().optional(),
        transcricao: z.string().optional(),
        duracaoMin: z.number().int().positive().optional(),
        ordem: z.number().int().optional(),
        planoMinimo: z.enum(["gratuito", "membro"]).optional(),
        publicada: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return updateLesson(id, data);
    }),
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteLesson(input.id)),
});

export const forumRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          spaceId: z.number().optional(),
          ordem: z.enum(["recentes", "comentados"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (input?.spaceId) {
        await assertSpaceAccess(input.spaceId, !!ctx.user);
      }
      return listPosts(input?.spaceId, input?.ordem ?? "recentes");
    }),
  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPost(input.id)),
  comments: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(({ input }) => listComments(input.postId)),
  reactions: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(({ ctx, input }) => listReactions(input.postId, ctx.user?.id)),
  create: authedQuery
    .input(
      z.object({
        spaceId: z.number().optional(),
        titulo: z.string().min(3, "O título precisa de pelo menos 3 letras"),
        conteudo: z
          .string()
          .min(10, "Conte um pouco mais (mínimo de 10 letras)"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!rateLimit({ chave: `post:${ipDe(ctx.req)}`, limite: 12, janelaMs: 10 * 60 * 1000 })) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Calma! Você publicou várias vezes seguidas. Espere um pouquinho.",
        });
      }
      const post = await createPost({ ...input, authorId: ctx.user.id });
      await registrarPontos(ctx.user.id, "post", "post", post.id);
      return post;
    }),
  comment: authedQuery
    .input(
      z.object({
        postId: z.number(),
        parentId: z.number().optional(),
        conteudo: z.string().min(1, "Escreva algo para comentar"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comentario = await createComment({
        ...input,
        authorId: ctx.user.id,
      });
      await registrarPontos(ctx.user.id, "comentario", "comment", comentario.id);
      // avisa o autor da publicação (se não for ele mesmo)
      const post = await getPost(input.postId);
      if (post && post.authorId !== ctx.user.id) {
        await notificar(
          post.authorId,
          "resposta",
          `${ctx.user.name ?? "Alguém"} comentou na sua publicação`,
          post.titulo,
          `/comunidade/post/${post.id}`,
        );
      }
      return comentario;
    }),
  react: authedQuery
    .input(
      z.object({
        postId: z.number().optional(),
        commentId: z.number().optional(),
        tipo: z.enum(["curtir", "aplaudir", "coracao", "ideia"]),
      }),
    )
    .mutation(({ ctx, input }) =>
      toggleReaction({ ...input, userId: ctx.user.id }),
    ),
  setFlags: adminQuery
    .input(
      z.object({
        id: z.number(),
        fixado: z.boolean().optional(),
        resolvido: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return setPostFlags(id, data);
    }),
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePost(input.id)),
});

export const jobsRouter = createRouter({
  list: publicQuery.query(() => listActiveJobs()),
  create: adminQuery
    .input(
      z.object({
        titulo: z.string().min(1),
        empresa: z.string().min(1),
        descricao: z.string().min(10),
        local: z.string().optional(),
        modelo: z.enum(["presencial", "hibrido", "remoto"]),
        faixaSalarial: z.string().optional(),
        requisitos: z.string().optional(),
        etariaFriendly: z.boolean().optional(),
        contato: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createJob({ ...input, createdBy: ctx.user.id }),
    ),
  setActive: adminQuery
    .input(z.object({ id: z.number(), ativa: z.boolean() }))
    .mutation(({ input }) => setJobActive(input.id, input.ativa)),
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteJob(input.id)),
  apply: authedQuery
    .input(
      z.object({
        jobId: z.number(),
        mensagem: z.string().optional(),
        curriculoUrl: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => applyToJob({ ...input, userId: ctx.user.id })),
  myApplications: authedQuery.query(({ ctx }) =>
    listMyApplications(ctx.user.id),
  ),
  applications: adminQuery
    .input(z.object({ jobId: z.number() }))
    .query(({ input }) => listApplicationsForJob(input.jobId)),
  setApplicationStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["enviada", "vista", "conversa", "encerrada"]),
      }),
    )
    .mutation(({ input }) => setApplicationStatus(input.id, input.status)),
});

export const companiesRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        nome: z.string().min(1, "Informe o nome da empresa"),
        contatoNome: z.string().min(1, "Informe o nome do contato"),
        email: z.string().email("Informe um e-mail válido"),
        segmento: z.string().optional(),
        descricao: z.string().optional(),
      }),
    )
    .mutation(({ input }) => registerCompany(input)),
  list: adminQuery.query(() => listCompanies()),
  setStatus: adminQuery
    .input(
      z.object({ id: z.number(), status: z.enum(["pendente", "aprovada"]) }),
    )
    .mutation(({ input }) => setCompanyStatus(input.id, input.status)),
});

export const profileRouter = createRouter({
  me: authedQuery.query(({ ctx }) => getProfileByUser(ctx.user.id)),
  save: authedQuery
    .input(
      z.object({
        faixaEtaria: faixaEtariaEnum.optional(),
        cidade: z.string().optional(),
        profissaoAtual: z.string().optional(),
        areaInteresse: z.string().optional(),
        objetivoTipo: objetivoEnum.optional(),
        objetivo: z.string().optional(),
        experienciaTech: experienciaEnum.optional(),
        disponivelParaVagas: z.boolean().optional(),
        bio: z.string().optional(),
        podeEnsinar: z.string().optional(),
        estaAprendendo: z.string().optional(),
        links: z.string().optional(),
        concluido: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) => upsertProfile(ctx.user.id, input)),
  count: publicQuery.query(() => countProfiles()),
});
