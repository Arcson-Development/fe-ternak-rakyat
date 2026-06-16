import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";

import React from "react";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "../theme";
import { AppProviders } from "../components/provider/AppProviders";

export const metadata = {
  title: "SITERNAK — Pengembangan Ternak Rakyat",
  description:
    "Sistem Informasi Pengembangan Ternak Rakyat. Pendataan, monitoring, dan pembinaan peternak ayam nasional.",
  applicationName: "SITERNAK",
  authors: [{ name: "Arcson Development" }],
  keywords: [
    "peternakan",
    "ternak rakyat",
    "ayam pedaging",
    "ayam petelur",
    "kandang",
    "SITERNAK",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13bc6d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <AppProviders>{children}</AppProviders>
        </MantineProvider>
      </body>
    </html>
  );
}
