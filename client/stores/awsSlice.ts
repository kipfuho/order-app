import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { EventsChannel } from "aws-amplify/api";
import { Subscription } from "rxjs";

interface SubscriptionDetail {
  type: string; // event type
  subscription: Subscription;
  timestamp: Date;
}

interface ConnectionDetail {
  channelId: string;
  connection: EventsChannel;
  subscriptionDetails: SubscriptionDetail[];
  timestamp: Date;
}

interface AppSyncEventState {
  connectionDetails: ConnectionDetail[];
}

const initialState: AppSyncEventState = {
  connectionDetails: [],
};

const awsSlice = createSlice({
  name: "aws",
  initialState,
  reducers: {
    // Add a connection
    connectAppSyncChannel: (
      state,
      action: PayloadAction<{
        channelId: string;
        channel: EventsChannel;
        subscription: Subscription;
      }>
    ) => {
      if (!action.payload) return;
      const existingConnection = state.connectionDetails.find(
        (conn) => conn.channelId === action.payload.channelId
      );
      if (!existingConnection) {
        const currentTime = new Date();
        state.connectionDetails.push({
          channelId: action.payload.channelId,
          connection: action.payload.channel,
          subscriptionDetails: [
            {
              subscription: action.payload.subscription,
              timestamp: currentTime,
              type: "ALL",
            },
          ],
          timestamp: currentTime,
        });
      } else {
        action.payload.channel.close();
      }
    },

    // Close connection and remove all subscriptions
    closeAppSyncChannel: (
      state,
      action: PayloadAction<{ channelId: string }>
    ) => {
      if (!action.payload) return;
      const index = state.connectionDetails.findIndex(
        (conn) => conn.channelId === action.payload.channelId
      );
      if (index !== -1) {
        // Unsubscribe from all subscriptions in this connection
        state.connectionDetails[index].subscriptionDetails.forEach((sub) => {
          sub.subscription.unsubscribe();
        });
        // Remove the connection from the state
        state.connectionDetails.splice(index, 1);
      }
    },

    // Subscribe to an event type
    subscribeEventType: (
      state,
      action: PayloadAction<{
        channelId: string;
        type: string;
        subscription: Subscription;
      }>
    ) => {
      if (!action.payload) return;
      const connection = state.connectionDetails.find(
        (conn) => conn.channelId === action.payload.channelId
      );
      if (connection) {
        const existingSubscription = connection.subscriptionDetails.find(
          (sub) => sub.type === action.payload.type
        );
        if (!existingSubscription) {
          connection.subscriptionDetails.push({
            type: action.payload.type,
            subscription: action.payload.subscription,
            timestamp: new Date(),
          });
        }
      }
    },

    // Unsubscribe from a specific event type
    unsubscribeEventType: (
      state,
      action: PayloadAction<{ channelId: string; type: string }>
    ) => {
      if (!action.payload) return;
      const connection = state.connectionDetails.find(
        (conn) => conn.channelId === action.payload.channelId
      );
      if (connection) {
        const subIndex = connection.subscriptionDetails.findIndex(
          (sub) => sub.type === action.payload.type
        );
        if (subIndex !== -1) {
          connection.subscriptionDetails[subIndex].subscription.unsubscribe();
          connection.subscriptionDetails.splice(subIndex, 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const {
  connectAppSyncChannel,
  closeAppSyncChannel,
  subscribeEventType,
  unsubscribeEventType,
} = awsSlice.actions;

export default awsSlice.reducer;
