import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { sql } from "drizzle-orm";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 10 * 1024 * 1024 }));

// Healthcheck (Railway): sempre responde, mesmo sem banco
app.get("/health", async (c) => {
  let banco: "ok" | "erro" | "desligado" = "desligado";
  if (env.dbEnabled) {
    try {
      const db = getDb();
      if (!db) throw new Error("sem conexão");
      await db.execute(sql`select 1`);
      banco = "ok";
    } catch {
      banco = "erro";
    }
  }
  return c.json({
    status: "ok",
    banco,
    email: env.emailEnabled ? "configurado" : "stdout",
    uploads: env.uploadEnabled ? "configurado" : "desligado",
    autenticacao: env.authEnabled ? "ok" : "sem APP_SECRET",
  });
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ erro: "Rota não encontrada" }, 404));

export default app;

// Migrações + seed no boot: idempotentes, e falha NUNCA derruba o processo
if (env.dbEnabled) {
  import("./ensure-schema")
    .then((m) => m.ensureSchema())
    .catch((e) =>
      console.error("[boot] migração/seed falhou (servidor continua):", e),
    );
} else {
  console.log("[boot] sem DATABASE_URL — rodando sem banco de dados.");
}

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  serve({ fetch: app.fetch, port: env.port }, () => {
    console.log(`Recomeça 50+ rodando na porta ${env.port}`);
  });
}
