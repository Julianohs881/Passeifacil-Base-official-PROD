
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Configuração de CORS para a função
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função auxiliar para logs detalhados com carimbo de data/hora
const logStep = (requestId: string, message: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}][CHECK-SUBSCRIPTION:${requestId}] ${message}${detailsStr}`);
};

serve(async (req) => {
  // Identificador único para rastrear cada solicitação através dos logs
  const requestId = crypto.randomUUID().substring(0, 8);
  const log = (message: string, details?: any) => logStep(requestId, message, details);
  
  log("Function started");
  
  // Lidar com requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    log("Responding to CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Etapa 1: Configurar variáveis de ambiente e Stripe
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("ERRO: STRIPE_SECRET_KEY não encontrada");
      throw new Error("STRIPE_SECRET_KEY não está configurada no ambiente");
    }
    log("STRIPE_SECRET_KEY retrieved successfully");
    
    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      log("ERRO: Variáveis do Supabase não estão configuradas");
      throw new Error("Variáveis do Supabase não estão configuradas");
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { auth: { persistSession: false } }
    );
    log("Supabase client created with service role key");
    
    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log("ERRO: Header de autenticação não fornecido");
      throw new Error("Header de autorização não fornecido");
    }
    log("Authorization header found");
    
    const token = authHeader.replace("Bearer ", "");
    log("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      log("ERRO: Falha na autenticação", { error: userError.message });
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user || !user.email) {
      log("ERRO: Usuário não autenticado ou email não disponível");
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    log("User authenticated successfully", { userId: user.id, email: user.email });
    
    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Procurar cliente do Stripe pelo email
    log("Searching for Stripe customer with email", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    // Se não encontrar cliente no Stripe
    if (customers.data.length === 0) {
      log("No customer found with this email, updating profile with no subscription");
      
      // Atualizar perfil para indicar que não possui assinatura
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: false,
          plan: "gratuito",
          subscription_status: null,
          stripe_customer_id: null,
          subscription_id: null,
          subscription_end_date: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (updateError) {
        log("ERRO: Falha ao atualizar perfil", { error: updateError.message });
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }
      
      log("Profile updated successfully with no subscription");
      return new Response(
        JSON.stringify({ 
          success: true, 
          has_access: false,
          message: "Nenhuma assinatura encontrada para este usuário"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // Cliente encontrado no Stripe
    const customerId = customers.data[0].id;
    log("Customer found in Stripe", { customerId });
    
    // Procurar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1
    });
    
    // Verificar se possui assinatura ativa
    const hasActiveSubscription = subscriptions.data.length > 0;
    let subscriptionId = null;
    let subscriptionStatus = null;
    let subscriptionEndDate = null;
    
    if (hasActiveSubscription) {
      const subscription = subscriptions.data[0];
      subscriptionId = subscription.id;
      subscriptionStatus = subscription.status;
      subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
      
      log("Active subscription found", { 
        subscriptionId, 
        status: subscriptionStatus,
        endDate: subscriptionEndDate 
      });
      
      // Atualizar perfil com informações da assinatura ativa
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: true,
          plan: "assinante",
          subscription_status: subscriptionStatus,
          stripe_customer_id: customerId,
          subscription_id: subscriptionId,
          subscription_end_date: subscriptionEndDate,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (updateError) {
        log("ERRO: Falha ao atualizar perfil", { error: updateError.message });
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }
      
      log("Profile updated successfully with active subscription");
      return new Response(
        JSON.stringify({ 
          success: true, 
          has_access: true,
          subscription_id: subscriptionId,
          subscription_status: subscriptionStatus,
          subscription_end_date: subscriptionEndDate,
          message: "Assinatura ativa encontrada e perfil atualizado"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } else {
      // Não possui assinatura ativa
      log("No active subscription found");
      
      // Atualizar perfil para indicar que não possui assinatura
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: false,
          plan: "cancelado",
          subscription_status: "canceled",
          stripe_customer_id: customerId,
          subscription_id: null,
          subscription_end_date: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (updateError) {
        log("ERRO: Falha ao atualizar perfil", { error: updateError.message });
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }
      
      log("Profile updated with no active subscription");
      return new Response(
        JSON.stringify({ 
          success: true, 
          has_access: false,
          message: "Cliente encontrado, mas sem assinatura ativa"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERROR in function", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
