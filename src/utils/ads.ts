import { Platform } from 'react-native';

export const RewardedAdEventType = { EARNED_REWARD: 'earned_reward' };
export const AdEventType = { ERROR: 'error' };

// We use a mock by default to avoid any 'require' issues in Expo Go
let mobileAdsModule: any = null;

const loadMobileAds = () => {
  if (mobileAdsModule !== null) return mobileAdsModule;
  
  if (Platform.OS === 'web') {
    mobileAdsModule = false;
    return null;
  }

  // Metro still analyzes 'require' statements even if they are in a try-catch.
  // In some Expo Go versions, the mere presence of the require can cause issues if not guarded well.
  // We use a more aggressive approach to avoid the require.
  try {
    // Constants.appOwnership is 'expo' when running in Expo Go
    const ExpoConstants = require('expo-constants').default;
    const isExpoGo = ExpoConstants?.appOwnership === 'expo';
    
    if (isExpoGo) {
      console.log('Expo Go detected via Constants - disabling native ads');
      mobileAdsModule = false;
      return null;
    }

    // Only attempt require if we are fairly sure we are NOT in Expo Go
    mobileAdsModule = require('react-native-google-mobile-ads');
    if (mobileAdsModule && (mobileAdsModule.default || mobileAdsModule.RewardedAd)) {
      return mobileAdsModule;
    }
    mobileAdsModule = false;
    return null;
  } catch (e) {
    mobileAdsModule = false;
    return null;
  }
};

export const initializeAds = async (): Promise<{ success: boolean; reason?: string }> => {
  if (Platform.OS === 'web') return { success: false, reason: 'web' };
  
  try {
    const ads = loadMobileAds();
    if (!ads || !ads.default) return { success: false, reason: 'module_not_available' };
    await ads.default().initialize();
    return { success: true };
  } catch (e) {
    return { success: false, reason: 'error' };
  }
};

export const createRewardedAd = (adUnitId: string): any => {
  const mockAd = {
    load: () => {},
    show: () => {},
    loaded: false,
    addAdEventListener: () => () => {},
  };

  if (Platform.OS === 'web') return mockAd;
  
  try {
    const ads = loadMobileAds();
    if (!ads || !ads.RewardedAd) return mockAd;
    return ads.RewardedAd.createForAdRequest(adUnitId);
  } catch (e) {
    return mockAd;
  }
};

export const getAdEventTypes = (): { RewardedAdEventType: any; AdEventType: any } => {
  try {
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
  } catch (e) {
    return {
      RewardedAdEventType: { EARNED_REWARD: 'earned_reward' },
      AdEventType: { ERROR: 'error' },
    };
  }
};
