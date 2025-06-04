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

const namespace = "default";
const useappsync = true;

export const AppSyncChannel = {
  SHOP: (shopId: string) => `${namespace}/shop/${shopId}`,
  CUSTOMER: (shopId: string) => `${namespace}/shop/${shopId}/customer`,
  ONLINE_PAYMENT: (customerId: string) => `${namespace}/payment/${customerId}`,
};

export const AppSyncChannelType = {
  SHOP: "SHOP",
  CUSTOMER: "CUSTOMER",
  ONLINE_PAYMENT: "ONLINE_PAYMENT",
};

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
};

// general action action for events
export const EventActionType = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  CANCEL: "CANCEL",
};

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
          console.log("Received event for shop:", event);
          const { type, data } = event;
          const { userId } = data;
          const currentSessionUserId = store.getState().auth.session?.id;

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
              text1: "Payment completed",
              text2: `Order session ${billNo} has been paid`,
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
            store.dispatch(
              kitchenApiSlice.util.invalidateTags(["UncookedDishOrders"]),
            );
            return;
          }

          if (type === EventType.SHOP_CHANGED) {
            const { action, shop } = data;
            if (currentSessionUserId !== userId) {
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
            if (currentSessionUserId !== userId) {
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
            if (currentSessionUserId !== userId) {
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
            if (currentSessionUserId !== userId) {
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
            if (currentSessionUserId !== userId) {
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
            if (currentSessionUserId !== userId) {
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

            if (currentSessionUserId !== userId) {
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

            if (currentSessionUserId !== userId) {
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
            if (currentSessionUserId !== userId) {
              store.dispatch(
                orderApiSlice.util.invalidateTags([
                  { type: "OrderSessions", id: orderSessionId },
                  { type: "ActiveOrderSessions", id: tableId },
                ]),
              );
            }
            return;
          }

          console.log("Cannot match event type!~");
        } catch (error) {
          console.error("Error handling event:", error);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    store.dispatch(
      connectAppSyncChannel({
        type: AppSyncChannelType.SHOP,
        channel,
        subscription,
      }),
    );
  } catch (err) {
    console.error("Connection error:", err);
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
          console.log("Received event for customer:", event);
          const { type, data } = event;

          if (type === EventType.SHOP_CHANGED) {
            const { action, shop } = data;

            (() => {
              if (_.isEmpty(shop)) {
                store.dispatch(
                  shopApiSlice.util.invalidateTags([
                    { type: "Shops", id: shop?.id },
                  ]),
                );
                return;
              }

              try {
                // update cache instead of refetch
                if (action === EventActionType.UPDATE) {
                  store.dispatch(
                    shopApiSlice.util.updateQueryData(
                      "getShop",
                      { shopId, isCustomerApp: true },
                      (draft) => {
                        return { ...draft, ...shop };
                      },
                    ),
                  );
                  return;
                }
              } catch {
                store.dispatch(
                  shopApiSlice.util.invalidateTags([
                    { type: "Shops", id: shop?.id },
                  ]),
                );
                return;
              }
              store.dispatch(
                shopApiSlice.util.invalidateTags([
                  { type: "Shops", id: shop?.id },
                ]),
              );
            })();
            return;
          }

          if (type === EventType.TABLE_CHANGED) {
            const { action, table } = data;

            (() => {
              if (_.isEmpty(table)) {
                store.dispatch(
                  tableApiSlice.util.invalidateTags([
                    { type: "Tables", id: table?.id },
                  ]),
                );
                return;
              }

              try {
                // update cache instead of refetch
                if (action === EventActionType.UPDATE) {
                  store.dispatch(
                    tableApiSlice.util.updateQueryData(
                      "getTable",
                      { shopId, tableId: table?.id, isCustomerApp: true },
                      (draft) => {
                        return { ...draft, ...table };
                      },
                    ),
                  );
                  return;
                }
              } catch {
                store.dispatch(
                  tableApiSlice.util.invalidateTags([
                    { type: "Tables", id: table?.id },
                  ]),
                );
                return;
              }
              store.dispatch(
                tableApiSlice.util.invalidateTags([
                  { type: "Tables", id: table?.id },
                ]),
              );
            })();
            return;
          }

          if (type === EventType.TABLE_POSITION_CHANGED) {
            store.dispatch(tableApiSlice.util.invalidateTags(["Tables"]));
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

          console.log("Cannot match event type!~");
        } catch (error) {
          console.error("Error handling event:", error);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    store.dispatch(
      connectAppSyncChannel({
        type: AppSyncChannelType.CUSTOMER,
        channel,
        subscription,
      }),
    );
  } catch (err) {
    console.error("Connection error:", err);
  }
};

/**
 * Kết nối đến channel shop cho khách hàng
 */
const connectAppSyncForOnlinePayment = async ({
  customerId,
}: {
  customerId: string;
}) => {
  if (!useappsync) return;

  try {
    const channelId = AppSyncChannel.ONLINE_PAYMENT(customerId);
    const channel = await events.connect(channelId);

    const subscription = channel.subscribe({
      next: async ({ event }) => {
        try {
          console.log("Received event for online payment:", event);
          const { type, data } = event;

          if (type === EventType.PAYMENT_COMPLETE) {
            const { action, shop } = data;

            return;
          }

          console.log("Cannot match event type!~");
        } catch (error) {
          console.error("Error handling event:", error);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    store.dispatch(
      connectAppSyncChannel({
        type: AppSyncChannelType.ONLINE_PAYMENT,
        channel,
        subscription,
      }),
    );
  } catch (err) {
    console.error("Connection error:", err);
  }
};

export {
  connectAppSyncForShop,
  connectAppSyncForShopForCustomer,
  connectAppSyncForOnlinePayment,
};
