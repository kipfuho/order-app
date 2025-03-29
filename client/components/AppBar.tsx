import { ReactNode } from "react";
import { Appbar } from "react-native-paper";

export function AppBar({
  title,
  goBack,
  children,
}: {
  title: string;
  goBack?: () => void;
  children?: ReactNode;
}) {
  return (
    <Appbar.Header style={{ height: 60, paddingHorizontal: 8 }}>
      {goBack && <Appbar.BackAction onPress={goBack} size={20} />}
      <Appbar.Content title={title} titleStyle={{ fontSize: 16 }} />
      {children}
    </Appbar.Header>
  );
}
