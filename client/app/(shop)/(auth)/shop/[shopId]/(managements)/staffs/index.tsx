import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { goToEmployeeList } from "@apis/navigate.service";

export default function EmployeeRedirect() {
  const { shopId } = useLocalSearchParams() as { shopId: string };
  const router = useRouter();

  useEffect(() => {
    if (shopId) {
      goToEmployeeList({ router, shopId });
    }
  }, [shopId]);

  return <Redirect href={`/shop/${shopId}/staffs/employees`} />;
}
