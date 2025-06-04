import _ from "lodash";
import store from "@stores/store";
import { signIn, signOut } from "@/stores/auth.slice";
import {
  loginForAnonymousCustomerRequest,
  refreshTokensRequest,
} from "./auth.api.service";
import {
  signInForCustomer,
  signOutForCustomer,
} from "@/stores/auth.customer.slice";

const isTokenExpired = (
  token:
    | Partial<{
        expires: number;
      }>
    | undefined,
) => {
  if (!token || !token.expires) return false;
  return Date.now() >= token.expires;
};

const _getCustomerAccessToken = async (): Promise<string> => {
  const state = store.getState(); // Access Redux state
  const customer = state.authCustomer.session;
  if (!customer) {
    return "";
  }

  if (!customer.tokens) {
    store.dispatch(signOutForCustomer());
    return "";
  }

  if (isTokenExpired(_.get(customer, "tokens.access"))) {
    let newTokens = await refreshTokensRequest(
      customer.tokens.refresh.token,
      true,
    );
    if (!newTokens && customer.anonymous) {
      newTokens = await loginForAnonymousCustomerRequest(customer.id);
    }
    if (!newTokens) {
      store.dispatch(signOutForCustomer());
      return "";
    }
    store.dispatch(signInForCustomer({ ...customer, tokens: newTokens }));
    return newTokens.access.token;
  }
  return customer.tokens.access.token;
};

export const getAccessToken = async (
  isCustomerApp: boolean = false,
): Promise<string> => {
  try {
    const state = store.getState(); // Access Redux state
    if (isCustomerApp) {
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
  } catch {
    store.dispatch(signOut());
    return "";
  }
};
