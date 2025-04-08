import _ from "lodash";
import store from "../stores/store";
import { refreshTokensRequest } from "./api.service";
import { signIn, signOut } from "../stores/authSlice";

export const isTokenExpired = (
  token:
    | Partial<{
        expires: number;
      }>
    | undefined
) => {
  if (!token || !token.expires) return false;
  return Date.now() >= token.expires;
};

export const getAccessToken = async (): Promise<string> => {
  const state = store.getState(); // Access Redux state
  const user = state.auth.session;
  if (!user || !user.tokens) {
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
