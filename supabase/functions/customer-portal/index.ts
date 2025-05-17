
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Constantes para CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função para log de etapas (útil para depuração)
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Lidar com solicitações OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Função iniciada");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    logStep("Chave do Stripe verificada");
    
    // Verificar configuração do portal do cliente no Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    try {
      // Tenta obter a configuração do portal do cliente para verificar se está configurada
      await stripe.billingPortal.configurations.list({ limit: 1 });
    } catch (configError) {
      logStep("AVISO: Portal do cliente não está configurado no Stripe", { message: configError.message });
      return new Response(JSON.stringify({ 
        error: "Portal do cliente do Stripe não está configurado. Configure-o em https://dashboard.stripe.com/test/settings/billing/portal"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Criar cliente Supabase com chave de serviço para operações de escrita
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Verificar autenticação do usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Cabeçalho de autorização não fornecido");
    logStep("Cabeçalho de autorização encontrado");
    
    const token = authHeader.replace("Bearer ", "");
    logStep("Autenticando usuário com token");
    
    // Obter informações do usuário a partir do token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email não disponível");
    logStep("Usuário autenticado", { userId: user.id, email: user.email });
    
    // Verificar se o cliente já existe no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    // Se não existe cliente no Stripe, criar um novo
    let customerId;
    if (customers.data.length === 0) {
      logStep("Cliente não encontrado no Stripe, criando novo cliente");
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_uid: user.id
        }
      });
      customerId = customer.id;
      logStep("Novo cliente criado no Stripe", { customerId });
    } else {
      customerId = customers.data[0].id;
      logStep("Cliente existente encontrado no Stripe", { customerId });
    }
    
    // Criar a sessão do portal do cliente
    const origin = req.headers.get("origin") || "https://hrpchhrykumcdeolvtfs.supabase.co";
    logStep("Criando sessão de portal para cliente", { customerId, returnUrl: origin });
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: origin,
    });
    
    if (!session.url) {
      throw new Error("Falha ao criar URL da sessão do portal");
    }
    
    logStep("Sessão do portal criada com sucesso", { 
      sessionId: session.id,
      url: session.url
    });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO em customer-portal", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
