export default {
  expo: {
    name: "Drip'n",
    slug: "dripn",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "dripn",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dripnapp.dripn",
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
          iosAppId: "ca-app-pub-4501953262639636~3485723863", // Your real iOS App ID
          // androidAppId: "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ", // add later if needed
        },
      ],
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
