import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["membro", "moderador", "admin"]);
export const planoEnum = pgEnum("plano", ["gratuito", "membro"]);
export const faixaEtariaEnum = pgEnum("faixa_etaria", [
  "45-49",
  "50-54",
  "55-59",
  "60-64",
  "65+",
]);
export const experienciaEnum = pgEnum("experiencia_tech", [
  "iniciante",
  "basico",
  "intermediario",
  "avancado",
]);
export const objetivoEnum = pgEnum("objetivo_tipo", [
  "recolocacao",
  "freelance",
  "empreender",
  "curiosidade",
]);
export const tokenTipoEnum = pgEnum("token_tipo", [
  "magic",
  "verificacao",
  "recuperacao",
]);
export const espacoTipoEnum = pgEnum("espaco_tipo", [
  "publicado",
  "membros",
  "convite",
]);
export const espacoFormatoEnum = pgEnum("espaco_formato", [
  "forum",
  "curso",
  "eventos",
  "chat",
  "links",
]);
export const reacaoEnum = pgEnum("reacao_tipo", [
  "curtir",
  "aplaudir",
  "coracao",
  "ideia",
]);
export const progressoEnum = pgEnum("progresso_status", [
  "nao_iniciado",
  "assistindo",
  "concluido",
]);
export const rsvpEnum = pgEnum("rsvp_status", ["vou", "talvez", "nao_vou"]);
export const candidaturaEnum = pgEnum("candidatura_status", [
  "enviada",
  "vista",
  "conversa",
  "encerrada",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "aberto",
  "resolvido",
  "descartado",
]);
export const empresaStatusEnum = pgEnum("empresa_status", [
  "pendente",
  "aprovada",
]);
export const modeloVagaEnum = pgEnum("modelo_vaga", [
  "presencial",
  "hibrido",
  "remoto",
]);
export const notificacaoTipoEnum = pgEnum("notificacao_tipo", [
  "resposta",
  "mencao",
  "mensagem",
  "evento",
  "vaga",
  "sistema",
]);

// ---------------------------------------------------------------------------
// Usuários, sessões e tokens de e-mail
// ---------------------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    avatar: text("avatar"),
    passwordHash: text("password_hash"),
    role: roleEnum("role").default("membro").notNull(),
    plano: planoEnum("plano").default("gratuito").notNull(),
    emailVerificadoEm: timestamp("email_verificado_em"),
    aceitouTermosEm: timestamp("aceitou_termos_em"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const emailTokens = pgTable(
  "email_tokens",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    codigo: varchar("codigo", { length: 6 }).notNull(),
    tipo: tokenTipoEnum("tipo").notNull(),
    expiraEm: timestamp("expira_em").notNull(),
    usadoEm: timestamp("usado_em"),
    tentativas: integer("tentativas").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("email_tokens_email_idx").on(t.email)],
);

// ---------------------------------------------------------------------------
// Perfil (primeiros passos + perfil público)
// ---------------------------------------------------------------------------
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  faixaEtaria: faixaEtariaEnum("faixa_etaria"),
  cidade: varchar("cidade", { length: 255 }),
  profissaoAtual: varchar("profissao_atual", { length: 255 }),
  areaInteresse: varchar("area_interesse", { length: 255 }),
  objetivoTipo: objetivoEnum("objetivo_tipo"),
  objetivo: text("objetivo"),
  experienciaTech: experienciaEnum("experiencia_tech").default("iniciante"),
  disponivelParaVagas: boolean("disponivel_para_vagas").default(true).notNull(),
  bio: text("bio"),
  podeEnsinar: text("pode_ensinar"),
  estaAprendendo: text("esta_aprendendo"),
  links: text("links"),
  concluido: boolean("concluido").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;

