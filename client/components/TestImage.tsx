import { Image } from "expo-image";
import { BLURHASH } from "../constants/common";

export function TestImage() {
  return (
    <Image
      source={{
        uri: "https://biufoodshopapp.s3.ap-southeast-1.amazonaws.com/__emilia_and_natsuki_subaru_re_zero_kara_hajimeru_isekai_seikatsu_drawn_by_lanyingchengzhi__42ee9c0c695937a6fa0a4e4ee557104a.jpg",
      }}
      style={{ width: 200, height: 150, borderRadius: 10 }}
      placeholder={{ blurhash: BLURHASH }}
      contentFit="cover"
      transition={1000}
    />
  );
}
