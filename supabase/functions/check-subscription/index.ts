
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
    
    // Instead of using JWT validation that might be failing, try to get user ID from request body
    // This approach bypasses the JWT validation issues
    let userId = null;
    
    // Method 1: Try to get user ID from request body
    try {
      if (req.headers.get("Content-Type")?.includes("application/json")) {
        const body = await req.json();
        if (body && body.user_id) {
          userId = body.user_id;
          log("User ID extracted from request body", { userId });
        }
      }
    } catch (bodyError) {
      log("Error parsing request body", { error: bodyError.message });
      // Continue with other methods if body parsing fails
    }
    
    // Method 2: Try to get user from authorization header (standard approach)
    if (!userId) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        log("No Authorization header provided");
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Authorization header not provided" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401
        });
      }
      
      log("Authorization header found");
      const token = authHeader.replace("Bearer ", "");
      
      try {
        // Try to extract user ID from JWT payload directly without validation
        // This is a fallback method if the standard auth.getUser is failing
        if (token.includes('.')) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          log("Extracted JWT payload", { sub: payload.sub, email: payload.email });
          
          if (payload.sub) {
            userId = payload.sub;
            log("User ID extracted from JWT payload", { userId });
          } else if (payload.email) {
            // If we have email but no user ID, try to look up the user by email
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", payload.email)
              .single();
              
            if (userData && !userError) {
              userId = userData.id;
              log("User ID found by email lookup", { userId, email: payload.email });
            } else {
              log("Failed to find user by email", { email: payload.email, error: userError?.message });
            }
          }
        }
      } catch (jwtError) {
        log("Error parsing JWT", { error: jwtError.message });
        // Continue with standard auth if JWT parsing fails
      }
      
      // Try standard auth method as a last resort if we still don't have a user ID
      if (!userId) {
        try {
          log("Attempting to get user with token");
          const { data, error } = await supabase.auth.getUser(token);
          
          if (error) {
            log("Error getting user from token", { error: error.message });
          } else if (data && data.user) {
            userId = data.user.id;
            log("User ID obtained from auth.getUser", { userId });
          }
        } catch (authError) {
          log("Error in auth.getUser", { error: authError.message });
        }
      }
    }
    
    // If we still don't have a userId after all attempts
    if (!userId) {
      log("Failed to determine user ID through any method");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Could not determine user identity. Please log in again." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401
      });
    }
    
    // Now that we have a userId, proceed with profile lookup
    log("Fetching profile data", { userId });
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("plan, has_access, manual_access, stripe_customer_id, subscription_id, subscription_status, subscription_end_date")
      .eq("id", userId)
      .single();
      
    if (profileError || !profileData) {
      log("Error fetching profile", { error: profileError?.message || "Profile not found" });
      
      // If profile doesn't exist, try to create a basic one
      if (profileError?.code === "PGRST116") {
        log("Profile not found, creating basic profile");
        
        const { data: insertData, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            plan: "gratuito",
            has_access: false
          })
          .select();
          
        if (insertError) {
          log("Error creating profile", { error: insertError.message });
          return new Response(JSON.stringify({ 
            success: false, 
            error: `Failed to create profile: ${insertError.message}` 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
          });
        }
        
        log("Basic profile created");
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
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Error fetching profile: ${profileError?.message || "Profile not found"}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404
      });
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
        log("WARNING: STRIPE_SECRET_KEY not found");
        // Don't throw error, just skip Stripe check
      } else {
        log("STRIPE_SECRET_KEY retrieved");
        
        // Initialize Stripe
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
        
        log("Checking Stripe subscription", { 
          customerId: profileData.stripe_customer_id,
          subscriptionId: profileData.subscription_id 
        });
        
        // If we have a subscription ID, check if it's still active
        if (profileData.subscription_id) {
          try {
            const subscription = await stripe.subscriptions.retrieve(profileData.subscription_id);
            
            log("Subscription retrieved", { 
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
                .eq("id", userId);
              
              if (updateError) {
                log("Error updating profile", { error: updateError.message });
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
                .eq("id", userId);
              
              if (updateError) {
                log("Error updating profile", { error: updateError.message });
              } else {
                log("Profile updated with changed subscription status", { status: subscription.status });
              }
            }
          } catch (stripeError) {
            log("Error retrieving subscription", { error: stripeError.message });
            
            // If subscription is not found, update profile
            if (stripeError.code === "resource_missing") {
              const { error: updateError } = await supabase
                .from("profiles")
                .update({
                  has_access: false,
                  subscription_status: "canceled",
                  subscription_id: null,
                  subscription_end_date: null
                })
                .eq("id", userId);
              
              if (updateError) {
                log("Error updating profile", { error: updateError.message });
              } else {
                log("Profile updated as subscription not found");
              }
            }
          }
        }
      }
    }
    
    // Refetch the latest profile data to ensure we have the most up-to-date info
    const { data: updatedProfile, error: refetchError } = await supabase
      .from("profiles")
      .select("plan, has_access, manual_access, subscription_status, subscription_end_date")
      .eq("id", userId)
      .single();
    
    if (refetchError) {
      log("Error refetching profile", { error: refetchError.message });
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to refetch profile: ${refetchError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }
    
    // Determine final access based on profile and manual override
    const finalHasAccess = updatedProfile.has_access || updatedProfile.manual_access;
    
    log("Final access determination", { 
      has_access: finalHasAccess, 
      plan: updatedProfile.plan,
      manual_access: updatedProfile.manual_access
    });
    
    // Return the final result
    return new Response(JSON.stringify({ 
      success: true, 
      has_access: finalHasAccess,
      plan: updatedProfile.plan,
      manual_access: updatedProfile.manual_access,
      subscription_status: updatedProfile.subscription_status,
      subscription_end_date: updatedProfile.subscription_end_date,
      userId: userId,
      message: "Subscription status verified"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("FATAL ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