// ---------------------------------------------------------------------------
// Espaços
// ---------------------------------------------------------------------------
export const spaceCategories = pgTable("space_categories", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  ordem: integer("ordem").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spaces = pgTable(
  "spaces",
  {
    id: serial("id").primaryKey(),
    categoriaId: integer("categoria_id").references(() => spaceCategories.id),
    nome: varchar("nome", { length: 255 }).notNull(),
    descricao: text("descricao"),
    icone: varchar("icone", { length: 64 }),
    ordem: integer("ordem").notNull(),
    tipo: espacoTipoEnum("tipo").default("publicado").notNull(),
    formato: espacoFormatoEnum("formato").default("forum").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [index("spaces_ordem_idx").on(t.ordem)],
);

export type Space = typeof spaces.$inferSelect;

export const spaceMembers = pgTable(
  "space_members",
  {
    id: serial("id").primaryKey(),
    spaceId: integer("space_id")
      .notNull()
      .references(() => spaces.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("space_members_uk").on(t.spaceId, t.userId)],
);

// ---------------------------------------------------------------------------
// Publicações, comentários, reações, enquetes, seguir
// ---------------------------------------------------------------------------
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    spaceId: integer("space_id").references(() => spaces.id),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    conteudo: text("conteudo").notNull(),
    fixado: boolean("fixado").default(false).notNull(),
    resolvido: boolean("resolvido").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("posts_space_idx").on(t.spaceId),
    index("posts_created_idx").on(t.createdAt),
  ],
);

export type ForumPost = typeof posts.$inferSelect;

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    parentId: integer("parent_id"),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id),
    conteudo: text("conteudo").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [index("comments_post_idx").on(t.postId)],
);

export const reactions = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id),
    commentId: integer("comment_id").references(() => comments.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    tipo: reacaoEnum("tipo").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("reactions_post_idx").on(t.postId),
    uniqueIndex("reactions_uk").on(t.postId, t.commentId, t.userId, t.tipo),
  ],
);

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id),
  pergunta: varchar("pergunta", { length: 255 }).notNull(),
  opcoes: text("opcoes").notNull(), // JSON: string[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pollVotes = pgTable(
  "poll_votes",
  {
    id: serial("id").primaryKey(),
    pollId: integer("poll_id")
      .notNull()
      .references(() => polls.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    opcao: integer("opcao").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("poll_votes_uk").on(t.pollId, t.userId)],
);

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    deUserId: integer("de_user_id")
      .notNull()
      .references(() => users.id),
    paraUserId: integer("para_user_id").references(() => users.id),
    postId: integer("post_id").references(() => posts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("follows_user_idx").on(t.deUserId)],
);

// ---------------------------------------------------------------------------
// Cursos, módulos, aulas, progresso, quiz, certificados
// ---------------------------------------------------------------------------
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  cargaHoraria: integer("carga_horaria"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modules = pgTable(
  "modules",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    ordem: integer("ordem").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("modules_course_idx").on(t.courseId)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    moduleId: integer("module_id")
      .notNull()
      .references(() => modules.id),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    descricao: text("descricao"),
    videoUrl: text("video_url"),
    materialUrl: text("material_url"),
    transcricao: text("transcricao"),
    duracaoMin: integer("duracao_min"),
    ordem: integer("ordem").notNull(),
    planoMinimo: planoEnum("plano_minimo").default("gratuito").notNull(),
    publicada: boolean("publicada").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("lessons_module_idx").on(t.moduleId)],
);

export type Lesson = typeof lessons.$inferSelect;

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id),
    status: progressoEnum("status").default("concluido").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("lesson_progress_uk").on(t.userId, t.lessonId)],
);

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id")
    .notNull()
    .references(() => modules.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  perguntas: text("perguntas").notNull(), // JSON: [{pergunta, opcoes[], correta}]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    acertos: integer("acertos").notNull(),
    total: integer("total").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("quiz_attempts_user_idx").on(t.userId)],
);

export const certificates = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    codigo: varchar("codigo", { length: 32 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("certificates_uk").on(t.userId, t.courseId)],
);

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    descricao: text("descricao"),
    dataHora: timestamp("data_hora").notNull(),
    duracaoMin: integer("duracao_min"),
    link: varchar("link", { length: 512 }),
    local: varchar("local", { length: 255 }),
    limiteVagas: integer("limite_vagas"),
    recorrencia: varchar("recorrencia", { length: 64 }),
    gravacaoUrl: text("gravacao_url"),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("events_data_idx").on(t.dataHora)],
);

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    status: rsvpEnum("status").default("vou").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("event_rsvps_uk").on(t.userId, t.eventId)],
);

// ---------------------------------------------------------------------------
// Mensagens diretas
// ---------------------------------------------------------------------------
export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    userA: integer("user_a")
      .notNull()
      .references(() => users.id),
    userB: integer("user_b")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("conversations_uk").on(t.userA, t.userB)],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    deUserId: integer("de_user_id")
      .notNull()
      .references(() => users.id),
    paraUserId: integer("para_user_id")
      .notNull()
      .references(() => users.id),
    conteudo: text("conteudo").notNull(),
    lidaEm: timestamp("lida_em"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("messages_para_idx").on(t.paraUserId),
    index("messages_created_idx").on(t.createdAt),
  ],
);

