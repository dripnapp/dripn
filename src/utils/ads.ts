import { Platform } from 'react-native';

export const RewardedAdEventType = { EARNED_REWARD: 'earned_reward' };
export const AdEventType = { ERROR: 'error' };

let mobileAdsModule: any = null;

const loadMobileAds = () => {
  if (mobileAdsModule !== null) return mobileAdsModule;
  
  try {
    mobileAdsModule = require('react-native-google-mobile-ads');
    return mobileAdsModule;
  } catch (e) {
    console.log('Mobile ads module not available (likely Expo Go)');
    mobileAdsModule = false;
    return null;
  }
};

export const initializeAds = async (): Promise<{ success: boolean; reason?: string }> => {
  if (Platform.OS === 'web') {
    return { success: false, reason: 'web' };
  }
  
  const ads = loadMobileAds();
  if (!ads) {
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
  if (!ads) {
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
    RewardedAdEventType: ads.RewardedAdEventType,
    AdEventType: ads.AdEventType,
  };
};
