"use client";

import React, { useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Drawer,
  Group,
  Indicator,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBell,
  IconBuildingWarehouse,
  IconCheck,
  IconClipboardList,
  IconHistory,
  IconUserPlus,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { usePeternakList } from "../../hooks/useTernakRakyat";
import {
  KATEGORI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  kemitraanLabel,
  type Kandang,
} from "../../hooks/useTernakRakyat";
import { listAllDrafts, deleteDraft } from "../../hooks/useTernakRakyat/useWizardDraft";

type Notif = {
  id: string;
  kind: "new" | "kandang" | "kemitraan" | "warning" | "draft";
  title: string;
  description: string;
  when: string;
  href?: string;
  icon: any;
  color: string;
};

const ICON_MAP = {
  new: { icon: IconUserPlus, color: "primary" },
  kandang: { icon: IconBuildingWarehouse, color: "accent" },
  kemitraan: { icon: IconClipboardList, color: "violet" },
  warning: { icon: IconAlertCircle, color: "yellow" },
  draft: { icon: IconHistory, color: "blue" },
};

/**
 * Bell-icon dropdown. Builds notifications dynamically from the
 * stored data: latest registrations, recently added kandangs, saved
 * drafts, and rough warnings (kandang tidak operasi, etc).
 *
 * Marked-read state lives in localStorage so the indicator doesn't
 * haunt the user forever.
 */
export function NotificationsDrawer() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const list = usePeternakList();
  const [tab, setTab] = useState<string | null>("all");
  const [readIds, setReadIds] = useState<string[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("siternak-notif-read");
      if (raw) setReadIds(JSON.parse(raw));
    } catch {}
  }, []);

  const markAllRead = () => {
    const ids = all.map((n) => n.id);
    setReadIds(ids);
    try {
      localStorage.setItem("siternak-notif-read", JSON.stringify(ids));
    } catch {}
  };

  const all: Notif[] = useMemo(() => {
    const out: Notif[] = [];
    // Most recent registrations
    list.slice(0, 8).forEach((p) => {
      out.push({
        id: `new-${p.id}`,
        kind: "new",
        title: `Pendaftaran: ${p.nama}`,
        description: `${KATEGORI_LABEL[p.kategori]} · ${p.alamat.kabupaten?.name}, ${p.alamat.provinsi?.name}`,
        when: p.createdAt,
        href: `/dashboard/peternak/${p.id}`,
        ...ICON_MAP.new,
      });
      p.kandang.slice(0, 3).forEach((k, i) => {
        out.push({
          id: `kdg-${p.id}-${i}`,
          kind: "kandang",
          title: `${k.nama || `Kandang ${i + 1}`} — ${STATUS_OPERASIONAL_LABEL[k.statusOperasional]}`,
          description: `${p.nama} · ${k.jenisUsaha ? `Kemitraan ${kemitraanLabel(k.kemitraan)}` : "Mandiri"}`,
          when: p.createdAt,
          href: `/dashboard/peternak/${p.id}`,
          ...ICON_MAP.kandang,
        });
      });
    });

    // Drafts pending
    const drafts = listAllDrafts();
    drafts.forEach((d) => {
      out.push({
        id: `draft-${d.modeKey}`,
        kind: "draft",
        title: "Draf pendaftaran belum selesai",
        description: `Tersimpan ${new Date(d.envelope.savedAt).toLocaleString("id-ID")}`,
        when: d.envelope.savedAt,
        href: `/pendaftaran${d.envelope.mode === "edit" ? `?edit=${d.envelope.payload.id}` : ""}`,
        ...ICON_MAP.draft,
      });
    });

    // Warnings: kandang with kondisi buruk
    list.forEach((p) => {
      p.kandang.forEach((k, i) => {
        if (
          k.kondisi.dinding.kondisi === "rusak" ||
          k.kondisi.atap.kondisi === "rusak" ||
          k.kondisi.lantai.kondisi === "rusak"
        ) {
          out.push({
            id: `warn-${p.id}-${i}`,
            kind: "warning",
            title: `Kondisi ${k.nama || `Kandang ${i + 1}`} perlu perhatian`,
            description: `Kondisi rusak terdeteksi pada ${p.nama}.`,
            when: p.createdAt,
            href: `/dashboard/peternak/${p.id}`,
            ...ICON_MAP.warning,
          });
        }
      });
    });

    return out.sort((a, b) => +new Date(b.when) - +new Date(a.when));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const unreadCount = all.filter((n) => !readIds.includes(n.id)).length;

  const filtered = tab === "unread" ? all.filter((n) => !readIds.includes(n.id)) : all;

  const handleClick = (n: Notif) => {
    if (!readIds.includes(n.id)) {
      const next = [...readIds, n.id];
      setReadIds(next);
      try {
        localStorage.setItem("siternak-notif-read", JSON.stringify(next));
      } catch {}
    }
    if (n.href) {
      router.push(n.href);
      close();
    }
  };

  return (
    <>
      <Tooltip label="Notifikasi">
        <Indicator
          inline
          processing={unreadCount > 0}
          color="red"
          size={8}
          offset={3}
          disabled={unreadCount === 0}
        >
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={open}
            aria-label="Buka notifikasi"
          >
            <IconBell size={18} />
          </ActionIcon>
        </Indicator>
      </Tooltip>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="md"
        padding={0}
        title={
          <Group justify="space-between" w="100%">
            <Stack gap={0}>
              <Text fw={700} fz="md">Notifikasi</Text>
              <Text fz="xs" c="dimmed">
                {unreadCount > 0
                  ? `${unreadCount} belum dibaca`
                  : "Semua sudah dibaca"}
              </Text>
            </Stack>
            {unreadCount > 0 && (
              <Button
                size="compact-xs"
                variant="subtle"
                leftSection={<IconCheck size={12} />}
                onClick={markAllRead}
              >
                Tandai semua
              </Button>
            )}
          </Group>
        }
      >
        <Tabs value={tab} onChange={setTab} px="md">
          <Tabs.List>
            <Tabs.Tab value="all">Semua ({all.length})</Tabs.Tab>
            <Tabs.Tab value="unread">Belum dibaca ({unreadCount})</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <ScrollArea h="calc(100vh - 180px)" p="md">
          {filtered.length === 0 ? (
            <Stack align="center" justify="center" py="xl" gap="xs">
              <ThemeIcon variant="light" color="gray" size={56} radius="xl">
                <IconBell size={28} />
              </ThemeIcon>
              <Text fz="sm" fw={600}>Tidak ada notifikasi</Text>
              <Text fz="xs" c="dimmed" ta="center">
                Pemberitahuan akan muncul di sini saat ada aktivitas.
              </Text>
            </Stack>
          ) : (
            <Stack gap="xs">
              {filtered.map((n) => {
                const Icon = n.icon;
                const unread = !readIds.includes(n.id);
                return (
                  <Box
                    key={n.id}
                    onClick={() => handleClick(n)}
                    p="sm"
                    style={{
                      borderRadius: 8,
                      background: unread ? "var(--app-primary-soft)" : "var(--app-surface)",
                      border: "1px solid var(--app-border)",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <ThemeIcon variant="light" color={n.color} size="md" radius="md">
                        <Icon size={14} />
                      </ThemeIcon>
                      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                        <Group justify="space-between" gap="sm">
                          <Text fz="sm" fw={600} lineClamp={1}>{n.title}</Text>
                          {unread && (
                            <Badge size="xs" color="primary" radius="xl" variant="filled">
                              Baru
                            </Badge>
                          )}
                        </Group>
                        <Text fz="xs" c="dimmed" lineClamp={2}>
                          {n.description}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {new Date(n.when).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </Stack>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          )}
        </ScrollArea>
      </Drawer>
    </>
  );
}
