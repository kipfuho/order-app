import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Animated } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

// Enhanced loading component with animations
const EnhancedLoadingScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const fadeAnim1 = useRef(new Animated.Value(0.3)).current;
  const fadeAnim2 = useRef(new Animated.Value(0.3)).current;
  const fadeAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const animation1 = createPulseAnimation(fadeAnim1, 0);
    const animation2 = createPulseAnimation(fadeAnim2, 200);
    const animation3 = createPulseAnimation(fadeAnim3, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [fadeAnim1, fadeAnim2, fadeAnim3]);

  return (
    <View style={styles.container}>
      <View style={styles.loadingCard}>
        <ActivityIndicator
          size="large"
          color={theme.colors.error}
          style={styles.spinner}
        />
        <Text style={styles.loadingTitle}>{t("customer_load_dish")}</Text>
        <Text style={[styles.loadingSubtitle, { opacity: 0.6 }]}>
          {t("customer_load_dish_2")}
        </Text>

        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { opacity: fadeAnim1, backgroundColor: theme.colors.error },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { opacity: fadeAnim2, backgroundColor: theme.colors.error },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { opacity: fadeAnim3, backgroundColor: theme.colors.error },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    minWidth: 280,
  },
  spinner: {
    marginBottom: 20,
    transform: [{ scale: 1.2 }],
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default EnhancedLoadingScreen;
