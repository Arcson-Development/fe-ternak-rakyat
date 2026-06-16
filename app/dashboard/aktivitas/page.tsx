"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  Container,
  Group,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Timeline,
} from "@mantine/core";
import {
  IconActivityHeartbeat,
  IconBuildingWarehouse,
  IconClipboardList,
  IconDownload,
  IconEdit,
  IconFilter,
  IconPlus,
  IconSearch,
  IconUser,
  IconUserPlus,
  IconHistory,
} from "@tabler/icons-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import { usePeternakList } from "../../../hooks/useTernakRakyat";
import {
  KATEGORI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  KEMITRAAN_LABEL,
  type Kemitraan,
  type Kandang,
  type Peternak,
} from "../../../hooks/useTernakRakyat";

type Act = {
  id: string;
  kind: "create" | "edit" | "kandang" | "status" | "kemitraan";
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  ref?: string;
};

const KIND_META: Record<Act["kind"], { icon: any; color: string; label: string }> = {
  create: { icon: IconUserPlus, color: "primary", label: "Pendaftaran" },
  edit: { icon: IconEdit, color: "blue", label: "Edit Data" },
  kandang: { icon: IconBuildingWarehouse, color: "accent", label: "Kandang" },
  status: { icon: IconActivityHeartbeat, color: "teal", label: "Status" },
  kemitraan: { icon: IconClipboardList, color: "violet", label: "Kemitraan" },
};

function buildActivities(list: Peternak[]): Act[] {
  const out: Act[] = [];
  list.forEach((p) => {
    out.push({
      id: `${p.id}-create`,
      kind: "create",
      title: `Pendaftaran baru: ${p.nama}`,
      description: `${KATEGORI_LABEL[p.kategori]} · ${p.alamat.kabupaten?.name}, ${p.alamat.provinsi?.name}`,
      actor: "Admin",
      timestamp: p.createdAt,
      ref: p.id,
    });
    p.kandang.forEach((k, i) => {
      out.push({
        id: `${p.id}-kandang-${i}`,
        kind: "kandang",
        title: `Tambah ${k.nama || `Kandang ${i + 1}`} untuk ${p.nama}`,
        description: `${k.lokasi.lat?.toFixed(4)}, ${k.lokasi.lng?.toFixed(4)} · Kapasitas ${k.kapasitas}`,
        actor: "Operator",
        timestamp: new Date(new Date(p.createdAt).getTime() + i * 1000).toISOString(),
        ref: k.id,
      });
      if (k.statusOperasional) {
        out.push({
          id: `${p.id}-status-${i}`,
          kind: "status",
          title: `${k.nama || `Kandang ${i + 1}`}: ${STATUS_OPERASIONAL_LABEL[k.statusOperasional]}`,
          description:
            k.statusOperasional === "operasi"
              ? `${k.jumlahAyam} · ${k.jenisUsaha === "kemitraan" ? `Kemitraan ${KEMITRAAN_LABEL[k.kemitraan as Kemitraan] || k.kemitraan}` : "Mandiri"}`
              : "Kandang tidak beroperasi",
          actor: "Admin",
          timestamp: new Date(new Date(p.createdAt).getTime() + (i + 1) * 1000).toISOString(),
          ref: k.id,
        });
      }
      if (k.jenisUsaha === "kemitraan" && KEMITRAAN_LABEL[k.kemitraan as Kemitraan] || k.kemitraan) {
        out.push({
          id: `${p.id}-mitra-${i}`,
          kind: "kemitraan",
          title: `Kemitraan: ${p.nama} → ${KEMITRAAN_LABEL[k.kemitraan as Kemitraan] || k.kemitraan}`,
          description: `${k.nama || `Kandang ${i + 1}`}`,
          actor: "Admin",
          timestamp: new Date(new Date(p.createdAt).getTime() + (i + 2) * 1000).toISOString(),
          ref: k.id,
        });
      }
    });
  });
  // Newest first
  return out.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export default function AktivitasPage() {
  const list = usePeternakList();
  const all = useMemo(() => buildActivities(list), [list]);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<string | null>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((a) => {
      if (kindFilter && kindFilter !== "all" && a.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.actor.toLowerCase().includes(q)
      );
    });
  }, [all, search, kindFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    all.forEach((a) => (c[a.kind] = (c[a.kind] ?? 0) + 1));
    return c;
  }, [all]);

  return (
    <Container size="xl" px={0}>
      <Stack gap="lg">
        <PageHeader
          eyebrow="Audit Trail"
          title="Aktivitas Sistem"
          description="Catatan kronologis pendaftaran, penambahan kandang, perubahan status, dan kemitraan."
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <StatCard
            label="Total"
            value={all.length}
            icon={IconHistory}
            iconColor="primary"
            hint="Semua event"
          />
          <StatCard
            label="Pendaftaran"
            value={counts.create ?? 0}
            icon={IconUserPlus}
            iconColor="primary"
          />
          <StatCard
            label="Kandang"
            value={counts.kandang ?? 0}
            icon={IconBuildingWarehouse}
            iconColor="accent"
          />
          <StatCard
            label="Status"
            value={counts.status ?? 0}
            icon={IconActivityHeartbeat}
            iconColor="teal"
          />
          <StatCard
            label="Kemitraan"
            value={counts.kemitraan ?? 0}
            icon={IconClipboardList}
            iconColor="violet"
          />
        </div>

        <Card padding="md" radius="md" withBorder shadow="xs">
          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder="Cari judul, deskripsi, atau aktor..."
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={{ base: "100%", sm: 320 }}
            />
            <Select
              data={[
                { value: "all", label: "Semua Tipe" },
                ...Object.entries(KIND_META).map(([k, m]) => ({ value: k, label: m.label })),
              ]}
              value={kindFilter}
              onChange={setKindFilter}
              leftSection={<IconFilter size={14} />}
              w={220}
            />
            <Text fz="xs" c="dimmed" ml="auto">
              {filtered.length} event
            </Text>
          </Group>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState
            icon={IconHistory}
            title="Belum ada aktivitas"
            description="Aktivitas sistem akan muncul di sini setelah ada pendaftaran."
          />
        ) : (
          <Card padding="lg" radius="md" withBorder shadow="xs">
            <ScrollArea h={600}>
              <Timeline active={filtered.length} bulletSize={32} lineWidth={2}>
                {filtered.map((a) => {
                  const meta = KIND_META[a.kind];
                  const Icon = meta.icon;
                  return (
                    <Timeline.Item
                      key={a.id}
                      bullet={
                        <Avatar size={26} radius="xl" color={meta.color} variant="light">
                          <Icon size={14} />
                        </Avatar>
                      }
                      title={
                        <Group gap="sm" wrap="wrap">
                          <Text fw={600} fz="sm">{a.title}</Text>
                          <Badge size="xs" color={meta.color} variant="light" radius="sm">
                            {meta.label}
                          </Badge>
                        </Group>
                      }
                    >
                      <Text fz="xs" c="dimmed" mt={2}>
                        {a.description}
                      </Text>
                      <Group gap="sm" mt={4}>
                        <Text fz="xs" c="dimmed">
                          oleh {a.actor}
                        </Text>
                        <Text fz="xs" c="dimmed">·</Text>
                        <Text fz="xs" c="dimmed">
                          {new Date(a.timestamp).toLocaleString("id-ID")}
                        </Text>
                      </Group>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </ScrollArea>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
