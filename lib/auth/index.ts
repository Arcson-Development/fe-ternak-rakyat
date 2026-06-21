"use client";

import { api } from "../api/client";
import { setItem, getItem, delItem } from "../../utils/lib/localstorage";

/**
 * Mirror the token into a non-HttpOnly cookie so the edge middleware
 * can read it for SSR route protection. Expires in 7 days.
 */
function setSessionCookie(token: string) {
  if (typeof document === "undefined") return;
  const days = 7;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `siternak-session=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "siternak-session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

/** Auth flow that talks to the real backend API. */

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  token: string;
};

const STORAGE_KEYS = {
  token: "token",
  user: "user",
} as const;

/**
 * Login via real backend API only.
 */
export async function login(username: string, password: string): Promise<User> {
  const { data } = await api.post<{ data: User }>("/auth/login", {
    username,
    password,
  });
  await setItem(STORAGE_KEYS.token, data.data.token);
  await setItem(STORAGE_KEYS.user, data.data);
  setSessionCookie(data.data.token);
  return data.data;
}

export function logout(): void {
  delItem(STORAGE_KEYS.token);
  delItem(STORAGE_KEYS.user);
  clearSessionCookie();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function getCurrentUser(): User | null {
  return getItem<User>(STORAGE_KEYS.user);
}

export function isAuthenticated(): boolean {
  return !!getItem<string>(STORAGE_KEYS.token);
}

// Re-export the admin-role token flow so callers can do:
//   import { ensureAdminToken } from "../../lib/auth"
// instead of reaching into `lib/auth/adminAuth` directly. The two
// flows are independent — admin token is lazy-fetched only when an
// admin-gated endpoint (export, approve, reject) is hit.
export {
  ensureAdminToken,
  getAdminToken,
  clearAdminToken,
} from "./adminAuth";
