import { ActivityIndicator, Surface } from "react-native-paper";

export function LoaderBasic() {
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
}
