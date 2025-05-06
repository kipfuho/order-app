import { ResourcesConfig } from "aws-amplify";

export const AmplifyConfig: ResourcesConfig = {
  API: {
    Events: {
      endpoint: process.env.AMPLIFY_ENDPOINTS || "",
      region: process.env.AMPLIFY_REGION,
      defaultAuthMode: "apiKey",
      apiKey: process.env.AMPLIFY_API_KEY,
    },
  },
};
