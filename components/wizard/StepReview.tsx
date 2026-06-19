"use client";

import React from "react";
import {
  Box,
  Card,
  Divider,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBuildingWarehouse,
  IconEdit,
  IconId,
  IconMapPin,
  IconShieldCheck,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { SectionCard } from "../ui/SectionCard";
import { StatusBadge } from "../ui/StatusBadge";
import {
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  kemitraanLabel,
  type KategoriPeternak,
  type Kandang,
} from "../../hooks/useTernakRakyat";
import type { RegionRef } from "../../hooks/useTernakRakyat";

type Identitas = {
  nama: string;
  noKtp: string;
  ktp: { id: string; preview: string | null; name?: string };
  kategori: KategoriPeternak | "";
  alamat: {
    provinsi: RegionRef | null;
    kabupaten: RegionRef | null;
    kecamatan: RegionRef | null;
    kelurahan: RegionRef | null;
    detail: string;
  };
};

type Props = {
  identitas: Identitas;
  kandangList: Kandang[];
  onJumpTo: (step: number) => void;
};

export function StepReview({ identitas, kandangList, onJumpTo }: Props) {
  return (
    <Stack gap="md">
      {/* Identitas */}
      <SectionCard
        title="Identitas Peternak"
        icon={IconUser}
        actions={
          <EditButton onClick={() => onJumpTo(0)} />
        }
      >
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Nama" value={identitas.nama} />
            <Field label="No. KTP" value={identitas.noKtp} mono />
            <Field
              label="Kategori"
              value={identitas.kategori ? KATEGORI_LABEL[identitas.kategori] : "—"}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Provinsi" value={identitas.alamat.provinsi?.name ?? "—"} />
            <Field label="Kabupaten" value={identitas.alamat.kabupaten?.name ?? "—"} />
            <Field label="Kecamatan" value={identitas.alamat.kecamatan?.name ?? "—"} />
            <Field label="Kelurahan" value={identitas.alamat.kelurahan?.name ?? "—"} />
            <Field label="Alamat" value={identitas.alamat.detail} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group gap="sm" align="flex-start">
              <Text fz="xs" fw={600} c="dimmed" w={120}>
                FOTO KTP
              </Text>
              {identitas.ktp.preview ? (
                <Box
                  style={{
                    width: 180,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid var(--app-border)",
                  }}
                >
                  <img
                    src={identitas.ktp.preview}
                    alt="KTP"
                    style={{ width: "100%", display: "block" }}
                  />
                </Box>
              ) : (
                <Text fz="sm" c="dimmed">
                  Tidak ada foto
                </Text>
              )}
            </Group>
          </Grid.Col>
        </Grid>
      </SectionCard>

      {/* Kandang */}
      <SectionCard
        title="Daftar Kandang"
        description={`${kandangList.length} kandang akan didaftarkan.`}
        icon={IconBuildingWarehouse}
        iconColor="blue"
        actions={<EditButton onClick={() => onJumpTo(1)} />}
      >
        <Stack gap="sm">
          {kandangList.map((k, i) => (
            <Card
              key={k.id}
              withBorder
              padding="md"
              radius="md"
              style={{ background: "var(--app-surface-sunken)" }}
            >
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
                <Stack gap={2}>
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="primary" radius="xl" size="md">
                      <IconBuildingWarehouse size={14} />
                    </ThemeIcon>
                    <Text fw={700}>{k.nama || `Kandang ${i + 1}`}</Text>
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {k.lokasi.lat !== null && k.lokasi.lng !== null
                      ? `${k.lokasi.lat.toFixed(4)}, ${k.lokasi.lng.toFixed(4)}`
                      : "—"}
                    {k.lokasi.alamat ? ` · ${k.lokasi.alamat}` : ""}
                  </Text>
                </Stack>
                <Group gap="xs">
                  <StatusBadge variant="custom" label={KAPASITAS_LABEL[k.kapasitas as keyof typeof KAPASITAS_LABEL] || "—"} color="primary" />
                  <StatusBadge variant="operasional" value={k.statusOperasional} />
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      </SectionCard>

      {/* Kandang details (kondisi, peralatan, operasional) */}
      {kandangList.map((k, i) => (
        <SectionCard
          key={k.id}
          title={`Kandang ${i + 1}: ${k.nama}`}
          description="Kondisi, peralatan, dan operasional."
          icon={IconUsers}
          iconColor="accent"
          actions={<EditButton onClick={() => onJumpTo(2)} />}
        >
          <Stack gap="md">
            <Box>
              <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6} lts="0.06em">
                Kondisi Fisik
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                <MiniField label="Dinding" value={k.kondisi.dinding.kondisi} />
                <MiniField label="Atap" value={k.kondisi.atap.kondisi} />
                <MiniField label="Lantai" value={k.kondisi.lantai.kondisi} />
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6} lts="0.06em">
                Peralatan
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <MiniField label="Tempat Minum" value={k.peralatan.tempatMinum.kondisi} />
                <MiniField label="Tempat Makan" value={k.peralatan.tempatMakan.kondisi} />
                <MiniField label="Brooding / Pemanas" value={k.peralatan.brooding.kondisi} />
                <MiniField label="Kipas / Ventilasi" value={k.peralatan.kipas.kondisi} />
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6} lts="0.06em">
                Operasional
              </Text>
              <Group gap="sm" wrap="wrap">
                <StatusBadge variant="operasional" value={k.statusOperasional} />
                {k.statusOperasional === "operasi" && (
                  <>
                    <StatusBadge
                      variant="custom"
                      label={`Jumlah: ${KAPASITAS_LABEL[k.jumlahAyam as keyof typeof KAPASITAS_LABEL] || "—"}`}
                      color="primary"
                    />
                    <StatusBadge
                      variant="custom"
                      label={k.jenisUsaha === "kemitraan"
                        ? `Kemitraan: ${kemitraanLabel(k.kemitraan)}`
                        : "Usaha: Mandiri"}
                      color={k.jenisUsaha === "kemitraan" ? "accent" : "primary"}
                    />
                  </>
                )}
              </Group>
            </Box>
          </Stack>
        </SectionCard>
      ))}

      <Card
        padding="md"
        radius="md"
        style={{
          background: "var(--app-primary-soft)",
          border: "1px solid var(--app-primary)",
        }}
      >
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <ThemeIcon variant="filled" color="primary" size="lg" radius="md">
            <IconShieldCheck size={20} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fz="sm" fw={700} c="primary.8">
              Konfirmasi & Simpan
            </Text>
            <Text fz="xs" c="primary.9" lh={1.4}>
              Pastikan seluruh data sudah benar. Data akan tersimpan di
              dasbor admin dan dapat diedit sewaktu-waktu oleh operator.
            </Text>
          </Stack>
        </Group>
      </Card>
    </Stack>
  );
}

// ---------- subcomponents ----------

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Group gap="sm" align="flex-start" wrap="nowrap" mb={6}>
      <Text fz="xs" fw={600} c="dimmed" w={120} style={{ paddingTop: 2 }}>
        {label.toUpperCase()}
      </Text>
      <Text
        fz="sm"
        fw={500}
        style={{ fontFamily: mono ? "monospace" : undefined, wordBreak: "break-word" }}
      >
        {value || "—"}
      </Text>
    </Group>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <Card
      withBorder
      padding="xs"
      radius="md"
      style={{ background: "var(--app-surface)" }}
    >
      <Group justify="space-between" align="center">
        <Text fz="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <StatusBadge variant="kondisi" value={value as any} />
      </Group>
    </Card>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        color: "var(--app-primary)",
        background: "var(--app-primary-soft)",
      }}
    >
      <IconEdit size={12} /> Edit
    </UnstyledButton>
  );
}
