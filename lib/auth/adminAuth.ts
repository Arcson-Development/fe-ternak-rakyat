"use client";

import axios from "axios";
import { DOMAIN_API } from "../../utils/contants/env";
import { getItem, setItem, delItem } from "../../utils/lib/localstorage";

/**
 * Admin-role bearer token, distinct from the regular session token used
 * by `lib/auth/index.ts`. The two live in separate localStorage keys
 * and have separate logout flows; they're cached independently because
 * they're issued by DIFFERENT endpoints:
 *
 *   - regular token :  POST /auth/login            (handled by lib/auth)
 *   - admin token   :  POST /auth/admin/sign-in   (handled here)
 *
 * Why a separate token?
 *   The backend gates admin-only endpoints (e.g.
 *   /form-export/export-to-excel and PUT /form/is-approve-to-1/:id)
 *   behind the admin-role JWT. The regular `token` returned by
 *   /auth/login is a user-facing session token and isn't valid for
 *   those routes. Fetching a dedicated admin token lets the laporan
 *   page trigger exports without changing how the rest of the app
 *   authenticates.
 *
 * The Postman collection hardcodes `admin1` / `Admin123!` for this
 * endpoint, so we mirror that here. If the backend ever starts
 * returning per-user admin tokens (e.g. keyed off the main login
 * session), switch `hardcodedAdminLogin` to call the new endpoint.
 */

const ADMIN_LOGIN_PATH = "/auth/admin/sign-in";
const TOKEN_KEY = "admin-token";
const USERNAME = "admin1";
const PASSWORD = "Admin123!";

/** Read the cached admin token. Returns null on server or when missing. */
export function getAdminToken(): string | null {
  return getItem<string>(TOKEN_KEY);
}

/** Persist an admin token from a successful /auth/admin/sign-in. */
export async function setAdminToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

/** Wipe the cached admin token. Used on logout or 401 from admin APIs. */
export function clearAdminToken(): void {
  delItem(TOKEN_KEY);
}

type LoginResponse = {
  data?: { token?: string; access_token?: string };
  token?: string;
  access_token?: string;
};

/**
 * POST the demo admin credentials to the API. Returns the bearer token.
 * Throws when the call fails or the response is missing a token.
 *
 * Endpoint contract (from Postman collection):
 *   POST {API}/auth/admin/sign-in
 *   Content-Type: application/x-www-form-urlencoded
 *   username=admin1&password=Admin123!
 */
export async function hardcodedAdminLogin(): Promise<string> {
  const body = new URLSearchParams();
  body.append("username", USERNAME);
  body.append("password", PASSWORD);

  const { data } = await axios.post<LoginResponse>(
    `${DOMAIN_API}${ADMIN_LOGIN_PATH}`,
    body,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15_000,
    }
  );

  const token =
    data?.data?.token ??
    data?.data?.access_token ??
    data?.token ??
    data?.access_token;

  if (!token) {
    throw new Error(
      "Login admin berhasil tetapi token tidak ditemukan pada respons API."
    );
  }

  await setAdminToken(token);
  return token;
}

/**
 * Convenience: always return a fresh admin bearer token by calling
 * /auth/admin/sign-in. Bypasses the localStorage cache on purpose so a
 * tab that's been open across a server restart (or after a token
 * rotation) doesn't keep retrying with a stale token. Concurrent
 * callers within the same render share one in-flight promise — three
 * parallel exports will trigger exactly one login round-trip.
 */
let pendingAdminToken: Promise<string> | null = null;

export async function ensureAdminToken(): Promise<string> {
  if (pendingAdminToken) return pendingAdminToken;
  pendingAdminToken = hardcodedAdminLogin().finally(() => {
    pendingAdminToken = null;
  });
  return pendingAdminToken;
}