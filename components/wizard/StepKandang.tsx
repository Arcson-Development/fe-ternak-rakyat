"use client";

import React from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconBuildingWarehouse,
  IconCircleCheck,
  IconCircleX,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { SectionCard } from "../ui/SectionCard";
import { GpsPicker } from "../ui/GpsPicker";
import { StatusBadge } from "../ui/StatusBadge";
import {
  KAPASITAS_LABEL,
  type Kandang,
  type KapasitasKandang,
} from "../../hooks/useTernakRakyat";

type Props = {
  list: Kandang[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, next: Kandang) => void;
};

export function StepKandang({ list, onAdd, onRemove, onChange }: Props) {
  const [active, setActive] = React.useState<string>(list[0]?.id ?? "");

  // Make sure the active tab always points to a real item (after add/remove).
  React.useEffect(() => {
    if (!list.find((k) => k.id === active) && list[0]) {
      setActive(list[0].id);
    }
  }, [list, active]);

  const updateKandang = (id: string, patch: Partial<Kandang>) => {
    const current = list.find((k) => k.id === id);
    if (!current) return;
    onChange(id, { ...current, ...patch });
  };

  const isComplete = (k: Kandang) =>
    k.lokasi.lat !== null &&
    k.lokasi.lng !== null &&
    k.lokasi.alamat.trim().length >= 3 &&
    k.kapasitas !== "";

  return (
    <Stack gap="md">
      <SectionCard
        title="Daftar Kandang"
        description="Tambahkan satu atau lebih kandang. Setiap kandang dapat memiliki lokasi dan kapasitas yang berbeda."
        icon={IconBuildingWarehouse}
        actions={
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            color="primary"
            onClick={onAdd}
          >
            Tambah Kandang
          </Button>
        }
      >
        <Tabs
          value={active}
          onChange={(v) => v && setActive(v)}
          variant="pills"
          radius="md"
          color="primary"
        >
          <Tabs.List>
            {list.map((k, i) => {
              const complete = isComplete(k);
              return (
                <Tabs.Tab
                  key={k.id}
                  value={k.id}
                  leftSection={
                    complete ? (
                      <IconCircleCheck size={14} color="var(--app-primary)" />
                    ) : (
                      <IconCircleX size={14} color="var(--app-text-subtle)" />
                    )
                  }
                >
                  {k.nama || `Kandang ${i + 1}`}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs>
      </SectionCard>

      {list.map((k, i) => (
        <Box key={k.id} style={{ display: k.id === active ? "block" : "none" }}>
          <SectionCard
            title={k.nama || `Kandang ${i + 1}`}
            description="Isi nama, koordinat GPS, dan kapasitas kandang."
            icon={IconBuildingWarehouse}
            actions={
              <Tooltip label={list.length === 1 ? "Minimal 1 kandang" : "Hapus kandang"}>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onRemove(k.id)}
                  disabled={list.length === 1}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            }
          >
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <TextInput
                    label="Nama Kandang"
                    placeholder={`cth: Kandang Utama`}
                    value={k.nama}
                    onChange={(e) => updateKandang(k.id, { nama: e.currentTarget.value })}
                    description="Beri nama yang mudah dikenali oleh Anda dan petugas."
                  />
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap={6}>
                  <Text fz="sm" fw={500}>
                    Kapasitas Kandang
                    <Text component="span" c="red" inherit>{" *"}</Text>
                  </Text>
                  <SegmentedControl
                    fullWidth
                    value={k.kapasitas}
                    onChange={(v) =>
                      updateKandang(k.id, { kapasitas: v as KapasitasKandang })
                    }
                    data={(Object.keys(KAPASITAS_LABEL) as KapasitasKandang[]).map(
                      (key) => ({ value: key, label: KAPASITAS_LABEL[key] })
                    )}
                    color="primary"
                  />
                  <Text fz="xs" c="dimmed">
                    Pilih sesuai jumlah ayam maksimum yang bisa ditampung.
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={12}>
                <GpsPicker
                  value={k.lokasi}
                  onChange={(next) =>
                    updateKandang(k.id, { lokasi: next })
                  }
                  withAsterisk
                />
              </Grid.Col>
            </Grid>
          </SectionCard>
        </Box>
      ))}

      <Card
        padding="md"
        radius="md"
        withBorder
        style={{ background: "var(--app-surface-sunken)" }}
      >
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Text fz="sm" c="dimmed">
            Ringkasan pengisian:
          </Text>
          <Group gap="xs">
            {list.map((k, i) => {
              const ok = isComplete(k);
              return (
                <Badge
                  key={k.id}
                  size="sm"
                  radius="sm"
                  variant="light"
                  color={ok ? "primary" : "gray"}
                >
                  {k.nama || `Kandang ${i + 1}`}: {ok ? "Lengkap" : "Belum"}
                </Badge>
              );
            })}
          </Group>
        </Group>
      </Card>
    </Stack>
  );
}
