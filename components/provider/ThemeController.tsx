"use client";

import { useEffect } from "react";
import { useThemeStore, prefersDark } from "../../hooks/useTheme";

/**
 * Mirrors the theme store to Mantine's data-mantine-color-scheme
 * attribute on <html>. Mantine reads this attribute to know which
 * palette to render with.
 *
 * Lives in a no-render <span> in the tree; runs only on mount and
 * whenever the user toggles the theme.
 */
export function ThemeController() {
  const mode = useThemeStore((s) => s.mode);
  const setResolved = useThemeStore((s) => s.setResolved);

  useEffect(() => {
    const html = document.documentElement;
    const apply = (m: typeof mode) => {
      if (m === "auto") {
        const dark = prefersDark();
        html.setAttribute("data-mantine-color-scheme", dark ? "dark" : "light");
        setResolved(dark ? "dark" : "light");
      } else {
        html.setAttribute("data-mantine-color-scheme", m);
        setResolved(m);
      }
    };
    apply(mode);

    if (mode === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply("auto");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [mode, setResolved]);

  return null;
}
