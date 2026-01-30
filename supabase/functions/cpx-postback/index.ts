import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-client@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const CPX_WHITELIST_IPS = ["188.40.3.73", "2a01:4f8:d0a:30ff::2", "157.90.97.92"]

serve(async (req) => {
  // 1. IP Whitelist Check
  const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(',')[0].trim()
  if (clientIp && !CPX_WHITELIST_IPS.includes(clientIp)) {
    console.error(`Unauthorized IP: ${clientIp}`)
    // return new Response("Unauthorized", { status: 403 })
  }

  const url = new URL(req.url)
  const status = url.searchParams.get("status") // 1 = completed, 2 = canceled
  const transId = url.searchParams.get("trans_id")
  const userId = url.searchParams.get("user_id") // This should be our internal auth.uid() or uniqueId
  const amountLocal = parseFloat(url.searchParams.get("amount_local") || "0")
  const type = url.searchParams.get("type") // out, complete, bonus
  const receivedHash = url.searchParams.get("secure_hash")

  const SECURE_HASH = Deno.env.get("EXPO_PUBLIC_CPX_SECURE_HASH") || Deno.env.get("CPX_SECURE_HASH")
  
  // 2. Hash Validation
  const dataToHash = `${transId}-${SECURE_HASH}`
  const encoder = new TextEncoder()
  const data = encoder.encode(dataToHash)
  const hashBuffer = await crypto.subtle.digest("MD5", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  if (calculatedHash !== receivedHash) {
    console.error(`Hash mismatch. Received: ${receivedHash}, Calculated: ${calculatedHash}`)
    return new Response("Invalid Hash", { status: 400 })
  }

  if (status !== "1") {
    return new Response("OK", { status: 200 }) // Ignore non-completed events but return 200
  }

  // 3. Process Reward
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  // Find user by uniqueId or ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, points, total_earned")
    .eq("unique_id", userId)
    .single()

  if (userError || !user) {
    console.error(`User not found: ${userId}`)
    return new Response("User not found", { status: 404 })
  }

  // Update points
  const rewardAmount = Math.floor(amountLocal)
  const newPoints = user.points + rewardAmount
  const newTotalEarned = user.total_earned + rewardAmount

  const { error: updateError } = await supabase
    .from("users")
    .update({ 
      points: newPoints,
      total_earned: newTotalEarned
    })
    .eq("id", user.id)

  if (updateError) {
    console.error(`Update error: ${updateError.message}`)
    return new Response("Internal Error", { status: 500 })
  }

  // Record history
  await supabase.from("history").insert({
    user_id: user.id,
    type: "reward",
    amount: rewardAmount,
    source: "CPX Research Survey",
    status: "completed",
    details: { trans_id: transId, type: type }
  })

  return new Response("OK", { status: 200 })
})
