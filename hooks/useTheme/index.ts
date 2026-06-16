"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "auto";

type ThemeState = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  /** Resolved value: what the DOM currently uses. */
  resolved: "light" | "dark";
  setResolved: (r: "light" | "dark") => void;
};

/**
 * Lightweight theme store. Resolves "auto" against the OS preference
 * via prefers-color-scheme. Mantine's ColorSchemeScript is what
 * actually flips the DOM, so this store is mostly a coordinator.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "light",
      resolved: "light",
      setMode: (m) => set({ mode: m }),
      setResolved: (r) => set({ resolved: r }),
    }),
    {
      name: "siternak-theme",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/** Listener for OS-level changes when mode === "auto". */
export function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}


/** Convenience hook: returns mode + setter for the current component. */
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  return { mode, setMode };
}
