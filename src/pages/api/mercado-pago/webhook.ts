import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function buscarPagamentoNoMercadoPago(paymentId: string) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    },
  });
  return res.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { data } = req.body;
  if (data && data.id) {
    const payment = await buscarPagamentoNoMercadoPago(data.id);

    if (payment.status === "approved") {
      const email = payment.payer.email;
      await supabase
        .from("usuarios")
        .update({ plano: "pro" })
        .eq("email", email);
    }
  }
  res.status(200).json({ received: true });
} 