import { events } from "aws-amplify/api";
import store from "../stores/store";
import { connectAppSyncChannel } from "../stores/awsSlice";
import { shopApiSlice } from "../stores/apiSlices/shopApi.slice";
import { tableApiSlice } from "../stores/apiSlices/tableApi.slice";
import { dishApiSlice } from "../stores/apiSlices/dishApi.slice";
import { staffApiSlice } from "../stores/apiSlices/staffApi.slice";
import { orderApiSlice } from "../stores/apiSlices/orderApi.slice";
import Toast from "react-native-toast-message";
import { kitchenApiSlice } from "../stores/apiSlices/kitchenApi.slice";
import { reportApiSlice } from "@/stores/apiSlices/reportApi.slice";
import { getPermissionsRequest } from "./auth.api.service";
import _ from "lodash";
import { getShopRequest } from "./shop.api.service";
import { updateShop, updateTable } from "@/stores/customerSlice";
import { getTableRequest } from "./table.api.service";
import { logger } from "@/constants/utils";
import { cartApiSlice } from "@/stores/apiSlices/cartApi.slice";
import { OrderSessionStatus } from "@/constants/common";
import { t } from "i18next";

const namespace = "default";
const useappsync = true;

export const AppSyncChannel = {
  SHOP: (shopId: string) => `${namespace}/shop/${shopId}`,
  CUSTOMER: (shopId: string) => `${namespace}/shop/${shopId}/customer`,
  SINGLE_CUSTOMER: (customerId: string) => `${namespace}/payment/${customerId}`,
};

export const AppSyncChannelType = {
  SHOP: "SHOP",
  CUSTOMER: "CUSTOMER",
  SINGLE_CUSTOMER: "SINGLE_CUSTOMER",
} as const;

export const EventType = {
  SHOP_CHANGED: "SHOP_CHANGED",
  TABLE_CHANGED: "TABLE_CHANGED",
  TABLE_POSITION_CHANGED: "TABLE_POSITION_CHANGED",
  DISH_CHANGED: "DISH_CHANGED",
  DISH_CATEGORY_CHANGED: "DISH_CATEGORY_CHANGED",
  EMPLOYEE_CHANGED: "EMPLOYEE_CHANGED",
  EMPLOYEE_POSITION_CHANGED: "EMPLOYEE_POSITION_CHANGED",
  DEPARTMENT_CHANGED: "EMPLOYEE_DEPARTMENT_CHANGED",
  PAYMENT_COMPLETE: "PAYMENT_COMPLETE",
  CANCEL_PAYMENT: "CANCEL_PAYMENT",
  ORDER_SESSION_UPDATE: "ORDER_SESSION_UPDATE",
  NEW_ORDER: "NEW_ORDER",
  UNCONFIRMED_ORDER_CHANGE: "UNCONFIRMED_ORDER_CHANGE",
  UNCONFIRMED_ORDER_APPROVE: "UNCONFIRMED_ORDER_APPROVE",
} as const;

// general action action for events
export const EventActionType = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  CANCEL: "CANCEL",
} as const;

/**
 * Kết nối đến channel shop cho màn quản lý
 */
