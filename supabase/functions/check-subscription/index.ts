
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
      
      // Atualizar o perfil do usuário sem acesso
      await supabaseClient.from("profiles").update({
        has_access: false,
        plan: "sem assinatura",
        subscription_status: null,
        subscription_id: null,
        stripe_customer_id: null,
        subscription_end_date: null
      }).eq("id", user.id);
      
      return new Response(JSON.stringify({ 
        has_access: false,
        plan: "sem assinatura",
        subscription_status: null
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
    
    let subscriptionStatus = "inativo";
    let subscriptionId = null;
    let subscriptionEnd = null;
    let hasAccess = false;
    let plan = "sem assinatura";

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionStatus = subscription.status;
      subscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      hasAccess = true;
      plan = "assinante";
      
      logStep("Assinatura ativa encontrada", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd 
      });
    } else {
      // Verificar se há uma compra recente nos checkouts
      const checkouts = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 5,
        status: 'complete'
      });
      
      // Procurar por um checkout recente completado
      const recentCheckout = checkouts.data.find(checkout => {
        // Verificar se é um checkout recente (últimas 24 horas)
        const checkoutTime = new Date(checkout.created * 1000);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return checkoutTime > oneDayAgo && checkout.payment_status === 'paid';
      });
      
      if (recentCheckout) {
        // Se encontrarmos um checkout recente bem-sucedido, dar acesso
        hasAccess = true;
        plan = "assinante";
        subscriptionStatus = "pending_active";
        
        logStep("Checkout recente bem-sucedido encontrado, atualizando acesso", { 
          checkoutId: recentCheckout.id,
          timestamp: new Date(recentCheckout.created * 1000).toISOString()
        });
      } else {
        logStep("Nenhuma assinatura ativa ou checkout recente encontrado");
      }
    }

    // Atualizar o perfil do usuário no Supabase
    await supabaseClient.from("profiles").update({
      has_access: hasAccess,
      plan: plan,
      subscription_status: subscriptionStatus,
      subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      subscription_end_date: subscriptionEnd
    }).eq("id", user.id);

    logStep("Banco de dados atualizado com informações de assinatura", { 
      has_access: hasAccess, 
      plan: plan 
    });
    
    return new Response(JSON.stringify({
      has_access: hasAccess,
      plan: plan,
      subscription_status: subscriptionStatus,
      subscription_end_date: subscriptionEnd
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
