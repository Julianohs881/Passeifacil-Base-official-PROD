import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Configuração de CORS para a função
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função auxiliar para logs detalhados com carimbo de data/hora
const logWithTimestamp = (category: string, message: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}][${category}] ${message}${detailsStr}`);
};

serve(async (req) => {
  // Identificador único para rastrear cada solicitação através dos logs
  const requestId = crypto.randomUUID().substring(0, 8);
  const log = (message: string, details?: any) => logWithTimestamp(`STRIPE-WEBHOOK:${requestId}`, message, details);
  
  log("Função iniciada");
  
  // Lidar com requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    log("Respondendo à requisição CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Etapa 1: Configurar variáveis de ambiente e Stripe
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("ERRO: STRIPE_SECRET_KEY não encontrada");
      throw new Error("STRIPE_SECRET_KEY não está configurada no ambiente");
    }
    log("STRIPE_SECRET_KEY recuperada com sucesso");
    
    // Determinar qual segredo de webhook usar com base no ambiente
    // Verificar se estamos em desenvolvimento ou produção com base na URL ou outro indicador
    const isTestMode = stripeKey.startsWith('sk_test_');
    let webhookSecret;
    
    if (isTestMode) {
      webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST");
      log("Ambiente de TESTE detectado - usando STRIPE_WEBHOOK_SECRET_TEST", { 
        keyExists: !!webhookSecret, 
        keyLength: webhookSecret ? webhookSecret.length : 0 
      });
    } else {
      webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      log("Ambiente de PRODUÇÃO detectado - usando STRIPE_WEBHOOK_SECRET", { 
        keyExists: !!webhookSecret, 
        keyLength: webhookSecret ? webhookSecret.length : 0 
      });
    }
    
    if (!webhookSecret) {
      log("ERRO: Segredo do webhook não encontrado para o ambiente atual", { isTestMode });
      throw new Error(`STRIPE_WEBHOOK_SECRET${isTestMode ? '_TEST' : ''} não está configurado no ambiente`);
    }
    log("Segredo do webhook recuperado com sucesso para o ambiente", { isTestMode });
    
    // Inicializar Stripe com a chave correta
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    log("Cliente Stripe inicializado");
    
    // Etapa 2: Obter o corpo da solicitação como texto para verificação de assinatura
    const body = await req.text();
    if (!body || body.length === 0) {
      log("ERRO: Corpo da solicitação vazio");
      throw new Error("Corpo da solicitação está vazio");
    }
    log("Corpo da solicitação recuperado", { bodyLength: body.length });
    
    // Etapa 3: Verificar a assinatura do Stripe
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      log("ERRO: Assinatura do Stripe não fornecida", { 
        headers: Object.fromEntries(req.headers) 
      });
      throw new Error("Assinatura do Stripe não fornecida");
    }
    log("Assinatura do Stripe encontrada", { signatureLength: signature.length });
    
    // Verificar a assinatura do webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      log("Assinatura do webhook verificada com sucesso", { 
        eventType: event.type,
        eventId: event.id,
        ambiente: isTestMode ? "TESTE" : "PRODUÇÃO"
      });
    } catch (err) {
      log("Falha na verificação da assinatura do webhook", { 
        error: err.message,
        signature: signature.substring(0, 20) + "...", // Registro parcial para segurança
        ambiente: isTestMode ? "TESTE" : "PRODUÇÃO"
      });
      return new Response(JSON.stringify({ error: `Erro no Webhook: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Etapa 4: Criar cliente Supabase para operações administrativas
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
    log("Cliente Supabase criado com chave de serviço");
    
    // Etapa 5: Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        // Checkout bem-sucedido - usuário realizou o primeiro pagamento
        const session = event.data.object;
        log("Evento checkout.session.completed recebido", { 
          sessionId: session.id,
          customerId: session.customer,
          paymentStatus: session.payment_status
        });
        
        if (session.payment_status !== 'paid') {
          log("Checkout ainda não foi pago completamente", { 
            status: session.payment_status 
          });
          return new Response(JSON.stringify({ 
            received: true,
            message: "Checkout não está no status 'paid'"
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        // Buscar detalhes do cliente para encontrar o usuário associado
        const customer = await stripe.customers.retrieve(session.customer as string);
        log("Detalhes do cliente recuperados", { 
          customer: customer.id,
          email: customer.email
        });
        
        // Atualizar usuário no Supabase
        await processSubscriptionForUser(
          supabaseClient,
          stripe,
          customer.email as string, 
          session.customer as string,
          session.subscription as string,
          log
        );
        
        return new Response(JSON.stringify({ success: true, event: "checkout.session.completed" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      case 'invoice.paid': {
        // Fatura paga - pode ser a primeira ou renovações subsequentes
        const invoice = event.data.object;
        log("Evento invoice.paid recebido", { 
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription
        });
        
        // Buscar detalhes do cliente
        const customer = await stripe.customers.retrieve(invoice.customer as string);
        log("Detalhes do cliente recuperados para fatura", { 
          customer: customer.id,
          email: customer.email
        });
        
        // Atualizar usuário no Supabase
        await processSubscriptionForUser(
          supabaseClient, 
          stripe,
          customer.email as string, 
          invoice.customer as string, 
          invoice.subscription as string,
          log
        );
        
        return new Response(JSON.stringify({ success: true, event: "invoice.paid" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        // Assinatura criada ou atualizada
        const subscription = event.data.object;
        log(`Evento ${event.type} recebido`, { 
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer
        });
        
        // Buscar detalhes do cliente
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        log("Detalhes do cliente recuperados para assinatura", { 
          customer: customer.id,
          email: customer.email
        });
        
        // Atualizar usuário no Supabase apenas se a assinatura estiver ativa
        if (subscription.status === 'active') {
          await processSubscriptionForUser(
            supabaseClient, 
            stripe,
            customer.email as string, 
            subscription.customer as string, 
            subscription.id,
            log
          );
        } else {
          log("Assinatura não está ativa, não atualizando usuário", { 
            status: subscription.status 
          });
        }
        
        return new Response(JSON.stringify({ success: true, event: event.type }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      case 'customer.subscription.deleted': {
        // Assinatura cancelada ou expirada
        const subscription = event.data.object;
        log("=== CANCELAMENTO DE ASSINATURA DETECTADO ===");
        log("Evento customer.subscription.deleted recebido", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        });
        
        // Buscar detalhes do cliente
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        log("Detalhes do cliente recuperados para cancelamento", { 
          customerId: customer.id,
          email: customer.email,
          customerCreated: customer.created ? new Date(customer.created * 1000).toISOString() : null
        });
        
        if (!customer.email) {
          log("ERRO: Email do cliente não encontrado no Stripe", { customerId: customer.id });
          throw new Error("Email do cliente não encontrado no Stripe");
        }
        
        // Buscar usuário pelo email no Supabase
        log("Procurando usuário no Supabase por email", { email: customer.email });
        const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers();
        if (userError) {
          log("ERRO: Falha ao listar usuários do Supabase", { error: userError.message });
          throw new Error(`Erro ao listar usuários: ${userError.message}`);
        }
        
        const user = users.users.find(u => u.email === customer.email);
        if (!user) {
          log("AVISO: Usuário não encontrado no Supabase com email", { 
            email: customer.email,
            totalUsers: users.users.length 
          });
          // Não é um erro crítico - pode ser que o usuário tenha sido deletado
          return new Response(JSON.stringify({ 
            success: true, 
            message: "Usuário não encontrado no Supabase", 
            event: "customer.subscription.deleted" 
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        log("Usuário encontrado no Supabase, processando cancelamento", { 
          userId: user.id,
          userEmail: user.email,
          userCreated: user.created_at
        });
        
        // Verificar estado atual do perfil antes da atualização
        const { data: currentProfile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          log("AVISO: Erro ao buscar perfil atual", { error: profileError.message });
        } else {
          log("Estado atual do perfil", {
            currentPlan: currentProfile.plan,
            currentHasAccess: currentProfile.has_access,
            currentSubscriptionStatus: currentProfile.subscription_status,
            currentSubscriptionId: currentProfile.subscription_id
          });
        }
        
        // Atualizar o perfil do usuário para modo gratuito
        const updateData = {
          has_access: false,
          plan: "gratuito",
          subscription_status: "canceled",
          subscription_end_date: new Date().toISOString(),
          // Manter o stripe_customer_id para referência futura
          // subscription_id: null // Opcionalmente limpar o subscription_id
        };
        
        log("Atualizando perfil para modo gratuito", updateData);
        
        const { data: updateResult, error: updateError } = await supabaseClient
          .from("profiles")
          .update(updateData)
          .eq("id", user.id)
          .select();
        
        if (updateError) {
          log("ERRO: Falha ao atualizar perfil para modo gratuito", { 
            error: updateError.message,
            userId: user.id 
          });
          throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
        }
        
        log("=== CANCELAMENTO PROCESSADO COM SUCESSO ===");
        log("Usuário rebaixado para plano gratuito", { 
          userId: user.id,
          email: customer.email,
          subscriptionId: subscription.id,
          updatedRows: updateResult?.length || 0,
          newProfile: updateResult?.[0] || null
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          event: "customer.subscription.deleted",
          userId: user.id,
          email: customer.email,
          message: "Usuário rebaixado para plano gratuito com sucesso"
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      default: {
        // Eventos não processados
        log("Tipo de evento não tratado", { eventType: event.type });
        return new Response(JSON.stringify({ received: true, eventType: event.type }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("ERRO crítico na função do webhook", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      request_id: requestId,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Função auxiliar para processar assinaturas e atualizar usuários
async function processSubscriptionForUser(
  supabaseClient: any,
  stripe: Stripe,
  userEmail: string,
  customerId: string,
  subscriptionId: string,
  log: (message: string, details?: any) => void
) {
  // Verificar se temos email de usuário
  if (!userEmail) {
    log("ERRO: Email do usuário não fornecido");
    throw new Error("Email do usuário não fornecido");
  }
  
  // Buscar detalhes da assinatura para obter a data de término
  log("Buscando detalhes da assinatura", { subscriptionId });
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Calcular data de término da assinatura
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
  log("Detalhes da assinatura recuperados", { 
    status: subscription.status,
    endDate: subscriptionEnd,
    planId: subscription.items.data[0]?.price.id
  });
  
  // Obter usuário no Supabase pelo email
  log("Buscando usuário no Supabase pelo email", { email: userEmail });
  const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers();
  
  if (userError) {
    log("ERRO: Falha ao listar usuários", { error: userError.message });
    throw new Error(`Erro ao listar usuários: ${userError.message}`);
  }
  
  const user = users.users.find(u => u.email === userEmail);
  if (!user) {
    log("ERRO: Usuário não encontrado com email", { email: userEmail });
    throw new Error(`Usuário com email ${userEmail} não encontrado`);
  }
  
  log("Usuário encontrado no Supabase", { userId: user.id });
  
  // Atualizar perfil do usuário com detalhes da assinatura
  log("Atualizando perfil do usuário com acesso ativo", { 
    userId: user.id,
    subscriptionId,
    endDate: subscriptionEnd
  });
  
  const updateData = {
    has_access: true,
    plan: "assinante",
    stripe_customer_id: customerId,
    subscription_id: subscriptionId,
    subscription_status: subscription.status,
    subscription_end_date: subscriptionEnd,
  };
  
  log("Dados para atualização", updateData);
  
  const { data: updateResult, error: updateError } = await supabaseClient
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select();
  
  if (updateError) {
    log("ERRO: Falha ao atualizar perfil", { error: updateError.message });
    throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
  }
  
  log("Perfil do usuário atualizado com sucesso", { 
    userId: user.id,
    updatedRows: updateResult?.length || 0
  });
  
  return { success: true, userId: user.id };
}
