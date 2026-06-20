"use client";

// Real implementation in ./client.tsx (loaded dynamically with
// ssr: false to avoid React #418/#423 hydration mismatches).
// The dashboard renders TrendArea, KategoriDonut, TopKabupatenBar
// (all Recharts) plus FarmMapLeaflet — all of them generate
// SVG IDs / DOM IDs during render that routinely diverge
// between SSR and CSR.

import dynamic from "next/dynamic";
import { Center, Loader } from "@mantine/core";

const DashboardClient = dynamic(
  () => import("./client").then((m) => m.DashboardClient),
  {
    ssr: false,
    loading: () => (
      <Center mih="60vh">
        <Loader size="md" />
      </Center>
    ),
  }
);

export default function DashboardPageRoute() {
  return <DashboardClient />;
}
