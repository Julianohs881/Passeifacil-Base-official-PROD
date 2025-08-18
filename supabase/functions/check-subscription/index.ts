
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
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

    // Get current profile status in the database
    log("Getting current profile status in database");
    const { data: currentProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id, plan, has_access, subscription_status, subscription_end_date, manual_access")
      .eq("id", user.id)
      .single();

    if (profileError) {
      log("ERROR: Failed to get current profile", { error: profileError.message });
      throw new Error(`Error getting profile: ${profileError.message}`);
    }

    log("Current profile status", {
      plan: currentProfile.plan,
      has_access: currentProfile.has_access,
      subscription_status: currentProfile.subscription_status,
      subscription_end_date: currentProfile.subscription_end_date
    });

    // ---- TEST/ADMIN ACCESS CONTROL ----
    // Add your test/admin emails to this list:
    const adminEmails = ["seuemail@dominio.com"];
    
    // DEBUG: Log admin check details
    log("DEBUG: Admin check details", {
      userEmail: user.email,
      adminEmails: adminEmails,
      isInAdminList: adminEmails.includes(user.email),
      manualAccess: currentProfile?.manual_access,
      manualAccessType: typeof currentProfile?.manual_access,
      manualAccessValue: currentProfile?.manual_access === true
    });
    
    let subscriptionStatus = "inativo";
    let subscriptionId = null;
    let subscriptionEnd = null;
    let plan = "gratuito";
    let hasAccess = true; // SEMPRE true para todos os usuários
    let stripeCustomerId = null;

    // TESTE: Forçar manual_access para debug
    const forceManualAccess = true; // Mude para false quando quiser testar normalmente
    
    // PRIMEIRO: Verificar se é um usuário admin com manual_access
    if ((adminEmails.includes(user.email) && currentProfile?.manual_access === true) || forceManualAccess) {
      if (forceManualAccess) {
        log("FORÇANDO manual_access para teste - remova esta linha depois");
      }
      
      plan = "assinante (manual)";
      subscriptionStatus = "manual_active";
      hasAccess = true;
      
      log("Admin user with manual access detected - granting immediate access", {
        email: user.email,
        manual_access: currentProfile?.manual_access,
        forceManualAccess: forceManualAccess,
        plan: plan
      });
    } else {
      log("DEBUG: Not admin or manual_access not true", {
        isAdmin: adminEmails.includes(user.email),
        manualAccess: currentProfile?.manual_access,
        condition1: adminEmails.includes(user.email),
        condition2: currentProfile?.manual_access === true,
        forceManualAccess: forceManualAccess
      });
      
      // SEGUNDO: Verificar se o usuário já tem uma assinatura ativa no banco (MercadoPago ou Stripe)
      if (currentProfile.plan === "assinante") {
        // Verificar se a assinatura não expirou
        if (currentProfile.subscription_end_date) {
          const expirationDate = new Date(currentProfile.subscription_end_date);
          const now = new Date();
          
          if (expirationDate > now) {
            // Assinatura ainda é válida
            plan = currentProfile.plan;
            subscriptionStatus = currentProfile.subscription_status || "active";
            subscriptionEnd = currentProfile.subscription_end_date;
            
            log("Active subscription found in database (MercadoPago/Stripe)", {
              plan: currentProfile.plan,
              status: currentProfile.subscription_status,
              endDate: currentProfile.subscription_end_date,
              isExpired: false
            });
          } else {
            log("Subscription found but expired", {
              plan: currentProfile.plan,
              endDate: currentProfile.subscription_end_date,
              isExpired: true
            });
          }
        } else {
          // Assinatura sem data de expiração (permanente)
          plan = currentProfile.plan;
          subscriptionStatus = currentProfile.subscription_status || "active";
          
          log("Active subscription found in database (no expiration date)", {
            plan: currentProfile.plan,
            status: currentProfile.subscription_status
          });
        }
      }

      // TERCEIRO: Se não encontrou assinatura no banco, verificar Stripe
      if (plan === "gratuito") {
        log("No active subscription in database, checking Stripe");
        
        try {
          // Initialize Stripe with the API key
          const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
          
          // Look for a customer with the user's email
          log("Searching for Stripe customer with email", { email: user.email });
          const customers = await stripe.customers.list({ 
            email: user.email, 
            limit: 1 
          });

          // If no customer exists, user is free
          if (customers.data.length === 0) {
            log("No customer found with this email, user is free");
            plan = "gratuito";
            subscriptionStatus = null;
          } else {
            // Customer exists, get their ID
            stripeCustomerId = customers.data[0].id;
            log("Stripe customer found", { customerId: stripeCustomerId });

            // Check for active subscriptions
            log("Checking for active subscriptions", { customerId: stripeCustomerId });
            const subscriptions = await stripe.subscriptions.list({
              customer: stripeCustomerId,
              status: "active",
              limit: 1,
            });
            
            // If active subscription found, update profile with subscription details
            if (subscriptions.data.length > 0) {
              const subscription = subscriptions.data[0];
              subscriptionStatus = subscription.status;
              subscriptionId = subscription.id;
              subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
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
                customer: stripeCustomerId,
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
                plan = "assinante";
                subscriptionStatus = "pending_active";
                
                log("Recent successful checkout found, granting access", { 
                  checkoutId: recentCheckout.id,
                  timestamp: new Date(recentCheckout.created * 1000).toISOString()
                });
              } else {
                log("No active subscription or recent checkout found, user is free");
                plan = "gratuito";
              }
            }
          }
        } catch (stripeError) {
          log("ERROR: Stripe API call failed", { error: stripeError.message });
          // Continue with free plan if Stripe fails
          plan = "gratuito";
          subscriptionStatus = null;
        }
      }
    }

    // Set has_access to true if it's an admin email AND manual_access is true, OR if the user has a valid subscription, OR if user is free
    let hasAccessFinal = true; // SEMPRE true para todos os usuários
    let finalPlan = plan;

    // Log final plan decision
    log("Final plan decision", {
      email: user.email,
      isAdmin: adminEmails.includes(user.email),
      manualAccess: currentProfile?.manual_access,
      finalPlan: finalPlan,
      hasAccess: hasAccessFinal
    });

    // Update profile with subscription details - SEMPRE com has_access: true
    log("Updating profile with subscription information", {
      userId: user.id,
      hasAccess: hasAccessFinal,
      plan: finalPlan
    });
    
    const { data: updateData, error: updateError } = await supabaseClient
      .from("profiles")
      .update({
        has_access: true, // SEMPRE true para todos os usuários
        plan: finalPlan,
        subscription_status: subscriptionStatus,
        subscription_id: subscriptionId,
        stripe_customer_id: stripeCustomerId,
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
      plan: finalPlan
    });
    
    // Return subscription status - SEMPRE com has_access: true
    return new Response(JSON.stringify({
      has_access: true, // SEMPRE true para todos os usuários
      plan: finalPlan,
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
