"use client";

// Real implementation in ./client.tsx (loaded dynamically with
// ssr: false to avoid React #418/#423 hydration mismatches).
// The list page renders a Recharts-powered progress chart plus
// a Mantine table with bulk actions — both have rendered-DOM
// ID drift between SSR and CSR.

import dynamic from "next/dynamic";
import { Center, Loader } from "@mantine/core";

const PeternakListClient = dynamic(
  () => import("./client").then((m) => m.PeternakListClient),
  {
    ssr: false,
    loading: () => (
      <Center mih="60vh">
        <Loader size="md" />
      </Center>
    ),
  }
);

export default function PeternakListPageRoute() {
  return <PeternakListClient />;
}
