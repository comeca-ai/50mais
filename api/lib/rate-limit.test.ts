import { describe, expect, it } from "vitest";
import { rateLimit, limitar } from "./rate-limit";

describe("rateLimit", () => {
  it("permite até o limite e depois retorna falso", () => {
    const chave = `teste:${Math.random()}`;
    expect(rateLimit({ chave, limite: 3, janelaMs: 60_000 })).toBe(true);
    expect(rateLimit({ chave, limite: 3, janelaMs: 60_000 })).toBe(true);
    expect(rateLimit({ chave, limite: 3, janelaMs: 60_000 })).toBe(true);
    expect(rateLimit({ chave, limite: 3, janelaMs: 60_000 })).toBe(false);
  });

  it("chaves diferentes são independentes", () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    expect(rateLimit({ chave: a, limite: 1, janelaMs: 60_000 })).toBe(true);
    expect(rateLimit({ chave: b, limite: 1, janelaMs: 60_000 })).toBe(true);
  });

  it("depois da janela, volta a permitir", async () => {
    const chave = `c:${Math.random()}`;
    expect(rateLimit({ chave, limite: 1, janelaMs: 20 })).toBe(true);
    expect(rateLimit({ chave, limite: 1, janelaMs: 20 })).toBe(false);
    await new Promise((r) => setTimeout(r, 30));
    expect(rateLimit({ chave, limite: 1, janelaMs: 20 })).toBe(true);
  });
});

describe("limitar — versão que lança erro", () => {
  it("estoura com mensagem amigável em português", () => {
    const chave = `d:${Math.random()}`;
    limitar({ chave, limite: 1, janelaMs: 60_000 });
    expect(() => limitar({ chave, limite: 1, janelaMs: 60_000 })).toThrowError(
      /tente de novo com calma/,
    );
  });
});
