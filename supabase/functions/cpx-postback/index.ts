import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const CPX_WHITELIST_IPS = ["188.40.3.73", "2a01:4f8:d0a:30ff::2", "157.90.97.92"]

serve(async (req) => {
  const url = new URL(req.url)
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      } 
    })
  }

  // CPX Testing / Heartbeat
  if (url.searchParams.toString() === "" && req.method === "GET") {
    return new Response("CPX Postback Endpoint Active", { 
      status: 200,
      headers: { "Content-Type": "text/plain" }
    })
  }

  try {
    const status = url.searchParams.get("status")
    const transId = url.searchParams.get("trans_id")
    const userId = url.searchParams.get("user_id") 
    const amountLocal = parseFloat(url.searchParams.get("amount_local") || "0")
    const type = url.searchParams.get("type")
    const receivedHash = url.searchParams.get("secure_hash")

    // Validate existence of core params
    if (!transId || !receivedHash) {
      return new Response("Missing parameters", { status: 400 })
    }

    const SECURE_HASH = Deno.env.get("CPX_SECURE_HASH") || Deno.env.get("EXPO_PUBLIC_CPX_SECURE_HASH")
    if (!SECURE_HASH) {
      console.error("CPX_SECURE_HASH not set")
      return new Response("Config Error", { status: 500 })
    }

    // Hash Validation: md5({trans_id}-secure_hash)
    const dataToHash = `${transId}-${SECURE_HASH}`
    const encoder = new TextEncoder()
    const data = encoder.encode(dataToHash)
    const hashBuffer = await crypto.subtle.digest("MD5", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (calculatedHash !== receivedHash) {
      console.error(`Hash mismatch for ${transId}`)
      return new Response("Invalid Hash", { status: 403 })
    }

    if (status !== "1") {
      return new Response("OK", { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Flexible ID lookup
    let query = supabase.from("users").select("id, points, total_earned")
    if (userId && userId.includes("-")) {
      query = query.eq("id", userId)
    } else {
      query = query.eq("unique_id", userId)
    }

    const { data: user, error: userError } = await query.single()
    if (userError || !user) {
      console.error(`User ${userId} not found`)
      return new Response("User not found", { status: 404 })
    }

    const rewardAmount = Math.floor(amountLocal)
    
    // Process update
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        points: user.points + rewardAmount,
        total_earned: user.total_earned + rewardAmount
      })
      .eq("id", user.id)

    if (updateError) throw updateError

    await supabase.from("history").insert({
      user_id: user.id,
      type: "reward",
      amount: rewardAmount,
      source: "CPX Research Survey",
      status: "completed",
      details: { trans_id: transId, type: type }
    })

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response("Error", { status: 500 })
  }
})
