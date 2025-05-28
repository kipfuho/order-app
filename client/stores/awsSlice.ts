import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { EventsChannel } from "aws-amplify/api";
import { Subscription } from "rxjs";

interface ConnectionDetail {
  channelType: string;
  connection: EventsChannel;
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
        type: string;
        channel: EventsChannel;
        subscription: Subscription;
      }>,
    ) => {
      if (!action.payload) return;

      const existingConnection = state.connectionDetails.find(
        (conn) => conn.channelType === action.payload.type,
      );
      if (existingConnection) {
        existingConnection.connection.close();
        state.connectionDetails = state.connectionDetails.filter(
          (conn) => conn.channelType !== action.payload.type,
        );
      }

      const currentTime = new Date();
      state.connectionDetails.push({
        channelType: action.payload.type,
        connection: action.payload.channel,
        timestamp: currentTime,
      });
    },

    // Close connection and remove all subscriptions
    closeAppSyncChannel: (state, action: PayloadAction<{ type: string }>) => {
      if (!action.payload) return;

      const index = state.connectionDetails.findIndex(
        (conn) => conn.channelType === action.payload.type,
      );

      if (index === -1) return;
      const connectionDetail = state.connectionDetails[index];
      connectionDetail.connection.close();
      state.connectionDetails.splice(index, 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => {
      return initialState;
    });
  },
});

export const { connectAppSyncChannel, closeAppSyncChannel } = awsSlice.actions;

export default awsSlice.reducer;
