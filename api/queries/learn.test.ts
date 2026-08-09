import { describe, expect, it } from "vitest";
import { corrigirQuiz } from "./learn";

const gabarito = [
  { correta: 0 },
  { correta: 1 },
  { correta: 2 },
  { correta: 0 },
  { correta: 1 },
  { correta: 2 },
  { correta: 0 },
  { correta: 1 },
  { correta: 2 },
  { correta: 0 },
];

describe("corrigirQuiz — regra dos 70%", () => {
  it("gabarito completo passa", () => {
    const r = corrigirQuiz(gabarito, gabarito.map((g) => g.correta));
    expect(r.acertos).toBe(10);
    expect(r.passou).toBe(true);
  });

  it("exatamente 70% passa", () => {
    const respostas = gabarito.map((g, i) => (i < 7 ? g.correta : -1));
    expect(corrigirQuiz(gabarito, respostas).passou).toBe(true);
  });

  it("60% não passa", () => {
    const respostas = gabarito.map((g, i) => (i < 6 ? g.correta : -1));
    const r = corrigirQuiz(gabarito, respostas);
    expect(r.passou).toBe(false);
    expect(r.notaMinima).toBe(7);
  });

  it("resposta em branco conta como erro", () => {
    const r = corrigirQuiz(gabarito, []);
    expect(r.acertos).toBe(0);
    expect(r.passou).toBe(false);
  });
});
