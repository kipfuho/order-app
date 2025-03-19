import { ReactNode } from "react";
import { Appbar } from "react-native-paper";

export function AppBar({
  title,
  goBack,
  children,
}: {
  title: string;
  goBack: () => void;
  children?: ReactNode;
}) {
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => goBack()} />
      <Appbar.Content title={title} />
      {children}
    </Appbar.Header>
  );
}
