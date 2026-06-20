"use client";

// Real implementation lives in ./client.tsx (loaded dynamically
// with ssr: false to avoid React #418/#423 hydration mismatches).
// Public detail uses the same API-backed adapter as admin so the
// same fix applies.

import dynamic from "next/dynamic";
import { Center, Loader } from "@mantine/core";

const FormDetailClient = dynamic(
  () => import("./client").then((m) => m.FormDetailClient),
  {
    ssr: false,
    loading: () => (
      <Center mih="60vh">
        <Loader size="md" />
      </Center>
    ),
  }
);

export default function FormDetailPage() {
  return <FormDetailClient />;
}
