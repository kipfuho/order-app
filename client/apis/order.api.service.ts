import { TableForOrder } from "../stores/state.interface";
import store from "../stores/store";
import { updateTablesForOrder } from "../stores/userSlice";
import { apiRequest } from "./api.service";
import { getAccessToken } from "./utils.service";

/**
 * Get tables for order
 * @param param0
 */
export const getDishTypesRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessToken();

  const result: { tables: TableForOrder[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/orders/get-table-for-orders`,
    token: accessToken,
  });

  store.dispatch(updateTablesForOrder(result.tables));
};
