import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import {
  listLessons,
  listAllLessons,
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
} from "./queries/forum";
import {
  listActiveJobs,
  createJob,
  setJobActive,
  deleteJob,
  expressInterest,
  listInterestsForJob,
  listMyInterests,
  registerCompany,
  listCompanies,
  setCompanyStatus,
} from "./queries/jobs";
import {
  getProfileByUser,
  upsertProfile,
  countProfiles,
} from "./queries/profiles";

const faixaEtariaEnum = z.enum(["45-49", "50-54", "55-59", "60-64", "65+"]);
const experienciaEnum = z.enum([
  "iniciante",
  "basico",
  "intermediario",
  "avancado",
]);
const categoriaEnum = z.enum([
  "duvidas",
  "experiencias",
  "oportunidades",
  "geral",
]);

export const lessonsRouter = createRouter({
  list: publicQuery.query(() => listLessons()),
  listAll: adminQuery.query(() => listAllLessons()),
  create: adminQuery
    .input(
      z.object({
        modulo: z.string().min(1),
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        videoUrl: z.string().optional(),
        materialUrl: z.string().optional(),
        duracaoMin: z.number().int().positive().optional(),
        ordem: z.number().int(),
      }),
    )
    .mutation(({ input }) =>
      createLesson({
        ...input,
        videoUrl: input.videoUrl || undefined,
        materialUrl: input.materialUrl || undefined,
      }),
    ),
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        modulo: z.string().min(1).optional(),
        titulo: z.string().min(1).optional(),
        descricao: z.string().optional(),
        videoUrl: z.string().optional(),
        materialUrl: z.string().optional(),
        duracaoMin: z.number().int().positive().optional(),
        ordem: z.number().int().optional(),
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
  list: publicQuery.query(() => listPosts()),
  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPost(input.id)),
  comments: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(({ input }) => listComments(input.postId)),
  create: authedQuery
    .input(
      z.object({
        categoria: categoriaEnum,
        titulo: z.string().min(3, "O título precisa de pelo menos 3 letras"),
        conteudo: z
          .string()
          .min(10, "Conte um pouco mais (mínimo de 10 letras)"),
      }),
    )
    .mutation(({ ctx, input }) =>
      createPost({ ...input, authorId: ctx.user.id }),
    ),
  comment: authedQuery
    .input(
      z.object({
        postId: z.number(),
        conteudo: z.string().min(1, "Escreva algo para comentar"),
      }),
    )
    .mutation(({ ctx, input }) =>
      createComment({ ...input, authorId: ctx.user.id }),
    ),
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
  interest: authedQuery
    .input(z.object({ jobId: z.number(), mensagem: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      expressInterest({ ...input, userId: ctx.user.id }),
    ),
  myInterests: authedQuery.query(({ ctx }) => listMyInterests(ctx.user.id)),
  interests: adminQuery
    .input(z.object({ jobId: z.number() }))
    .query(({ input }) => listInterestsForJob(input.jobId)),
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
        faixaEtaria: faixaEtariaEnum,
        cidade: z.string().optional(),
        profissaoAtual: z.string().optional(),
        areaInteresse: z.string().optional(),
        objetivo: z.string().optional(),
        experienciaTech: experienciaEnum,
        disponivelParaVagas: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => upsertProfile(ctx.user.id, input)),
  count: publicQuery.query(() => countProfiles()),
});
