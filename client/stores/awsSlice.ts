import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { EventsChannel } from "aws-amplify/api";
import { Subscription } from "rxjs";
import _ from "lodash";

interface ConnectionDetail {
  connection: EventsChannel;
  timestamp: Date;
}

interface SubscriptionDetail {
  channelId: string;
  subscription: Subscription;
  timestamp: Date;
}

interface AppSyncConnectionState {
  connectionDetail: ConnectionDetail | null;
  subscriptionDetails: SubscriptionDetail[];
}

const initialState: AppSyncConnectionState = {
  connectionDetail: null,
  subscriptionDetails: [],
};

const awsSlice = createSlice({
  name: "aws",
  initialState,
  reducers: {
    // add a connection
    addConnectionAppSync: (state, action: PayloadAction<EventsChannel>) => {
      if (!action.payload) return;
      state.connectionDetail = {
        connection: action.payload,
        timestamp: new Date(),
      };
    },
    // close connection and all subscriptions
    closeConnectionAppSync: (state) => {
      if (!state.connectionDetail) return;
      state.connectionDetail.connection.close();
      state.connectionDetail = null;
    },
    subscribeChannel: (
      state,
      action: PayloadAction<{ channelId: string; subscription: Subscription }>
    ) => {
      if (!action.payload) return;
      state.subscriptionDetails = [
        ...state.subscriptionDetails,
        {
          ...action.payload,
          timestamp: new Date(),
        },
      ];
    },
    unsubscribeChannel: (state, action: PayloadAction<string>) => {
      if (!action.payload) return;
      const subscriptionDetail = _.find(
        state.subscriptionDetails,
        (subscriptionDetail) => subscriptionDetail.channelId === action.payload
      );
      subscriptionDetail?.subscription.unsubscribe();
      state.subscriptionDetails = _.filter(
        state.subscriptionDetails,
        (subscriptionDetail) => !subscriptionDetail.subscription.closed
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const {
  addConnectionAppSync,
  closeConnectionAppSync,
  subscribeChannel,
  unsubscribeChannel,
} = awsSlice.actions;

export default awsSlice.reducer;
