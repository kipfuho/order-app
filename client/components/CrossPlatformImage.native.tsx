import React from "react";
import FastImage, { FastImageProps } from "@d11/react-native-fast-image";
import _ from "lodash";

export const CrossPlatformImage: React.FC<FastImageProps> = ({
  source,
  style,
  ...props
}) => {
  const isValidUri = !_.isEmpty(_.get(source, "uri"));
  return (
    <FastImage
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={isValidUri ? source : require("@assets/images/savora.png")}
      style={style}
      {...props}
    />
  );
};
