const isWeb =
  process.env.EXPO_PUBLIC_PLATFORM === "web" || process.env.PLATFORM === "web";

const basePlugins = [
  "expo-router",
  [
    "expo-splash-screen",
    {
      image: "./assets/images/splash-icon.png",
      imageWidth: 200,
      resizeMode: "contain",
      backgroundColor: "#0d1117",
    },
  ],
  "expo-dev-client",
];

const nativePlugins = [
  "./plugins/withUnityAds",
  [
    "react-native-google-mobile-ads",
    {
      iosAppId: "ca-app-pub-4501953262639636~1618683110",
      androidAppId: "ca-app-pub-4501953262639636~1618683110",
    },
  ],
];

export default {
  expo: {
    name: "Drip'n",
    slug: "dripn",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "dripnapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dripnapp.dripn",
      buildNumber: "6",
      infoPlist: {
        NSUserTrackingUsageDescription:
          "This allows personalized ads to support rewards and features in the app.",
        ITSAppUsesNonExemptEncryption: false,
        SKAdNetworkItems: [
          { SKAdNetworkIdentifier: "cstr6suwn9.skadnetwork" },
          { SKAdNetworkIdentifier: "4fzdc2evr5.skadnetwork" },
          { SKAdNetworkIdentifier: "3rd42ekr43.skadnetwork" },
          { SKAdNetworkIdentifier: "3qcr597p9d.skadnetwork" },
          { SKAdNetworkIdentifier: "v9wtta54v3.skadnetwork" },
          { SKAdNetworkIdentifier: "n38lu8286q.skadnetwork" },
        ],
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0d1117",
      },
      edgeToEdgeEnabled: true,
      package: "com.dripnapp.dripn",
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [...basePlugins, ...nativePlugins],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      xummApiKey: process.env.EXPO_PUBLIC_XUMM_API_KEY || "",
      xummApiSecret: process.env.EXPO_PUBLIC_XUMM_API_SECRET || "",
      eas: {
        projectId: "a90c788d-906c-49bc-b1a4-81b2bf88b27a",
      },
    },
  },
};
