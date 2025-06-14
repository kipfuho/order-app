import React from "react";
import { Card, Text, useTheme, Avatar } from "react-native-paper";
import { View } from "react-native";
import { ToastConfig } from "react-native-toast-message";
import { CustomMD3Theme } from "@/constants/theme";

type ToastProps = {
  text1?: string;
  text2?: string;
  type: "success" | "error" | "info";
};

const getToastStyle = (type: string, theme: CustomMD3Theme) => {
  switch (type) {
    case "success":
      return {
        icon: "check-circle",
        backgroundColor: theme.colors.greenContainer,
        textColor: theme.colors.onGreenContainer,
      };
    case "error":
      return {
        icon: "alert-circle",
        backgroundColor: theme.colors.errorContainer,
        textColor: theme.colors.onErrorContainer,
      };
    case "info":
    default:
      return {
        icon: "information",
        backgroundColor: theme.colors.elevation.level2,
        textColor: theme.colors.onSurface,
      };
  }
};

const CustomPaperToast = ({ text1, text2, type = "info" }: ToastProps) => {
  const theme = useTheme<CustomMD3Theme>();
  const { icon, backgroundColor, textColor } = getToastStyle(type, theme);

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Card
        style={{ backgroundColor, flexDirection: "row", alignItems: "center" }}
      >
        <Card.Content style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar.Icon
            size={32}
            icon={icon}
            style={{ marginRight: 8, backgroundColor: "transparent" }}
            color={textColor}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: textColor, fontWeight: "bold", fontSize: 18 }}
            >
              {text1}
            </Text>
            {text2 ? (
              <Text style={{ color: textColor, marginTop: 8 }}>{text2}</Text>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const toastConfig: ToastConfig = {
  info: (props) => <CustomPaperToast {...props} type="info" />,
  success: (props) => <CustomPaperToast {...props} type="success" />,
  error: (props) => <CustomPaperToast {...props} type="error" />,
};

export default toastConfig;
