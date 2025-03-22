import React, { useState } from "react";
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  Surface,
} from "react-native-paper";
import { loginRequest } from "../../api/api.service";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

const LoginScreen = () => {
  const [email, setEmail] = useState("ctcakip@gmail.com");
  const [password, setPassword] = useState("1234567q");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email and password are required",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await loginRequest({ email, password });
      // go home page
      if (result) {
        router.replace("/");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface style={{ flex: 1 }}>
      <Text variant="headlineLarge">Login</Text>
      <TextInput
        label="Email"
        value={email}
        mode="outlined"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        mode="outlined"
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator animating={true} size="large" />
      ) : (
        <Button mode="contained-tonal" onPress={handleLogin} disabled={loading}>
          Login
        </Button>
      )}
    </Surface>
  );
};

export default LoginScreen;
