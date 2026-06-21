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
  type Kondisi,
  type Kandang,
  type PhotoRef,
} from "../../hooks/useTernakRakyat";
import type { RegionRef } from "../../hooks/useTernakRakyat";

type Identitas = {
  nama: string;
  noKtp: string;
  ktp: { id: string; preview: string | null; name?: string };
  kategori: KategoriPeternak | "";
  catatan: string;
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
            <Field label="Catatan" value={identitas.catatan} multiline />
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
                <PhotoMiniField
                  label="Dinding"
                  kondisi={k.kondisi.dinding.kondisi}
                  photo={k.kondisi.dinding.foto}
                />
                <PhotoMiniField
                  label="Atap"
                  kondisi={k.kondisi.atap.kondisi}
                  photo={k.kondisi.atap.foto}
                />
                <PhotoMiniField
                  label="Lantai"
                  kondisi={k.kondisi.lantai.kondisi}
                  photo={k.kondisi.lantai.foto}
                />
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb={6} lts="0.06em">
                Peralatan
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <PhotoMiniField
                  label="Tempat Minum"
                  kondisi={k.peralatan.tempatMinum.kondisi}
                  photo={k.peralatan.tempatMinum.foto}
                />
                <PhotoMiniField
                  label="Tempat Makan"
                  kondisi={k.peralatan.tempatMakan.kondisi}
                  photo={k.peralatan.tempatMakan.foto}
                />
                <PhotoMiniField
                  label="Brooding / Pemanas"
                  kondisi={k.peralatan.brooding.kondisi}
                  photo={k.peralatan.brooding.foto}
                />
                <PhotoMiniField
                  label="Kipas / Ventilasi"
                  kondisi={k.peralatan.kipas.kondisi}
                  photo={k.peralatan.kipas.foto}
                />
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

function Field({ label, value, mono, multiline }: { label: string; value: string; mono?: boolean; multiline?: boolean }) {
  if (multiline) {
    return (
      <Box mb="sm">
        <Text fz="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>
          {label}
        </Text>
        <Text
          fz="sm"
          fw={500}
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: value ? "10px 12px" : 0,
            background: value ? "var(--app-surface-sunken)" : "transparent",
            border: value ? "1px solid var(--app-border)" : "none",
            borderRadius: 8,
            fontStyle: value ? "normal" : "italic",
            color: value ? undefined : "var(--mantine-color-dimmed)",
          }}
        >
          {value || "—"}
        </Text>
      </Box>
    );
  }
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

/**
 * Compact card for a kondisi / peralatan field: kondisi badge on top,
 * photo thumbnail below, inline. If no photo was uploaded, falls back
 * to a dashed placeholder so the user can still see the slot existed.
 */
function PhotoMiniField({
  label,
  kondisi,
  photo,
}: {
  label: string;
  kondisi: Kondisi | "";
  photo: PhotoRef;
}) {
  return (
    <Card
      withBorder
      padding="sm"
      radius="md"
      style={{ background: "var(--app-surface)" }}
    >
      <Stack gap={8}>
        <Group justify="space-between" align="center">
          <Text fz="xs" c="dimmed" fw={600}>
            {label}
          </Text>
          <StatusBadge variant="kondisi" value={kondisi as any} />
        </Group>
        {photo.preview ? (
          <Box
            style={{
              width: "100%",
              aspectRatio: "4 / 3",
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid var(--app-border)",
              background: "var(--app-surface-sunken)",
            }}
          >
            <img
              src={photo.preview}
              alt={label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        ) : (
          <Box
            style={{
              width: "100%",
              aspectRatio: "4 / 3",
              borderRadius: 6,
              border: "1px dashed var(--app-border)",
              background: "var(--app-surface-sunken)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text fz="xs" c="dimmed">
              Tidak ada foto
            </Text>
          </Box>
        )}
        {photo.name ? (
          <Text fz="xs" c="dimmed" lineClamp={1} title={photo.name}>
            {photo.name}
          </Text>
        ) : null}
      </Stack>
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