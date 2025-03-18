import { Redirect, useLocalSearchParams } from "expo-router";

export default function ShopRedirect() {
  const { shopId } = useLocalSearchParams();
  return <Redirect href={`/shop/${shopId}/menus/dishes`} />;
}
