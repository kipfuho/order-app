import { ResourcesConfig } from "aws-amplify";

export const AmplifyConfig: ResourcesConfig = {
  API: {
    Events: {
      endpoint: process.env.EXPO_PUBLIC_AMPLIFY_ENDPOINTS || "",
      region: process.env.EXPO_PUBLIC_AMPLIFY_REGION,
      defaultAuthMode: "apiKey",
      apiKey: process.env.EXPO_PUBLIC_AMPLIFY_API_KEY,
    },
  },
};
