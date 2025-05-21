import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function DishRedirect() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (shopId) {
      router.push(`/shop/${shopId}/menus/dishes`);
    }
  }, [shopId]);

  return null;
}
