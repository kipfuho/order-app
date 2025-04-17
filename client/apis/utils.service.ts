import _ from "lodash";
import store from "../stores/store";
import {
  signIn,
  signInForCustomer,
  signOut,
  signOutForCustomer,
} from "../stores/authSlice";
import { refreshTokensRequest } from "./auth.api.service";

const isTokenExpired = (
  token:
    | Partial<{
        expires: number;
      }>
    | undefined
) => {
  if (!token || !token.expires) return false;
  return Date.now() >= token.expires;
};

const _getCustomerAccessToken = async (): Promise<string> => {
  const state = store.getState(); // Access Redux state
  const customer = state.auth.customerSession;
  if (!customer) {
    return "";
  }
  if (!customer.tokens) {
    store.dispatch(signOutForCustomer());
    return "";
  }

  if (isTokenExpired(_.get(customer, "tokens.access"))) {
    const newTokens = await refreshTokensRequest(
      customer.tokens.refresh.token,
      true
    );
    if (!newTokens) {
      store.dispatch(signOutForCustomer());
      return "";
    }
    store.dispatch(signInForCustomer({ ...customer, tokens: newTokens }));
    return newTokens.access.token;
  }
  return customer.tokens.access.token;
};

export const getAccessToken = async (): Promise<string> => {
  const state = store.getState(); // Access Redux state
  if (state.auth.isCustomerApp) {
    const token = await _getCustomerAccessToken();
    return token;
  }

  const user = state.auth.session;
  if (!user) {
    return "";
  }
  if (!user.tokens) {
    store.dispatch(signOut());
    return "";
  }

  if (isTokenExpired(_.get(user, "tokens.access"))) {
    const newTokens = await refreshTokensRequest(user.tokens.refresh.token);
    if (!newTokens) {
      store.dispatch(signOut());
      return "";
    }
    store.dispatch(signIn({ ...user, tokens: newTokens }));
    return newTokens.access.token;
  }
  return user.tokens.access.token;
};
