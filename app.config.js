export default {
  expo: {
    name: "Drip'n",
    slug: "dripn",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "dripn",
    userInterfaceStyle: "automatic",
    newArchEnabled: true, // Keep enabled for better performance; if issues return, we can toggle

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dripnapp.dripn",
      // Added ATT prompt (required for personalized ads on iOS 14+)
      infoPlist: {
        NSUserTrackingUsageDescription:
          "This allows personalized ads to support rewards and features in the app.",
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

    plugins: [
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
      [
        "react-native-google-mobile-ads",
        {
          iosAppId: "ca-app-pub-3940256099942544~3347511713", // Google test App ID (iOS)
          // androidAppId: "ca-app-pub-3940256099942544~3347511713", // test for Android
        },
      ],
      [
        "expo-ads-admob",
        {
          iosAppId: "6027059", // ← Your Unity Game ID
        },
      ],
      // Temporarily disabled to fix Google-Mobile-Ads-SDK version conflict with AdMob
      // [
      //   "expo-ads-admob",
      //   {
      //     iosAppId: "6027059",
      //   },
      // ],
    ],

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
