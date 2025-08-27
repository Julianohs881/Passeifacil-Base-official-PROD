import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function for structured logging with timestamp
const logWithTimestamp = (category: string, message: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}][${category}] ${message}${detailsStr}`);
};

serve(async (req) => {
  // Generate a unique ID for this request to track through logs
  const requestId = crypto.randomUUID().substring(0, 8);
  const log = (message: string, details?: any) => logWithTimestamp(`CHECK-EXPIRED:${requestId}`, message, details);
  
  log("Function started");
  
  // Handle OPTIONS requests for CORS
  if (req.method === "OPTIONS") {
    log("Responding to CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Get current timestamp
    const now = new Date().toISOString();
    log("Checking for expired subscriptions", { currentTime: now });

    // Find all profiles with expired subscriptions that still have access
    const { data: expiredProfiles, error: queryError } = await supabaseClient
      .from("profiles")
      .select("id, email, plan, has_access, subscription_status, subscription_end_date")
      .eq("has_access", true)
      .in("plan", ["pro", "assinante"])
      .lt("subscription_end_date", now);

    if (queryError) {
      log("ERROR: Failed to query expired subscriptions", { error: queryError.message });
      throw new Error(`Error querying expired subscriptions: ${queryError.message}`);
    }

    log("Found expired subscriptions", { 
      count: expiredProfiles?.length || 0,
      profiles: expiredProfiles?.map(p => ({ id: p.id, plan: p.plan, end_date: p.subscription_end_date }))
    });

    if (!expiredProfiles || expiredProfiles.length === 0) {
      log("No expired subscriptions found");
      return new Response(JSON.stringify({
        success: true,
        message: "No expired subscriptions found",
        processed: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update expired profiles to free plan
    const updatePromises = expiredProfiles.map(async (profile) => {
      log("Processing expired profile", { 
        userId: profile.id, 
        plan: profile.plan,
        endDate: profile.subscription_end_date
      });

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({
          has_access: false,
          plan: "gratuito",
          subscription_status: "expired"
        })
        .eq("id", profile.id);

      if (updateError) {
        log("ERROR: Failed to update expired profile", { 
          userId: profile.id, 
          error: updateError.message 
        });
        return { success: false, userId: profile.id, error: updateError.message };
      } else {
        log("Successfully updated expired profile", { userId: profile.id });
        return { success: true, userId: profile.id };
      }
    });

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    log("Batch update completed", { 
      total: results.length, 
      successful, 
      failed,
      failures: results.filter(r => !r.success)
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Expired subscriptions check completed",
      processed: results.length,
      successful,
      failed,
      details: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // Log and return any errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    log("ERROR in check-expired-subscriptions function", {
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
