import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req)=>{
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
  };
  if (req.method === "OPTIONS") {
    return new Response("", {
      status: 200,
      headers
    });
  }
  if (req.method === "GET") {
    return new Response(JSON.stringify({
      message: "Webhook funcionando!"
    }), {
      headers
    });
  }
  if (req.method === "POST") {
    try {
      console.log("=== WEBHOOK RECEBIDO ===", new Date().toISOString());
      const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
      const body = await req.json();
      console.log("Body recebido:", JSON.stringify(body, null, 2));
      
      if (body.type === "payment") {
        const paymentId = body.data.id;
        console.log("Payment ID:", paymentId);
        
        // Buscar detalhes do pagamento no MercadoPago
        const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")}`
          }
        });
        
        if (!resp.ok) {
          console.error("Erro ao buscar pagamento no MercadoPago:", resp.status, resp.statusText);
          return new Response(JSON.stringify({
            error: "Erro ao buscar pagamento no MercadoPago"
          }), {
            status: 500,
            headers
          });
        }
        
        const payment = await resp.json();
        console.log("Payment status:", payment.status);
        console.log("Payment external_reference:", payment.external_reference);
        console.log("Payment payment_method_id:", payment.payment_method_id);
        console.log("Payment date_approved:", payment.date_approved);
        
        // Verificar se o pagamento foi aprovado (incluindo PIX)
        const isApproved = payment.status === "approved" || 
                          (payment.payment_method_id === "pix" && payment.date_approved !== null);
        
        if (isApproved) {
          const userId = payment.external_reference;
          if (!userId) {
            console.error("external_reference não encontrado no pagamento");
            return new Response(JSON.stringify({
              error: "external_reference não encontrado"
            }), {
              status: 400,
              headers
            });
          }
          
          console.log("Verificando se usuário existe na tabela profiles:", userId);
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id, plan, has_access, subscription_status")
            .eq("id", userId)
            .single();
            
          if (userError) {
            console.error("Erro ao buscar usuário:", userError);
            return new Response(JSON.stringify({
              error: "Usuário não encontrado: " + userError.message
            }), {
              status: 404,
              headers
            });
          }
          
          console.log("Usuário encontrado:", userData);
          
          // Calcular data de expiração (30 dias a partir de agora)
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30);
          console.log("Data de expiração calculada:", expirationDate.toISOString());
          
          console.log("Atualizando usuário:", userId);
          const { data, error } = await supabase
            .from("profiles")
            .update({
              plan: "assinante",
              has_access: true,
              subscription_status: "active",
              subscription_end_date: expirationDate.toISOString()
            })
            .eq("id", userId)
            .select();
            
          if (error) {
            console.error("Erro ao atualizar usuário:", error);
            return new Response(JSON.stringify({
              error: "Erro ao atualizar usuário: " + error.message
            }), {
              status: 500,
              headers
            });
          } else {
            console.log("Usuário atualizado com sucesso:", data);
          }
        } else {
          console.log("Pagamento não aprovado, status:", payment.status);
        }
      } else {
        console.log("Tipo de evento não é payment:", body.type);
      }
      
      return new Response(JSON.stringify({
        received: true
      }), {
        status: 200,
        headers
      });
    } catch (error) {
      console.error("Erro no webhook:", error);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers
      });
    }
  }
  return new Response(JSON.stringify({
    error: "Method not allowed"
  }), {
    status: 405,
    headers
  });
}); 