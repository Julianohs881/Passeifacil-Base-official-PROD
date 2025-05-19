
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
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");
    logStep("Stripe key retrieved successfully");
    
    // Get webhook secret - FIXED: Use just one webhook secret variable instead of conditionally selecting based on environment
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: Webhook secret missing", { error: "STRIPE_WEBHOOK_SECRET is not configured" });
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }
    
    logStep("Webhook secret retrieved successfully");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the request body as text for signature verification
    const body = await req.text();
    logStep("Request body retrieved", { bodyLength: body.length });
    
    // Get the Stripe signature from the request headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: Missing Stripe signature", { headers: Object.fromEntries(req.headers) });
      throw new Error("Stripe signature not provided");
    }
    
    logStep("Stripe signature found", { signatureLength: signature.length });
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified successfully", { event: event.type });
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
    
    logStep("Supabase client created");
    
    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      logStep("Checkout session completed event", { 
        sessionId: session.id, 
        customerId: session.customer,
        paymentStatus: session.payment_status
      });
      
      // Get customer details to find the associated user
      const customer = await stripe.customers.retrieve(session.customer as string);
      const userEmail = customer.email;
      
      if (!userEmail) {
        logStep("ERROR: Customer email not found", { customerId: session.customer });
        throw new Error("Customer email not found");
      }
      
      logStep("Customer email retrieved", { email: userEmail });
      
      // Get the user in Auth
      const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) {
        logStep("ERROR: Failed to list users", { error: authError.message });
        throw new Error(`Error listing users: ${authError.message}`);
      }
      
      const user = users.users.find(u => u.email === userEmail);
      if (!user) {
        logStep("ERROR: User not found with email", { email: userEmail });
        throw new Error(`User with email ${userEmail} not found`);
      }
      
      logStep("User found in database", { userId: user.id });
      
      // Calculate subscription end date (30 days ahead by default)
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
      
      // Update user profile with subscription details
      logStep("Updating user profile", { 
        userId: user.id,
        plan: "assinante",
        hasAccess: true,
        endDate: subscriptionEnd.toISOString()
      });
      
      const { data: updateData, error: updateError } = await supabaseClient
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
        logStep("ERROR: Failed to update profile", { error: updateError.message });
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      logStep("User profile updated successfully", { 
        userId: user.id,
        updateData
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } 
    else if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      logStep("Invoice paid event", { invoiceId: invoice.id, customerId: invoice.customer });
      
      // Get customer details
      const customer = await stripe.customers.retrieve(invoice.customer as string);
      const userEmail = customer.email;
      
      if (!userEmail) {
        logStep("ERROR: Customer email not found", { customerId: invoice.customer });
        throw new Error("Customer email not found");
      }
      
      // Get the user in Auth
      const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) {
        logStep("ERROR: Failed to list users", { error: authError.message });
        throw new Error(`Error listing users: ${authError.message}`);
      }
      
      const user = users.users.find(u => u.email === userEmail);
      if (!user) {
        logStep("ERROR: User not found with email", { email: userEmail });
        throw new Error(`User with email ${userEmail} not found`);
      }
      
      logStep("Updating user profile after invoice paid", { userId: user.id });
      
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
        logStep("ERROR: Failed to update profile", { error: updateError.message });
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      logStep("User profile updated successfully after invoice paid", { userId: user.id });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    else if (event.type === 'customer.subscription.updated' || 
              event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      
      // Check if this is an active subscription
      if (subscription.status === 'active') {
        logStep("Active subscription found", { 
          subscriptionId: subscription.id,
          status: subscription.status
        });
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const userEmail = customer.email;
        
        if (!userEmail) {
          logStep("ERROR: Customer email not found", { customerId: subscription.customer });
          throw new Error("Customer email not found");
        }
        
        logStep("Customer email retrieved", { email: userEmail });
        
        // Get the user in Auth
        const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
        if (authError) {
          logStep("ERROR: Failed to list users", { error: authError.message });
          throw new Error(`Error listing users: ${authError.message}`);
        }
        
        const user = users.users.find(u => u.email === userEmail);
        if (!user) {
          logStep("ERROR: User not found with email", { email: userEmail });
          throw new Error(`User with email ${userEmail} not found`);
        }
        
        // Calculate subscription end date
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        
        logStep("Updating user profile for active subscription", { 
          userId: user.id,
          subscriptionId: subscription.id,
          endDate: subscriptionEnd
        });
        
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
          logStep("ERROR: Failed to update profile", { error: updateError.message });
          throw new Error(`Error updating profile: ${updateError.message}`);
        }
        
        logStep("User profile updated for active subscription", { userId: user.id });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
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
      logStep("Subscription canceled event", { subscriptionId: subscription.id });
      
      // Get customer details
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const userEmail = customer.email;
      
      if (!userEmail) {
        logStep("ERROR: Customer email not found", { customerId: subscription.customer });
        throw new Error("Customer email not found");
      }
      
      // Get the user in Auth
      const { data: users, error: authError } = await supabaseClient.auth.admin.listUsers();
      if (authError) {
        logStep("ERROR: Failed to list users", { error: authError.message });
        throw new Error(`Error listing users: ${authError.message}`);
      }
      
      const user = users.users.find(u => u.email === userEmail);
      if (!user) {
        logStep("ERROR: User not found with email", { email: userEmail });
        throw new Error(`User with email ${userEmail} not found`);
      }
      
      logStep("Updating user profile for canceled subscription", { userId: user.id });
      
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
        logStep("ERROR: Failed to update profile", { error: updateError.message });
        throw new Error(`Error updating profile: ${updateError.message}`);
      }
      
      logStep("User access revoked due to subscription cancellation", { userId: user.id });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Return a 200 response for any unhandled events
    logStep("Unhandled event type", { eventType: event.type });
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
