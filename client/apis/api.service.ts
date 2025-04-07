import axios, { AxiosRequestConfig } from "axios";
import { Tokens, User } from "../stores/state.interface";
import { auth } from "../generated/auth";
import { signIn } from "../stores/authSlice";
import _ from "lodash";
import store from "../stores/store";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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

let refreshingPromise: Promise<Tokens> | null = null;

export const refreshTokensRequest = async (refreshToken: string) => {
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

  const tokens = await refreshingPromise;
  refreshingPromise = null; // Reset the promise after resolving

  return tokens;
};
