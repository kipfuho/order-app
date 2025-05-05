import { events } from "aws-amplify/api";
import store from "../stores/store";
import { connectAppSyncChannel } from "../stores/awsSlice";
import { shopApiSlice } from "../stores/apiSlices/shopApi.slice";
import { tableApiSlice } from "../stores/apiSlices/tableApi.slice";
import { dishApiSlice } from "../stores/apiSlices/dishApi.slice";
import { staffApiSlice } from "../stores/apiSlices/staffApi.slice";
import { orderApiSlice } from "../stores/apiSlices/orderApi.slice";
import Toast from "react-native-toast-message";

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
  EMPLOYEE_CHANGED: "DISH_CATEGORY_CHANGED",
  EMPLOYEE_POSITION_CHANGED: "DISH_CATEGORY_CHANGED",
  DEPARTMENT_CHANGED: "DISH_CATEGORY_CHANGED",
  PAYMENT_COMPLETE: "PAYMENT_COMPLETE",
  ORDER_SESSION_UPDATE: "ORDER_SESSION_UPDATE",
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
              ])
            );
            return;
          }

          // skippable events
          const { userId } = data;
          if (store.getState().auth.session?.id === userId) {
            console.log("Skipped event for shop:", event);
            return;
          }

          if (type === EventType.SHOP_CHANGED) {
            const { action, shop } = data;
            store.dispatch(shopApiSlice.util.invalidateTags(["Shops"]));
            return;
          }

          if (type === EventType.TABLE_CHANGED) {
            const { action, table } = data;
            store.dispatch(tableApiSlice.util.invalidateTags(["Tables"]));
            return;
          }

          if (type === EventType.TABLE_POSITION_CHANGED) {
            const { action, tablePosition } = data;
            store.dispatch(
              tableApiSlice.util.invalidateTags(["TablePositions"])
            );
            return;
          }

          if (type === EventType.DISH_CHANGED) {
            const { action, dish } = data;
            store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
            return;
          }

          if (type === EventType.DISH_CATEGORY_CHANGED) {
            const { action, dishCategory } = data;
            store.dispatch(
              dishApiSlice.util.invalidateTags(["DishCategories"])
            );
            return;
          }

          if (type === EventType.EMPLOYEE_CHANGED) {
            const { action, employee } = data;
            store.dispatch(staffApiSlice.util.invalidateTags(["Employees"]));
            return;
          }

          if (type === EventType.EMPLOYEE_POSITION_CHANGED) {
            const { action, employeePosition } = data;
            store.dispatch(
              staffApiSlice.util.invalidateTags(["EmployeePositions"])
            );
            return;
          }

          if (type === EventType.DEPARTMENT_CHANGED) {
            const { action, department } = data;
            store.dispatch(staffApiSlice.util.invalidateTags(["Departments"]));
            return;
          }

          if (type === EventType.ORDER_SESSION_UPDATE) {
            const {
              orderSessionId,
              tableId,
            }: { orderSessionId: string; tableId: string } = data;
            store.dispatch(
              orderApiSlice.util.invalidateTags([
                { type: "OrderSessions", id: orderSessionId },
                { type: "ActiveOrderSessions", id: tableId },
              ])
            );
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
      })
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
            store.dispatch(
              shopApiSlice.util.invalidateTags([
                { type: "Shops", id: shop?.id },
              ])
            );
            return;
          }

          if (type === EventType.TABLE_CHANGED) {
            const { action, table } = data;
            store.dispatch(
              tableApiSlice.util.invalidateTags([
                { type: "Tables", id: table?.id },
              ])
            );
            return;
          }

          if (type === EventType.TABLE_POSITION_CHANGED) {
            const { action, tablePosition } = data;
            store.dispatch(
              tableApiSlice.util.invalidateTags([
                { type: "TablePositions", id: tablePosition?.id },
              ])
            );
            return;
          }

          if (type === EventType.DISH_CHANGED) {
            const { action, dish } = data;
            store.dispatch(dishApiSlice.util.invalidateTags(["Dishes"]));
            return;
          }

          if (type === EventType.DISH_CATEGORY_CHANGED) {
            const { action, dishCategory } = data;
            store.dispatch(
              dishApiSlice.util.invalidateTags(["DishCategories"])
            );
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
      })
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
      })
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
