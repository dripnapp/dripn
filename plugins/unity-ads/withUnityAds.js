const { withInfoPlist, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withUnityAds = (config, { iosGameId }) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSUnityAdsGameId = iosGameId;
    return config;
  });
};

module.exports = withUnityAds;
