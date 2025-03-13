import axios, { AxiosRequestConfig } from "axios";
import { Shop, Tokens, User } from "../stores/state.interface";
import { auth } from "../generated/auth";
import { getAccessToken } from "./utils.service";
import { useDispatch } from "react-redux";
import { updateAllShops, updateUser } from "../stores/userSlice";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Create an Axios instance
const apiProtobufClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiClient = axios.create({
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

    const response = await apiClient.request<T>(config);
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

    console.log(decodedResponse);
    return decodedResponse;
  } catch (err) {
    console.error(err);
  }
};

export const loginRequest = async (
  email: string,
  password: string
): Promise<boolean> => {
  const dispatch = useDispatch();
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

  dispatch(updateUser({ ...user, tokens }));
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

export const queryShopsRequest = async (
  user: User,
  searchName: string,
  sortBy: string = "createdAt",
  page: number = 1,
  limit: number = 10
) => {
  const dispatch = useDispatch();
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

  const shops: Shop[] = await apiRequest({
    method: "GET",
    endpoint: `/v1/shops?${queryParams.toString()}`,
    token: accessToken,
  });

  dispatch(updateAllShops(shops));
};
