"use client";

import axios from "axios";
import { DOMAIN_API } from "../../utils/contants/env";
import { getItem, setItem, delItem } from "../../utils/lib/localstorage";

/**
 * Hardcoded login flow used by the public "Register Ternak Rakyat" page.
 *
 * The /pendaftaran page is gated by the same edge middleware as the rest
 * of the app, so a valid `siternak-session` cookie is already present
 * when this runs. However, the backend's /form/create endpoint requires
 * its own bearer token (the "peternak" role), which is obtained by
 * POSTing the demo credentials to /auth/peternak/sign-in.
 *
 * The endpoint accepts application/x-www-form-urlencoded, per the
 * Postman collection:
 *
 *   POST {API}/auth/peternak/sign-in
 *   username=peternak1&password=Admin123!
 *
 * We cache the resulting token in localStorage so subsequent submits
 * don't have to re-login. The cache is wiped on logout / token expiry.
 */

const PETERNAK_LOGIN_PATH = "/auth/peternak/sign-in";
const TOKEN_KEY = "peternak-token";
const USERNAME = "peternak1";
const PASSWORD = "Admin123!";

/**
 * Read the cached token (if any). Returns null when missing or when
 * running on the server.
 */
export function getPeternakToken(): string | null {
  return getItem<string>(TOKEN_KEY);
}

/**
 * Persist a token in localStorage so future submits can skip the login
 * round-trip.
 */
export async function setPeternakToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}

/**
 * Clear the cached token. Used on logout or when the API rejects the
 * token with 401/403.
 */
export function clearPeternakToken(): void {
  delItem(TOKEN_KEY);
}

type LoginResponse = {
  data?: { token?: string; access_token?: string };
  token?: string;
  access_token?: string;
};

/**
 * POST the demo credentials to the API. Returns the bearer token.
 * Throws when the call fails or the response is missing a token.
 */
export async function hardcodedPeternakLogin(): Promise<string> {
  const body = new URLSearchParams();
  body.append("username", USERNAME);
  body.append("password", PASSWORD);

  const { data } = await axios.post<LoginResponse>(
    `${DOMAIN_API}${PETERNAK_LOGIN_PATH}`,
    body,
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15_000,
    }
  );

  // Tolerate several common response shapes: { data: { token } },
  // { data: { access_token } }, { token }, { access_token }.
  const token =
    data?.data?.token ??
    data?.data?.access_token ??
    data?.token ??
    data?.access_token;

  if (!token) {
    throw new Error(
      "Login berhasil tetapi token tidak ditemukan pada respons API."
    );
  }

  await setPeternakToken(token);
  return token;
}

/**
 * Convenience: always return a fresh token by calling
 * /auth/peternak/sign-in. The localStorage cache is intentionally
 * bypassed — we want a fresh bearer on every page load so a
 * tab that's been open across a server restart (or after a token
 * rotation) doesn't keep retrying with a stale token and
 * triggering 401/403 on every API call.
 *
 * Concurrent callers within the same render are deduplicated via
 * an in-memory promise — if three queries fire in parallel they
 * share one login round-trip, not three.
 *
 * Used by the wizard submit AND the public list / detail / delete
 * endpoints — all four share this single helper, so the token is
 * fetched once per session and reused.
 */
let pendingToken: Promise<string> | null = null;

export async function ensurePeternakToken(): Promise<string> {
  if (pendingToken) return pendingToken;
  pendingToken = hardcodedPeternakLogin().finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}
