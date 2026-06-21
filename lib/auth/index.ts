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
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const { data: raw } = await api.post("/auth/admin/sign-in", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // Normalise response — accept several common API shapes
  const rawData = (raw as any)?.data;
  const token =
    typeof rawData === "string"
      ? rawData
      : String(rawData?.token ?? rawData?.access_token ?? (raw as any)?.token ?? (raw as any)?.access_token ?? "");
  const obj = (rawData && typeof rawData === "object" ? rawData : raw ?? {}) as Record<string, unknown>;
  const nested = (obj?.user ?? {}) as Record<string, unknown>;
  const user: User = {
    id: String(obj?.id ?? nested?.id ?? ""),
    name: String(obj?.name ?? nested?.name ?? username),
    email: String(obj?.email ?? nested?.email ?? ""),
    role: (obj?.role ?? nested?.role ?? "admin") as User["role"],
    token,
  };

  await setItem(STORAGE_KEYS.token, token);
  await setItem(STORAGE_KEYS.user, user);
  setSessionCookie(token);
  return user;
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

export const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", name: "Admin Pusat", role: "admin" },
  { username: "operator", password: "operator123", name: "Operator Daerah", role: "operator" },
  { username: "viewer", password: "viewer123", name: "Viewer", role: "viewer" },
];
