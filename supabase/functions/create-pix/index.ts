import { serve } from "https://deno.land/std/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // Recebe os dados enviados pelo frontend
    const { user_id, email } = await req.json();
    if (!user_id || !email) {
      return new Response(JSON.stringify({
        error: "user_id e email são obrigatórios"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    
    // Log para debug
    console.log("Criando pagamento PIX com valor: 19.90");
    
    // Faz requisição para Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")}`,
        "X-Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify({
        transaction_amount: 19.90,
        description: "Plano Premium Quiz",
        payment_method_id: "pix",
        payer: {
          email: email
        },
        external_reference: user_id
      })
    });
    
    const data = await response.json();
    
    // Verifica se houve erro na API do Mercado Pago
    if (response.status !== 201) {
      return new Response(JSON.stringify({
        error: data.message || "Erro ao criar pagamento Pix"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    
    // Pega os dados do QR Code
    const tx = data.point_of_interaction.transaction_data;
    return new Response(JSON.stringify({
      payment_id: data.id,
      qr_code: tx.qr_code,
      qr_code_base64: tx.qr_code_base64,
      ticket_url: tx.ticket_url,
      status: data.status
    }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}); 