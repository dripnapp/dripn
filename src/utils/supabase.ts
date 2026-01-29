// src/utils/supabase.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStore } from "../store/useStore";
import { Alert } from "react-native";

// ────────────────────────────────────────────────
// Environment variables
// ────────────────────────────────────────────────
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://fxbyabofsejlhtbboynn.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_33HgxcoB8fqDCE514PdkFw_PojUYBTL";
const VERIFY_REWARD_URL =
  process.env.EXPO_PUBLIC_VERIFY_REWARD_URL ||
  "https://fxbyabofsejlhtbboynn.supabase.co/functions/v1/verify-reward";

// Safety check
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase URL or Anon Key in environment variables");
}

// ────────────────────────────────────────────────
// Supabase client with proper auth persistence
// ────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ────────────────────────────────────────────────
// Return type for addPointsServer
// ────────────────────────────────────────────────
export type AddPointsServerResult = {
  success: boolean;
  synced?: boolean;
  error?: any;
};

// ────────────────────────────────────────────────
// Secure server-side point awarding
// - Optimistic UI update
// - Server verification via Edge Function
// - Graceful fallback + retry on transient errors
// ────────────────────────────────────────────────
export const addPointsServer = async (
  amount: number,
  source: string,
): Promise<AddPointsServerResult> => {
  const { addPoints } = useStore.getState();

  // 1. Optimistic local update (UI updates instantly)
  addPoints(amount);

  try {
    // 2. Get current authenticated session or sign in anonymously
    let {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("No session found, reward tracked locally only.");
      return { success: true, synced: false };
    }

    if (!session?.access_token) {
      console.warn(
        "No valid session - points added locally only",
        sessionError,
      );
      // Removed offline alert for smoother user experience
      return { success: true, synced: false };
    }

    console.log(
      `addPointsServer: ${amount} from ${source} for user ${session.user.id}`,
    );

    // 3. Call Edge Function with auth token
    const response = await fetch(VERIFY_REWARD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ amount, source }),
    });

    // Simple retry on 5xx (transient server issues)
    if (!response.ok && response.status >= 500) {
      console.warn(`Server 5xx (${response.status}) - retrying once...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const retryResponse = await fetch(VERIFY_REWARD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount, source }),
      });
      if (!retryResponse.ok) {
        throw new Error(`Retry failed: ${retryResponse.status}`);
      }
      const retryResult = await retryResponse.json();
      if (retryResult.success) {
        console.log(
          "Retry succeeded - server confirmed:",
          retryResult.new_points,
        );
        return { success: true, synced: true };
      }
    }

    if (response.status === 404) {
      console.error("Reward verification endpoint not found (404). Check Edge Function deployment.");
      return { success: true, synced: false };
    }

    if (!response.ok) {
      throw new Error(`Server responded ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("Server reward confirmed:", result.new_points);
      // Optional: re-sync local if server value differs (rare)
      // addPoints(result.new_points - amount); // adjust if needed
      return { success: true, synced: true };
    } else {
      console.error("Server rejected reward:", result.error);
      Alert.alert(
        "Reward Issue",
        "Server could not verify. Reward kept locally.",
      );
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("addPointsServer failed:", error);
    Alert.alert(
      "Connection Issue",
      "Reward added locally. Will try server sync later.",
    );
    return { success: false, error };
  }
};
