"use client";

import { createTheme, MantineColorsTuple, rem } from "@mantine/core";

/**
 * Enterprise theme for Pengembangan Ternak Rakyat (SITERNAK).
 *
 * Design language:
 * - Primary: deep teal/green (livestock/agritech domain).
 * - Neutral: cool slate, used for surfaces, borders, text.
 * - Status: clear semantic colors (success / warning / danger / info).
 * - Typography: Inter via Google Fonts. Slightly tighter line-height
 *   for a "production" feel. Scale tuned for data-heavy admin UIs.
 * - Dark mode: same primary hue, shifted neutrals for low-light comfort.
 */

const primary: MantineColorsTuple = [
  "#e6fbf2",
  "#cdf4e0",
  "#9ce6c1",
  "#67d8a0",
  "#3ecc85",
  "#25c373",
  "#13bc6d",
  "#08a75e",
  "#009453",
  "#008047",
];

const accent: MantineColorsTuple = [
  "#fff7e0",
  "#ffeec2",
  "#ffdb87",
  "#ffc84a",
  "#ffb71d",
  "#ffae03",
  "#ffa500",
  "#e39200",
  "#cb8200",
  "#b16e00",
];

const slate: MantineColorsTuple = [
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
];

export const theme = createTheme({
  primaryColor: "primary",
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: "md",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMonospace:
    "ui-monospace, SFMono-Regular, 'Cascadia Code', 'Roboto Mono', Menlo, monospace",
  headings: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: rem(32), lineHeight: "1.2" },
      h2: { fontSize: rem(26), lineHeight: "1.25" },
      h3: { fontSize: rem(20), lineHeight: "1.3" },
      h4: { fontSize: rem(17), lineHeight: "1.35" },
      h5: { fontSize: rem(15), lineHeight: "1.4" },
      h6: { fontSize: rem(13), lineHeight: "1.45" },
    },
  },
  white: "#ffffff",
  black: "#0b1220",
  colors: {
    primary,
    accent,
    slate,
  },
  shadows: {
    xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
    sm: "0 2px 4px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
    md: "0 4px 12px rgba(15, 23, 42, 0.07), 0 2px 4px rgba(15, 23, 42, 0.04)",
    lg: "0 10px 24px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)",
    xl: "0 20px 40px rgba(15, 23, 42, 0.1), 0 8px 16px rgba(15, 23, 42, 0.05)",
  },
  components: {
    Button: {
      defaultProps: { radius: "md" },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.005em",
        },
      },
    },
    Card: {
      defaultProps: { withBorder: true, shadow: "xs", radius: "md" },
    },
    Paper: {
      defaultProps: { radius: "md" },
    },
    Badge: {
      defaultProps: { radius: "sm" },
    },
    Tooltip: {
      defaultProps: { withArrow: true, radius: "sm" },
    },
    Modal: {
      defaultProps: { radius: "md", centered: true },
    },
    Drawer: {
      defaultProps: { radius: 0 },
    },
    Input: {
      styles: {
        input: {
          fontSize: rem(14),
        },
      },
    },
    Select: {
      styles: {
        input: {
          fontSize: rem(14),
        },
      },
    },
  },
  other: {
    surface: "var(--app-surface)",
    surfaceSunken: "var(--app-surface-sunken)",
    border: "var(--app-border)",
    borderStrong: "var(--app-border-strong)",
    text: "var(--app-text)",
    textSubtle: "var(--app-text-subtle)",
    textMuted: "var(--app-text-muted)",
    sidebarBg: "var(--app-sidebar-bg)",
    primarySoft: "var(--app-primary-soft)",
  },
});
