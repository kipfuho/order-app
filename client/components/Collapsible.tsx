import React, { PropsWithChildren, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  LayoutChangeEvent,
} from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const theme = useTheme();

  const [contentHeight, setContentHeight] = useState(0);
  const isOpen = useSharedValue(1); // 1 = open, 0 = closed

  const handleToggle = () => {
    isOpen.value = withTiming(isOpen.value === 1 ? 0 : 1, { duration: 300 });
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(isOpen.value, [0, 1], [0, contentHeight]),
    opacity: isOpen.value,
    overflow: "hidden",
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(isOpen.value, [0, 1], [0, 90])}deg` }],
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    if (contentHeight === 0) {
      setContentHeight(event.nativeEvent.layout.height);
    }
  };

  return (
    <Surface style={styles.container}>
      {/* Static title row */}
      <TouchableOpacity
        style={styles.heading}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <View style={{ height: 32, width: 32 }}>
          <Animated.View style={animatedIconStyle}>
            <Icon source="chevron-right" size={32} />
          </Animated.View>
        </View>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
      </TouchableOpacity>

      {/* Hidden measurement view */}
      {contentHeight === 0 && (
        <View style={styles.hidden} onLayout={onLayout}>
          {children}
        </View>
      )}

      {/* Animated collapsible section */}
      <Animated.View style={[animatedContainerStyle]}>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    margin: 8,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 1, // make sure it's above any content overflow
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
  },
  content: {
    paddingTop: 10,
  },
  hidden: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
    left: 0,
    right: 0,
  },
});
