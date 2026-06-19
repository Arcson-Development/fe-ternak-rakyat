"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconHome,
  IconId,
  IconMapPin,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";
import { useFormById } from "../../../../hooks/useTernakRakyat";
import type {
  FormItem,
  FormKandangItem,
} from "../../../../lib/api";

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE || "";

/**
 * Public detail of a single registration, fetched from
 * `/form/get-by-id/{id}` with the same petenak token as the wizard
 * and the list page. The form data is rendered using the BACKEND's
 * field names (snake_case) directly — no mapping to the local
 * `Peternak` type, since this is a read-only view.
 *
 * Photos come back as relative paths like "ktp/20260619_xxx.jpg";
 * the full URL is `NEXT_PUBLIC_IMAGE_BASE + "/" + path`.
 */
export default function FormDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: form, isLoading, isError, error, refetch } = useFormById(id);

  return (
    <Box className="pendaftaran-shell">
      <Box className="pendaftaran-topbar">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              onClick={() => router.push("/pendaftaran/daftar")}
              aria-label="Kembali ke daftar"
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Text fw={700} fz="md">
              SITERNAK — Detail Pendaftaran
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              onClick={() => router.push("/")}
              aria-label="Beranda"
            >
              <IconHome size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      <Container size="lg" py="md">
        {/* Error */}
        {isError && (
          <Card
            withBorder
            padding="md"
            radius="md"
            style={{ borderColor: "var(--mantine-color-red-3)" }}
          >
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <IconAlertCircle color="var(--mantine-color-red-6)" />
                <Stack gap={0}>
                  <Text fw={600} fz="sm" c="red.7">
                    Gagal memuat detail
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {(error as Error)?.message ||
                      "Pendaftaran tidak ditemukan atau telah dihapus."}
                  </Text>
                </Stack>
              </Group>
              <Group gap="xs">
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => refetch()}
                >
                  Coba lagi
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => router.push("/pendaftaran/daftar")}
                >
                  Ke daftar
                </Button>
              </Group>
            </Group>
          </Card>
        )}

        {/* Loading skeleton */}
        {isLoading && <DetailSkeleton />}

        {/* Loaded content */}
        {!isLoading && !isError && form && (
          <Stack gap="md">
            <DetailHeader form={form} />
            <IdentitasCard form={form} />
            {form.form_peternakan_kandang.map((k: FormKandangItem, i: number) => (
              <KandangCard key={k.id} index={i} kandang={k} />
            ))}
            <Group justify="center" mt="md">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={14} />}
                onClick={() => router.push("/pendaftaran/daftar")}
              >
                Kembali ke daftar
              </Button>
            </Group>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

// ================== subcomponents ==================

function DetailHeader({ form }: { form: FormItem }) {
  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Group gap="xs">
            <Text fz="xs" c="dimmed" fw={600} tt="uppercase">
              Pendaftaran
            </Text>
            <Badge variant="light" color="primary" size="sm">
              #{form.id}
            </Badge>
          </Group>
          <Text fz="xl" fw={700}>
            {form.nama}
          </Text>
          <Group gap="md" c="dimmed">
            <Group gap={4}>
              <IconCalendar size={14} />
              <Text fz="xs">
                {new Date(form.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Group>
            <Group gap={4}>
              <IconUser size={14} />
              <Text fz="xs">{form.kategori_peternak}</Text>
            </Group>
            <Group gap={4}>
              <IconMapPin size={14} />
              <Text fz="xs">
                {form.kabupaten}, {form.provinsi}
              </Text>
            </Group>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

function IdentitasCard({ form }: { form: FormItem }) {
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="md">
        <Group gap="sm">
          <IconId size={18} color="var(--mantine-color-primary-6)" />
          <Text fw={700}>Identitas Peternak</Text>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Nama Lengkap" value={form.nama} />
            <Field label="No. KTP" value={form.ktp_no} mono />
            <Field label="Kategori" value={form.kategori_peternak} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Provinsi" value={form.provinsi} />
            <Field label="Kabupaten" value={form.kabupaten} />
            <Field label="Kecamatan" value={form.kecamatan} />
            <Field label="Kelurahan" value={form.kelurahan} />
            <Field label="Alamat" value={form.alamat} />
          </Grid.Col>
        </Grid>

        <Divider />

        <Stack gap={6}>
          <Text fz="xs" fw={600} c="dimmed" tt="uppercase">
            Foto KTP
          </Text>
          {form.ktp_foto ? (
            <a
              href={`${IMAGE_BASE}/${form.ktp_foto}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", maxWidth: 320 }}
            >
              <img
                src={`${IMAGE_BASE}/${form.ktp_foto}`}
                alt={`KTP ${form.nama}`}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: 8,
                  border: "1px solid var(--app-border)",
                }}
              />
            </a>
          ) : (
            <Text fz="sm" c="dimmed">
              Tidak ada foto KTP
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

function KandangCard({
  index,
  kandang,
}: {
  index: number;
  kandang: FormKandangItem;
}) {
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="md">
        <Group gap="sm">
          <Badge variant="light" color="primary" size="md">
            Kandang #{index + 1}
          </Badge>
          <Text fw={600}>
            {kandang.is_operating ? "Sedang Operasi" : "Tidak Beroperasi"}
          </Text>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Lokasi (Lat, Lng)"
              value={
                kandang.latitude && kandang.longitude
                  ? `${kandang.latitude}, ${kandang.longitude}`
                  : "—"
              }
              mono
            />
            <Field label="Kapasitas" value={kandang.kapasitas || "—"} />
          </Grid.Col>
          {kandang.is_operating && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field label="Jumlah Ayam" value={kandang.jml_ayam || "—"} />
              <Field label="Jenis Usaha" value={kandang.jenis_usaha || "—"} />
              {kandang.jenis_kemitraan && (
                <Field
                  label="Kemitraan"
                  value={kandang.jenis_kemitraan}
                />
              )}
            </Grid.Col>
          )}
        </Grid>

        <Divider />

        {/* Kondisi */}
        <Stack gap={8}>
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" lts="0.06em">
            Kondisi Fisik
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            <PhotoMiniField
              label="Dinding"
              kondisi={kandang.dinding}
              photoPath={kandang.dinding_foto}
            />
            <PhotoMiniField
              label="Atap"
              kondisi={kandang.atap}
              photoPath={kandang.atap_foto}
            />
            <PhotoMiniField
              label="Lantai"
              kondisi={kandang.lantai}
              photoPath={kandang.lantai_foto}
            />
          </SimpleGrid>
        </Stack>

        {/* Peralatan */}
        <Stack gap={8}>
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" lts="0.06em">
            Peralatan
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <PhotoMiniField
              label="Tempat Minum"
              kondisi={kandang.tmp_mnm}
              photoPath={kandang.tmp_mnm_foto}
            />
            <PhotoMiniField
              label="Tempat Makan"
              kondisi={kandang.tmp_mkn}
              photoPath={kandang.tmp_mkn_foto}
            />
            <PhotoMiniField
              label="Brooding / Pemanas"
              kondisi={kandang.brooding}
              photoPath={kandang.brooding_foto}
            />
            <PhotoMiniField
              label="Kipas / Ventilasi"
              kondisi={kandang.kipas}
              photoPath={kandang.kipas_foto}
            />
          </SimpleGrid>
        </Stack>
      </Stack>
    </Card>
  );
}

function PhotoMiniField({
  label,
  kondisi,
  photoPath,
}: {
  label: string;
  kondisi: string;
  photoPath: string;
}) {
  const url = photoPath ? `${IMAGE_BASE}/${photoPath}` : "";
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
          <Badge
            color={
              kondisi === "Baik"
                ? "green"
                : kondisi === "Sedang"
                ? "yellow"
                : kondisi === "Rusak"
                ? "red"
                : "gray"
            }
            variant="light"
            size="sm"
          >
            {kondisi || "—"}
          </Badge>
        </Group>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block" }}
          >
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
                src={url}
                alt={label}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          </a>
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
      </Stack>
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <Group gap="sm" align="flex-start" wrap="nowrap" mb={6}>
      <Text fz="xs" fw={600} c="dimmed" w={120} style={{ paddingTop: 2 }}>
        {label.toUpperCase()}
      </Text>
      <Text
        fz="sm"
        fw={500}
        style={{
          fontFamily: mono ? "monospace" : undefined,
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Text>
    </Group>
  );
}

function DetailSkeleton() {
  return (
    <Stack gap="md">
      <Card withBorder padding="md" radius="md">
        <Stack gap="sm">
          <Skeleton h={20} w="40%" />
          <Skeleton h={32} w="60%" />
          <Skeleton h={14} w="80%" />
        </Stack>
      </Card>
      <Card withBorder padding="md" radius="md">
        <Stack gap="sm">
          <Skeleton h={20} w="30%" />
          <Skeleton h={14} w="50%" />
          <Skeleton h={14} w="70%" />
          <Skeleton h={14} w="60%" />
        </Stack>
      </Card>
    </Stack>
  );
}
