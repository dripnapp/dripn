import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { amount, source } = await req.json()

    // Get current user data
    const { data: userData, error: fetchError } = await supabaseClient
      .from('users')
      .select('points, total_earned')
      .eq('id', user.id)
      .single()

    if (fetchError) throw fetchError

    const newPoints = (userData.points || 0) + amount
    const newTotal = (userData.total_earned || 0) + amount

    // Update user
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ 
        points: newPoints,
        total_earned: newTotal
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Insert history
    await supabaseClient.from('history').insert({
      user_id: user.id,
      type: 'reward',
      amount: amount,
      source: source || 'reward',
      status: 'completed'
    })

    return new Response(JSON.stringify({ success: true, new_points: newPoints }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
