const { withBuildProperties } = require("expo-build-properties");

const withUnityAds = (config) => {
  // iOS: Add Unity Ads Pod
  config = withBuildProperties(config, {
    ios: {
      extraPods: [
        { name: "GoogleMobileAdsMediationUnity" }
      ]
    }
  });

  return config;
};

module.exports = withUnityAds;
