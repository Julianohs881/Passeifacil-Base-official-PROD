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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Lidar com solicitações OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Função iniciada");

    // Obter a chave do Stripe do ambiente
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    logStep("Chave do Stripe verificada");
    
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
    
    // Inicializar o Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Verificar se o usuário existe como cliente no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("Nenhum cliente encontrado, atualizando estado sem assinatura");
      
      // Atualizar o perfil do usuário para plano gratuito
      await supabaseClient.from("profiles").update({
        plan: "gratuito"
      }).eq("id", user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "gratuito"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Cliente Stripe encontrado", { customerId });

    // Verificar assinaturas ativas do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    
    let plan = "gratuito";
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      plan = "pro";
      
      logStep("Assinatura ativa encontrada", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd 
      });
    } else {
      // Add an extra check for completed checkouts that might not have updated the plan
      const checkouts = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 5,
        status: 'complete'
      });
      
      // Look for a recently completed checkout
      const recentCheckout = checkouts.data.find(checkout => {
        // Check if it's a recent checkout (last 24 hours)
        const checkoutTime = new Date(checkout.created * 1000);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return checkoutTime > oneDayAgo && checkout.payment_status === 'paid';
      });
      
      if (recentCheckout) {
        // If we found a recent successful checkout, set the plan to pro
        plan = "pro";
        logStep("Checkout recente bem-sucedido encontrado, atualizando para plano pro", { 
          checkoutId: recentCheckout.id,
          timestamp: new Date(recentCheckout.created * 1000).toISOString()
        });
      } else {
        logStep("Nenhuma assinatura ativa ou checkout recente encontrado");
      }
    }

    // Atualizar o perfil do usuário no Supabase
    await supabaseClient.from("profiles").update({
      plan: plan
    }).eq("id", user.id);

    logStep("Banco de dados atualizado com informações de assinatura", { 
      subscribed: hasActiveSub || plan === "pro", 
      plan: plan 
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub || plan === "pro",
      plan: plan,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO em check-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
