import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function criarPagamentoPix(valor: number, email: string) {
  const payment = await mercadopago.payment.create({
    transaction_amount: valor,
    description: "Pagamento via PIX",
    payment_method_id: "pix",
    payer: {
      email,
    },
  });
  return payment.body;
} 