import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'campuscare_token';
export const AUTH_INVALID_EVENT = 'campuscare:auth-invalid';
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

type ApiErrorBody = { message?: string; code?: string; errors?: string[] };

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
    const axiosError = error as AxiosError<ApiErrorBody>;
    if (axiosError.response?.data?.code === 'AI_PROVIDER_QUOTA_UNAVAILABLE') {
      return axiosError.response.data.message ?? 'AI Study Assistant is currently unavailable because the AI service is not enabled for this deployment. Your CampusCare account and saved study sessions are still available.';
    }
    if (!axiosError.response || (axiosError.response.status >= 500 && axiosError.response.status <= 599)) {
      return 'Service is temporarily unavailable. Please try again.';
    }

    return axiosError.response?.data?.message ?? axiosError.message;
  }

  return error instanceof Error ? error.message : 'Something went wrong';
}

export function getApiErrorCode(error: unknown) {
  return axios.isAxiosError<ApiErrorBody>(error) ? error.response?.data?.code : undefined;
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && getStoredToken()) {
      clearStoredToken();
      window.dispatchEvent(new Event(AUTH_INVALID_EVENT));
    }
    return Promise.reject(error);
  }
);
