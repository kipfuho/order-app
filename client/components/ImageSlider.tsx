import React from "react";
import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

export default function ImageSlider({ images }: { images: string[] }) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Carousel
        loop
        width={width}
        height={height / 2}
        autoPlay={true}
        autoPlayInterval={3000}
        data={images}
        scrollAnimationDuration={500}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.8,
        }}
        style={{ marginTop: -25 }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});
