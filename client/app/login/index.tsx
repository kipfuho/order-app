import React, { useState } from "react";
import {
  TextInput,
  Button,
  ActivityIndicator,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { loginRequest } from "../../apis/api.service";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View, KeyboardAvoidingView, Platform, Image } from "react-native";

const LoginScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <Surface
        style={{
          flex: 1,
          margin: 20,
          borderRadius: 16,
          padding: 24,
          justifyContent: "center",
          elevation: 4,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={{ width: 80, height: 80, borderRadius: 20 }}
          />
          <Text variant="headlineMedium" style={{ marginTop: 16 }}>
            {t("login")}
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 4 }}>
            {t("login_welcome")}
          </Text>
        </View>

        <TextInput
          label={t("email")}
          value={email}
          mode="outlined"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ marginBottom: 16 }}
        />
        <TextInput
          label={t("password")}
          value={password}
          mode="outlined"
          onChangeText={setPassword}
          secureTextEntry
          style={{ marginBottom: 24 }}
        />

        <View>
          {loading ? (
            <ActivityIndicator size={40} />
          ) : (
            <Button mode="contained" onPress={handleLogin} disabled={loading}>
              {t("login")}
            </Button>
          )}
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
