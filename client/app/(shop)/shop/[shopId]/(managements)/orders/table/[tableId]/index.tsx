import { Redirect, useLocalSearchParams } from "expo-router";

export default function OrderTableDefaultPage() {
  const { shopId, tableId } = useLocalSearchParams() as {
    shopId: string;
    tableId: string;
  };

  return (
    <Redirect href={`/shop/${shopId}/orders/table/${tableId}/current-orders`} />
  );
}
