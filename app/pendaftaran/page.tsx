"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Center, Loader, Stack, Text } from "@mantine/core";
import { useSearchParams, useRouter } from "next/navigation";
import { PendaftaranWizard } from "../../components/wizard/PendaftaranWizard";
import { usePeternakList, type Peternak } from "../../hooks/useTernakRakyat";

/**
 * Wrapper for the wizard that decides between "create" (new entry) and
 * "edit" (loading an existing record from the URL ?edit=<id> param).
 *
 * Edit mode passes the existing record to the wizard which pre-fills
 * all steps and, on submit, calls store.update() instead of add().
 */
function PendaftaranPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const list = usePeternakList();
  const editId = params.get("edit");
  const [loading, setLoading] = useState(Boolean(editId));
  const [existing, setExisting] = useState<Peternak | null>(null);

  useEffect(() => {
    if (!editId) {
      setLoading(false);
      return;
    }
    const found = list.find((p) => p.id === editId) ?? null;
    setExisting(found);
    setLoading(false);
    if (!found) {
      // ID supplied but no record found - redirect back after toast
      const t = setTimeout(() => router.push("/pendaftaran"), 1500);
      return () => clearTimeout(t);
    }
  }, [editId, list, router]);

  if (loading) {
    return (
      <Center mih="60vh">
        <Stack align="center" gap="sm">
          <Loader color="primary" />
          <Text fz="sm" c="dimmed">Memuat data...</Text>
        </Stack>
      </Center>
    );
  }

  if (editId && !existing) {
    return (
      <Center mih="60vh">
        <Stack align="center" gap="sm">
          <Text fz="lg" fw={700}>Data tidak ditemukan</Text>
          <Text fz="sm" c="dimmed">Mengalihkan ke formulir baru...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Suspense fallback={null}>
      <PendaftaranWizard
      initialValue={existing ?? undefined}
      modeKey={editId ?? "new"}
      />
    </Suspense>
  );
}


export default function PendaftaranPage() {
  return <Suspense fallback={null}><PendaftaranPageInner /></Suspense>;
}
