export const RewardedAdEventType = { EARNED_REWARD: 'earned_reward' };
export const AdEventType = { ERROR: 'error' };

export const initializeAds = async (): Promise<{ success: boolean; reason?: string }> => {
  console.log('Ads not available on web');
  return { success: false, reason: 'web' };
};

export const createRewardedAd = (_adUnitId: string): any => {
  return {
    load: () => {},
    show: () => {},
    loaded: false,
    addAdEventListener: () => () => {},
  };
};

export const getAdEventTypes = (): { RewardedAdEventType: any; AdEventType: any } => {
  return {
    RewardedAdEventType: { EARNED_REWARD: 'earned_reward' },
    AdEventType: { ERROR: 'error' },
  };
};
