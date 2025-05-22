import { memo } from "react";
import { ActivityIndicator, Surface } from "react-native-paper";

const LoaderBasicComponent = () => {
  return (
    <Surface mode="flat" style={{ flex: 1, padding: 16 }}>
      <ActivityIndicator
        animating={true}
        size="large"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </Surface>
  );
};

export const LoaderBasic = memo(LoaderBasicComponent);
