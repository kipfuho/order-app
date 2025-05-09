import React, { useEffect, useRef } from "react";
import { Pressable, Text, View, StyleSheet, Animated } from "react-native";
import { getCountryCurrency } from "../constants/utils";

type SymbolSwitchProps = {
  value: boolean;
  onChange: (val: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
};

export const SymbolSwitch = ({
  value,
  onChange,
  activeColor = "#3f51b5",
  inactiveColor = "#ccc",
}: SymbolSwitchProps) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 34],
  });

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <Pressable onPress={() => onChange(!value)}>
      <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
        <Animated.Text
          style={[styles.symbol, styles.symbolLeft, { opacity: anim }]}
        >
          %
        </Animated.Text>
        <Animated.Text
          style={[
            styles.symbol,
            styles.symbolRight,
            {
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          {getCountryCurrency()}
        </Animated.Text>

        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbTranslate }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
  },
  symbol: {
    position: "absolute",
    top: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  symbolLeft: {
    left: 8,
  },
  symbolRight: {
    right: 8,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "white",
    position: "absolute",
    top: 4,
  },
});
