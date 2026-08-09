import { env } from "./env";

/**
 * E-mail transacional via Resend.
 * Sem RESEND_API_KEY: o e-mail é impresso no stdout (modo degradado),
 * o que permite testar o fluxo completo sem credencial.
 */
export async function sendEmail(opts: {
  para: string;
  assunto: string;
  texto: string;
}): Promise<{ entregue: boolean }> {
  if (!env.emailEnabled) {
    console.log("=== E-MAIL (modo stdout, sem RESEND_API_KEY) ===");
    console.log(`Para: ${opts.para}`);
    console.log(`Assunto: ${opts.assunto}`);
    console.log(opts.texto);
    console.log("=== FIM DO E-MAIL ===");
    return { entregue: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.resendFrom,
        to: [opts.para],
        subject: opts.assunto,
        text: opts.texto,
      }),
    });
    if (!res.ok) {
      console.error("Resend falhou:", res.status, await res.text());
      return { entregue: false };
    }
    return { entregue: true };
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    return { entregue: false };
  }
}

export function emailCodigo(codigo: string, finalidade: string): string {
  return [
    `Olá! Aqui é a Recomeça.`,
    ``,
    `Seu código para ${finalidade} é:`,
    ``,
    `    ${codigo}`,
    ``,
    `Ele vale por 15 minutos e só pode ser usado uma vez.`,
    `Se você não pediu este código, ignore este e-mail.`,
    ``,
    `Com carinho, equipe Recomeça`,
  ].join("\n");
}
