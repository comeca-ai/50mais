/**
 * Bootstrap idempotente do banco de dados.
 *
 * Executado na inicialização do servidor em produção: garante que todas as
 * tabelas existam (CREATE TABLE IF NOT EXISTS) e que as aulas iniciais do
 * curso estejam cadastradas. É seguro rodar várias vezes — nada é apagado
 * nem duplicado.
 */
import mysql from "mysql2/promise";
import { env } from "./lib/env";

const DDL = [
  `CREATE TABLE IF NOT EXISTS users (
    id bigint unsigned auto_increment PRIMARY KEY,
    unionId varchar(255) NOT NULL UNIQUE,
    name varchar(255),
    email varchar(320),
    avatar text,
    role enum('user','admin') NOT NULL DEFAULT 'user',
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastSignInAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS profiles (
    id bigint unsigned auto_increment PRIMARY KEY,
    userId bigint unsigned NOT NULL UNIQUE,
    faixaEtaria enum('45-49','50-54','55-59','60-64','65+') NOT NULL,
    cidade varchar(255),
    profissaoAtual varchar(255),
    areaInteresse varchar(255),
    objetivo text,
    experienciaTech enum('iniciante','basico','intermediario','avancado') NOT NULL DEFAULT 'iniciante',
    disponivelParaVagas tinyint(1) NOT NULL DEFAULT 1,
    concluido tinyint(1) NOT NULL DEFAULT 0,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS lessons (
    id bigint unsigned auto_increment PRIMARY KEY,
    modulo varchar(255) NOT NULL,
    titulo varchar(255) NOT NULL,
    descricao text,
    videoUrl text,
    materialUrl text,
    duracaoMin int,
    ordem int NOT NULL,
    publicada tinyint(1) NOT NULL DEFAULT 1,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS forumPosts (
    id bigint unsigned auto_increment PRIMARY KEY,
    authorId bigint unsigned NOT NULL,
    categoria enum('duvidas','experiencias','oportunidades','geral') NOT NULL DEFAULT 'geral',
    titulo varchar(255) NOT NULL,
    conteudo text NOT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS forumComments (
    id bigint unsigned auto_increment PRIMARY KEY,
    postId bigint unsigned NOT NULL,
    authorId bigint unsigned NOT NULL,
    conteudo text NOT NULL,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS jobs (
    id bigint unsigned auto_increment PRIMARY KEY,
    titulo varchar(255) NOT NULL,
    empresa varchar(255) NOT NULL,
    descricao text NOT NULL,
    local varchar(255),
    modelo enum('presencial','hibrido','remoto') NOT NULL DEFAULT 'remoto',
    contato varchar(320),
    ativa tinyint(1) NOT NULL DEFAULT 1,
    createdBy bigint unsigned,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS jobInterests (
    id bigint unsigned auto_increment PRIMARY KEY,
    jobId bigint unsigned NOT NULL,
    userId bigint unsigned NOT NULL,
    mensagem text,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS companies (
    id bigint unsigned auto_increment PRIMARY KEY,
    nome varchar(255) NOT NULL,
    contatoNome varchar(255) NOT NULL,
    email varchar(320) NOT NULL,
    segmento varchar(255),
    descricao text,
    status enum('pendente','aprovada') NOT NULL DEFAULT 'pendente',
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

const SEED_LESSONS: Array<{
  modulo: string;
  titulo: string;
  descricao: string;
  ordem: number;
}> = [
  {
    modulo: "Módulo 1 — Desmistificando a inteligência artificial",
    titulo: "O que é IA, afinal? (sem tecniquês)",
    descricao:
      "Uma explicação simples e direta do que é inteligência artificial, de onde ela veio e por que ela é uma oportunidade — não uma ameaça — para profissionais experientes.",
    ordem: 1,
  },
  {
    modulo: "Módulo 1 — Desmistificando a inteligência artificial",
    titulo: "IA no dia a dia: você já usa sem perceber",
    descricao:
      "Do GPS ao banco no celular: reconhecendo onde a IA já está presente na sua vida para perder o medo da novidade.",
    ordem: 2,
  },
  {
    modulo: "Módulo 1 — Desmistificando a inteligência artificial",
    titulo: "Criando sua primeira conta em uma ferramenta de IA",
    descricao:
      "Passo a passo, tela por tela, para criar sua conta e fazer sua primeira pergunta a uma IA.",
    ordem: 3,
  },
  {
    modulo: "Módulo 2 — Conversando com a IA",
    titulo: "Como conversar com a IA e ser entendido",
    descricao:
      "A arte de fazer bons pedidos à IA (o chamado 'prompt') e por que a sua experiência profissional é uma vantagem enorme aqui.",
    ordem: 4,
  },
  {
    modulo: "Módulo 2 — Conversando com a IA",
    titulo: "Pedidos prontos para o trabalho: e-mails, relatórios e apresentações",
    descricao:
      "Exemplos práticos e prontos para copiar: como a IA acelera as tarefas do dia a dia no escritório.",
    ordem: 5,
  },
  {
    modulo: "Módulo 3 — IA aplicada à sua profissão",
    titulo: "Currículo e LinkedIn turbinados com IA",
    descricao:
      "Use a IA para atualizar seu currículo, destacar sua experiência e se apresentar melhor para recrutadores.",
    ordem: 6,
  },
  {
    modulo: "Módulo 3 — IA aplicada à sua profissão",
    titulo: "Simulando entrevistas de emprego com a IA",
    descricao:
      "Treine entrevistas com a IA fazendo o papel de recrutador — e chegue confiante na entrevista de verdade.",
    ordem: 7,
  },
  {
    modulo: "Módulo 4 — Segurança e próximos passos",
    titulo: "Golpes e cuidados: usando IA com segurança",
    descricao:
      "Como identificar golpes que usam IA, proteger seus dados e ensinar a família a fazer o mesmo.",
    ordem: 8,
  },
  {
    modulo: "Módulo 4 — Segurança e próximos passos",
    titulo: "Seu plano de recomeço: da comunidade para o mercado",
    descricao:
      "Como montar seu plano de transição, usar a comunidade a seu favor e se preparar para as vagas das empresas parceiras.",
    ordem: 9,
  },
];

export async function ensureSchema() {
  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection({
      uri: env.databaseUrl,
      connectTimeout: 20000,
    });

    for (const stmt of DDL) {
      await conn.query(stmt);
    }

    const [rows] = await conn.query("SELECT COUNT(*) AS n FROM lessons");
    const count = Number((rows as Array<{ n: number }>)[0]?.n ?? 0);
    if (count === 0) {
      for (const l of SEED_LESSONS) {
        await conn.query(
          "INSERT INTO lessons (modulo, titulo, descricao, ordem) VALUES (?, ?, ?, ?)",
          [l.modulo, l.titulo, l.descricao, l.ordem],
        );
      }
      console.log(`Seed: ${SEED_LESSONS.length} aulas iniciais criadas.`);
    }

    console.log("Schema do banco verificado com sucesso.");
  } catch (err) {
    // Não derruba o servidor se o banco estiver momentaneamente indisponível.
    console.error("ensureSchema: não foi possível verificar o banco:", err);
  } finally {
    await conn?.end().catch(() => undefined);
  }
}
