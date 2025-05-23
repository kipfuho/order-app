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
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // green
    green: "#1B5E20",
    onGreen: "#ffffff",
    greenContainer: "#2E7D32",
    onGreenContainer: "#ffffff",

    // yellow - Updated
    yellow: "#E9A319",
    onYellow: "#ffffff",
    yellowContainer: "#A86523",
    onYellowContainer: "#FFDF88",
  },
};

const lightTheme: CustomMD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // green
    green: "#dafbb0",
    onGreen: "#000000",
    greenContainer: "#adcd86",
    onGreenContainer: "#000000",

    // yellow - Updated
    yellow: "#E9A319",
    onYellow: "#1A1600",
    yellowContainer: "#F0E68C",
    onYellowContainer: "#74512D",
  },
};

export { darkTheme, lightTheme, CustomMD3Theme };
