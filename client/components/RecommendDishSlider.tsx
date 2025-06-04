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
        style={{ marginTop: -25 }}
        renderItem={({ item: dish }) => (
          <Pressable
            onPress={() => handleDishPress(dish)}
            style={styles.pressableContainer}
          >
            {dish.imageUrls && dish.imageUrls.length > 0 ? (
              <Image
                source={{ uri: dish.imageUrls[0] }}
                style={styles.image}
                placeholder={{ blurhash: BLURHASH }}
              />
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
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
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