export type Message = typeof messages.$inferSelect;

// ---------------------------------------------------------------------------
// Empresas, vagas, candidaturas
// ---------------------------------------------------------------------------
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  contatoNome: varchar("contato_nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  segmento: varchar("segmento", { length: 255 }),
  descricao: text("descricao"),
  status: empresaStatusEnum("status").default("pendente").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Company = typeof companies.$inferSelect;

export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    empresa: varchar("empresa", { length: 255 }).notNull(),
    descricao: text("descricao").notNull(),
    local: varchar("local", { length: 255 }),
    modelo: modeloVagaEnum("modelo").default("remoto").notNull(),
    faixaSalarial: varchar("faixa_salarial", { length: 255 }),
    requisitos: text("requisitos"),
    etariaFriendly: boolean("etaria_friendly").default(true).notNull(),
    contato: varchar("contato", { length: 320 }),
    ativa: boolean("ativa").default(true).notNull(),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("jobs_ativa_idx").on(t.ativa)],
);

export type Job = typeof jobs.$inferSelect;

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    mensagem: text("mensagem"),
    curriculoUrl: text("curriculo_url"),
    status: candidaturaEnum("status").default("enviada").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("applications_uk").on(t.jobId, t.userId)],
);

// ---------------------------------------------------------------------------
// Notificações
// ---------------------------------------------------------------------------
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    tipo: notificacaoTipoEnum("tipo").notNull(),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    corpo: text("corpo"),
    link: varchar("link", { length: 512 }),
    lidaEm: timestamp("lida_em"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.lidaEm)],
);

export const notificationPrefs = pgTable("notification_prefs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  resposta: boolean("resposta").default(true).notNull(),
  mencao: boolean("mencao").default(true).notNull(),
  mensagem: boolean("mensagem").default(true).notNull(),
  evento: boolean("evento").default(true).notNull(),
  vaga: boolean("vaga").default(true).notNull(),
  digest: varchar("digest", { length: 16 }).default("semanal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// Gamificação — razão de pontos (append-only) e badges
// ---------------------------------------------------------------------------
export const pointsLedger = pgTable(
  "points_ledger",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    acao: varchar("acao", { length: 64 }).notNull(),
    pontos: integer("pontos").notNull(),
    refTipo: varchar("ref_tipo", { length: 64 }),
    refId: integer("ref_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("points_ledger_user_idx").on(t.userId)],
);

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  codigo: varchar("codigo", { length: 64 }).notNull().unique(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    badgeId: integer("badge_id")
      .notNull()
      .references(() => badges.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_badges_uk").on(t.userId, t.badgeId)],
);

// ---------------------------------------------------------------------------
// Moderação e auditoria
// ---------------------------------------------------------------------------
export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    reporterId: integer("reporter_id")
      .notNull()
      .references(() => users.id),
    postId: integer("post_id").references(() => posts.id),
    commentId: integer("comment_id").references(() => comments.id),
    messageId: integer("message_id").references(() => messages.id),
    reportedUserId: integer("reported_user_id").references(() => users.id),
    motivo: text("motivo").notNull(),
    status: reportStatusEnum("status").default("aberto").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("reports_status_idx").on(t.status)],
);

export const moderationActions = pgTable("moderation_actions", {
  id: serial("id").primaryKey(),
  moderatorId: integer("moderator_id")
    .notNull()
    .references(() => users.id),
  acao: varchar("acao", { length: 64 }).notNull(),
  alvoTipo: varchar("alvo_tipo", { length: 64 }).notNull(),
  alvoId: integer("alvo_id").notNull(),
  motivo: text("motivo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    acao: varchar("acao", { length: 128 }).notNull(),
    detalhe: text("detalhe"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("audit_log_created_idx").on(t.createdAt)],
);

// ---------------------------------------------------------------------------
// Planos e assinaturas (pagamento = stub, ver api/lib/payment.ts)
// ---------------------------------------------------------------------------
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  codigo: planoEnum("codigo").notNull().unique(),
  nome: varchar("nome", { length: 255 }).notNull(),
  precoCentavos: integer("preco_centavos").default(0).notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    planId: integer("plan_id")
      .notNull()
      .references(() => plans.id),
    status: varchar("status", { length: 32 }).default("ativa").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("subscriptions_user_idx").on(t.userId)],
);
