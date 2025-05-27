import React, { useRef, useState, useEffect } from "react";
import { View, PanResponder, Dimensions, Animated, Text } from "react-native";
import { useTheme } from "react-native-paper";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";

interface SwipeablePageProps {
  children: React.ReactNode;
  pageTitle?: string;
  previewContent?: {
    previous?: React.ReactNode;
    next?: React.ReactNode;
  };
}

const SWIPE_THRESHOLD = 100;
const PREVIEW_THRESHOLD = 30;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const AdvancedSwipeablePage: React.FC<SwipeablePageProps> = ({
  children,
  pageTitle,
  previewContent,
}) => {
  const { navigateToNext, navigateToPrevious, currentIndex, totalPages } =
    useSwipeNavigation();
  const theme = useTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const currentTranslateValue = useRef(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [swipeProgress, setSwipeProgress] = useState(0);

  // Track the current translate value
  useEffect(() => {
    const listener = translateX.addListener(({ value }) => {
      currentTranslateValue.current = value;
    });
    return () => translateX.removeListener(listener);
  }, []);

  // Default preview content generator
  const generatePreviewContent = (direction: "previous" | "next") => {
    const targetIndex =
      direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= totalPages) return null;

    const routes = [
      {
        title: "Cook by Order",
        icon: "📋",
        description: "Manage orders by priority",
      },
      {
        title: "Cook by Dish",
        icon: "🍳",
        description: "Group similar dishes together",
      },
      { title: "Serving", icon: "🍽️", description: "Ready to serve orders" },
      {
        title: "Cook History",
        icon: "📊",
        description: "View cooking statistics",
      },
      {
        title: "Serve History",
        icon: "📈",
        description: "Serving performance data",
      },
    ];

    const route = routes[targetIndex];
    if (!route) return null;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>{route.icon}</Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: theme.colors.onSurface,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {route.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.onSurfaceVariant,
            textAlign: "center",
          }}
        >
          {route.description}
        </Text>
      </View>
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 15
        );
      },
      onPanResponderGrant: () => {
        setIsSwipeActive(true);
        translateX.setOffset(currentTranslateValue.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;

        // Calculate swipe progress
        const progress = Math.abs(dx) / SCREEN_WIDTH;
        setSwipeProgress(Math.min(progress, 1));

        // Determine swipe direction and set preview
        if (Math.abs(dx) > PREVIEW_THRESHOLD) {
          if (dx > 0 && currentIndex > 0) {
            setSwipeDirection("right");
            Animated.timing(previewOpacity, {
              toValue: Math.min(Math.abs(dx) / 100, 0.9),
              duration: 0,
              useNativeDriver: true,
            }).start();
          } else if (dx < 0 && currentIndex < totalPages - 1) {
            setSwipeDirection("left");
            Animated.timing(previewOpacity, {
              toValue: Math.min(Math.abs(dx) / 100, 0.9),
              duration: 0,
              useNativeDriver: true,
            }).start();
          } else {
            setSwipeDirection(null);
            Animated.timing(previewOpacity, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }
        } else {
          setSwipeDirection(null);
          Animated.timing(previewOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }

        // Apply resistance at boundaries
        let translation = dx;
        if (
          (dx > 0 && currentIndex === 0) ||
          (dx < 0 && currentIndex === totalPages - 1)
        ) {
          translation = dx * 0.3;
        }

        translateX.setValue(translation);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;

        translateX.flattenOffset();
        setIsSwipeActive(false);
        setSwipeDirection(null);
        setSwipeProgress(0);

        // Fade out preview
        Animated.timing(previewOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // Check if swipe threshold is met
        const shouldNavigate =
          Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.8;

        if (shouldNavigate) {
          if (dx > 0 && currentIndex > 0) {
            // Animate slide to previous page
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              navigateToPrevious();
            });
            return;
          } else if (dx < 0 && currentIndex < totalPages - 1) {
            // Animate slide to next page
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              navigateToNext();
            });
            return;
          }
        }

        // Snap back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const renderPreviewPanel = (direction: "left" | "right") => {
    const isNext = direction === "left";
    const content = isNext
      ? previewContent?.next || generatePreviewContent("next")
      : previewContent?.previous || generatePreviewContent("previous");

    if (!content) return null;

    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: SCREEN_WIDTH * 0.8,
          [direction === "left" ? "left" : "right"]: -SCREEN_WIDTH * 0.8,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: 1,
          opacity: previewOpacity,
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange:
                  direction === "left" ? [-SCREEN_WIDTH, 0] : [0, SCREEN_WIDTH],
                outputRange:
                  direction === "left"
                    ? [SCREEN_WIDTH * 0.6, 0]
                    : [-SCREEN_WIDTH * 0.6, 0],
                extrapolate: "clamp",
              }),
            },
            {
              scale: translateX.interpolate({
                inputRange:
                  direction === "left" ? [-SCREEN_WIDTH, 0] : [0, SCREEN_WIDTH],
                outputRange: [1, 0.9],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            margin: 8,
            overflow: "hidden",
          }}
        >
          {content}
        </View>
      </Animated.View>
    );
  };

  const renderSwipeProgress = () => {
    if (!isSwipeActive || swipeProgress === 0) return null;

    return (
      <View
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          right: 20,
          height: 4,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
            transform: [
              {
                scaleX: translateX.interpolate({
                  inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                  outputRange: [1, 0, 1],
                  extrapolate: "clamp",
                }),
              },
            ],
            transformOrigin: swipeDirection === "left" ? "right" : "left",
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {/* Preview panels */}
      {swipeDirection === "left" && renderPreviewPanel("left")}
      {swipeDirection === "right" && renderPreviewPanel("right")}

      {/* Main content with overlay */}
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX }],
        }}
      >
        {children}

        {/* Dimming overlay when previewing */}
        {isSwipeActive && (
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "black",
              opacity: translateX.interpolate({
                inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                outputRange: [0.3, 0, 0.3],
                extrapolate: "clamp",
              }),
            }}
          />
        )}
      </Animated.View>

      {/* Swipe progress indicator */}
      {renderSwipeProgress()}

      {/* Page indicators */}
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {Array.from({ length: totalPages }).map((_, index) => (
          <Animated.View
            key={index}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor:
                index === currentIndex
                  ? theme.colors.primary
                  : theme.colors.outline,
              opacity: index === currentIndex ? 1 : 0.5,
              transform: [
                {
                  scale: index === currentIndex ? 1.2 : 1,
                },
              ],
            }}
          />
        ))}
      </View>
    </View>
  );
};
