const { withDangerousMod, withInfoPlist } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withUnityAdsPod = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile",
      );
      let podfile = fs.readFileSync(filePath, "utf-8");

      // Add Unity Ads pod if not already present
      if (!podfile.includes("pod 'UnityAds'")) {
        podfile = podfile.replace(
          /target '.*' do/,
          `target '${config.modRequest.projectName}' do
  pod 'UnityAds', '~> 4.12'`,
        );
        fs.writeFileSync(filePath, podfile);
      }

      return config;
    },
  ]);
};

const withUnityGameId = (config, { iosGameId }) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSUnityAdsGameId = iosGameId;
    return config;
  });
};

module.exports = (config, props) => {
  config = withUnityAdsPod(config);
  config = withUnityGameId(config, props);
  return config;
};
