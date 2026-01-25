import mobileAds, { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';

export { RewardedAdEventType, AdEventType };

export const initializeAds = async (): Promise<{ success: boolean; reason?: string }> => {
  try {
    await mobileAds().initialize();
    console.log('AdMob initialized successfully');
    return { success: true };
  } catch (e) {
    console.warn('Mobile ads failed to initialize:', e);
    return { success: false, reason: 'error' };
  }
};

export const createRewardedAd = (adUnitId: string): any => {
  return RewardedAd.createForAdRequest(adUnitId);
};

export const getAdEventTypes = (): { RewardedAdEventType: any; AdEventType: any } => {
  return { RewardedAdEventType, AdEventType };
};
