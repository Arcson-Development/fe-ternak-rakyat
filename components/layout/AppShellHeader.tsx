"use client";

import React from "react";
import { Kbd,
  Tooltip,
  Stack,
  Avatar,
  Badge,
  Box,
  Burger,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBell,
  IconChevronDown,
  IconLogout,
  IconSearch,
  IconSun,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { spotlight } from "@mantine/spotlight";
import { NotificationsDrawer } from "./NotificationsDrawer";
import { useThemeStore } from "../../hooks/useTheme";
import { getCurrentUser, logout } from "../../lib/auth";

type Props = { opened: boolean; toggle: () => void };

export function AppShellHeader({ opened, toggle }: Props) {
  const router = useRouter();
  const user = getCurrentUser();

  const initials = (user?.name ?? "AD")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => logout();

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group gap={10} wrap="nowrap">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #13bc6d 0%, #009450 100%)",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            S
          </Box>
          <Box>
            <Text fz="sm" fw={800} lh={1} c="dark.9">
              SITERNAK
            </Text>
            <Text fz={10} c="dimmed" fw={500} lh={1.4} visibleFrom="md">
              Pengembangan Ternak Rakyat
            </Text>
          </Box>
        </Group>
      </Group>

      <Group gap="md" wrap="nowrap">
        <Badge
          variant="light"
          color="primary"
          size="sm"
          radius="sm"
          visibleFrom="sm"
          style={{ textTransform: "none" }}
        >
          v1.0.0
        </Badge>
        <UnstyledButton
          onClick={() => spotlight.open()}
          data-onboarding="search-trigger"
          aria-label="Buka pencarian global"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 8,
            background: "var(--app-surface-sunken)",
            border: "1px solid var(--app-border)",
            cursor: "pointer",
            color: "var(--app-text-muted)",
          }}
        >
          <IconSearch size={14} />
          <Text fz="xs" visibleFrom="sm">Cari...</Text>
          <Group gap={2} visibleFrom="md">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </Group>
        </UnstyledButton>
        <NotificationsDrawer />

        <Tooltip label="Toggle dark mode">
          <UnstyledButton
            data-onboarding="theme-toggle"
            onClick={() => {
              const next = useThemeStore.getState().resolved === "dark" ? "light" : "dark";
              useThemeStore.getState().setMode(next);
            }}
            aria-label="Toggle dark mode"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--app-border)",
              background: "var(--app-surface)",
              cursor: "pointer",
            }}
          >
            <IconSun size={16} color="var(--app-text-muted)" />
          </UnstyledButton>
        </Tooltip>

        <Menu position="bottom-end" withArrow shadow="md" width={220}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap={8} wrap="nowrap">
                <Avatar size={32} radius="xl" color="primary" variant="light">
                  {initials}
                </Avatar>
                <Box visibleFrom="sm">
                  <Text fz="xs" fw={600} lh={1.2}>
                    {user?.name ?? "Admin"}
                  </Text>
                  <Text fz={10} c="dimmed" lh={1.2}>
                    {user?.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "Administrator"}
                  </Text>
                </Box>
                <IconChevronDown size={14} color="var(--app-text-muted)" />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>
              <Stack gap={2}>
                <Text fz="sm" fw={600}>{user?.name ?? "Pengguna"}</Text>
                <Text fz="xs" c="dimmed">{user?.email ?? "guest@siternak.id"}</Text>
              </Stack>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconUserCircle size={14} />}
              onClick={() => router.push("/dashboard/pengaturan")}
            >
              Profil Saya
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={14} />}
              onClick={() => router.push("/dashboard/pengaturan")}
            >
              Pengaturan
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconLogout size={14} />}
              color="red"
              onClick={handleLogout}
            >
              Keluar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
