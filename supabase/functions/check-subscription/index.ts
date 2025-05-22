import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function for structured logging with timestamp
const logWithTimestamp = (category, message, details) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}][${category}] ${message}${detailsStr}`);
};

serve(async (req) => {
  // Generate a unique ID for this request to track through logs
  const requestId = crypto.randomUUID().substring(0, 8);
  const log = (message, details) => logWithTimestamp(`CHECK-SUBSCRIPTION:${requestId}`, message, details);
  
  log("Function started");
  
  // Handle OPTIONS requests for CORS
  if (req.method === "OPTIONS") {
    log("Responding to CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Stripe key from environment
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("ERROR: STRIPE_SECRET_KEY not found in environment");
      throw new Error("STRIPE_SECRET_KEY is not configured in the environment");
    }
    log("STRIPE_SECRET_KEY retrieved successfully");

    // Create Supabase client with service role key for administrative operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      log("ERROR: Supabase environment variables not found");
      throw new Error("Supabase environment variables are not configured");
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { auth: { persistSession: false } }
    );
    log("Supabase client created with service role key");
    
    // Verify authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log("ERROR: No Authorization header provided");
      throw new Error("Authorization header not provided");
    }
    log("Authorization header found");
    
    const token = authHeader.replace("Bearer ", "");
    log("Authenticating user with token");

    // Get user information from token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      log("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!userData?.user) {
      log("ERROR: No user data returned from authentication");
      throw new Error("User data not available after authentication");
    }
    
    const user = userData.user;
    if (!user?.email) {
      log("ERROR: User email not available");
      throw new Error("User email not available");
    }
    
    log("User authenticated successfully", { 
      userId: user.id, 
      email: user.email 
    });
    
    // Initialize Stripe with the API key
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Look for a customer with the user's email
    log("Searching for Stripe customer with email", { email: user.email });
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    // If no customer exists, update profile with no subscription
    if (customers.data.length === 0) {
      log("No customer found with this email, updating profile with no subscription");
      
      // Busca manual_access antes de atualizar
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("manual_access")
        .eq("id", user.id)
        .single();

      // ---- CONTROLE DE ACESSO DE TESTE/ADMIN ----
      // Coloque seus e-mails de teste/admin nesta lista:
      const adminEmails = ["seuemail@dominio.com"];
      let hasAccessFinal = (adminEmails.includes(user.email) && profile?.manual_access === true);

      const { data: updateData, error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: hasAccessFinal,
          plan: hasAccessFinal ? "assinante (manual)" : "sem assinatura",
          subscription_status: null,
          subscription_id: null,
          stripe_customer_id: null,
          subscription_end_date: null
        })
        .eq("id", user.id);
      
      if (updateError) {
        log("ERROR: Failed to update profile", { error: updateError.message });
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      log("Profile updated successfully with no subscription");
      
      return new Response(JSON.stringify({ 
        has_access: hasAccessFinal,
        plan: hasAccessFinal ? "assinante (manual)" : "sem assinatura",
        subscription_status: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Customer exists, get their ID
    const customerId = customers.data[0].id;
    log("Stripe customer found", { customerId });

    // Check for active subscriptions
    log("Checking for active subscriptions", { customerId });
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    let subscriptionStatus = "inativo";
    let subscriptionId = null;
    let subscriptionEnd = null;
    let hasAccess = false;
    let plan = "sem assinatura";

    // If active subscription found, update profile with subscription details
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      subscriptionStatus = subscription.status;
      subscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      hasAccess = true;
      plan = "assinante";
      
      log("Active subscription found", { 
        subscriptionId: subscription.id, 
        status: subscription.status,
        endDate: subscriptionEnd 
      });
    } else {
      // If no active subscription, check for recent completed checkouts
      log("No active subscription found, checking recent checkouts");
      
      const checkouts = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 5,
        status: 'complete'
      });
      
      // Find a recent checkout (completed in the last 24 hours)
      const recentCheckout = checkouts.data.find(checkout => {
        // Check if checkout is recent (last 24 hours)
        const checkoutTime = new Date(checkout.created * 1000);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return checkoutTime > oneDayAgo && checkout.payment_status === 'paid';
      });
      
      if (recentCheckout) {
        // If recent checkout found, grant temporary access
        hasAccess = true;
        plan = "assinante";
        subscriptionStatus = "pending_active";
        
        log("Recent successful checkout found, granting access", { 
          checkoutId: recentCheckout.id,
          timestamp: new Date(recentCheckout.created * 1000).toISOString()
        });
      } else {
        log("No active subscription or recent checkout found");
      }
    }

    // Antes de atualizar o perfil, buscar manual_access
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("manual_access")
      .eq("id", user.id)
      .single();

    // ---- CONTROLE DE ACESSO DE TESTE/ADMIN ----
    // Coloque seus e-mails de teste/admin nesta lista:
    const adminEmails = ["seuemail@dominio.com"];
    let hasAccessFinal = (adminEmails.includes(user.email) && profile?.manual_access === true) ? true : hasAccess;

    // Update profile with subscription details
    log("Updating profile with subscription information", {
      userId: user.id,
      hasAccess: hasAccessFinal,
      plan
    });
    
    const { data: updateData, error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        has_access: hasAccessFinal,
        plan: hasAccessFinal ? "assinante (manual)" : plan,
        subscription_status: subscriptionStatus,
        subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        subscription_end_date: subscriptionEnd
      })
      .eq("id", user.id);
    
    if (updateError) {
      log("ERROR: Failed to update profile", { error: updateError.message });
      throw new Error(`Error updating profile: ${updateError.message}`);
    }
    
    log("Profile updated successfully", {
      userId: user.id,
      hasAccess: hasAccessFinal,
      plan: hasAccessFinal ? "assinante (manual)" : plan
    });
    
    // Return subscription status
    return new Response(JSON.stringify({
      has_access: hasAccessFinal,
      plan: hasAccessFinal ? "assinante (manual)" : plan,
      subscription_status: subscriptionStatus,
      subscription_end_date: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log and return any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    log("ERROR in check-subscription function", { 
      message: errorMessage,
      stack: errorStack
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
