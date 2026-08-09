/**
 * PaymentProvider — ponto de extensão para gateway de pagamento.
 *
 * A implementação atual é um STUB proposital: apenas marca o plano no
 * banco, sem cobrar ninguém. Quando for hora de cobrar de verdade
 * (Stripe, Asaas, Mercado Pago…), crie uma classe que implemente esta
 * interface e troque aqui — nenhuma rota precisa mudar.
 */
export interface PaymentProvider {
  /** Inicia o processo de assinatura. Retorna URL de checkout ou null. */
  iniciarAssinatura(userId: number, plano: "membro"): Promise<string | null>;
  /** Cancela a assinatura vigente. */
  cancelarAssinatura(userId: number): Promise<void>;
}

export class StubPaymentProvider implements PaymentProvider {
  async iniciarAssinatura(): Promise<string | null> {
    // Sem gateway: a rota que chama este método marca o plano direto no banco.
    return null;
  }
  async cancelarAssinatura(): Promise<void> {
    // Nada a cancelar fora do banco.
  }
}

export const paymentProvider: PaymentProvider = new StubPaymentProvider();
