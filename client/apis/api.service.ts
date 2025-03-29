import axios, { AxiosRequestConfig } from "axios";
import {
  Shop,
  Table,
  TablePosition,
  Tokens,
  Unit,
  User,
} from "../stores/state.interface";
import { auth } from "../generated/auth";
import {
  updateAllShops,
  updateAllTablePositions,
  updateAllTables,
  updateAllUnits,
} from "../stores/userSlice";
import { getAccessToken } from "./utils.service";
import { signIn } from "../stores/authSlice";
import store from "../stores/store";
import _ from "lodash";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create an Axios formData instance
const apiFormDataClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

const apiProtobufClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/x-protobuf",
    Accept: "application/x-protobuf",
  },
  responseType: "arraybuffer",
});

export const apiProtobufRequest = async <T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  data?: Uint8Array, // Expect Protobuf-encoded data
  token?: string
): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };

    const response = await apiProtobufClient.request<T>(config);
    return response.data;
  } catch (error: any) {
    console.error("API Request Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

export const apiRequest = async <T>({
  method,
  endpoint,
  data,
  token,
}: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  data?: object;
  token?: string;
}): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };

    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error: any) {
    console.error("API Request Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

export const apiFormDataRequest = async <T>({
  endpoint,
  formData,
  token,
}: {
  endpoint: string;
  formData?: object;
  token?: string;
}): Promise<T> => {
  try {
    const config: AxiosRequestConfig = {
      method: "POST",
      url: endpoint,
      data: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    };

    const response = await apiFormDataClient.request<T>(config);
    return response.data;
  } catch (error: any) {
    console.error("API Request Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

// example of using protobuf
export const loginRequestProtobuf = async (email: string, password: string) => {
  try {
    // Encode login request using Protobuf
    const encodedRequest = new Uint8Array(
      auth.LoginRequest.encode({ email, password }).finish()
    );

    const responseBuffer = await apiRequest<Uint8Array>({
      method: "POST",
      endpoint: "v1/auth/login",
      data: encodedRequest,
    });

    // Decode Protobuf response
    const decodedResponse = auth.LoginResponse.decode(
      new Uint8Array(responseBuffer)
    ).toJSON();

    return decodedResponse;
  } catch (err) {
    console.error(err);
  }
};

export const loginRequest = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<boolean> => {
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

  store.dispatch(signIn({ ...user, tokens }));
  return true;
};

export const refreshTokensRequest = async (refreshToken: string) => {
  const tokens: Tokens = await apiRequest({
    method: "POST",
    endpoint: "v1/auth/refresh-tokens",
    data: {
      refreshToken,
    },
  });

  return tokens;
};

export const createShopRequest = async ({
  name,
  phone,
  email,
  taxRate,
  location,
}: {
  name: string;
  email: string;
  phone?: string;
  taxRate?: number;
  location?: string;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    email: string;
    phone?: string;
    taxRate?: number;
    location?: string;
  } = { name, email };

  if (location) {
    body.location = location;
  }
  if (phone) {
    body.name = name;
  }
  if (taxRate) {
    body.taxRate = taxRate;
  }

  await apiRequest({
    method: "POST",
    endpoint: "/v1/shops",
    token: accessToken,
    data: body,
  });
};

export const queryShopsRequest = async ({
  user,
  searchName,
  sortBy = "createdAt",
  page = 1,
  limit = 10,
}: {
  user: User | null;
  searchName?: string;
  sortBy?: string;
  page: number;
  limit: number;
}) => {
  if (!user) return [];
  const accessToken = await getAccessToken();
  const queryParams = new URLSearchParams({
    employeeUserId: user.id,
    sortBy,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (searchName) {
    queryParams.append("name", searchName);
  }
  // Append user ID or token if necessary
  if (user.id) {
    queryParams.append("userId", user.id);
  }

  const shops: { results: Shop[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops?${queryParams.toString()}`,
    token: accessToken,
  });

  store.dispatch(updateAllShops(shops.results));
};

export const updateShopRequest = async ({
  shopId,
  name,
  phone,
  email,
  taxRate,
  location,
}: {
  shopId: string;
  name: string;
  email: string;
  phone?: string;
  taxRate?: number;
  location?: string;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    email: string;
    phone?: string;
    taxRate?: number;
    location?: string;
  } = { name, email };

  if (location) {
    body.location = location;
  }
  if (phone) {
    body.name = name;
  }
  if (taxRate) {
    body.taxRate = taxRate;
  }

  await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}`,
    token: accessToken,
    data: body,
  });
};

export const deleteShopRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessToken();

  await apiRequest({
    method: "DELETE",
    endpoint: `/v1/shops/${shopId}`,
    token: accessToken,
  });
};

export const createTablePositionRequest = async ({
  shopId,
  name,
  categories,
}: {
  shopId: string;
  name: string;
  categories: string[];
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    dishCategories?: string[];
  } = { name };

  if (categories) {
    body.dishCategories = _.map(categories, "id");
  }

  const result: { tablePosition: TablePosition } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/tablePositions`,
    token: accessToken,
    data: body,
  });

  const state = store.getState();
  store.dispatch(
    updateAllTablePositions([
      ...state.shop.tablePositions,
      result.tablePosition,
    ])
  );
};

export const updateTablePositionRequest = async ({
  tablePositionId,
  shopId,
  name,
  categories,
}: {
  tablePositionId: string;
  shopId: string;
  name: string;
  categories: string[];
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    dishCategories?: string[];
  } = { name };

  if (categories) {
    body.dishCategories = categories;
  }

  const result: { tablePosition: TablePosition } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/tablePositions/${tablePositionId}`,
    token: accessToken,
    data: body,
  });

  const state = store.getState();
  store.dispatch(
    updateAllTablePositions([
      ..._.filter(
        state.shop.tablePositions,
        (tablePosition) => tablePosition.id !== tablePositionId
      ),
      result.tablePosition,
    ])
  );
};

export const getTablePositionsRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessToken();

  const result: {
    tablePositions: TablePosition[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tablePositions`,
    token: accessToken,
  });

  store.dispatch(updateAllTablePositions(result.tablePositions));
};

export const createTableRequest = async ({
  shopId,
  name,
  tablePosition,
}: {
  shopId: string;
  name: string;
  tablePosition: TablePosition;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    position: string;
  } = { name, position: tablePosition.id };

  const result: { table: Table } = await apiRequest({
    method: "POST",
    endpoint: `/v1/shops/${shopId}/tables`,
    token: accessToken,
    data: body,
  });

  const state = store.getState();
  store.dispatch(updateAllTables([...state.shop.tables, result.table]));
};

export const updateTableRequest = async ({
  tableId,
  shopId,
  name,
  tablePosition,
}: {
  tableId: string;
  shopId: string;
  name: string;
  tablePosition: TablePosition;
}) => {
  const accessToken = await getAccessToken();
  const body: {
    name: string;
    position: string;
  } = { name, position: tablePosition.id };

  const result: { table: Table } = await apiRequest({
    method: "PATCH",
    endpoint: `/v1/shops/${shopId}/tables/${tableId}`,
    token: accessToken,
    data: body,
  });

  const state = store.getState();
  store.dispatch(
    updateAllTables([
      ..._.filter(state.shop.tables, (table) => table.id !== tableId),
      result.table,
    ])
  );
};

export const getTablesRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessToken();

  const result: {
    tables: Table[];
  } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/tables`,
    token: accessToken,
  });

  store.dispatch(updateAllTables(result.tables));
};

export const getUnitsRequest = async ({ shopId }: { shopId: string }) => {
  const accessToken = await getAccessToken();
  store;
  const result: { units: Unit[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/units/`,
    token: accessToken,
  });

  store.dispatch(updateAllUnits(result.units));
};

export const createDefaultUnitsRequest = async ({
  shopId,
}: {
  shopId: string;
}) => {
  const accessToken = await getAccessToken();
  const result: { units: Unit[] } = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops/${shopId}/units/create-default`,
    token: accessToken,
  });

  store.dispatch(updateAllUnits(result.units));
};
