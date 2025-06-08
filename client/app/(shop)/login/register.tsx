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
import { registerRequest } from "@apis/auth.api.service"; // You'll need to implement this
import Logo from "@assets/svg/logo.svg";
import PasswordInput from "@/components/ui/PasswordInput";

const RegisterScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("fill_required_fields"),
      });
      return;
    }

    setLoading(true);
    try {
      const result = await registerRequest({ name, email, password });
      if (result) {
        Toast.show({
          type: "success",
          text1: t("register_success"),
          text2: t("please_login"),
        });
        router.replace("/login");
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t("register_failed"),
        text2: err.message || t("something_wrong"),
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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Logo width={240} height={240} fill="#2e7d32" />
            <Text variant="headlineMedium">{t("register")}</Text>
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>
              {t("register_welcome")}
            </Text>
          </View>

          <TextInput
            label={t("name")}
            value={name}
            mode="outlined"
            onChangeText={setName}
          />
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
              <Button
                mode="contained"
                onPress={handleRegister}
                disabled={loading}
              >
                {t("register")}
              </Button>
            )}

            <Button
              mode="contained-tonal"
              onPress={() => router.replace("/login")}
            >
              {t("already_have_account")}
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
