import { Redirect } from "expo-router";

export default function ShopRedirect() {
  return <Redirect href="/shop/[shopId]/home" />;
}
