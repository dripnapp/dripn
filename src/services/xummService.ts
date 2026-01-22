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
  return { apiKey, apiSecret };
};

let xummSdk: XummSdk | null = null;

const getXummSdk = () => {
  const { apiKey, apiSecret } = getCredentials();
  if (!xummSdk && apiKey && apiSecret) {
    xummSdk = new XummSdk(apiKey, apiSecret);
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
    const sdk = getXummSdk();

    if (!sdk) {
      const { apiKey, apiSecret } = getCredentials();
      if (!apiKey || !apiSecret) {
        return {
          success: false,
          error:
            "XUMM API credentials not configured. Please restart the app after adding your API keys.",
        };
      }
      return {
        success: false,
        error: "Failed to initialize XUMM SDK",
      };
    }

    const payload = await sdk.payload.create({
      txjson: {
        TransactionType: "SignIn",
      },
      options: {
        submit: false,
        return_url: {
          app: "dripnapp://redirect",
          web: Platform.OS === "web" ? window.location.href : undefined,
        },
      },
      custom_meta: {
        instruction: "Sign in to Drip'n",
      },
    });

    if (!payload || !payload.uuid) {
      return {
        success: false,
        error: "Failed to create sign-in request",
      };
    }

    if (Platform.OS === "web") {
      if (payload.next?.always) {
        window.open(payload.next.always, "_blank");
      }
    } else {
      if (payload.next?.always) {
        await Linking.openURL(payload.next.always);
      }
    }

    return {
      success: true,
      payloadId: payload.uuid,
    };
  } catch (error: any) {
    console.error("XUMM Sign-in error:", error);
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
    const sdk = getXummSdk();

    if (!sdk) {
      return {
        success: false,
        error: "XUMM SDK not initialized",
      };
    }

    const result = await sdk.payload.get(payloadId);

    if (!result) {
      return {
        success: false,
        error: "Payload not found",
      };
    }

    if (result.meta.resolved) {
      if (result.meta.signed) {
        return {
          success: true,
          address: result.response?.account || undefined,
        };
      } else {
        return {
          success: false,
          error: "Sign-in was rejected or cancelled",
        };
      }
    }

    return {
      success: false,
      error: "Waiting for user to sign",
    };
  } catch (error: any) {
    console.error("XUMM status check error:", error);
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
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkPayloadStatus(payloadId);

    if (result.success && result.address) {
      onStatusChange?.("Connected!");
      return result;
    }

    if (result.error === "Sign-in was rejected or cancelled") {
      return result;
    }

    onStatusChange?.(`Waiting for approval... (${attempt + 1}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return {
    success: false,
    error: "Connection timed out. Please try again.",
  };
};
