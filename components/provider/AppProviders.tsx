"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalContextProvider } from "./GlobalContextProvider";
import { GlobalSpotlight } from "./SpotlightProvider";
import { ThemeController } from "./ThemeController";
import { Notifications } from "@mantine/notifications";

/**
 * Top-level client providers. Combines:
 *   - TanStack Query (data layer)
 *   - The app-wide GlobalContext
 *   - The global command-palette Spotlight
 *   - Mantine notification container
 *
 * The QueryClient is created per-mount with sane defaults for a production
 * admin app: 30s stale time, 1 retry, no refetch-on-focus, 10m GC.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalContextProvider>
        <ThemeController />
        {children}
        <GlobalSpotlight />
        <Notifications position="top-right" zIndex={2000} />
      </GlobalContextProvider>
    </QueryClientProvider>
  );
}
