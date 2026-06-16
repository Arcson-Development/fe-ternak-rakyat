"use client";

import React from "react";
import { UnstyledButton, Text, Group, Stack, Box } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUserPlus,
  IconUsers,
  IconBuildingWarehouse,
  IconChartBar,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

type Item = {
  href: string;
  label: string;
  icon: Icon;
};

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Beranda", icon: IconLayoutDashboard },
  { href: "/pendaftaran", label: "Daftar", icon: IconUserPlus },
  { href: "/dashboard/peternak", label: "Peternak", icon: IconUsers },
  { href: "/dashboard/kandang", label: "Kandang", icon: IconBuildingWarehouse },
  { href: "/dashboard/laporan", label: "Laporan", icon: IconChartBar },
];

const ACTIVE_COLOR = "var(--mantine-color-primary-6)";
const INACTIVE_COLOR = "var(--app-text-muted)";

/**
 * Bottom navigation bar visible only on small screens.
 * Provides quick access to the 5 most-used destinations.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <Box
      hiddenFrom="sm"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--app-surface)",
        borderTop: "1px solid var(--app-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <Group justify="space-around" align="center" gap={0} h={64} wrap="nowrap">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <UnstyledButton
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <Stack gap={2} align="center" justify="center">
                <Icon
                  size={20}
                  stroke={active ? 2.5 : 1.7}
                  color={active ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
                <Text
                  fz={10}
                  fw={active ? 700 : 500}
                  c={active ? "primary.6" : "dimmed"}
                  lh={1}
                >
                  {item.label}
                </Text>
              </Stack>
            </UnstyledButton>
          );
        })}
      </Group>
    </Box>
  );
}
