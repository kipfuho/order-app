import { signIn, signInForCustomer } from "../stores/authSlice";
import { Customer, Tokens, User } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import {
  LoginForCustomerRequest,
  LoginRequest,
  RegisterForCustomerRequest,
} from "./auth.api.interface";

export const getAccessTokenLazily = async () => {
  const { getAccessToken } = await import("./utils.service");

  return getAccessToken();
};

const loginRequest = async ({
  email,
  password,
}: LoginRequest): Promise<boolean> => {
  const {
    user,
    tokens,
  }: {
    user: User;
    tokens: Tokens;
  } = await apiRequest({
    method: "POST",
    endpoint: "v1/auth/login",
    data: {
      email,
      password,
    },
  });

  require("../stores/store").default.dispatch(signIn({ ...user, tokens }));
  return true;
};

let refreshingPromise: Promise<Tokens> | null = null;
let customerRefreshingPromise: Promise<Tokens> | null = null;

const refreshTokensRequest = async (
  refreshToken: string,
  isCustomerApp: boolean = false
) => {
  try {
    let tokens;
    if (isCustomerApp) {
      if (customerRefreshingPromise) {
        const newToken = await customerRefreshingPromise;
        return newToken ?? "";
      }
      customerRefreshingPromise = apiRequest({
        method: "POST",
        endpoint: "v1/auth/refresh-tokens",
        data: {
          refreshToken,
        },
      });

      tokens = await customerRefreshingPromise;
    } else {
      if (refreshingPromise) {
        const newToken = await refreshingPromise;
        return newToken ?? "";
      }
      refreshingPromise = apiRequest({
        method: "POST",
        endpoint: "v1/auth/refresh-tokens",
        data: {
          refreshToken,
        },
      });

      tokens = await refreshingPromise;
    }

    return tokens;
  } catch (error) {
    return null;
  } finally {
    refreshingPromise = null; // Reset the promise after resolving
  }
};

const checkUserByEmailRequest = async (email: string) => {
  try {
    const accessToken = await getAccessTokenLazily();

    const result: { exist: boolean } = await apiRequest({
      method: "POST",
      endpoint: "v1/auth/check-user-by-email",
      token: accessToken,
      data: {
        email,
      },
    });

    return result.exist;
  } catch (error) {
    return true;
  }
};

let loginForAnonymousCustomerRequestPromise: Promise<{
  customer: Customer;
  tokens: Tokens;
}> | null = null;

const loginForAnonymousCustomerRequest = async () => {
  try {
    let response: { customer: Customer; tokens: Tokens };
    if (!loginForAnonymousCustomerRequestPromise) {
      loginForAnonymousCustomerRequestPromise = apiRequest({
        method: "POST",
        endpoint: "v1/auth/login-for-anonymous-customer",
      });
    }

    response = await loginForAnonymousCustomerRequestPromise;

    require("../stores/store").default.dispatch(
      signInForCustomer({ ...response.customer, tokens: response.tokens })
    );
    return true;
  } catch (error) {
    return false;
  } finally {
    loginForAnonymousCustomerRequestPromise = null; // Reset the promise after resolving
  }
};

const loginForCustomerRequest = async ({
  phone,
  password,
}: LoginForCustomerRequest) => {
  try {
    const { customer, tokens }: { customer: Customer; tokens: Tokens } =
      await apiRequest({
        method: "POST",
        endpoint: "v1/auth/login-for-customer",
        data: {
          phone,
          password,
        },
      });

    require("../stores/store").default.dispatch(
      signInForCustomer({ ...customer, tokens })
    );
    return true;
  } catch (error) {
    return true;
  }
};

const registerForCustomerRequest = async ({
  id,
  name,
  phone,
  password,
}: RegisterForCustomerRequest) => {
  try {
    const { customer, tokens }: { customer: Customer; tokens: Tokens } =
      await apiRequest({
        method: "POST",
        endpoint: "v1/auth/login-for-customer",
        data: {
          id,
          name,
          phone,
          password,
        },
      });

    require("../stores/store").default.dispatch(
      signInForCustomer({ ...customer, tokens })
    );
    return true;
  } catch (error) {
    return true;
  }
};

export {
  loginRequest,
  refreshTokensRequest,
  checkUserByEmailRequest,
  loginForAnonymousCustomerRequest,
  loginForCustomerRequest,
  registerForCustomerRequest,
};
