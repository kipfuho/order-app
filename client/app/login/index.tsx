import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { loginRequest } from "../../api/api.service";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../stores/userSlice";
import { RootState } from "../../stores/store";

const LoginScreen = () => {
  const [email, setEmail] = useState("ctcakip@gmail.com");
  const [password, setPassword] = useState("1234567q");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.shop.user);

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
      const userData = await loginRequest(email, password);
      dispatch(updateUser(userData));
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
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Login
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {loading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
        />
      ) : (
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          disabled={loading}
        >
          Login
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  loader: {
    marginTop: 10,
    alignSelf: "center",
  },
});

export default LoginScreen;
