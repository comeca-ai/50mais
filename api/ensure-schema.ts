/**
 * Bootstrap idempotente do banco (Postgres).
 *
 * Roda no boot do servidor: aplica as migrações SQL embutidas no bundle e,
 * se o banco estiver vazio, carrega o conteúdo inicial (seed). Qualquer
 * falha é registrada no log, mas NUNCA derruba o processo.
 */
import postgres from "postgres";
import { env } from "./lib/env";
import { MIGRATIONS } from "./migrations.generated";

/** Códigos Postgres de "já existe" — seguros para ignorar (idempotência). */
const ERROS_IDEMPOTENTES = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (types, enums)
  "42701", // duplicate_column
  "42P06", // duplicate_schema
  "23505", // unique_violation
]);

export async function ensureSchema(): Promise<void> {
  if (!env.dbEnabled) {
    console.log("[boot] DATABASE_URL não definida — banco desligado, servidor segue sem ele.");
    return;
  }

  const client = postgres(env.databaseUrl, { prepare: false, max: 1 });
  let aplicados = 0;
  let ignorados = 0;

  try {
    for (const migration of MIGRATIONS) {
      for (const trecho of migration.split("--> statement-breakpoint")) {
        const stmt = trecho.trim();
        if (!stmt) continue;
        try {
          await client.unsafe(stmt);
          aplicados++;
        } catch (e) {
          const code = (e as { code?: string })?.code ?? "";
          if (ERROS_IDEMPOTENTES.has(code)) {
            ignorados++;
          } else {
            console.error(
              `[boot] falha em statement (${code || "??"}):`,
              String(e).slice(0, 300),
            );
          }
        }
      }
    }
    console.log(`[boot] migrações ok (${aplicados} aplicados, ${ignorados} já existentes)`);
  } catch (e) {
    console.error("[boot] erro ao abrir conexão para migrar:", String(e).slice(0, 300));
  } finally {
    await client.end().catch(() => {});
  }

  // Seed (conteúdo inicial) — só se o banco estiver vazio
  try {
    const { seed } = await import("./seed");
    await seed();
  } catch (e) {
    console.error("[boot] seed falhou (servidor continua):", String(e).slice(0, 300));
  }
}
