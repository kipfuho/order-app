import { useState } from "react";
import { StyleProp, TextStyle } from "react-native";
import { TextInput } from "react-native-paper";

const PasswordInput = ({
  text,
  setText,
  style,
  mode,
  disabled,
  label,
}: {
  text: string;
  setText: (_text: string) => void;
  style?: StyleProp<TextStyle>;
  mode: "outlined" | "flat";
  disabled?: boolean;
  label?: string;
}) => {
  const [secure, setSecure] = useState(true);

  return (
    <TextInput
      label={label}
      mode={mode}
      disabled={disabled}
      secureTextEntry={secure}
      value={text}
      onChangeText={setText}
      style={style}
      right={
        <TextInput.Icon
          icon={secure ? "eye" : "eye-off"}
          onPress={() => setSecure(!secure)}
        />
      }
    />
  );
};

export default PasswordInput;
