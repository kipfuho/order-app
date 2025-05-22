import { memo } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

const VerticalDivider = ({ width = 1 }: { width?: number }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        width,
        height: "100%",
        backgroundColor: theme.colors.backdrop,
        marginHorizontal: 4,
      }}
    />
  );
};

export default memo(VerticalDivider);
