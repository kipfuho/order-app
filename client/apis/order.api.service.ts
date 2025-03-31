import { TableForOrder } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";

/**
 * Get tables for order
 * @param param0
 */
export const getTablesForOrderRequest = async ({
  shopId,
}: {
  shopId: string;
}) => {
  const accessToken = await getAccessToken();

  const result: { tables: TableForOrder[] } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/orders/get-table-for-orders`,
    token: accessToken,
  });

  return result.tables;
};
