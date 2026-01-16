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
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0d1117"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0d1117"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      xummApiKey: process.env.EXPO_PUBLIC_XUMM_API_KEY || '',
      xummApiSecret: process.env.EXPO_PUBLIC_XUMM_API_SECRET || ''
    }
  }
};
