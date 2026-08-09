import { describe, expect, it } from "vitest";
import { PONTOS, nivelDe } from "./pontos";

describe("tabela de pontos", () => {
  it("valores batem com a regra da comunidade", () => {
    expect(PONTOS.post).toBe(10);
    expect(PONTOS.comentario).toBe(5);
    expect(PONTOS.aulaConcluida).toBe(15);
    expect(PONTOS.presencaEvento).toBe(3);
  });
});

describe("nivelDe — nomes humanos dos níveis", () => {
  it("0 a 49 pontos = Semente", () => {
    expect(nivelDe(0).nome).toBe("Semente");
    expect(nivelDe(49).nome).toBe("Semente");
    expect(nivelDe(0).proximo).toBe(50);
  });
  it("50 a 149 = Chegando", () => {
    expect(nivelDe(50).nome).toBe("Chegando");
    expect(nivelDe(149).nome).toBe("Chegando");
  });
  it("150 a 299 = Praticando", () => {
    expect(nivelDe(150).nome).toBe("Praticando");
  });
  it("300 a 599 = Ajudando", () => {
    expect(nivelDe(300).nome).toBe("Ajudando");
  });
  it("600+ = Referência (nível máximo, sem próximo)", () => {
    expect(nivelDe(600).nome).toBe("Referência");
    expect(nivelDe(9999).nome).toBe("Referência");
    expect(nivelDe(600).proximo).toBeNull();
  });
});
