"use client";

import React from "react";
import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUserPlus,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

type Item = {
  href: string;
  label: string;
  icon: Icon;
  'data-onboarding'?: string;
  group: "Utama" | "Master" | "Lainnya";
};

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Ringkasan", icon: IconLayoutDashboard, group: "Utama" },
  { href: "/pendaftaran", label: "Pendaftaran", icon: IconUserPlus, group: "Utama" },
  { href: "/dashboard/peternak", label: "Daftar Peternak", icon: IconUsers, group: "Utama" },
  { href: "/dashboard/laporan", label: "Laporan", icon: IconChartBar, group: "Master" },
  { href: "/dashboard/pengaturan", label: "Pengaturan", icon: IconSettings, group: "Lainnya" },
  { href: "/dashboard/bantuan", label: "Bantuan", icon: IconHelp, group: "Lainnya" },
];

export function AppShellSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  const groups: Array<"Utama" | "Master" | "Lainnya"> = ["Utama", "Master", "Lainnya"];

  return (
    <Stack gap="xs" p="md" style={{ height: "100%" }}>
      <Stack gap={4} style={{ flex: 1, overflowY: "auto" }}>
        {groups.map((g) => {
          const items = ITEMS.filter((i) => i.group === g);
          if (items.length === 0) return null;
          return (
            <Box key={g} mb="xs">
              <Text
                fz={10}
                fw={700}
                tt="uppercase"
                c="var(--app-sidebar-fg-muted)"
                px="sm"
                mb={4}
                style={{ letterSpacing: "0.08em" }}
              >
                {g}
              </Text>
              <Stack gap={2}>
                {items.map((it) => {
                  const Icon = it.icon;
                  const active = isActive(it.href);
                  return (
                    <UnstyledButton
                      key={it.href}
                      data-onboarding={(it as any)['data-onboarding']}
                      onClick={() => {
                        router.push(it.href);
                        onNavigate?.();
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: active ? "white" : "var(--app-sidebar-fg)",
                        background: active ? "var(--app-sidebar-active)" : "transparent",
                        fontWeight: active ? 600 : 500,
                        fontSize: 14,
                        transition: "all 0.12s",
                      }}
                    >
                      <Icon size={18} stroke={1.7} />
                      <span>{it.label}</span>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Stack>

      <Box
        p="sm"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
        }}
      >
        <Text fz="xs" fw={700} c="white" mb={2}>
          Backend belum tersedia
        </Text>
        <Text fz={11} c="var(--app-sidebar-fg-muted)" lh={1.35}>
          Data tersimpan lokal. Hubungkan ke API saat endpoint siap.
        </Text>
      </Box>
    </Stack>
  );
}
