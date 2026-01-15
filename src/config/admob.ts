export const ADMOB_CONFIG = {
  ios: {
    appId: 'ca-app-pub-4501953262639636~3485723863',
    rewardedAdUnitId: 'ca-app-pub-4501953262639636/8435825886',
  },
  android: {
    appId: '',
    rewardedAdUnitId: '',
  },
};

export const getAdMobIds = (platform: 'ios' | 'android') => {
  return ADMOB_CONFIG[platform];
};
