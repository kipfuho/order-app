import { createListenerMiddleware, addListener } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./store";

export const listenerMiddleware = createListenerMiddleware();
export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>();
export const addAppListener = addListener.withTypes<RootState, AppDispatch>();

// types
export type AppStartListening = typeof startAppListening;
export type AppAddListener = typeof addAppListener;
