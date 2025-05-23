
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
    // Step 1: Set up environment variables and Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      log("ERROR: Supabase variables not configured");
      throw new Error("Supabase variables are not configured");
    }
    
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      { auth: { persistSession: false } }
    );
    log("Supabase client created with service role key");
    
    // Authenticate user from token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log("ERROR: Authorization header not provided");
      throw new Error("Authorization header not provided");
    }
    log("Authorization header found");
    
    const token = authHeader.replace("Bearer ", "");
    log("Authenticating user with token");
    
    // Get user from token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) {
      log("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user || !user.id) {
      log("ERROR: User not authenticated or ID not available");
      throw new Error("User not authenticated or ID not available");
    }
    log("User authenticated successfully", { userId: user.id });
    
    // Get user profile from database
    log("Fetching user profile", { userId: user.id });
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("plan, has_access, manual_access, stripe_customer_id, subscription_id, subscription_status, subscription_end_date")
      .eq("id", user.id)
      .single();
    
    if (profileError || !profileData) {
      log("ERROR: Failed to fetch profile", { 
        error: profileError?.message || "Profile not found",
        userId: user.id
      });
      
      // Create a basic profile if not found
      if (profileError?.code === "PGRST116") {
        log("Profile not found, attempting to create one");
        
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            plan: "gratuito",
            has_access: false
          });
        
        if (insertError) {
          log("ERROR: Failed to create profile", { error: insertError.message });
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
        
        log("Basic profile created successfully");
        return new Response(JSON.stringify({ 
          success: true, 
          has_access: false,
          plan: "gratuito",
          manual_access: false,
          message: "New profile created"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });
      }
      
      throw new Error(`Error fetching profile: ${profileError?.message || "Profile not found"}`);
    }
    
    log("Profile fetched successfully", { 
      plan: profileData.plan, 
      has_access: profileData.has_access,
      manual_access: profileData.manual_access
    });

    // Setup Stripe and check subscription only if we have a customer ID
    if (profileData.stripe_customer_id) {
      let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        log("ERROR: STRIPE_SECRET_KEY not found");
        throw new Error("STRIPE_SECRET_KEY is not configured in the environment");
      }
      log("STRIPE_SECRET_KEY retrieved successfully");
      
      // Initialize Stripe
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      
      log("Checking Stripe subscription status", { 
        customerId: profileData.stripe_customer_id,
        subscriptionId: profileData.subscription_id 
      });
      
      // If we have a subscription ID, check if it's still active
      if (profileData.subscription_id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(profileData.subscription_id);
          
          log("Subscription retrieved from Stripe", { 
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
          });
          
          // Update the profile with the latest subscription status
          if (subscription.status === "active") {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                has_access: true,
                subscription_status: subscription.status,
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
              })
              .eq("id", user.id);
            
            if (updateError) {
              log("ERROR: Failed to update profile", { error: updateError.message });
            } else {
              log("Profile updated with active subscription");
            }
          } else if (subscription.status !== profileData.subscription_status) {
            // Subscription status changed, update the profile
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                has_access: false,
                subscription_status: subscription.status
              })
              .eq("id", user.id);
            
            if (updateError) {
              log("ERROR: Failed to update profile", { error: updateError.message });
            } else {
              log("Profile updated with changed subscription status", { status: subscription.status });
            }
          }
        } catch (error) {
          log("ERROR: Failed to retrieve subscription", { error: error.message });
          
          // If subscription is not found, update profile
          if (error.code === "resource_missing") {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                has_access: false,
                subscription_status: "canceled",
                subscription_id: null,
                subscription_end_date: null
              })
              .eq("id", user.id);
            
            if (updateError) {
              log("ERROR: Failed to update profile", { error: updateError.message });
            } else {
              log("Profile updated as subscription not found");
            }
          }
        }
      }
    }
    
    // Refetch the latest profile data to ensure we have the most up-to-date info
    const { data: updatedProfile, error: refetchError } = await supabase
      .from("profiles")
      .select("plan, has_access, manual_access, subscription_status, subscription_end_date")
      .eq("id", user.id)
      .single();
    
    if (refetchError) {
      log("ERROR: Failed to refetch profile", { error: refetchError.message });
      throw new Error(`Failed to refetch profile: ${refetchError.message}`);
    }
    
    // Determine final access based on profile and manual override
    const finalHasAccess = updatedProfile.has_access || updatedProfile.manual_access;
    
    log("Final access determination", { 
      has_access: finalHasAccess, 
      plan: updatedProfile.plan,
      manual_access: updatedProfile.manual_access
    });
    
    // Return the final result
    return new Response(
      JSON.stringify({ 
        success: true, 
        has_access: finalHasAccess,
        plan: updatedProfile.plan,
        manual_access: updatedProfile.manual_access,
        subscription_status: updatedProfile.subscription_status,
        subscription_end_date: updatedProfile.subscription_end_date,
        message: "Subscription status verified"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
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
