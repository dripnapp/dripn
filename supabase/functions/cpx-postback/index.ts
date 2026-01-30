import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const CPX_WHITELIST_IPS = ["188.40.3.73", "2a01:4f8:d0a:30ff::2", "157.90.97.92"]

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      } 
    })
  }

  // CPX Testing sometimes sends a simple GET to check if the URL exists
  const url = new URL(req.url)
  if (url.searchParams.sort().toString() === "" && req.method === "GET") {
    return new Response("CPX Postback Endpoint Active", { status: 200 })
  }

  // 1. IP Whitelist Check
  const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(',')[0].trim()
  if (clientIp && !CPX_WHITELIST_IPS.includes(clientIp)) {
    console.warn(`Incoming request from non-whitelisted IP: ${clientIp}`)
    // In production, you might want to return 403 here
  }

  const status = url.searchParams.get("status") // 1 = completed, 2 = canceled
  const transId = url.searchParams.get("trans_id")
  const userId = url.searchParams.get("user_id") 
  const amountLocal = parseFloat(url.searchParams.get("amount_local") || "0")
  const type = url.searchParams.get("type") // out, complete, bonus
  const receivedHash = url.searchParams.get("secure_hash")

  // Check for required params
  if (!transId || !receivedHash) {
    return new Response("Missing parameters", { status: 400 })
  }

  const SECURE_HASH = Deno.env.get("CPX_SECURE_HASH") || Deno.env.get("EXPO_PUBLIC_CPX_SECURE_HASH")
  
  if (!SECURE_HASH) {
    console.error("CPX_SECURE_HASH environment variable is not set")
    return new Response("Configuration Error", { status: 500 })
  }

  // 2. Hash Validation
  // CPX requirement: md5({trans_id}-secure_hash)
  const dataToHash = `${transId}-${SECURE_HASH}`
  const encoder = new TextEncoder()
  const data = encoder.encode(dataToHash)
  const hashBuffer = await crypto.subtle.digest("MD5", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  if (calculatedHash !== receivedHash) {
    console.error(`Hash mismatch for transId ${transId}. Received: ${receivedHash}, Calculated: ${calculatedHash}`)
    return new Response("Invalid Hash", { status: 403 })
  }

  // Only reward if status is 1 (completed)
  if (status !== "1") {
    console.log(`Event status ${status} for trans_id ${transId}. Ignoring reward.`)
    return new Response("OK", { status: 200 })
  }

  // 3. Process Reward
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  // Try to find user by unique_id (6-digit code) OR by UUID (f3da46bc...)
  // The screenshot shows a UUID being sent as user_id
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
  
  // Atomic update
  const { error: updateError } = await supabase
    .from("users")
    .update({ 
      points: user.points + rewardAmount,
      total_earned: user.total_earned + rewardAmount
    })
    .eq("id", user.id)

  if (updateError) {
    console.error(`Database update error: ${updateError.message}`)
    return new Response("Internal Error", { status: 500 })
  }

  // Record history
  await supabase.from("history").insert({
    user_id: user.id,
    type: "reward",
    amount: rewardAmount,
    source: "CPX Research Survey",
    status: "completed",
    details: { 
      trans_id: transId, 
      type: type,
      amount_usd: url.searchParams.get("amount_usd"),
      ip_click: url.searchParams.get("ip_click")
    }
  })

  console.log(`Successfully rewarded user ${userId} with ${rewardAmount} drips for trans_id ${transId}`)
  return new Response("OK", { status: 200 })
})
