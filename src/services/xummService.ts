import { Platform, Linking } from "react-native";
import { XummSdk } from "xumm-sdk";
import Constants from "expo-constants";

const getCredentials = () => {
  const apiKey =
    process.env.EXPO_PUBLIC_XUMM_API_KEY ||
    Constants.expoConfig?.extra?.xummApiKey ||
    "";
  const apiSecret =
    process.env.EXPO_PUBLIC_XUMM_API_SECRET ||
    Constants.expoConfig?.extra?.xummApiSecret ||
    "";

  console.log("[XUMM CREDENTIALS] API Key present:", !!apiKey);
  console.log("[XUMM CREDENTIALS] API Secret present:", !!apiSecret);

  return { apiKey, apiSecret };
};

let xummSdk: XummSdk | null = null;

const getXummSdk = () => {
  const { apiKey, apiSecret } = getCredentials();
  if (!xummSdk && apiKey && apiSecret) {
    console.log("[XUMM SDK] Initializing new XummSdk instance");
    xummSdk = new XummSdk(apiKey, apiSecret);
  } else if (xummSdk) {
    console.log("[XUMM SDK] Reusing existing XummSdk instance");
  } else {
    console.log("[XUMM SDK] Cannot initialize - missing credentials");
  }
  return xummSdk;
};

export interface XummSignInResult {
  success: boolean;
  address?: string;
  error?: string;
  payloadId?: string;
}

export const createSignInRequest = async (): Promise<XummSignInResult> => {
  try {
    console.log("[XUMM] Starting createSignInRequest");

    const sdk = getXummSdk();

    if (!sdk) {
      const { apiKey, apiSecret } = getCredentials();
      if (!apiKey || !apiSecret) {
        console.error("[XUMM] Missing API credentials");
        return {
          success: false,
          error:
            "XUMM API credentials not configured. Please restart the app after adding your API keys.",
        };
      }
      console.error("[XUMM] Failed to initialize SDK despite credentials");
      return {
        success: false,
        error: "Failed to initialize XUMM SDK",
      };
    }

    const payloadConfig = {
      txjson: {
        TransactionType: "SignIn" as const, // "as const" helps TS
      },
      options: {
        submit: false,
        return_url: {
          app: "dripnapp://redirect",
        },
      },
      custom_meta: {
        instruction: "Sign in to Drip'n",
      },
    };

    console.log(
      "[XUMM] Sending payload configuration to Xumm:",
      JSON.stringify(payloadConfig, null, 2),
    );

    const payload = await sdk.payload.create(payloadConfig);

    console.log(
      "[XUMM] Full payload creation response from Xumm:",
      JSON.stringify(payload, null, 2),
    );

    if (!payload || !payload.uuid) {
      console.error("[XUMM] No UUID in payload response");
      return {
        success: false,
        error: "Failed to create sign-in request",
      };
    }

    console.log("[XUMM] Payload UUID:", payload.uuid);

    if (payload.next) {
      console.log("[XUMM] Next actions from Xumm:", payload.next);
    }

    if (payload.refs) {
      console.log("[XUMM] References (QR, etc.):", payload.refs);
    }

    if (Platform.OS === "web") {
      console.log("[XUMM] Platform detected: web");
      if (payload.next?.always) {
        console.log("[XUMM] Opening in new tab (web):", payload.next.always);
        window.open(payload.next.always, "_blank");
      } else {
        console.warn("[XUMM] No 'always' URL for web redirect");
      }
    } else {
      console.log("[XUMM] Platform detected: mobile/native");
      if (payload.next?.always) {
        console.log(
          "[XUMM] Opening this URL in mobile app:",
          payload.next.always,
        );
        await Linking.openURL(payload.next.always);
      } else {
        console.warn(
          "[XUMM] No 'always' URL provided by Xumm for mobile redirect",
        );
      }
    }

    console.log(
      "[XUMM] Sign-in request created successfully. Payload ID:",
      payload.uuid,
    );

    return {
      success: true,
      payloadId: payload.uuid,
    };
  } catch (error: any) {
    console.error("[XUMM] Sign-in request failed with error:", error);
    return {
      success: false,
      error: error.message || "Failed to connect to XUMM",
    };
  }
};

export const checkPayloadStatus = async (
  payloadId: string,
): Promise<XummSignInResult> => {
  try {
    console.log("[XUMM] Checking status for payload ID:", payloadId);
    const sdk = getXummSdk();

    if (!sdk) {
      console.error("[XUMM] SDK not initialized in checkPayloadStatus");
      return {
        success: false,
        error: "XUMM SDK not initialized",
      };
    }

    const result = await sdk.payload.get(payloadId);
    console.log(
      "[XUMM] Payload status response:",
      JSON.stringify(result, null, 2),
    );

    if (!result) {
      console.error("[XUMM] Payload not found");
      return {
        success: false,
        error: "Payload not found",
      };
    }

    if (result.meta.resolved) {
      if (result.meta.signed) {
        console.log(
          "[XUMM] Sign-in successful - address:",
          result.response?.account,
        );
        return {
          success: true,
          address: result.response?.account || undefined,
        };
      } else {
        console.log("[XUMM] Sign-in rejected or cancelled");
        return {
          success: false,
          error: "Sign-in was rejected or cancelled",
        };
      }
    }

    console.log("[XUMM] Still waiting for user to sign");
    return {
      success: false,
      error: "Waiting for user to sign",
    };
  } catch (error: any) {
    console.error("[XUMM] Status check failed:", error);
    return {
      success: false,
      error: error.message || "Failed to check status",
    };
  }
};

export const pollForSignIn = async (
  payloadId: string,
  onStatusChange?: (status: string) => void,
  maxAttempts: number = 60,
): Promise<XummSignInResult> => {
  console.log(
    "[XUMM] Starting polling for payload:",
    payloadId,
    "max attempts:",
    maxAttempts,
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkPayloadStatus(payloadId);

    if (result.success && result.address) {
      console.log("[XUMM] Polling success - wallet connected");
      onStatusChange?.("Connected!");
      return result;
    }

    if (result.error === "Sign-in was rejected or cancelled") {
      console.log("[XUMM] Polling ended - user rejected/cancelled");
      return result;
    }

    const statusMsg = `Waiting for approval... (${attempt + 1}/${maxAttempts})`;
    console.log("[XUMM]", statusMsg);
    onStatusChange?.(statusMsg);

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("[XUMM] Polling timed out after", maxAttempts, "attempts");
  return {
    success: false,
    error: "Connection timed out. Please try again.",
  };
};
