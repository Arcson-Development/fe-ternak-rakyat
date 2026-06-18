"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Center,
  Loader,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh, IconShieldCheck } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import { PendaftaranWizard } from "../../components/wizard/PendaftaranWizard";
import { usePeternakList, type Peternak } from "../../hooks/useTernakRakyat";
import { ensurePeternakToken } from "../../lib/auth/peternakAuth";

/**
 * Three-phase UX for the public registration form:
 *
 *   1. "pending"  → seamless auto-login running. Show a friendly spinner
 *                   so the user knows something is happening in the
 *                   background (the petenak token is needed to POST
 *                   /form/create, which is a public endpoint).
 *   2. "ready"    → token is cached in localStorage. Render the wizard.
 *   3. "error"    → auto-login failed (network down, API 5xx, CORS, …).
 *                   Surface the error with a retry button — the form
 *                   cannot be submitted without a valid token, so we
 *                   refuse to render it.
 */
type AuthStatus = "pending" | "ready" | "error";

function PendaftaranPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const list = usePeternakList();
  const editId = params.get("edit");

  // Seamless petenak auth state
  const [authStatus, setAuthStatus] = useState<AuthStatus>("pending");
  const [authError, setAuthError] = useState<string | null>(null);

  // Edit-mode state (independent from auth state)
  const [editLoading, setEditLoading] = useState(Boolean(editId));
  const [existing, setExisting] = useState<Peternak | null>(null);

  // Kick off the hardcoded petenak login as soon as the page mounts.
  // ensurePeternakToken() is idempotent — if a token is already in
  // localStorage the call returns immediately, otherwise it hits
  // POST /auth/peternak/sign-in with the demo credentials and caches
  // the result for the next submit.
  const performAuth = useCallback(async () => {
    setAuthStatus("pending");
    setAuthError(null);
    try {
      await ensurePeternakToken();
      setAuthStatus("ready");
    } catch (err: any) {
      // Don't show the wizard if auth failed — the user would only
      // see a confusing submit-time error minutes later.
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Tidak dapat menghubungi server autentikasi.";
      setAuthError(message);
      setAuthStatus("error");
    }
  }, []);

  useEffect(() => {
    performAuth();
  }, [performAuth]);

  // Edit-mode lookup — unchanged from the original behaviour.
  useEffect(() => {
    if (!editId) {
      setEditLoading(false);
      return;
    }
    const found = list.find((p) => p.id === editId) ?? null;
    setExisting(found);
    setEditLoading(false);
    if (!found) {
      const t = setTimeout(() => router.push("/pendaftaran"), 1500);
      return () => clearTimeout(t);
    }
  }, [editId, list, router]);

  // ─── Render branches ───

  // 1. Auth or edit lookup in progress
  if (authStatus === "pending" || editLoading) {
    const label =
      authStatus === "pending"
        ? "Menyiapkan sesi formulir…"
        : "Memuat data…";
    return (
      <Center mih="60vh">
        <Stack align="center" gap="md">
          <Loader color="primary" size="lg" />
          <Stack align="center" gap={2}>
            <Text fz="sm" fw={600}>
              {label}
            </Text>
            <Text fz="xs" c="dimmed">
              {authStatus === "pending"
                ? "Mengamankan koneksi ke server secara otomatis."
                : "Mencari data peternak yang akan diedit."}
            </Text>
          </Stack>
        </Stack>
      </Center>
    );
  }

  // 2. Auth failed — show explicit error UI with retry
  if (authStatus === "error") {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="md" maw={460}>
          <ThemeIcon color="red" size={56} radius="xl" variant="light">
            <IconAlertCircle size={32} />
          </ThemeIcon>
          <Stack align="center" gap={6}>
            <Text fz="xl" fw={700} ta="center">
              Tidak dapat memulai formulir
            </Text>
            <Text fz="sm" c="dimmed" ta="center">
              Sesi autentikasi untuk mengirim formulir tidak berhasil dibuat.
              Coba lagi — biasanya cukup sekali untuk melewati gangguan
              jaringan sementara.
            </Text>
          </Stack>
          {authError && (
            <Alert
              color="red"
              variant="light"
              icon={<IconAlertCircle size={16} />}
              w="100%"
              radius="md"
            >
              <Text fz="xs" ff="monospace" style={{ wordBreak: "break-word" }}>
                {authError}
              </Text>
            </Alert>
          )}
          <Button
            size="md"
            leftSection={<IconRefresh size={16} />}
            onClick={performAuth}
          >
            Coba lagi
          </Button>
        </Stack>
      </Center>
    );
  }

  // 3. Auth ready but edit ID was supplied and the record was not found
  if (editId && !existing) {
    return (
      <Center mih="60vh">
        <Stack align="center" gap="sm">
          <Text fz="lg" fw={700}>Data tidak ditemukan</Text>
          <Text fz="sm" c="dimmed">Mengalihkan ke formulir baru…</Text>
        </Stack>
      </Center>
    );
  }

  // 4. Auth ready + (no edit OR edit record found) → show the wizard
  return (
    <Stack gap="xs">
      {/* Tiny "auth ok" pill so the user sees the auto-login actually
          succeeded — useful when debugging in the wild. */}
      <Center>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 999,
            background: "var(--mantine-color-primary-0)",
            color: "var(--mantine-color-primary-9)",
          }}
        >
          <ThemeIcon color="primary" size="xs" radius="xl" variant="filled">
            <IconShieldCheck size={10} />
          </ThemeIcon>
          <Text fz="xs" fw={600}>
            Sesi formulir siap · koneksi aman
          </Text>
        </span>
      </Center>
      <PendaftaranWizard
        initialValue={existing ?? undefined}
        modeKey={editId ?? "new"}
      />
    </Stack>
  );
}

export default function PendaftaranPage() {
  return (
    <Suspense fallback={null}>
      <PendaftaranPageInner />
    </Suspense>
  );
}
