"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCalendar,
  IconHome,
  IconId,
  IconMapPin,
  IconNotes,
  IconUser,
} from "@tabler/icons-react";
import {
  useFormById,
  formItemToPeternak,
  type Peternak,
  type Kandang,
  type PhotoRef,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  JENIS_USAHA_LABEL,
  kemitraanLabel,
  KONDISI_LABEL,
} from "../../../../hooks/useTernakRakyat";

/**
 * Public detail of a single registration, served from the SAME
 * local Zustand store the admin `/dashboard/peternak/[id]` page
 * reads (`usePeternakList` -> find by id). Uses the local
 * `Peternak` shape — field names are camelCase and photos are
 * blob URLs that survive only within a session (they get wiped
 * from the persisted draft after submit, and IDB photos get
 * cleared too, so restored entries show a "Tidak ada foto"
 * placeholder).
 */
// Named export so `app/.../page.tsx` can dynamic-load this with
// ssr: false. Same React #418/#423 hydration fix as the admin
// detail page.
export function FormDetailClient() {
  return <FormDetailPage />;
}

function FormDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  // Fetch directly from the backend by id, then transform the
  // snake_case FormItem envelope into the local Peternak shape the
  // rest of this page (rendering, status badges, photos as
  // ${IMAGE_BASE}/<path>) was built around.
  const { data: formData, isLoading, isError, error, refetch } = useFormById(
    id
  );
  const form: Peternak | null = formData ? formItemToPeternak(formData) : null;

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
        {/* Loading skeleton */}
        {(!hydrated || isLoading) && <DetailSkeleton />}

        {/* Not found / error */}
        {hydrated && !isLoading && (isError || !form) && (
          <Card withBorder padding="xl" radius="md" style={{ textAlign: "center" }}>
            <Stack align="center" gap="sm">
              <Text fw={600}>Pendaftaran tidak ditemukan</Text>
              <Text fz="sm" c="dimmed">
                {(error as Error)?.message ||
                  `ID "${id}" tidak ditemukan di server.`}
              </Text>
              <Button
                variant="light"
                leftSection={<IconArrowLeft size={14} />}
                onClick={() => router.push("/pendaftaran/daftar")}
                mt="xs"
              >
                Kembali ke daftar
              </Button>
            </Stack>
          </Card>
        )}

        {/* Loaded content */}
        {hydrated && !isLoading && form && (
          <Stack gap="md">
            <DetailHeader form={form} />
            <IdentitasCard form={form} />
            {form.kandang.map((k, i) => (
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

function DetailHeader({ form }: { form: Peternak }) {
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap={4}>
        <Group gap="xs">
          <Text fz="xs" c="dimmed" fw={600} tt="uppercase">
            Pendaftaran
          </Text>
          <Badge variant="light" color="primary" size="sm">
            #{String(form.id)}
          </Badge>
        </Group>
        <Text fz="xl" fw={700}>
          {form.nama}
        </Text>
        <Group gap="md" c="dimmed">
          <Group gap={4}>
            <IconCalendar size={14} />
            <Text fz="xs">
              {new Date(form.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </Group>
          <Group gap={4}>
            <IconUser size={14} />
            <Text fz="xs">{KATEGORI_LABEL[form.kategori] || "—"}</Text>
          </Group>
          <Group gap={4}>
            <IconMapPin size={14} />
            <Text fz="xs">
              {form.alamat.kabupaten?.name
                ? `${form.alamat.kabupaten.name}, ${form.alamat.provinsi?.name ?? ""}`
                : "—"}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

function IdentitasCard({ form }: { form: Peternak }) {
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
            <Field label="No. KTP" value={form.noKtp} mono />
            <Field
              label="Kategori"
              value={KATEGORI_LABEL[form.kategori] || "—"}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Provinsi"
              value={form.alamat.provinsi?.name ?? "—"}
            />
            <Field
              label="Kabupaten"
              value={form.alamat.kabupaten?.name ?? "—"}
            />
            <Field
              label="Kecamatan"
              value={form.alamat.kecamatan?.name ?? "—"}
            />
            <Field
              label="Kelurahan"
              value={form.alamat.kelurahan?.name ?? "—"}
            />
            <Field label="Alamat" value={form.alamat.detail} />
          </Grid.Col>
        </Grid>

        {form.catatan && (
          <>
            <Divider />
            <Stack gap={6}>
              <Group gap="xs">
                <IconNotes size={14} color="var(--mantine-color-primary-6)" />
                <Text fz="xs" fw={600} c="dimmed" tt="uppercase">
                  Catatan
                </Text>
              </Group>
              <Text
                fz="sm"
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  padding: "10px 12px",
                  background: "var(--app-surface-sunken)",
                  border: "1px solid var(--app-border)",
                  borderRadius: 8,
                }}
              >
                {form.catatan}
              </Text>
            </Stack>
          </>
        )}

        <Divider />

        <Stack gap={6}>
          <Text fz="xs" fw={600} c="dimmed" tt="uppercase">
            Foto KTP
          </Text>
          {form.ktp.preview ? (
            <Box style={{ maxWidth: 320 }}>
              <img
                src={form.ktp.preview}
                alt={`KTP ${form.nama}`}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: 8,
                  border: "1px solid var(--app-border)",
                }}
              />
            </Box>
          ) : (
            <Text fz="sm" c="dimmed">
              Tidak ada foto KTP
            </Text>
          )}
          {form.ktp.name && (
            <Text fz="xs" c="dimmed" lineClamp={1} title={form.ktp.name}>
              {form.ktp.name}
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

function KandangCard({ index, kandang }: { index: number; kandang: Kandang }) {
  const isOps = kandang.statusOperasional === "operasi";
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="md">
        <Group gap="sm">
          <Badge variant="light" color="primary" size="md">
            Kandang #{index + 1}
          </Badge>
          <Text fw={600}>{kandang.nama || "(tanpa nama)"}</Text>
          <Badge
            color={isOps ? "green" : "gray"}
            variant="light"
            size="sm"
          >
            {STATUS_OPERASIONAL_LABEL[kandang.statusOperasional]}
          </Badge>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field
              label="Lokasi (Lat, Lng)"
              value={
                kandang.lokasi.lat !== null && kandang.lokasi.lng !== null
                  ? `${kandang.lokasi.lat}, ${kandang.lokasi.lng}`
                  : "—"
              }
              mono
            />
            <Field
              label="Alamat"
              value={kandang.lokasi.alamat || "—"}
            />
            <Field
              label="Kapasitas"
              value={KAPASITAS_LABEL[kandang.kapasitas as keyof typeof KAPASITAS_LABEL] || "—"}
            />
          </Grid.Col>
          {isOps && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Field
                label="Jumlah Ayam"
                value={KAPASITAS_LABEL[kandang.jumlahAyam as keyof typeof KAPASITAS_LABEL] || "—"}
              />
              <Field
                label="Jenis Usaha"
                value={JENIS_USAHA_LABEL[kandang.jenisUsaha] || "—"}
              />
              {kandang.jenisUsaha === "kemitraan" && (
                <Field
                  label="Kemitraan"
                  value={kemitraanLabel(kandang.kemitraan)}
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
              kondisi={kandang.kondisi.dinding.kondisi}
              foto={kandang.kondisi.dinding.foto}
            />
            <PhotoMiniField
              label="Atap"
              kondisi={kandang.kondisi.atap.kondisi}
              foto={kandang.kondisi.atap.foto}
            />
            <PhotoMiniField
              label="Lantai"
              kondisi={kandang.kondisi.lantai.kondisi}
              foto={kandang.kondisi.lantai.foto}
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
              kondisi={kandang.peralatan.tempatMinum.kondisi}
              foto={kandang.peralatan.tempatMinum.foto}
            />
            <PhotoMiniField
              label="Tempat Makan"
              kondisi={kandang.peralatan.tempatMakan.kondisi}
              foto={kandang.peralatan.tempatMakan.foto}
            />
            <PhotoMiniField
              label="Brooding / Pemanas"
              kondisi={kandang.peralatan.brooding.kondisi}
              foto={kandang.peralatan.brooding.foto}
            />
            <PhotoMiniField
              label="Kipas / Ventilasi"
              kondisi={kandang.peralatan.kipas.kondisi}
              foto={kandang.peralatan.kipas.foto}
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
  foto,
}: {
  label: string;
  kondisi: "" | "baik" | "sedang" | "rusak";
  foto: PhotoRef;
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
          <Badge
            color={
              kondisi === "baik"
                ? "green"
                : kondisi === "sedang"
                ? "yellow"
                : kondisi === "rusak"
                ? "red"
                : "gray"
            }
            variant="light"
            size="sm"
          >
            {KONDISI_LABEL[kondisi] || "—"}
          </Badge>
        </Group>
        {foto.preview ? (
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
              src={foto.preview}
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
        {foto.name && (
          <Text fz="xs" c="dimmed" lineClamp={1} title={foto.name}>
            {foto.name}
          </Text>
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
