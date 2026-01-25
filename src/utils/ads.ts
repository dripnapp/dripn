import { Platform } from 'react-native';

export const RewardedAdEventType = { EARNED_REWARD: 'earned_reward' };
export const AdEventType = { ERROR: 'error' };

let mobileAdsModule: any = null;

const loadMobileAds = () => {
  if (mobileAdsModule !== null) return mobileAdsModule;
  
  if (Platform.OS === 'web') {
    mobileAdsModule = false;
    return null;
  }

  // CRITICAL: We MUST avoid the 'require' call entirely if we suspect it will throw 
  // an uncatchable Invariant Violation in the native layer (TurboModuleRegistry).
  // In Expo Go, these modules are not present in the native binary.
  try {
    // We check for a global property that often indicates if we're in a managed Expo environment
    // where native modules might be missing.
    const isExpoGo = (global as any).Expo || (global as any).__expo || (global as any).__EXPO_DEVICE_INFO__;
    
    if (isExpoGo) {
      console.log('Detected Expo Go - skipping native ads module require');
      mobileAdsModule = false;
      return null;
    }

    mobileAdsModule = require('react-native-google-mobile-ads');
    if (mobileAdsModule && (mobileAdsModule.default || mobileAdsModule.RewardedAd)) {
      return mobileAdsModule;
    }
    mobileAdsModule = false;
    return null;
  } catch (e) {
    console.log('Caught error loading ads module:', e);
    mobileAdsModule = false;
    return null;
  }
};

export const initializeAds = async (): Promise<{ success: boolean; reason?: string }> => {
  if (Platform.OS === 'web') {
    return { success: false, reason: 'web' };
  }
  
  const ads = loadMobileAds();
  if (!ads || !ads.default) {
    return { success: false, reason: 'module_not_available' };
  }
  
  try {
    await ads.default().initialize();
    console.log('AdMob initialized successfully');
    return { success: true };
  } catch (e) {
    console.warn('Mobile ads failed to initialize:', e);
    return { success: false, reason: 'error' };
  }
};

export const createRewardedAd = (adUnitId: string): any => {
  if (Platform.OS === 'web') {
    return {
      load: () => {},
      show: () => {},
      loaded: false,
      addAdEventListener: () => () => {},
    };
  }
  
  const ads = loadMobileAds();
  if (!ads || !ads.RewardedAd) {
    return {
      load: () => {},
      show: () => {},
      loaded: false,
      addAdEventListener: () => () => {},
    };
  }
  
  try {
    return ads.RewardedAd.createForAdRequest(adUnitId);
  } catch (e) {
    console.warn('Failed to create rewarded ad:', e);
    return {
      load: () => {},
      show: () => {},
      loaded: false,
      addAdEventListener: () => () => {},
    };
  }
};

export const getAdEventTypes = (): { RewardedAdEventType: any; AdEventType: any } => {
  const ads = loadMobileAds();
  if (!ads) {
    return {
      RewardedAdEventType: { EARNED_REWARD: 'earned_reward' },
      AdEventType: { ERROR: 'error' },
    };
  }
  
  return {
    RewardedAdEventType: ads.RewardedAdEventType || { EARNED_REWARD: 'earned_reward' },
    AdEventType: ads.AdEventType || { ERROR: 'error' },
  };
};
