/**
 * Lê db/migrations/*.sql e gera api/migrations.generated.ts com o SQL
 * embutido, para que as migrações de boot viajem dentro do bundle (dist/).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "db/migrations";
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const migrations = files.map((f) => readFileSync(join(dir, f), "utf8"));

const out = `// GERADO automaticamente por scripts/embed-migrations.mjs — não editar.
export const MIGRATIONS: string[] = ${JSON.stringify(migrations, null, 2)};
`;

writeFileSync("api/migrations.generated.ts", out);
console.log(`[embed-migrations] ${files.length} arquivo(s) embutido(s).`);
