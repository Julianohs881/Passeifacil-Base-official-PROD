import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // CORS pré-flight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const mpToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!mpToken) {
      return new Response(JSON.stringify({
        error: "MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente."
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Método não permitido"
      }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({
        error: "E-mail é obrigatório"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    // Cria preferência de pagamento Pix usando fetch
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            title: "Assinatura PRO Passei Fácil",
            quantity: 1,
            currency_id: "BRL",
            unit_price: 14.90
          }
        ],
        payer: { email },
        payment_methods: {
          excluded_payment_types: [{ id: "credit_card" }],
          default_payment_method_id: "pix"
        },
        back_urls: {
          success: "https://passeifacil.com.br/subscription?status=success",
          failure: "https://passeifacil.com.br/subscription?status=error",
          pending: "https://passeifacil.com.br/subscription?status=pending"
        },
        auto_return: "approved"
      })
    });
    const data = await response.json();
    
    // Log para debug
    console.log("Resposta do Mercado Pago:", JSON.stringify(data, null, 2));
    console.log("Status da resposta:", response.status);
    
    if (!response.ok) {
      console.error("Erro na API do Mercado Pago:", data);
      return new Response(JSON.stringify({
        error: data.message || "Erro ao gerar link de pagamento Pix",
        details: data.cause ? JSON.stringify(data.cause) : (data ? JSON.stringify(data) : "Resposta vazia do Mercado Pago")
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    
    if (data && data.init_point) {
      return new Response(JSON.stringify({
        init_point: data.init_point
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } else {
      console.error("Resposta do Mercado Pago sem init_point:", data);
      return new Response(JSON.stringify({
        error: "Erro ao gerar link de pagamento Pix",
        details: data ? JSON.stringify(data) : "Resposta vazia do Mercado Pago"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Erro inesperado ao tentar gerar pagamento Pix",
      details: err && err.message ? err.message : String(err)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}); 