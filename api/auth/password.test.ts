import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("senha (argon2id)", () => {
  it("hash + verificação correta", async () => {
    const hash = await hashPassword("minha-frase-senha-123");
    expect(hash).not.toContain("minha-frase-senha-123");
    expect(await verifyPassword(hash, "minha-frase-senha-123")).toBe(true);
  });

  it("senha errada não entra", async () => {
    const hash = await hashPassword("senha-certa");
    expect(await verifyPassword(hash, "senha-errada")).toBe(false);
  });

  it("hash inválido retorna falso em vez de explodir", async () => {
    expect(await verifyPassword("lixo", "qualquer")).toBe(false);
  });
});
