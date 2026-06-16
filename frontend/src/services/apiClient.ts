import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'campuscare_token';
const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:5000/api';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown[];
};

export const apiClient = axios.create({
  baseURL: API_URL
});

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; errors?: string[] }>;
    if (!axiosError.response || (axiosError.response.status >= 500 && axiosError.response.status <= 599)) {
      return 'Service is temporarily unavailable. Please try again.';
    }

    return axiosError.response?.data?.message ?? axiosError.message;
  }

  return error instanceof Error ? error.message : 'Something went wrong';
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
