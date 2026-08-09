import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  int,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ---------------------------------------------------------------------------
// Perfil do membro (cadastro de interessados 50+)
// ---------------------------------------------------------------------------
export const profiles = mysqlTable("profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .unique(),
  faixaEtaria: mysqlEnum("faixaEtaria", [
    "45-49",
    "50-54",
    "55-59",
    "60-64",
    "65+",
  ]).notNull(),
  cidade: varchar("cidade", { length: 255 }),
  profissaoAtual: varchar("profissaoAtual", { length: 255 }),
  areaInteresse: varchar("areaInteresse", { length: 255 }),
  objetivo: text("objetivo"),
  experienciaTech: mysqlEnum("experienciaTech", [
    "iniciante",
    "basico",
    "intermediario",
    "avancado",
  ])
    .default("iniciante")
    .notNull(),
  disponivelParaVagas: boolean("disponivelParaVagas").default(true).notNull(),
  concluido: boolean("concluido").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// ---------------------------------------------------------------------------
// Aulas do curso (catálogo)
// ---------------------------------------------------------------------------
export const lessons = mysqlTable("lessons", {
  id: serial("id").primaryKey(),
  modulo: varchar("modulo", { length: 255 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  videoUrl: text("videoUrl"),
  materialUrl: text("materialUrl"),
  duracaoMin: int("duracaoMin"),
  ordem: int("ordem").notNull(),
  publicada: boolean("publicada").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// ---------------------------------------------------------------------------
// Espaços da comunidade (estilo Circle)
// acesso: "publico" = qualquer visitante lê | "membros" = só logados (base do
// futuro paywall)
// ---------------------------------------------------------------------------
export const spaces = mysqlTable("spaces", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ordem: int("ordem").notNull(),
  acesso: mysqlEnum("acesso", ["publico", "membros"])
    .default("publico")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Space = typeof spaces.$inferSelect;
export type InsertSpace = typeof spaces.$inferInsert;

// ---------------------------------------------------------------------------
// Fórum da comunidade
// ---------------------------------------------------------------------------
export const forumPosts = mysqlTable("forumPosts", {
  id: serial("id").primaryKey(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  spaceId: bigint("spaceId", { mode: "number", unsigned: true }),
  categoria: mysqlEnum("categoria", [
    "duvidas",
    "experiencias",
    "oportunidades",
    "geral",
  ])
    .default("geral")
    .notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

export const forumComments = mysqlTable("forumComments", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  conteudo: text("conteudo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = typeof forumComments.$inferInsert;

// ---------------------------------------------------------------------------
// Vagas de emprego
// ---------------------------------------------------------------------------
export const jobs = mysqlTable("jobs", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  empresa: varchar("empresa", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  local: varchar("local", { length: 255 }),
  modelo: mysqlEnum("modelo", ["presencial", "hibrido", "remoto"])
    .default("remoto")
    .notNull(),
  contato: varchar("contato", { length: 320 }),
  ativa: boolean("ativa").default(true).notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Manifestação de interesse do membro em uma vaga
export const jobInterests = mysqlTable("jobInterests", {
  id: serial("id").primaryKey(),
  jobId: bigint("jobId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  mensagem: text("mensagem"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobInterest = typeof jobInterests.$inferSelect;
export type InsertJobInterest = typeof jobInterests.$inferInsert;

// ---------------------------------------------------------------------------
// Empresas parceiras (cadastro público, aprovado pelo admin)
// ---------------------------------------------------------------------------
export const companies = mysqlTable("companies", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  contatoNome: varchar("contatoNome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  segmento: varchar("segmento", { length: 255 }),
  descricao: text("descricao"),
  status: mysqlEnum("status", ["pendente", "aprovada"])
    .default("pendente")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ---------------------------------------------------------------------------
// Progresso do aluno no curso
// ---------------------------------------------------------------------------
export const lessonProgress = mysqlTable("lessonProgress", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lessonId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;

// ---------------------------------------------------------------------------
// Eventos ao vivo (encontros, aulas ao vivo, palestras)
// ---------------------------------------------------------------------------
export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataHora: timestamp("dataHora").notNull(),
  duracaoMin: int("duracaoMin"),
  link: varchar("link", { length: 512 }),
  local: varchar("local", { length: 255 }),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const eventRsvps = mysqlTable("eventRsvps", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["vou", "talvez"]).default("vou").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventRsvp = typeof eventRsvps.$inferSelect;

// ---------------------------------------------------------------------------
// Mensagens diretas entre membros
// ---------------------------------------------------------------------------
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  deUserId: bigint("deUserId", { mode: "number", unsigned: true }).notNull(),
  paraUserId: bigint("paraUserId", { mode: "number", unsigned: true }).notNull(),
  conteudo: text("conteudo").notNull(),
  lidaEm: timestamp("lidaEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
