import { Platform } from 'react-native';

export const RewardedAdEventType = { EARNED_REWARD: 'earned_reward', LOADED: 'loaded' };
export const AdEventType = { ERROR: 'error', CLOSED: 'closed' };

export let adsModule: any = null;
let mobileAdsModule: any = null;

const loadMobileAds = () => {
  if (mobileAdsModule !== null) return mobileAdsModule;
  
  if (Platform.OS === 'web') {
    mobileAdsModule = false;
    return null;
  }

  try {
    const ExpoConstants = require('expo-constants').default;
    const isExpoGo = ExpoConstants?.appOwnership === 'expo';
    
    if (isExpoGo) {
      console.log('Expo Go detected via Constants - disabling native ads');
      mobileAdsModule = false;
      return null;
    }

    mobileAdsModule = require('react-native-google-mobile-ads');
    adsModule = mobileAdsModule;
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
    
    // Apply privacy preferences from store
    const { useStore } = require('../store/useStore');
    const { privacyConsent } = useStore.getState();
    
    if (ads.default().setRequestConfiguration) {
      ads.default().setRequestConfiguration({
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: privacyConsent.region === 'EU' && !privacyConsent.euConsent,
        maxAdContentRating: 'G',
      });
    }

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
        RewardedAdEventType: { EARNED_REWARD: 'earned_reward', LOADED: 'loaded' },
        AdEventType: { ERROR: 'error', CLOSED: 'closed' },
      };
    }
    return {
      RewardedAdEventType: ads.RewardedAdEventType || { EARNED_REWARD: 'earned_reward', LOADED: 'loaded' },
      AdEventType: ads.AdEventType || { ERROR: 'error', CLOSED: 'closed' },
    };
  } catch (e) {
    return {
      RewardedAdEventType: { EARNED_REWARD: 'earned_reward', LOADED: 'loaded' },
      AdEventType: { ERROR: 'error', CLOSED: 'closed' },
    };
  }
};
