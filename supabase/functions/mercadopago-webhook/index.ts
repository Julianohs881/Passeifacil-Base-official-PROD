import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!, 
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  const body = await req.json();
  
  if (body.type === "payment") {
    const paymentId = body.data.id;
    
    // Consulta o pagamento no Mercado Pago
    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")}`
      }
    });
    
    const payment = await resp.json();
    
    if (payment.status === "approved") {
      const userId = payment.external_reference; // o mesmo user_id enviado no create-pix
      
      await supabase
        .from("users")
        .update({
          plan: "assinante",
          has_access: true,
          subscription_status: "active"
        })
        .eq("id", userId);
    }
  }
  
  return new Response(JSON.stringify({
    received: true
  }), {
    status: 200,
    headers: corsHeaders
  });
}); 