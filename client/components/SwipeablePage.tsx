import React, { useRef, useState } from "react";
import { View, PanResponder, Dimensions, Animated, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";

interface SwipeablePageProps {
  children: React.ReactNode;
  pageTitle?: string; // For preview display
}

const SWIPE_THRESHOLD = 80; // Distance needed to complete navigation
const PREVIEW_THRESHOLD = 20; // Distance to start showing preview
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const SwipeablePage: React.FC<SwipeablePageProps> = ({
  children,
  pageTitle,
}) => {
  const { navigateToNext, navigateToPrevious, currentIndex, totalPages } =
    useSwipeNavigation();
  const theme = useTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  const currentTranslateValue = useRef(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );

  // Track the current value
  React.useEffect(() => {
    const listener = translateX.addListener(({ value }) => {
      currentTranslateValue.current = value;
    });
    return () => translateX.removeListener(listener);
  }, []);

  // Get page titles for preview (you might want to get these from your routes)
  const getPageTitle = (index: number) => {
    const routes = [
      "Cook by Order",
      "Cook by Dish",
      "Serving",
      "Cook History",
      "Serve History",
    ];
    return routes[index] || `Page ${index + 1}`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderGrant: () => {
        setIsSwipeActive(true);
        translateX.setOffset(currentTranslateValue.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;

        // Determine swipe direction and set preview
        if (Math.abs(dx) > PREVIEW_THRESHOLD) {
          if (dx > 0 && currentIndex > 0) {
            setSwipeDirection("right");
          } else if (dx < 0 && currentIndex < totalPages - 1) {
            setSwipeDirection("left");
          } else {
            setSwipeDirection(null);
          }
        }

        // Limit the translation to prevent over-swiping
        let translation = dx;
        if (dx > 0 && currentIndex === 0) {
          translation = dx * 0.2; // Reduce movement at boundary
        } else if (dx < 0 && currentIndex === totalPages - 1) {
          translation = dx * 0.2; // Reduce movement at boundary
        }

        translateX.setValue(translation);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;

        translateX.flattenOffset();
        setIsSwipeActive(false);
        setSwipeDirection(null);

        // Check if swipe threshold is met
        const shouldNavigate =
          Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5;

        if (shouldNavigate) {
          if (dx > 0 && currentIndex > 0) {
            // Animate to show previous page
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              navigateToPrevious();
            });
            return;
          } else if (dx < 0 && currentIndex < totalPages - 1) {
            // Animate to show next page
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              navigateToNext();
            });
            return;
          }
        }

        // Snap back to center if threshold not met
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const renderPreview = (direction: "left" | "right") => {
    const targetIndex =
      direction === "left" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= totalPages) return null;

    const previewTitle = getPageTitle(targetIndex);
    const leftPosition =
      direction === "left" ? SCREEN_WIDTH - 100 : -SCREEN_WIDTH + 100;

    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 100,
          left: leftPosition,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: 1,
          justifyContent: "center",
          alignItems: "center",
          opacity: 0.9,
          zIndex: 1000,
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange: direction === "left" ? [-200, 0] : [0, 200],
                outputRange: direction === "left" ? [100, 0] : [-100, 0],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontSize: 12,
            textAlign: "center",
            paddingHorizontal: 8,
            transform: [{ rotate: "90deg" }],
          }}
          numberOfLines={2}
        >
          {previewTitle}
        </Text>
      </Animated.View>
    );
  };

  const renderSwipeIndicator = () => {
    if (!isSwipeActive || !swipeDirection) return null;

    return (
      <Animated.View
        style={{
          position: "absolute",
          top: "50%",
          left: swipeDirection === "right" ? 20 : undefined,
          right: swipeDirection === "left" ? 20 : undefined,
          backgroundColor: theme.colors.primary,
          borderRadius: 20,
          padding: 8,
          opacity: translateX.interpolate({
            inputRange: swipeDirection === "left" ? [-100, -20] : [20, 100],
            outputRange: [0.8, 0.3],
            extrapolate: "clamp",
          }),
          transform: [
            {
              scale: translateX.interpolate({
                inputRange: swipeDirection === "left" ? [-100, -20] : [20, 100],
                outputRange: [1.2, 0.8],
                extrapolate: "clamp",
              }),
            },
          ],
          zIndex: 1001,
        }}
      >
        <Text style={{ color: theme.colors.onPrimary, fontSize: 16 }}>
          {swipeDirection === "left" ? "→" : "←"}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {/* Main content */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX }],
        }}
      >
        {children}
      </Animated.View>

      {/* Preview panels */}
      {swipeDirection === "left" && renderPreview("left")}
      {swipeDirection === "right" && renderPreview("right")}

      {/* Swipe indicator */}
      {renderSwipeIndicator()}

      {/* Progress indicator */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {Array.from({ length: totalPages }).map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.outline,
              opacity: index === currentIndex ? 1 : 0.5,
            }}
          />
        ))}
      </View>
    </View>
  );
};
