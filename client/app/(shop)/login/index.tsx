import React, { useState } from "react";
import {
  TextInput,
  Button,
  ActivityIndicator,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { loginRequest } from "@apis/auth.api.service";
import Logo from "@assets/svg/logo.svg";
import { goToShopList } from "@apis/navigate.service";
import PasswordInput from "@/components/ui/PasswordInput";
import { useSession } from "@/hooks/useSession";

const LoginScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { clientId } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: t("error_login"),
        text2: t("error_login_detail"),
      });
      return;
    }

    setLoading(true);
    try {
      const result = await loginRequest({ email, password, clientId });
      if (result) {
        goToShopList({ router });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: t("error_login"),
        text2: t("error_login_detail_2"),
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
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <Logo width={240} height={240} fill="#2e7d32" />
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
          />
          <PasswordInput
            label={t("password")}
            mode="outlined"
            text={password}
            setText={setPassword}
            style={{ marginBottom: 12 }}
          />

          <View style={{ gap: 8 }}>
            {loading ? (
              <ActivityIndicator size={40} />
            ) : (
              <Button mode="contained" onPress={handleLogin} disabled={loading}>
                {t("login")}
              </Button>
            )}

            <Button
              mode="contained-tonal"
              onPress={() => router.replace("/login/register")}
            >
              {t("register")}
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
