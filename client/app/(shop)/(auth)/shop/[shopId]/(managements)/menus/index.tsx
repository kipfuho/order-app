import { Redirect, useLocalSearchParams } from "expo-router";

export default function DishRedirect() {
  const { shopId } = useLocalSearchParams() as { shopId: string };

  return <Redirect href={`/shop/${shopId}/menus/dishes`} />;
}
