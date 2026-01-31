import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth header (Bearer token from client)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body (JSON from client)
    const body = await req.json();
    const { amount, source } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch current points to calculate new total (since we can't easily use RPC result in return)
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("points, total_earned")
      .eq("id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = (userData.points || 0) + amount;
    const newTotal = (userData.total_earned || 0) + amount;

    // Add points to user
    const { error: updateError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        points: newPoints,
        total_earned: newTotal,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (updateError) throw updateError;

    // Log to history
    await supabase
      .from("history")
      .insert({
        user_id: user.id,
        type: "reward",
        amount,
        source: source || "Server-verified reward",
        status: "completed"
      });

    return new Response(
      JSON.stringify({ success: true, new_points: newPoints }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
