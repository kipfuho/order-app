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

  // should refresh token if it's gonna expire soon
  return Date.now() + 5000 >= token.expires;
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

  const clientId = state.authCustomer.clientId;
  if (isTokenExpired(_.get(customer, "tokens.access"))) {
    let newTokens = await refreshTokensRequest({
      refreshToken: customer.tokens.refresh.token,
      clientId,
      isCustomerApp: true,
    });
    if (!newTokens && customer.anonymous) {
      newTokens = await loginForAnonymousCustomerRequest({
        customerId: customer.id,
        clientId,
      });
    }
    if (!newTokens) {
      store.dispatch(signOutForCustomer());
      return "";
    }
    store.dispatch(
      signInForCustomer({
        customer: { ...customer, tokens: newTokens },
        clientId,
      }),
    );
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

    const clientId = state.auth.clientId;
    if (isTokenExpired(_.get(user, "tokens.access"))) {
      const newTokens = await refreshTokensRequest({
        refreshToken: user.tokens.refresh.token,
        clientId,
      });
      if (!newTokens) {
        store.dispatch(signOut());
        return "";
      }
      store.dispatch(
        signIn({
          user: { ...user, tokens: newTokens },
          clientId,
        }),
      );
      return newTokens.access.token;
    }
    return user.tokens.access.token;
  } catch {
    store.dispatch(signOut());
    return "";
  }
};
