"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` once the component has finished hydrating on the client,
 * and `false` during SSR / the first client render.
 *
 * Use this to gate content that depends on client-only state (cookies,
 * localStorage, browser APIs, etc.) so the SSR markup matches the first
 * client render and React doesn't throw a hydration mismatch warning.
 *
 * Pattern:
 *   const hydrated = useHydrated();
 *   return <span>{hydrated ? getCurrentUser()?.name : "Guest"}</span>;
 *
 * The fallback ("Guest" in the example) is what both the server and the
 * first client render will produce, so the markup matches. After hydration
 * the real client-only value takes over on the next render.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
