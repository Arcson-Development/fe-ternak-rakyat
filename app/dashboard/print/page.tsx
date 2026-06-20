"use client";

// Real implementation in ./client.tsx (loaded dynamically with
// ssr: false to avoid React #418/#423 hydration mismatches).

import dynamic from "next/dynamic";
import { Center, Loader } from "@mantine/core";

const BatchPrintClient = dynamic(
  () => import("./client").then((m) => m.BatchPrintClient),
  {
    ssr: false,
    loading: () => (
      <Center mih="60vh">
        <Loader size="md" />
      </Center>
    ),
  }
);

export default function BatchPrintPageRoute() {
  return <BatchPrintClient />;
}
