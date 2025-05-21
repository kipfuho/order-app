import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function TableRedirect() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (shopId) {
      router.push(`/shop/${shopId}/settings/table-management/tables`);
    }
  }, [shopId]);

  return null;
}
