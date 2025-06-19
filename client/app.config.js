import "dotenv/config";

const profile = process.env.EAS_BUILD_PROFILE || "dev";

const androidPackage =
  profile === "production"
    ? "com.anonymous.gradappshop"
    : `com.anonymous.gradappshop.${profile}`;

const appName = profile === "production" ? "Savora" : "Savora Internal";
const appSlug = `savora-${profile}`;

export default {
  name: appName,
  slug: appSlug,
  version: "1.0.1",
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
      projectId: "03c69a5f-922e-4521-9cad-d43c9f71ee5f",
    },
  },
};
