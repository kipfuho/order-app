import React, { PropsWithChildren } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon, Surface, Text } from "react-native-paper";
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
  const isOpen = useSharedValue(0); // 1 = open, 0 = closed
  const contentHeight = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: interpolate(isOpen.value, [0, 1], [0, contentHeight.value]),
    opacity: isOpen.value,
    overflow: "hidden",
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(isOpen.value, [0, 1], [0, 90])}deg` }],
  }));

  const measureContentHeight = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      contentHeight.value = height;
      if (isOpen.value === 0) {
        isOpen.value = withTiming(1, { duration: 300 });
      }
    }
  };

  const handleToggle = () => {
    if (contentHeight.value > 0) {
      isOpen.value = withTiming(isOpen.value === 1 ? 0 : 1, { duration: 300 });
    }
  };

  return (
    <Surface style={styles.container}>
      {/* Static title row */}
      <TouchableOpacity
        style={styles.heading}
        onPress={handleToggle}
        activeOpacity={1}
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

      <Animated.View style={animatedContainerStyle}>
        <View
          style={{
            position: "absolute",
            width: "100%",
            paddingTop: 10,
          }}
          onLayout={measureContentHeight}
        >
          {children}
        </View>
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
    zIndex: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
  },
});
