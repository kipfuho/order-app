import { updatePermissions } from "@/stores/shop.slice";
import { signIn, signOut } from "../stores/auth.slice";
import { Customer, Tokens, User } from "../stores/state.interface";
import { apiRequest } from "./api.service";
import {
  LoginForCustomerRequest,
  LoginRequest,
  LogoutRequest,
  RegisterForCustomerRequest,
  RegisterRequest,
} from "./auth.api.interface";
import { signInForCustomer } from "@/stores/auth.customer.slice";

export const getAccessTokenLazily = async (isCustomerApp: boolean = false) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAccessToken } = await require("@apis/utils.service");

  return getAccessToken(isCustomerApp);
};

const registerRequest = async ({
  name,
  email,
  password,
}: RegisterRequest): Promise<boolean> => {
  await apiRequest({
    method: "POST",
    endpoint: "v1/auth/register",
    data: {
      name,
      email,
      password,
    },
  });

  return true;
};

const loginRequest = async ({
  email,
  password,
  clientId,
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
      clientId,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@stores/store").default.dispatch(
    signIn({
      user: { ...user, tokens },
      clientId,
    }),
  );
  return true;
};

let refreshingPromise: Promise<Tokens> | null = null;
let customerRefreshingPromise: Promise<Tokens> | null = null;

const refreshTokensRequest = async ({
  refreshToken,
  clientId,
  isCustomerApp = false,
}: {
  refreshToken: string;
  clientId: string;
  isCustomerApp?: boolean;
}) => {
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
          clientId,
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
          clientId,
        },
      });

      tokens = await refreshingPromise;
    }

    return tokens;
  } catch {
    return null;
  } finally {
    refreshingPromise = null; // Reset the promise after resolving
    customerRefreshingPromise = null; // Reset the promise after resolving
  }
};

const logoutRequest = async ({
  refreshToken,
}: LogoutRequest): Promise<boolean> => {
  try {
    await apiRequest({
      method: "POST",
      endpoint: "v1/auth/logout",
      data: {
        refreshToken,
      },
    });
  } finally {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@stores/store").default.dispatch(signOut());
  }
  return true;
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
  } catch {
    return true;
  }
};

let loginForAnonymousCustomerRequestPromise: Promise<{
  customer: Customer;
  tokens: Tokens;
}> | null = null;

const loginForAnonymousCustomerRequest = async ({
  customerId,
  clientId,
}: {
  customerId?: string;
  clientId: string;
}) => {
  try {
    if (!loginForAnonymousCustomerRequestPromise) {
      loginForAnonymousCustomerRequestPromise = apiRequest({
        method: "POST",
        endpoint: "v1/auth/login-for-anonymous-customer",
        data: {
          customerId,
          clientId,
        },
        isCustomerApp: true,
      });
    }

    const response: { customer: Customer; tokens: Tokens } =
      await loginForAnonymousCustomerRequestPromise;

    if (!customerId) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@stores/store").default.dispatch(
        signInForCustomer({
          customer: { ...response.customer, tokens: response.tokens },
          clientId,
        }),
      );
    }
    return response.tokens;
  } catch {
    return null;
  } finally {
    loginForAnonymousCustomerRequestPromise = null; // Reset the promise after resolving
  }
};

const loginForCustomerRequest = async ({
  phone,
  password,
  clientId,
}: LoginForCustomerRequest) => {
  try {
    const { customer, tokens }: { customer: Customer; tokens: Tokens } =
      await apiRequest({
        method: "POST",
        endpoint: "v1/auth/login-for-customer",
        data: {
          phone,
          password,
          clientId,
        },
      });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@stores/store").default.dispatch(
      signInForCustomer({
        customer: { ...customer, tokens },
        clientId,
      }),
    );
    return true;
  } catch {
    return true;
  }
};

const registerForCustomerRequest = async ({
  id,
  name,
  phone,
  password,
  clientId,
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
          clientId,
        },
      });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@stores/store").default.dispatch(
      signInForCustomer({
        customer: { ...customer, tokens },
        clientId,
      }),
    );
    return true;
  } catch {
    return true;
  }
};

const getPermissionsRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessTokenLazily();

  const result: { permissions: string[] } = await apiRequest({
    method: "POST",
    endpoint: "v1/auth/permissions",
    token: accessToken,
    data: { shopId },
  });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@stores/store").default.dispatch(
    updatePermissions({ permissions: result.permissions }),
  );
};

export {
  registerRequest,
  loginRequest,
  logoutRequest,
  refreshTokensRequest,
  checkUserByEmailRequest,
  loginForAnonymousCustomerRequest,
  loginForCustomerRequest,
  registerForCustomerRequest,
  getPermissionsRequest,
};
