export const ADMOB_CONFIG = {
  android: {
    appId: 'ca-app-pub-8431843567794750~3455532760',
    rewardedAdUnitId: 'ca-app-pub-8431843567794750/4357550894',
  },
  ios: {
    appId: 'ca-app-pub-8431843567794750~8800208849',
    rewardedAdUnitId: 'ca-app-pub-8431843567794750/1274084371',
  },
  testMode: true,
};

export const TEST_AD_UNIT_IDS = {
  android: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

export const getAdUnitId = (platform: 'android' | 'ios', testMode: boolean = true) => {
  if (testMode) {
    return TEST_AD_UNIT_IDS[platform].rewarded;
  }
  return ADMOB_CONFIG[platform].rewardedAdUnitId;
};
