import { beforeAll, describe, expect, it } from "vitest";

let signSession: typeof import("./session").signSession;
let verifySession: typeof import("./session").verifySession;

beforeAll(async () => {
  process.env.APP_SECRET = "segredo-de-teste-com-32-caracteres!!";
  const m = await import("./session");
  signSession = m.signSession;
  verifySession = m.verifySession;
});

describe("sessão JWT", () => {
  it("assina e verifica ida e volta", async () => {
    const token = await signSession({ sid: 42, uid: 7 });
    const dados = await verifySession(token);
    expect(dados?.sid).toBe(42);
    expect(dados?.uid).toBe(7);
  });

  it("token adulterado é rejeitado", async () => {
    const token = await signSession({ sid: 1, uid: 1 });
    const adulterado = token.slice(0, -2) + "xx";
    expect(await verifySession(adulterado)).toBeNull();
  });

  it("lixo não é sessão", async () => {
    expect(await verifySession("nao-e-um-jwt")).toBeNull();
  });
});
