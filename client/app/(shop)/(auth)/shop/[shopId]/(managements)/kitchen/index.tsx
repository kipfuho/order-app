import { Redirect, useLocalSearchParams } from "expo-router";

export default function KitchenPage() {
  const { shopId } = useLocalSearchParams();

  return <Redirect href={`/shop/${shopId}/kitchen/cook-by-order`} />;
}
