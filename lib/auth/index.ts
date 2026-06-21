"use client";

import { api, toApiError } from "../api/client";
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

/**
 * Minimal auth flow that talks to the real backend when available, and
 * falls back to a local "demo" session for development. Two known demo
 * accounts are accepted in the demo mode (see below).
 */

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

export const DEMO_ACCOUNTS = [
  { username: "admin", password: "admin123", name: "Admin SITERNAK", role: "admin" as const },
  { username: "operator", password: "operator123", name: "Operator Lapangan", role: "operator" as const },
];

/**
 * Try real backend first, fall back to demo accounts when there's no
 * API URL configured. Always returns a User with a token.
 */
export async function login(username: string, password: string): Promise<User> {
  // 1. Real API attempt
  try {
    const { data } = await api.post<{ data: User }>("/auth/login", {
      username,
      password,
    });
    await setItem(STORAGE_KEYS.token, data.data.token);
    await setItem(STORAGE_KEYS.user, data.data);
    setSessionCookie(data.data.token);
    return data.data;
  } catch (err) {
    // 2. Demo fallback (only if API URL is not set)
    const isDemoMode = !process.env.NEXT_PUBLIC_DOMAIN_API;
    if (!isDemoMode) throw toApiError(err);

    const acc = DEMO_ACCOUNTS.find(
      (a) => a.username === username && a.password === password
    );
    if (!acc) {
      throw {
        status: 401,
        message: "Username atau password salah",
      };
    }
    const user: User = {
      id: `user-${acc.username}`,
      name: acc.name,
      email: `${acc.username}@siternak.id`,
      role: acc.role,
      token: `demo-${acc.username}-${Date.now()}`,
    };
    await setItem(STORAGE_KEYS.token, user.token);
    await setItem(STORAGE_KEYS.user, user);
    setSessionCookie(user.token);
    return user;
  }
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
