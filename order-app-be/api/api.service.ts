import axios, { AxiosRequestConfig } from "axios";
import { Tokens, User } from "../stores/state.interface";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to handle API requests
export const apiRequest = async <T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  data?: object,
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

export const loginRequest = async (email: string, password: string) => {
  const {
    user,
    tokens,
  }: {
    user: User;
    tokens: Tokens;
  } = await apiRequest("POST", "v1/auth/login", {
    email,
    password,
  });

  return { ...user, tokens };
};
