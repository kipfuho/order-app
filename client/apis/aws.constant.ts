const namespace = "default";

export const AppSyncChannel = {
  TEST: () => `${namespace}/test`,
  SHOP: (shopId: string) => `${namespace}/shop/${shopId}`,
  TABLE: (tableId: string) => `${namespace}/table/${tableId}`,
};
