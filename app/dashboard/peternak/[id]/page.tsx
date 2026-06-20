"use client";

// Real implementation lives in ./client.tsx (loaded dynamically with
// ssr: false to avoid React hydration mismatches). All the data-
// driven rendering, Mantine Tabs, Image lightbox and Recharts
// pieces live there — they're all sources of subtle SSR/CSR drift
// (chart IDs, theme attribute, API response timing) that the React
// reconciler flags as #418/#423.

import dynamic from "next/dynamic";
import { DetailSkeleton } from "../../../../components/skeletons";

const PeternakDetailClient = dynamic(
  () => import("./client").then((m) => m.PeternakDetailClient),
  {
    ssr: false,
    loading: () => <DetailSkeleton />,
  }
);

export default function PeternakDetailPage() {
  return <PeternakDetailClient />;
}
