"use client";

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { DOMAIN_API } from "../../utils/contants/env";
import { getItem, delItem } from "../../utils/lib/localstorage";

/**
 * Singleton axios instance used for every backend call. Reads the base
 * URL from NEXT_PUBLIC_DOMAIN_API. Interceptors:
 *
 *   - Attach bearer token (if any) from localStorage
 *   - On 401: clear token and let the caller handle the redirect
 *   - On network error: show a friendly notification
 *
 * The instance is intentionally client-side; the file is marked
 * "use client" so Next.js never tries to bundle it on the server.
 */
export const api: AxiosInstance = axios.create({
  baseURL: DOMAIN_API || "/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getItem<string>("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      delItem("token");
      delItem("user");
      // Hard-redirect to login. We do this here (instead of in components)
      // so the user can never end up in a half-authenticated state.
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(err);
  }
);

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    return {
      status: err.response?.status ?? 0,
      message:
        (err.response?.data as any)?.message ?? err.message ?? "Network error",
      details: err.response?.data,
    };
  }
  return { status: 0, message: (err as Error)?.message ?? "Unknown error" };
}
