import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { goToShopDishList } from "../../../../../../../apis/navigate.service";

export default function DishRedirect() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();

  useEffect(() => {
    if (shopId) {
      goToShopDishList({ router, shopId });
    }
  }, [shopId]);

  return null;
}
