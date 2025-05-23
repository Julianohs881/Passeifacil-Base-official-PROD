
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for detailed logging with timestamp
const logStep = (requestId: string, message: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}][CHECK-SUBSCRIPTION:${requestId}] ${message}${detailsStr}`);
};

serve(async (req) => {
  // Generate unique ID for request tracing through logs
  const requestId = crypto.randomUUID().substring(0, 8);
  const log = (message: string, details?: any) => logStep(requestId, message, details);
  
  log("Function started");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    log("Responding to CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Step 1: Set up environment variables and Stripe
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      log("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not configured in the environment");
    }
    log("STRIPE_SECRET_KEY retrieved successfully");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      log("ERROR: Supabase variables not configured");
      throw new Error("Supabase variables are not configured");
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { auth: { persistSession: false } }
    );
    log("Supabase client created with service role key");
    
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log("ERROR: Authorization header not provided");
      throw new Error("Authorization header not provided");
    }
    log("Authorization header found");
    
    const token = authHeader.replace("Bearer ", "");
    log("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      log("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user || !user.email) {
      log("ERROR: User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    log("User authenticated successfully", { userId: user.id, email: user.email });
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Search for Stripe customer by email
    log("Searching for Stripe customer with email", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    // If no customer found in Stripe
    if (customers.data.length === 0) {
      log("No customer found with this email, updating profile with no subscription");
      
      // Update profile to indicate no subscription
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: false,
          plan: "gratuito",
          subscription_status: null,
          stripe_customer_id: null,
          subscription_id: null,
          subscription_end_date: null
        })
        .eq("id", user.id);
      
      if (updateError) {
        log("ERROR: Failed to update profile", { error: updateError.message });
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      log("Profile updated successfully with no subscription");
      return new Response(
        JSON.stringify({ 
          success: true, 
          has_access: false,
          plan: "gratuito",
          manual_access: false,
          message: "No subscription found for this user"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // Customer found in Stripe
    const customerId = customers.data[0].id;
    log("Customer found in Stripe", { customerId });
    
    // Search for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1
    });
    
    // Verify if there's an active subscription
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
      
      // Update profile with active subscription information
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: true,
          plan: "assinante",
          subscription_status: subscriptionStatus,
          stripe_customer_id: customerId,
          subscription_id: subscriptionId,
          subscription_end_date: subscriptionEndDate
        })
        .eq("id", user.id);
      
      if (updateError) {
        log("ERROR: Failed to update profile", { error: updateError.message });
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      // Get the updated profile to return the correct manual_access value
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .select("manual_access")
        .eq("id", user.id)
        .single();
        
      if (profileError) {
        log("ERROR: Failed to fetch profile after update", { error: profileError.message });
        // Even if there's an error fetching the profile, we'll continue with the default manual_access value
      }
      
      const manualAccess = profileData?.manual_access || false;
      
      log("Profile updated successfully with active subscription");
      return new Response(
        JSON.stringify({ 
          success: true, 
          has_access: true,
          plan: "assinante",
          manual_access: manualAccess,
          subscription_id: subscriptionId,
          subscription_status: subscriptionStatus,
          subscription_end_date: subscriptionEndDate,
          message: "Active subscription found and profile updated"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    } else {
      // No active subscription
      log("No active subscription found");
      
      // Update profile to indicate no active subscription
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: false,
          plan: "cancelado",
          subscription_status: "canceled",
          stripe_customer_id: customerId,
          subscription_id: null,
          subscription_end_date: null
        })
        .eq("id", user.id);
      
      if (updateError) {
        log("ERROR: Failed to update profile", { error: updateError.message });
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      // Get the updated profile to return the correct manual_access value
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .select("manual_access")
        .eq("id", user.id)
        .single();
        
      if (profileError) {
        log("ERROR: Failed to fetch profile after update", { error: profileError.message });
        // Even if there's an error fetching the profile, we'll continue with the default manual_access value
      }
      
      const manualAccess = profileData?.manual_access || false;
      
      log("Profile updated with no active subscription");
      return new Response(
        JSON.stringify({ 
          success: true, 
          has_access: false,
          plan: "cancelado",
          manual_access: manualAccess,
          message: "Customer found, but no active subscription"
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
