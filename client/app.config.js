import "dotenv/config";

const profile = process.env.EAS_BUILD_PROFILE || "dev";

const androidPackage =
  profile === "production"
    ? "com.anonymous.gradappshop"
    : `com.anonymous.gradappshop.${profile}`;

const appName = profile === "production" ? "Savora" : "Savora Internal";

export default {
  name: appName,
  slug: "savora",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/savora.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  runtimeVersion: {
    policy: "appVersion",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    package: androidPackage,
    adaptiveIcon: {
      foregroundImage: "./assets/images/savora.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/savora.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "8c32ec34-e59d-4bd7-b109-4b37964b84b6",
    },
  },
};
