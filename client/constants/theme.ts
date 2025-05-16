import { MD3LightTheme, MD3DarkTheme, MD3Theme } from "react-native-paper";

interface CustomMD3Theme extends MD3Theme {
  colors: MD3Theme["colors"] & {
    green: string;
    onGreen: string;
    greenContainer: string;
    onGreenContainer: string;
    yellow: string;
    onYellow: string;
    yellowContainer: string;
    onYellowContainer: string;
  };
}

const darkTheme: CustomMD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // green
    green: "#dafbb0",
    onGreen: "#000000",
    greenContainer: "#adcd86",
    onGreenContainer: "#000000",

    // yellow
    yellow: "#fff0ba",
    onYellow: "#000000",
    yellowContainer: "#d7c26b",
    onYellowContainer: "#000000",
  },
};

const lightTheme: CustomMD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // green
    green: "#1B5E20",
    onGreen: "#ffffff",
    greenContainer: "#2E7D32",
    onGreenContainer: "#ffffff",

    // yellow
    yellow: "#827717",
    onYellow: "#ffffff",
    yellowContainer: "#9E9D24",
    onYellowContainer: "#ffffff",
  },
};

export { darkTheme, lightTheme, CustomMD3Theme };
