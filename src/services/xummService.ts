import { Platform, Linking } from 'react-native';
import { XummSdk } from 'xumm-sdk';

const XUMM_API_KEY = process.env.EXPO_PUBLIC_XUMM_API_KEY || '';
const XUMM_API_SECRET = process.env.EXPO_PUBLIC_XUMM_API_SECRET || '';

let xummSdk: XummSdk | null = null;

const getXummSdk = () => {
  if (!xummSdk && XUMM_API_KEY && XUMM_API_SECRET) {
    xummSdk = new XummSdk(XUMM_API_KEY, XUMM_API_SECRET);
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
      if (!XUMM_API_KEY || !XUMM_API_SECRET) {
        return {
          success: false,
          error: 'XUMM API credentials not configured. Please add XUMM_API_KEY and XUMM_API_SECRET.'
        };
      }
      return {
        success: false,
        error: 'Failed to initialize XUMM SDK'
      };
    }

    const payload = await sdk.payload.create({
      txjson: {
        TransactionType: 'SignIn'
      },
      options: {
        submit: false,
        return_url: {
          app: 'adfi://xumm-callback',
          web: Platform.OS === 'web' ? window.location.href : undefined
        }
      },
      custom_meta: {
        instruction: 'Sign in to ADFI Crypto Rewards'
      }
    });

    if (!payload || !payload.uuid) {
      return {
        success: false,
        error: 'Failed to create sign-in request'
      };
    }

    if (Platform.OS === 'web') {
      if (payload.next?.always) {
        window.open(payload.next.always, '_blank');
      }
    } else {
      if (payload.next?.always) {
        await Linking.openURL(payload.next.always);
      }
    }

    return {
      success: true,
      payloadId: payload.uuid
    };
  } catch (error: any) {
    console.error('XUMM Sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to XUMM'
    };
  }
};

export const checkPayloadStatus = async (payloadId: string): Promise<XummSignInResult> => {
  try {
    const sdk = getXummSdk();
    
    if (!sdk) {
      return {
        success: false,
        error: 'XUMM SDK not initialized'
      };
    }

    const result = await sdk.payload.get(payloadId);
    
    if (!result) {
      return {
        success: false,
        error: 'Payload not found'
      };
    }

    if (result.meta.signed && result.response?.account) {
      return {
        success: true,
        address: result.response.account,
        payloadId
      };
    }

    if (result.meta.resolved && !result.meta.signed) {
      return {
        success: false,
        error: 'Sign-in was rejected or cancelled'
      };
    }

    return {
      success: false,
      error: 'Pending user action in Xaman app'
    };
  } catch (error: any) {
    console.error('XUMM status check error:', error);
    return {
      success: false,
      error: error.message || 'Failed to check status'
    };
  }
};

export const pollForSignIn = async (
  payloadId: string,
  onStatusUpdate: (status: string) => void,
  maxAttempts: number = 60
): Promise<XummSignInResult> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkPayloadStatus(payloadId);
    
    if (result.success && result.address) {
      return result;
    }
    
    if (result.error === 'Sign-in was rejected or cancelled') {
      return result;
    }
    
    onStatusUpdate(`Waiting for approval in Xaman... (${attempt + 1}/${maxAttempts})`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return {
    success: false,
    error: 'Connection timed out. Please try again.'
  };
};
