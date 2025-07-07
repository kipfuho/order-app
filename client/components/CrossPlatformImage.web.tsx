import React from "react";
import { Image, ImageProps } from "react-native";

export const CrossPlatformImage: React.FC<ImageProps> = ({
  source,
  style,
  ...props
}) => {
  return <Image source={source} style={style} {...props} />;
};
