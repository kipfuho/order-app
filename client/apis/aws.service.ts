import { events } from "aws-amplify/api";
import store from "../stores/store";
import { connectAppSyncChannel, subscribeEventType } from "../stores/awsSlice";
import { getDishCategoriesRequest, getDishesRequest } from "./dish.api.service";
import {
  getTablePositionsRequest,
  getTablesRequest,
} from "./table.api.service";

const namespace = "default";
const useappsync = false;

export const AppSyncChannel = {
  TEST: () => `${namespace}/test`,
  SHOP: (shopId: string) => `${namespace}/shop/${shopId}`,
  TABLE: (tableId: string) => `${namespace}/table/${tableId}`,
  ORDERSESSION: (orderSessionId: string) =>
    `${namespace}/orderSession/${orderSessionId}`,
};

export const EventType = {
  UPDATE_SHOP: "UPDATE_SHOP",
  UPDATE_DISH: "UPDATE_DISH",
  UPDATE_DISH_CATEGORY: "UPDATE_DISH_CATEGORY",
  UPDATE_TABLE: "UPDATE_TABLE",
  UPDATE_TABLE_POSITION: "UPDATE_TABLE_POSITION",
};

const _getConnectionWithChannelId = (channelId: string) => {
  const allConnections = store.getState().aws.connectionDetails;
  const connection = allConnections.find(
    (conn) => conn.channelId === channelId
  );
  return connection;
};

/**
 * Ket noi den channel shop
 */
const connectAppSyncForShop = async ({ shopId }: { shopId: string }) => {
  if (!useappsync) return;

  try {
    const channelId = AppSyncChannel.SHOP(shopId);
    const previousConnection = _getConnectionWithChannelId(channelId);
    if (previousConnection) {
      return;
    }

    const channel = await events.connect(channelId);

    const subscription = channel.subscribe({
      next: async (data) => {
        try {
          console.log("Received event:", data);
          if (data.type === EventType.UPDATE_DISH) {
            await getDishesRequest({ shopId });
            return;
          }

          if (data.type === EventType.UPDATE_DISH_CATEGORY) {
            await getDishCategoriesRequest({ shopId });
            await getDishesRequest({ shopId });
            return;
          }

          if (data.type === EventType.UPDATE_SHOP) {
            // await ({ shopId });
            return;
          }

          if (data.type === EventType.UPDATE_TABLE) {
            await getTablesRequest({ shopId });
            return;
          }

          if (data.type === EventType.UPDATE_TABLE_POSITION) {
            await getTablePositionsRequest({ shopId });
            await getTablesRequest({ shopId });
            return;
          }

          console.log("Cannot match event type!~");
        } catch (error) {
          console.error("Error handling event:", error);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    store.dispatch(connectAppSyncChannel({ channelId, channel, subscription }));
    // subscribeEventType()
  } catch (err) {
    console.error("Connection error:", err);
  }
};

const connectAppSyncForTable = async ({ tableId }: { tableId: string }) => {
  if (!useappsync) return;

  try {
    const channelId = AppSyncChannel.TABLE(tableId);
    const previousConnection = _getConnectionWithChannelId(channelId);
    if (previousConnection) {
      return;
    }

    const channel = await events.connect(channelId);

    const subscription = channel.subscribe({
      next: async (data) => {
        try {
          console.log("Received event:", data);

          console.log("Cannot match event type!~");
        } catch (error) {
          console.error("Error handling event:", error);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    store.dispatch(connectAppSyncChannel({ channelId, channel, subscription }));
    // subscribeEventType()
  } catch (err) {
    console.error("Connection error:", err);
  }
};

const connectAppSyncForOrderSession = async ({
  orderSessionId,
}: {
  orderSessionId: string;
}) => {
  if (!useappsync) return;

  try {
    const channelId = AppSyncChannel.ORDERSESSION(orderSessionId);
    const previousConnection = _getConnectionWithChannelId(channelId);
    if (previousConnection) {
      return;
    }

    const channel = await events.connect(channelId);

    const subscription = channel.subscribe({
      next: async (data) => {
        try {
          console.log("Received event:", data);

          console.log("Cannot match event type!~");
        } catch (error) {
          console.error("Error handling event:", error);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    store.dispatch(connectAppSyncChannel({ channelId, channel, subscription }));
    // subscribeEventType()
  } catch (err) {
    console.error("Connection error:", err);
  }
};

export {
  connectAppSyncForShop,
  connectAppSyncForTable,
  connectAppSyncForOrderSession,
};
