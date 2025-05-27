import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { goToTableList } from "../../../../../../../../apis/navigate.service";

export default function TableRedirect() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();

  useEffect(() => {
    if (shopId) {
      goToTableList({ router, shopId });
    }
  }, [shopId]);

  return <Redirect href={`/shop/${shopId}/settings/table-management/tables`} />;
}