const connectAppSyncForShop = async ({ shopId }: { shopId: string }) => {
  if (!useappsync) return;

  try {
    const channelId = AppSyncChannel.SHOP(shopId);
    const channel = await events.connect(channelId);

    const subscription = channel.subscribe({
      next: async ({ event }) => {
        try {
          logger.log("Received event for shop:", event);
          const { type, data } = event;
          const { clientId } = data;
          const currentClientId = store.getState().auth.clientId;

          // unskippable events
          if (type === EventType.PAYMENT_COMPLETE) {
            const {
              orderSessionId,
              tableId,
              billNo,
            }: { orderSessionId: string; tableId: string; billNo: string } =
              data;
            Toast.show({
              type: "success",
              text1: t("payment_complete"),
              text2: `${t("invoice")} ${billNo} ${t("has_been_paid")}`,
            });
            store.dispatch(
              orderApiSlice.util.invalidateTags([
                { type: "OrderSessions", id: orderSessionId },
                { type: "ActiveOrderSessions", id: tableId },
                "TablesForOrder",
              ]),
            );
            store.dispatch(reportApiSlice.util.invalidateTags(["Reports"]));
            return;
          }

          if (type === EventType.CANCEL_PAYMENT) {
            const {
              orderSessionId,
              tableId,
            }: { orderSessionId: string; tableId: string; billNo: string } =
              data;
            store.dispatch(
              orderApiSlice.util.invalidateTags([
                { type: "OrderSessions", id: orderSessionId },
                { type: "ActiveOrderSessions", id: tableId },
                "TablesForOrder",
              ]),
            );
            store.dispatch(reportApiSlice.util.invalidateTags(["Reports"]));
            return;
          }

          if (type === EventType.NEW_ORDER) {
            const { tableId, orderSessionId } = data;
            store.dispatch(
              orderApiSlice.util.invalidateTags([
                { type: "OrderSessions", id: orderSessionId },
                { type: "ActiveOrderSessions", id: tableId },
                "TablesForOrder",
              ]),
            );
            const state = store.getState();
            const cachedArgs = kitchenApiSlice.util.selectCachedArgsForQuery(
              state,
              "getUncookedDishOrders",
            );
            if (cachedArgs.length > 0) {
              store.dispatch(
                kitchenApiSlice.endpoints.getUncookedDishOrders.initiate(
                  { shopId, cursor: _.get(cachedArgs, "0.cursor") },
                  {
                    forceRefetch: true,
                  },
                ),
              );
            }
            return;
          }

          if (type === EventType.SHOP_CHANGED) {
            const { action, shop } = data;
            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(shop)) {
                  store.dispatch(shopApiSlice.util.invalidateTags(["Shops"]));
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      shopApiSlice.util.updateQueryData(
                        "getShops",
                        {},
                        (draft) => {
                          draft.push(shop);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      shopApiSlice.util.updateQueryData(
                        "getShops",
                        {},
                        (draft) => {
                          const index = draft.findIndex(
                            (s) => s.id === shop.id,
                          );
                          if (index !== -1) {
                            draft[index] = { ...draft[index], ...shop };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      shopApiSlice.util.updateQueryData(
                        "getShops",
                        {},
                        (draft) => {
                          return draft.filter((s) => s.id !== shop.id);
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(tableApiSlice.util.invalidateTags(["Tables"]));
                  return;
                }
                store.dispatch(tableApiSlice.util.invalidateTags(["Tables"]));
              })();
            }
            return;
          }

          if (type === EventType.TABLE_CHANGED) {
            const { action, table } = data;
            store.dispatch(
              orderApiSlice.util.invalidateTags(["TablesForOrder"]),
            );
            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(table)) {
                  store.dispatch(tableApiSlice.util.invalidateTags(["Tables"]));
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      tableApiSlice.util.updateQueryData(
                        "getTables",
                        shopId,
                        (draft) => {
                          draft.push(table);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      tableApiSlice.util.updateQueryData(
                        "getTables",
                        shopId,
                        (draft) => {
                          const index = draft.findIndex(
                            (t) => t.id === table.id,
                          );
                          if (index !== -1) {
                            draft[index] = { ...draft[index], ...table };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      tableApiSlice.util.updateQueryData(
                        "getTables",
                        shopId,
                        (draft) => {
                          return draft.filter((t) => t.id !== table.id);
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(tableApiSlice.util.invalidateTags(["Tables"]));
                  return;
                }
                store.dispatch(tableApiSlice.util.invalidateTags(["Tables"]));
              })();
            }
            return;
          }

          if (type === EventType.TABLE_POSITION_CHANGED) {
            const { action, tablePosition } = data;
            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(tablePosition)) {
                  store.dispatch(
                    tableApiSlice.util.invalidateTags(["TablePositions"]),
                  );
                  return;
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      tableApiSlice.util.updateQueryData(
                        "getTablePositions",
                        shopId,
                        (draft) => {
                          draft.push(tablePosition);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      tableApiSlice.util.updateQueryData(
                        "getTablePositions",
                        shopId,
                        (draft) => {
                          const index = draft.findIndex(
                            (tp) => tp.id === tablePosition.id,
                          );
                          if (index !== -1) {
                            draft[index] = {
                              ...draft[index],
                              ...tablePosition,
                            };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      tableApiSlice.util.updateQueryData(
                        "getTablePositions",
                        shopId,
                        (draft) => {
                          return draft.filter(
                            (tp) => tp.id !== tablePosition.id,
                          );
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(
                    tableApiSlice.util.invalidateTags(["TablePositions"]),
                  );
                  return;
                }
                store.dispatch(
                  tableApiSlice.util.invalidateTags(["TablePositions"]),
                );
              })();
            }

            return;
          }

          if (type === EventType.DISH_CHANGED) {
            const { action, dish } = data;
            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(dish)) {
                  store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
                  return;
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      dishApiSlice.util.updateQueryData(
                        "getDishes",
                        { shopId },
                        (draft) => {
                          draft.push(dish);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      dishApiSlice.util.updateQueryData(
                        "getDishes",
                        { shopId },
                        (draft) => {
                          const index = draft.findIndex(
                            (d) => d.id === dish.id,
                          );
                          if (index !== -1) {
                            draft[index] = { ...draft[index], ...dish };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      dishApiSlice.util.updateQueryData(
                        "getDishes",
                        { shopId },
                        (draft) => {
                          return draft.filter((d) => d.id !== dish.id);
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
                  return;
                }
                store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
              })();
            }

            return;
          }

          if (type === EventType.DISH_CATEGORY_CHANGED) {
            const { action, dishCategory } = data;
            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(dishCategory)) {
                  store.dispatch(
                    dishApiSlice.util.invalidateTags(["DishCategories"]),
                  );
                  return;
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      dishApiSlice.util.updateQueryData(
                        "getDishCategories",
                        { shopId },
                        (draft) => {
                          draft.push(dishCategory);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      dishApiSlice.util.updateQueryData(
                        "getDishCategories",
                        { shopId },
                        (draft) => {
                          const index = draft.findIndex(
                            (dc) => dc.id === dishCategory.id,
                          );
                          if (index !== -1) {
                            draft[index] = { ...draft[index], ...dishCategory };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      dishApiSlice.util.updateQueryData(
                        "getDishCategories",
                        { shopId },
                        (draft) => {
                          return draft.filter(
                            (dc) => dc.id !== dishCategory.id,
                          );
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(
                    dishApiSlice.util.invalidateTags(["DishCategories"]),
                  );
                  return;
                }

                store.dispatch(
                  dishApiSlice.util.invalidateTags(["DishCategories"]),
                );
              })();
            }
            return;
          }

          if (type === EventType.EMPLOYEE_CHANGED) {
            const { action, employee } = data;
            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(employee)) {
                  store.dispatch(
                    staffApiSlice.util.invalidateTags(["Employees"]),
                  );
                  return;
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getEmployees",
                        shopId,
                        (draft) => {
                          draft.push(employee);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getEmployees",
                        shopId,
                        (draft) => {
                          const index = draft.findIndex(
                            (e) => e.id === employee.id,
                          );
                          if (index !== -1) {
                            draft[index] = { ...draft[index], ...employee };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getEmployees",
                        shopId,
                        (draft) => {
                          return draft.filter((e) => e.id !== employee.id);
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(
                    staffApiSlice.util.invalidateTags(["Employees"]),
                  );
                  return;
                }

                store.dispatch(
                  staffApiSlice.util.invalidateTags(["Employees"]),
                );
              })();
            }
            getPermissionsRequest({ shopId });
            return;
          }

          if (type === EventType.EMPLOYEE_POSITION_CHANGED) {
            const { action, employeePosition } = data;

            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(employeePosition)) {
                  store.dispatch(
                    staffApiSlice.util.invalidateTags(["EmployeePositions"]),
                  );
                  return;
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getEmployeePositions",
                        shopId,
                        (draft) => {
                          draft.push(employeePosition);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getEmployeePositions",
                        shopId,
                        (draft) => {
                          const index = draft.findIndex(
                            (ep) => ep.id === employeePosition.id,
                          );
                          if (index !== -1) {
                            draft[index] = {
                              ...draft[index],
                              ...employeePosition,
                            };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getEmployeePositions",
                        shopId,
                        (draft) => {
                          return draft.filter(
                            (ep) => ep.id !== employeePosition.id,
                          );
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(
                    staffApiSlice.util.invalidateTags(["EmployeePositions"]),
                  );
                  return;
                }
                store.dispatch(
                  staffApiSlice.util.invalidateTags(["EmployeePositions"]),
                );
              })();
            }
            return;
          }

          if (type === EventType.DEPARTMENT_CHANGED) {
            const { action, department } = data;

            if (currentClientId !== clientId) {
              (() => {
                if (_.isEmpty(department)) {
                  store.dispatch(
                    staffApiSlice.util.invalidateTags(["Departments"]),
                  );
                  return;
                }

                try {
                  // update cache instead of refetch
                  if (action === EventActionType.CREATE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getDepartments",
                        shopId,
                        (draft) => {
                          draft.push(department);
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.UPDATE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getDepartments",
                        shopId,
                        (draft) => {
                          const index = draft.findIndex(
                            (d) => d.id === department.id,
                          );
                          if (index !== -1) {
                            draft[index] = { ...draft[index], ...department };
                          }
                        },
                      ),
                    );
                    return;
                  }
                  if (action === EventActionType.DELETE) {
                    store.dispatch(
                      staffApiSlice.util.updateQueryData(
                        "getDepartments",
                        shopId,
                        (draft) => {
                          return draft.filter((d) => d.id !== department.id);
                        },
                      ),
                    );
                    return;
                  }
                } catch {
                  store.dispatch(
                    staffApiSlice.util.invalidateTags(["Departments"]),
                  );
                  return;
                }
                store.dispatch(
                  staffApiSlice.util.invalidateTags(["Departments"]),
                );
              })();
            }

            getPermissionsRequest({ shopId });
            return;
          }

          if (type === EventType.ORDER_SESSION_UPDATE) {
            const {
              orderSessionId,
              tableId,
            }: { orderSessionId: string; tableId: string } = data;
            if (currentClientId !== clientId) {
              store.dispatch(
                orderApiSlice.util.invalidateTags([
                  { type: "OrderSessions", id: orderSessionId },
                  { type: "ActiveOrderSessions", id: tableId },
                ]),
              );
            }
            return;
          }

          if (type === EventType.UNCONFIRMED_ORDER_CHANGE) {
            if (currentClientId !== clientId) {
              store.dispatch(
                orderApiSlice.util.invalidateTags(["UnconfirmedOrders"]),
              );
            }
            return;
          }

          if (type === EventType.UNCONFIRMED_ORDER_APPROVE) {
            const {
              orderSessionId,
              tableId,
            }: { orderSessionId: string; tableId: string } = data;
            if (currentClientId !== clientId) {
              store.dispatch(
                orderApiSlice.util.invalidateTags(["UnconfirmedOrders"]),
              );
            }
            store.dispatch(
              orderApiSlice.util.invalidateTags([
                { type: "OrderSessions", id: orderSessionId },
                { type: "ActiveOrderSessions", id: tableId },
                "TablesForOrder",
              ]),
            );
            const state = store.getState();
            const cachedArgs = kitchenApiSlice.util.selectCachedArgsForQuery(
              state,
              "getUncookedDishOrders",
            );
            if (cachedArgs.length > 0) {
              store.dispatch(
                kitchenApiSlice.endpoints.getUncookedDishOrders.initiate(
                  { shopId, cursor: _.get(cachedArgs, "0.cursor") },
                  {
                    forceRefetch: true,
                  },
                ),
              );
            }
            return;
          }

          logger.log("Cannot match event type!~");
        } catch (error) {
          logger.error("Error handling event:", error);
        }
      },
      error: (err) => logger.error("Subscription error:", err),
    });

    store.dispatch(
      connectAppSyncChannel({
        type: AppSyncChannelType.SHOP,
        channel,
        subscription,
      }),
    );
  } catch (err) {
    logger.error("Connection error:", err);
  }
};

/**
 * Kết nối đến channel shop cho khách hàng
 */
const connectAppSyncForShopForCustomer = async ({
  shopId,
}: {
  shopId: string;
}) => {
  if (!useappsync) return;

  try {
    const channelId = AppSyncChannel.CUSTOMER(shopId);
    const channel = await events.connect(channelId);

    const subscription = channel.subscribe({
      next: async ({ event }) => {
        try {
          logger.log("Received event for customer:", event);
          const { type, data } = event;

          if (type === EventType.SHOP_CHANGED) {
            const { action, shop } = data;

            await (async () => {
              if (!_.isEmpty(shop)) {
                const _shop = await getShopRequest(shopId, true);
                store.dispatch(updateShop(_shop));
                return;
              }

              try {
                // update cache instead of refetch
                if (action === EventActionType.UPDATE) {
                  store.dispatch(
                    updateShop({
                      ...store.getState().customer.shop,
                      ...shop,
                    }),
                  );
                  return;
                }
              } catch {
                const _shop = await getShopRequest(shopId, true);
                store.dispatch(updateShop(_shop));
                return;
              }
              const _shop = await getShopRequest(shopId, true);
              store.dispatch(updateShop(_shop));
            })();
            return;
          }

          if (type === EventType.TABLE_CHANGED) {
            const { action, table } = data;

            await (async () => {
              const currentTable = store.getState().customer.table;
              if (!currentTable) return;

              if (_.isEmpty(table)) {
                const _table = await getTableRequest({
                  shopId,
                  tableId: currentTable.id,
                  isCustomerApp: true,
                });
                store.dispatch(updateTable(_table));
                return;
              }

              try {
                // update cache instead of refetch
                if (action === EventActionType.UPDATE) {
                  store.dispatch(
                    updateTable({
                      ...store.getState().customer.table,
                      ...table,
                    }),
                  );
                  return;
                }
              } catch {
                const _table = await getTableRequest({
                  shopId,
                  tableId: currentTable.id,
                  isCustomerApp: true,
                });
                store.dispatch(updateTable(_table));
                return;
              }

              const _table = await getTableRequest({
                shopId,
                tableId: currentTable.id,
                isCustomerApp: true,
              });
              store.dispatch(updateTable(_table));
            })();
            return;
          }

          if (type === EventType.TABLE_POSITION_CHANGED) {
            const currentTable = store.getState().customer.table;
            if (!currentTable) return;

            const _table = await getTableRequest({
              shopId,
              tableId: currentTable.id,
              isCustomerApp: true,
            });
            store.dispatch(updateTable(_table));
            return;
          }

          if (type === EventType.DISH_CHANGED) {
            const { action, dish } = data;

            (() => {
              if (_.isEmpty(dish)) {
                store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
                return;
              }

              try {
                // update cache instead of refetch
                if (action === EventActionType.CREATE) {
                  store.dispatch(
                    dishApiSlice.util.updateQueryData(
                      "getDishes",
                      { shopId, isCustomerApp: true },
                      (draft) => {
                        draft.push(dish);
                      },
                    ),
                  );
                  return;
                }

                if (action === EventActionType.UPDATE) {
                  store.dispatch(
                    dishApiSlice.util.updateQueryData(
                      "getDishes",
                      { shopId, isCustomerApp: true },
                      (draft) => {
                        const index = draft.findIndex((d) => d.id === dish.id);
                        if (index !== -1) {
                          draft[index] = { ...draft[index], ...dish };
                        }
                      },
                    ),
                  );
                  return;
                }

                if (action === EventActionType.DELETE) {
                  store.dispatch(
                    dishApiSlice.util.updateQueryData(
                      "getDishes",
                      { shopId, isCustomerApp: true },
                      (draft) => {
                        return draft.filter((d) => d.id !== dish.id);
                      },
                    ),
                  );
                  return;
                }
              } catch {
                store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
                return;
              }
              store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
            })();
            return;
          }

          if (type === EventType.DISH_CATEGORY_CHANGED) {
            const { action, dishCategory } = data;

            (() => {
              if (_.isEmpty(dishCategory)) {
                store.dispatch(
                  dishApiSlice.util.invalidateTags(["DishCategories"]),
                );
                return;
              }

              try {
                // update cache instead of refetch
                if (action === EventActionType.CREATE) {
                  store.dispatch(
                    dishApiSlice.util.updateQueryData(
                      "getDishCategories",
                      { shopId, isCustomerApp: true },
                      (draft) => {
                        draft.push(dishCategory);
                      },
                    ),
                  );
                  return;
                }

                if (action === EventActionType.UPDATE) {
                  store.dispatch(
                    dishApiSlice.util.updateQueryData(
                      "getDishCategories",
                      { shopId, isCustomerApp: true },
                      (draft) => {
                        const index = draft.findIndex(
                          (dc) => dc.id === dishCategory.id,
                        );
                        if (index !== -1) {
                          draft[index] = { ...draft[index], ...dishCategory };
                        }
                      },
                    ),
                  );
                  return;
                }

                if (action === EventActionType.DELETE) {
                  store.dispatch(
                    dishApiSlice.util.updateQueryData(
                      "getDishCategories",
                      { shopId, isCustomerApp: true },
                      (draft) => {
                        return draft.filter((dc) => dc.id !== dishCategory.id);
                      },
                    ),
                  );
                  return;
                }
              } catch {
                store.dispatch(
                  dishApiSlice.util.invalidateTags(["DishCategories"]),
                );
                return;
              }
              store.dispatch(
                dishApiSlice.util.invalidateTags(["DishCategories"]),
              );
            })();
            return;
          }

          logger.log("Cannot match event type!~");
        } catch (error) {
          logger.error("Error handling event:", error);
        }
      },
      error: (err) => logger.error("Subscription error:", err),
    });

    store.dispatch(
      connectAppSyncChannel({
        type: AppSyncChannelType.CUSTOMER,
        channel,
        subscription,
      }),
    );
  } catch (err) {
    logger.error("Connection error:", err);
  }
};

/**
 * Kết nối đến channel shop cho khách hàng
 */
const connectAppSyncForSingleCustomer = async ({
  customerId,
}: {
  customerId: string;
}) => {
  if (!useappsync) return;

  try {
    const channelId = AppSyncChannel.SINGLE_CUSTOMER(customerId);
    const channel = await events.connect(channelId);

    const subscription = channel.subscribe({
      next: async ({ event }) => {
        try {
          logger.log("Received event for online payment:", event);
          const { type, data } = event;
          const currentShopId = store.getState().customer.shop?.id as string;

          if (type === EventType.PAYMENT_COMPLETE) {
            const { orderSessionId, billNo } = data;
            Toast.show({
              type: "success",
              text1: t("payment_complete"),
              text2: `${t("invoice")} ${billNo} ${t("has_been_paid")}`,
            });

            store.dispatch(
              cartApiSlice.util.updateQueryData(
                "getCheckoutCartHistory",
                { shopId: currentShopId, isCustomerApp: true },
                (draft) => {
                  const index = _.findIndex(
                    draft.items,
                    (item) => item.id === orderSessionId,
                  );

                  if (index !== -1) {
                    draft.items[index] = {
                      ...draft.items[index],
                      status: OrderSessionStatus.paid,
                    };
                  }
                },
              ),
            );

            return;
          }

          if (type === EventType.ORDER_SESSION_UPDATE) {
            const { orderSessionId, orderSession, billNo, action } = data;

            // Đơn mới được tạo
            if (action === EventActionType.CREATE) {
              Toast.show({
                type: "success",
                text1: t("new_order"),
                text2: `${t("invoice")} ${billNo} ${t("has_new_order")}`,
              });

              store.dispatch(
                cartApiSlice.util.updateQueryData(
                  "getCheckoutCartHistory",
                  { shopId: currentShopId, isCustomerApp: true },
                  (draft) => {
                    const index = _.findIndex(
                      draft.items,
                      (item) => item.id === orderSessionId,
                    );

                    if (index !== -1) {
                      draft.items[index] = {
                        ...draft.items[index],
                        orders: [
                          ...draft.items[index].orders,
                          orderSession.newOrder,
                        ],
                      };
                    }
                  },
                ),
              );
            }

            // Cập nhật hoặc sửa trạng thái
            if (
              action === EventActionType.UPDATE ||
              action === EventActionType.CANCEL
            ) {
              Toast.show({
                type: "success",
                text1: t("update_order"),
                text2: `${t("invoice")} ${billNo} ${t("has_been_update")}. ${t(orderSession.status)}`,
              });

              store.dispatch(
                cartApiSlice.util.updateQueryData(
                  "getCheckoutCartHistory",
                  { shopId: currentShopId, isCustomerApp: true },
                  (draft) => {
                    const index = _.findIndex(
                      draft.items,
                      (item) => item.id === orderSessionId,
                    );

                    if (index !== -1) {
                      draft.items[index] = {
                        ...draft.items[index],
                        status:
                          orderSession.status || draft.items[index].status,
                        paymentAmount:
                          orderSession.paymentAmount ||
                          draft.items[index].paymentAmount,
                      };
                    }
                  },
                ),
              );
            }

            return;
          }

          if (type === EventType.UNCONFIRMED_ORDER_CHANGE) {
            Toast.show({
              type: "success",
              text1: t("update_order"),
              text2: t("order_update"),
            });

            store.dispatch(
              cartApiSlice.util.invalidateTags(["UnconfirmedCartHistory"]),
            );
            return;
          }

          if (type === EventType.UNCONFIRMED_ORDER_APPROVE) {
            Toast.show({
              type: "success",
              text1: t("update_order"),
              text2: t("order_update"),
            });

            store.dispatch(
              cartApiSlice.util.invalidateTags(["UnconfirmedCartHistory"]),
            );
            store.dispatch(cartApiSlice.util.invalidateTags(["CartHistory"]));
            return;
          }

          logger.log("Cannot match event type!~");
        } catch (error) {
          logger.error("Error handling event:", error);
        }
      },
      error: (err) => logger.error("Subscription error:", err),
    });

    store.dispatch(
      connectAppSyncChannel({
        type: AppSyncChannelType.SINGLE_CUSTOMER,
        channel,
        subscription,
      }),
    );
  } catch (err) {
    logger.error("Connection error:", err);
  }
};

export {
  connectAppSyncForShop,
  connectAppSyncForShopForCustomer,
  connectAppSyncForSingleCustomer,
};
