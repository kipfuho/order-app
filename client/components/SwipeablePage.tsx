import { FC, ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { View, PanResponder, Dimensions, Animated } from "react-native";
import { useTheme } from "react-native-paper";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

interface SwipeablePageProps {
  children: ReactNode;
  previewContent?: {
    previous?: React.ReactNode;
    next?: React.ReactNode;
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH / 3; // Distance needed to complete navigation
const PREVIEW_THRESHOLD = 20; // Distance to start showing preview

export const SwipeablePage: FC<SwipeablePageProps> = ({
  children,
  previewContent,
}) => {
  const { navigateToNext, navigateToPrevious, currentIndex, totalPages } =
    useSwipeNavigation();
  const theme = useTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  const currentTranslateValue = useRef(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  useEffect(() => {
    const listener = translateX.addListener(({ value }) => {
      currentTranslateValue.current = value;
    });
    return () => translateX.removeListener(listener);
  }, [translateX]);

  const createPanResponder = useCallback(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },

      onPanResponderGrant: () => {
        translateX.setOffset(currentTranslateValue.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;

        if (Math.abs(dx) > PREVIEW_THRESHOLD) {
          if (dx > 0 && currentIndex > 0) {
            setSwipeDirection("right");
          } else if (dx < 0 && currentIndex < totalPages - 1) {
            setSwipeDirection("left");
          } else {
            setSwipeDirection(null);
          }
        }

        let translation = dx;
        if (dx > 0 && currentIndex === 0) {
          translation = dx * 0.2;
        } else if (dx < 0 && currentIndex === totalPages - 1) {
          translation = dx * 0.2;
        }

        translateX.setValue(translation);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;

        translateX.flattenOffset();
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
    });
  }, [
    currentIndex,
    totalPages,
    navigateToNext,
    navigateToPrevious,
    translateX,
  ]);

  // Store the panResponder in a ref but recreate it when dependencies change
  const panResponderRef = useRef(createPanResponder());

  useEffect(() => {
    panResponderRef.current = createPanResponder();
  }, [createPanResponder]);

  const renderPreview = (direction: "left" | "right") => {
    const targetIndex =
      direction === "left" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= totalPages) return null;

    const preview =
      direction === "left" ? previewContent?.next : previewContent?.previous;
    const leftPosition = direction === "left" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: SCREEN_WIDTH,
          left: leftPosition,
          backgroundColor: theme.colors.surface,
          justifyContent: "center",
          alignItems: "center",
          opacity: 0.9,
          zIndex: 1000,
          transform: [
            {
              translateX: translateX,
            },
          ],
        }}
      >
        <View style={{ flex: 1, width: "100%" }}>{preview}</View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }} {...panResponderRef.current.panHandlers}>
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
    </View>
  );
};
