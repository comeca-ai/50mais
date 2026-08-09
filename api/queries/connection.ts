import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;

/**
 * Conexão preguiçosa: sem DATABASE_URL, retorna null e as rotas degradam
 * com erro amigável em vez de derrubar o processo.
 */
export function getDb() {
  if (!env.dbEnabled) return null;
  if (!instance) {
    const client = postgres(env.databaseUrl, { prepare: false });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

export function requireDb() {
  const db = getDb();
  if (!db) {
    throw new Error(
      "Banco de dados não configurado (DATABASE_URL ausente). Esta área está temporariamente indisponível.",
    );
  }
  return db;
}
