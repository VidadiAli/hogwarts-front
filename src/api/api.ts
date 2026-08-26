import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<AxiosResponse> | null = null;
let isRedirecting = false;

const getLoginPath = (): string => {
  return "/";
};

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const url = originalRequest?.url || "";

    const isAuthEndpoint =
      url.includes("/v1/auth/refresh") ||
      url.includes("/logout") ||
      url.includes("/login");

    if (isRedirecting) {
      return new Promise(() => {});
    }

    if (status === 401 && isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = api.post("/v1/auth/refresh");
        }

        await refreshPromise;

        isRefreshing = false;
        refreshPromise = null;

        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        refreshPromise = null;
        isRedirecting = true;

        localStorage.removeItem("role");

        if (window.location.pathname !== getLoginPath()) {
          window.location.href = getLoginPath();
        }

        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  }
);

export default api;