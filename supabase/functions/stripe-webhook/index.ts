
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Configure CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logStep("Function started");
    
    // Get the Stripe secret key from environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    
    // Determine environment and select appropriate webhook secret
    const isProduction = Deno.env.get("SUPABASE_ENV") === "production";
    const webhookSecretKey = isProduction ? "STRIPE_WEBHOOK_SECRET" : "STRIPE_WEBHOOK_SECRET_TEST";
    const webhookSecret = Deno.env.get(webhookSecretKey);

    logStep(`Usando a chave de webhook para ambiente: ${isProduction ? 'produção' : 'teste'} (${webhookSecretKey})`);
    
    if (!webhookSecret) throw new Error(`${webhookSecretKey} não está configurada`);
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the request body as text for signature verification
    const body = await req.text();
    
    // Get the Stripe signature from the request headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Stripe signature não fornecida");
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { event: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Create a Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      logStep("Checkout session completed", { sessionId: session.id, customerId: session.customer });
      
      // Get customer details to find the associated user
      const customer = await stripe.customers.retrieve(session.customer as string);
      const userEmail = customer.email;
      
      if (!userEmail) {
        throw new Error("Email do cliente não encontrado");
      }
      
      logStep("Customer email retrieved", { email: userEmail });
      
      // Get the user in Auth
      const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) {
        throw new Error(`Erro ao listar usuários: ${authError.message}`);
      }
      
      const user = users.users.find(u => u.email === userEmail);
      if (!user) {
        throw new Error(`Usuário com email ${userEmail} não encontrado`);
      }
      
      // Calcular data de expiração da assinatura (30 dias à frente por padrão)
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
      
      // Update user profile with subscription details
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ 
          has_access: true, 
          plan: "assinante",
          stripe_customer_id: session.customer,
          subscription_status: "active",
          subscription_end_date: subscriptionEnd.toISOString()
        })
        .eq("id", user.id);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }
      
      logStep("User profile updated to active subscription", { userId: user.id });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } 
    else if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      logStep("Invoice paid", { invoiceId: invoice.id, customerId: invoice.customer });
      
      // Get customer details
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      const userEmail = customer.email;
      
      if (!userEmail) {
        throw new Error("Email do cliente não encontrado");
      }
      
      // Get the user in Auth
      const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) {
        throw new Error(`Erro ao listar usuários: ${authError.message}`);
      }
      
      const user = users.users.find(u => u.email === userEmail);
      if (!user) {
        throw new Error(`Usuário com email ${userEmail} não encontrado`);
      }
      
      // Update user profile
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ 
          has_access: true, 
          plan: "assinante",
          subscription_status: "active"
        })
        .eq("id", user.id);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }
      
      logStep("User profile updated after invoice paid", { userId: user.id });
    }
    else if (event.type === 'customer.subscription.updated' || 
              event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      
      // Check if this is an active subscription
      if (subscription.status === 'active') {
        logStep("Active subscription found", { subscriptionId: subscription.id });
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userEmail = customer.email;
        
        if (!userEmail) {
          throw new Error("Email do cliente não encontrado");
        }
        
        logStep("Customer email retrieved", { email: userEmail });
        
        // Get the user in Auth
        const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
        if (authError) {
          throw new Error(`Erro ao listar usuários: ${authError.message}`);
        }
        
        const user = users.users.find(u => u.email === userEmail);
        if (!user) {
          throw new Error(`Usuário com email ${userEmail} não encontrado`);
        }
        
        // Calculate subscription end date
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        // Update user profile
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ 
            has_access: true, 
            plan: "assinante",
            stripe_customer_id: subscription.customer,
            subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_end_date: subscriptionEnd
          })
          .eq("id", user.id);
        
        if (updateError) {
          throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
        }
        
        logStep("User profile updated to active subscription", { userId: user.id });
      } else {
        // Subscription is not active (pending, incomplete, etc.)
        logStep("Non-active subscription found", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });
      }
    } 
    else if (event.type === 'customer.subscription.deleted') {
      // Handle subscription cancellation
      const subscription = event.data.object;
      logStep("Subscription canceled", { subscriptionId: subscription.id });
      
      // Get customer details
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const userEmail = customer.email;
      
      if (!userEmail) {
        throw new Error("Email do cliente não encontrado");
      }
      
      // Get the user in Auth
      const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) {
        throw new Error(`Erro ao listar usuários: ${authError.message}`);
      }
      
      const user = users.users.find(u => u.email === userEmail);
      if (!user) {
        throw new Error(`Usuário com email ${userEmail} não encontrado`);
      }
      
      // Update the user's profile to remove access
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ 
          has_access: false,
          plan: "cancelado",
          subscription_status: "canceled"
        })
        .eq("id", user.id);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }
      
      logStep("User access revoked due to subscription cancellation", { userId: user.id });
    }
    
    // Return a 200 response for any unhandled events
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
