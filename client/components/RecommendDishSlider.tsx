import React from "react";
import { StyleSheet, View, useWindowDimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import Carousel from "react-native-reanimated-carousel";
import { BLURHASH } from "@constants/common";
import { Dish } from "@/stores/state.interface";
import EnhancedLoadingScreen from "./ui/EnhancedLoading";
import { Surface, Text } from "react-native-paper";

interface DishImageSliderProps {
  dishes: Dish[];
  isLoading: boolean;
  onDishPress?: (dish: Dish) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function RecommendDishImageSlider({
  dishes,
  isLoading,
  onDishPress,
  autoPlay = true,
  autoPlayInterval = 3000,
}: DishImageSliderProps) {
  const { width, height } = useWindowDimensions();

  const handleDishPress = (dish: Dish) => {
    if (onDishPress) {
      onDishPress(dish);
    }
  };

  if (isLoading) {
    return <EnhancedLoadingScreen />;
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Carousel
        loop
        width={width}
        height={height / 2}
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        data={dishes}
        scrollAnimationDuration={500}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.8,
        }}
        style={{
          marginTop: -25,
        }}
        renderItem={({ item: dish }) => (
          <Pressable
            onPress={() => handleDishPress(dish)}
            style={styles.pressableContainer}
          >
            {dish.imageUrls && dish.imageUrls.length > 0 ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: dish.imageUrls[0] }}
                  style={styles.image}
                  placeholder={{ blurhash: BLURHASH }}
                  recyclingKey={`dish-${dish.id}`} // Helps recycle image components
                  cachePolicy="memory-disk" // Aggressive caching
                  priority="normal" // Don't compete with high-priority images
                  transition={null} // Disable transitions during scrolling
                  allowDownscaling // Allow image downscaling
                  contentFit="cover" // Efficient fit mode
                />
                <View style={styles.nameOverlay}>
                  <Text style={styles.nameOverlayText}>{dish.name}</Text>
                </View>
              </View>
            ) : (
              <Surface style={styles.fallbackContainer}>
                <Text style={styles.dishName}>{dish.name}</Text>
              </Surface>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pressableContainer: {
    width: "100%",
    height: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    maxWidth: 700,
    borderRadius: 16,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    maxWidth: 700,
  },
  nameOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  nameOverlayText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  fallbackContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  dishName: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
