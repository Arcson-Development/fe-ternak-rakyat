"use client";

import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconHelp,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

type Step = {
  /** CSS selector to highlight */
  target: string;
  /** Position of the tooltip relative to the target */
  placement?: "top" | "bottom" | "left" | "right";
  title: string;
  body: string;
  /** CTA that navigates somewhere (e.g. wizard). Optional. */
  cta?: { label: string; href: string };
};

const STEPS: Step[] = [
  {
    target: "body",
    placement: "bottom",
    title: "Selamat datang di SITERNAK",
    body:
      "SITERNAK membantu Anda mendata dan memonitor peternak ayam rakyat. Mari kita lihat beberapa hal penting.",
  },
  {
    target: "[data-onboarding=\"sidebar-dashboard\"]",
    placement: "right",
    title: "Dashboard Operasional",
    body:
      "Lihat ringkasan statistik, peta sebaran, dan tren pendaftaran dalam satu tampilan.",
  },
  {
    target: "[data-onboarding=\"sidebar-pendaftaran\"]",
    placement: "right",
    title: "Daftarkan Peternak Baru",
    body:
      "Mulai pendataan lengkap: identitas, alamat, foto KTP, kondisi kandang, hingga status operasional.",
  },
  {
    target: "[data-onboarding=\"sidebar-peternak\"]",
    placement: "right",
    title: "Manajemen Peternak",
    body:
      "Cari, filter, dan kelola data semua peternak yang sudah terdaftar. Klik baris untuk melihat detail.",
  },
  {
    target: "[data-onboarding=\"search-trigger\"]",
    placement: "bottom",
    title: "Pencarian Global",
    body:
      "Tekan Ctrl+K kapan saja untuk membuka command palette. Bisa cari halaman, peternak, atau aksi.",
  },
  {
    target: "[data-onboarding=\"theme-toggle\"]",
    placement: "bottom",
    title: "Mode Gelap",
    body:
      "Toggle mode terang/gelap di sini. Preferensi tersimpan otomatis. Atau atur di Pengaturan > Tampilan.",
  },
];

const STORAGE_KEY = "siternak-onboarding-done";

/**
 * Tiny custom tour overlay. Renders a backdrop, a highlight ring around
 * the target element, and a tooltip card. Auto-skips if `siternak-onboarding-done`
 * is set in localStorage. Triggered on first visit to the dashboard.
 */
export function OnboardingTour() {
  const route = useRouter();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) {
        // Small delay so DOM is settled
        const t = setTimeout(() => setActive(true), 600);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!active) return;
    const def = STEPS[step];
    if (!def) return;
    const el = document.querySelector(def.target) as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(r);
    } else {
      setRect(null);
    }
    // Recompute on resize
    const handler = () => {
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [active, step]);

  if (!active) return null;
  const def = STEPS[step];
  if (!def) return null;
  const isLast = step === STEPS.length - 1;

  const finish = () => {
    setActive(false);
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {}
  };

  const next = () => {
    if (isLast) {
      finish();
    } else {
      setStep((s) => s + 1);
    }
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <>
      {/* Backdrop with cut-out */}
      <Box
        onClick={finish}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.55)",
          zIndex: 1999,
          transition: "all 0.2s",
        }}
      />
      {/* Highlight ring */}
      {rect && (
        <Box
          style={{
            position: "fixed",
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            border: "2px solid var(--app-primary)",
            borderRadius: 12,
            boxShadow: "0 0 0 4px rgba(19, 188, 109, 0.25)",
            zIndex: 2000,
            pointerEvents: "none",
            transition: "all 0.25s",
          }}
        />
      )}
      {/* Tooltip */}
      <Card
        shadow="xl"
        padding="md"
        radius="md"
        withBorder
        style={{
          position: "fixed",
          ...tooltipPosition(rect, def.placement),
          width: 360,
          maxWidth: "calc(100vw - 32px)",
          zIndex: 2001,
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fz="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.06em" }}>
                Tur Panduan · {step + 1}/{STEPS.length}
              </Text>
              <Text fz="md" fw={700}>{def.title}</Text>
            </Stack>
            <ActionIcon variant="subtle" color="gray" onClick={finish} aria-label="Lewati tur">
              <IconX size={16} />
            </ActionIcon>
          </Group>
          <Text fz="sm" c="dimmed">{def.body}</Text>
          <Group justify="space-between" align="center" mt="xs">
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              onClick={finish}
            >
              Lewati tur
            </Button>
            <Group gap={4}>
              {step > 0 && (
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<IconArrowLeft size={12} />}
                  onClick={prev}
                >
                  Kembali
                </Button>
              )}
              {def.cta && !isLast ? null : (
                <Button
                  size="xs"
                  rightSection={isLast ? <IconCheck size={12} /> : <IconArrowRight size={12} />}
                  onClick={next}
                >
                  {isLast ? "Selesai" : "Lanjut"}
                </Button>
              )}
              {def.cta && (
                <Button
                  size="xs"
                  rightSection={<IconArrowRight size={12} />}
                  onClick={() => {
                    finish();
                    route.push(def.cta!.href);
                  }}
                >
                  {def.cta.label}
                </Button>
              )}
            </Group>
          </Group>
        </Stack>
      </Card>
    </>
  );
}

function tooltipPosition(
  rect: DOMRect | null,
  placement: Step["placement"] = "bottom"
): React.CSSProperties {
  if (!rect) {
    return {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
    };
  }
  const margin = 16;
  const w = 360;
  const h = 200; // estimate
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Compute preferred
  let left = rect.left;
  let top = rect.top;

  switch (placement) {
    case "right":
      left = rect.right + margin;
      top = rect.top + rect.height / 2 - h / 2;
      break;
    case "left":
      left = rect.left - w - margin;
      top = rect.top + rect.height / 2 - h / 2;
      break;
    case "top":
      left = rect.left + rect.width / 2 - w / 2;
      top = rect.top - h - margin;
      break;
    case "bottom":
    default:
      left = rect.left + rect.width / 2 - w / 2;
      top = rect.bottom + margin;
      break;
  }

  // Clamp
  left = Math.max(16, Math.min(left, vw - w - 16));
  top = Math.max(16, Math.min(top, vh - h - 16));

  return { left, top };
}
