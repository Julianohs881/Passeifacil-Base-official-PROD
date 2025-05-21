
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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
    
    try {
      // Inicializar o Stripe
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      
      // Verificar se o usuário já existe como cliente no Stripe
      logStep("Buscando cliente no Stripe");
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customerId;
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Cliente encontrado no Stripe", { customerId });
        
        // Verificar se o cliente já tem uma assinatura ativa
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });
        
        if (subscriptions.data.length > 0) {
          logStep("Cliente já possui uma assinatura ativa");
          return new Response(JSON.stringify({ 
            error: "Você já possui uma assinatura ativa",
            hasActiveSubscription: true,
            redirectToPortal: true
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } else {
        logStep("Cliente não encontrado no Stripe, será criado durante o checkout");
      }
      
      // Criar sessão de checkout do Stripe
      logStep("Criando sessão de checkout");
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: { 
                name: "Passei Fácil - Assinatura",
                description: "Acesso completo à plataforma Passei Fácil"
              },
              unit_amount: 1990, // R$14,90
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/success?subscription=success`,
        cancel_url: `${req.headers.get("origin")}/cancel?subscription=canceled`,
      });
      
      if (!session.url) {
        throw new Error("Falha ao criar URL da sessão de checkout");
      }
      
      logStep("Sessão de checkout criada com sucesso", { 
        sessionId: session.id,
        url: session.url
      });
      
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError: any) {
      // Capturar erros específicos da API do Stripe
      logStep("ERRO do Stripe", { 
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });
      
      let errorMessage = "Erro ao processar pagamento com o Stripe: ";
      
      if (stripeError.type === 'StripeInvalidRequestError') {
        errorMessage += "Solicitação inválida. Verifique os dados fornecidos.";
      } else if (stripeError.type === 'StripeAuthenticationError') {
        errorMessage += "Falha na autenticação do Stripe. Verifique a chave API.";
      } else if (stripeError.type === 'StripeAPIError') {
        errorMessage += "Erro na API do Stripe. O serviço pode estar indisponível temporariamente.";
      } else if (stripeError.type === 'StripeConnectionError') {
        errorMessage += "Erro de conexão com o Stripe. Verifique sua conexão com a internet.";
      } else if (stripeError.type === 'StripeRateLimitError') {
        errorMessage += "Muitas solicitações ao Stripe. Tente novamente mais tarde.";
      } else {
        errorMessage += stripeError.message || "Erro desconhecido.";
      }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO em create-checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde ou entre em contato com o suporte."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
