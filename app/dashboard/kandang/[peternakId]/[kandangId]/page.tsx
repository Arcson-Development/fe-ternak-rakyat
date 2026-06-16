"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Anchor,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconBolt,
  IconBuildingWarehouse,
  IconExternalLink,
  IconMapPin,
  IconPhoto,
  IconTool,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import {
  DAFTAR_KEMITRAAN,
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  KONDISI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  usePeternakList,
  useTernakStore,
  type Kandang,
  type Peternak,
} from "../../../../../hooks/useTernakRakyat";
import { PageHeader } from "../../../../../components/ui/PageHeader";
import { StatCard } from "../../../../../components/ui/StatCard";
import { StatusBadge } from "../../../../../components/ui/StatusBadge";
import { ConditionBar } from "../../../../../components/ui/ConditionBar";
import { PhotoLightbox, PhotoThumb, type PhotoItem } from "../../../../../components/ui/PhotoLightbox";

const MapPicker = dynamic(
  () => import("../../../../../components/map/MapPicker").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 320,
          background: "var(--app-surface-sunken)",
          border: "1px dashed var(--app-border)",
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          color: "var(--app-text-subtle)",
          fontSize: 12,
        }}
      >
        Memuat peta...
      </div>
    ),
  }
);

export default function KandangDetailPage() {
  const router = useRouter();
  const params = useParams<{ peternakId: string; kandangId: string }>();
  const list = usePeternakList();
  const updateKandang = useTernakStore((s) => s.update);
  const [lightboxPhotos, setLightboxPhotos] = useState<PhotoItem[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = (photos: PhotoItem[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const [peternak, setPeternak] = useState<Peternak | null>(null);
  const [kandang, setKandang] = useState<Kandang | null>(null);
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

  useEffect(() => {
    const p = list.find((x) => x.id === params.peternakId) ?? null;
    const k = p?.kandang.find((x) => x.id === params.kandangId) ?? null;
    setPeternak(p);
    setKandang(k);
  }, [params.peternakId, params.kandangId, list]);

  if (!peternak || !kandang) {
    return (
      <Container size="md">
        <Stack align="center" mt="xl" gap="md">
          <ThemeIcon size={56} variant="light" color="gray" radius="xl">
            <IconBuildingWarehouse size={28} />
          </ThemeIcon>
          <Text fz="lg" fw={700}>Kandang tidak ditemukan</Text>
          <Button
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => router.push("/dashboard/kandang")}
          >
            Kembali ke master
          </Button>
        </Stack>
      </Container>
    );
  }

  const handleDelete = () => {
    if (!peternak || !kandang) return;
    const next = {
      ...peternak,
      kandang: peternak.kandang.filter((k) => k.id !== kandang.id),
    };
    updateKandang(peternak.id, { kandang: next.kandang });
    notifications.show({
      title: "Kandang dihapus",
      message: `Kandang ${kandang.nama || "(tanpa nama)"} telah dihapus.`,
      color: "green",
      icon: <IconBuildingWarehouse size={16} />,
    });
    closeConfirm();
    router.push("/dashboard/kandang");
  };

  return (
    <Container size="xl" px={0}>
      <Stack gap="lg">
        <Breadcrumbs separator="·" mb="xs">
          <Anchor fz="xs" c="dimmed" onClick={() => router.push("/dashboard/kandang")}>
            Master Kandang
          </Anchor>
          <Text fz="xs" c="dimmed">
            {kandang.nama || `Kandang`}
          </Text>
        </Breadcrumbs>

        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Group gap="md">
            <ThemeIcon size={48} radius="md" variant="light" color="primary">
              <IconBuildingWarehouse size={24} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text fz="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.08em" }}>
                Kandang · {KAPASITAS_LABEL[kandang.kapasitas]}
              </Text>
              <Text fz={26} fw={700} lh={1.1}>
                {kandang.nama || `Kandang ${peternak.kandang.indexOf(kandang) + 1}`}
              </Text>
              <Group gap="xs" mt={2}>
                <Avatar size={20} color="primary" variant="light" radius="xl">
                  {peternak.nama.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </Avatar>
                <Text fz="sm" c="dimmed">
                  Milik {peternak.nama}
                </Text>
                <Button
                  variant="subtle"
                  size="compact-xs"
                  rightSection={<IconExternalLink size={10} />}
                  onClick={() => router.push(`/dashboard/peternak/${peternak.id}`)}
                >
                  Lihat profil
                </Button>
              </Group>
            </Stack>
          </Group>

          <Group gap="xs">
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => router.push("/dashboard/kandang")}
            >
              Kembali
            </Button>
            <Button
              variant="default"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={openConfirm}
            >
              Hapus
            </Button>
          </Group>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Status"
              value={STATUS_OPERASIONAL_LABEL[kandang.statusOperasional]}
              icon={IconBolt}
              iconColor={kandang.statusOperasional === "operasi" ? "accent" : "gray"}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Kapasitas"
              value={KAPASITAS_LABEL[kandang.kapasitas]}
              icon={IconBuildingWarehouse}
              iconColor="blue"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Jenis Usaha"
              value={
                kandang.jenisUsaha
                  ? JENIS_USAHA_LABEL[kandang.jenisUsaha]
                  : "—"
              }
              icon={IconTool}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Jumlah Ayam"
              value={
                kandang.jumlahAyam
                  ? KAPASITAS_LABEL[kandang.jumlahAyam]
                  : "—"
              }
              icon={IconPhoto}
            />
          </Grid.Col>
        </Grid>

        <Tabs defaultValue="lokasi" variant="outline" radius="md">
          <Tabs.List>
            <Tabs.Tab value="lokasi" leftSection={<IconMapPin size={14} />}>Lokasi</Tabs.Tab>
            <Tabs.Tab value="kondisi" leftSection={<IconBuildingWarehouse size={14} />}>Kondisi</Tabs.Tab>
            <Tabs.Tab value="peralatan" leftSection={<IconTool size={14} />}>Peralatan</Tabs.Tab>
            <Tabs.Tab value="operasional" leftSection={<IconBolt size={14} />}>Operasional</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="lokasi" pt="md">
            <Card padding="lg" radius="md" withBorder shadow="xs">
              <Stack gap="md">
                <Stack gap={4}>
                  <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
                    Alamat
                  </Text>
                  <Text fz="md" fw={500}>{kandang.lokasi.alamat || "—"}</Text>
                </Stack>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Stack gap={4}>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
                      Latitude
                    </Text>
                    <Text fz="md" ff="monospace">
                      {kandang.lokasi.lat !== null ? kandang.lokasi.lat.toFixed(6) : "—"}
                    </Text>
                  </Stack>
                  <Stack gap={4}>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
                      Longitude
                    </Text>
                    <Text fz="md" ff="monospace">
                      {kandang.lokasi.lng !== null ? kandang.lokasi.lng.toFixed(6) : "—"}
                    </Text>
                  </Stack>
                </SimpleGrid>
                {kandang.lokasi.lat !== null && kandang.lokasi.lng !== null ? (
                  <MapPicker
                    value={{ lat: kandang.lokasi.lat, lng: kandang.lokasi.lng, alamat: kandang.lokasi.alamat }}
                    onChange={() => {}}
                    height={320}
                  />
                ) : (
                  <Box
                    style={{
                      height: 320,
                      border: "1px dashed var(--app-border)",
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      color: "var(--app-text-subtle)",
                      background: "var(--app-surface-sunken)",
                    }}
                  >
                    Tidak ada koordinat
                  </Box>
                )}
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="kondisi" pt="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <ConditionCard
                title="Dinding"
                kondisi={kandang.kondisi.dinding.kondisi}
                foto={kandang.kondisi.dinding.foto.preview}
              />
              <ConditionCard
                title="Atap"
                kondisi={kandang.kondisi.atap.kondisi}
                foto={kandang.kondisi.atap.foto.preview}
              />
              <ConditionCard
                title="Lantai"
                kondisi={kandang.kondisi.lantai.kondisi}
                foto={kandang.kondisi.lantai.foto.preview}
              />
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="peralatan" pt="md">
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
              <ConditionCard
                title="Tempat Minum"
                kondisi={kandang.peralatan.tempatMinum.kondisi}
                foto={kandang.peralatan.tempatMinum.foto.preview}
                compact
              />
              <ConditionCard
                title="Tempat Makan"
                kondisi={kandang.peralatan.tempatMakan.kondisi}
                foto={kandang.peralatan.tempatMakan.foto.preview}
                compact
              />
              <ConditionCard
                title="Brooding/Pemanas"
                kondisi={kandang.peralatan.brooding.kondisi}
                foto={kandang.peralatan.brooding.foto.preview}
                compact
              />
              <ConditionCard
                title="Kipas"
                kondisi={kandang.peralatan.kipas.kondisi}
                foto={kandang.peralatan.kipas.foto.preview}
                compact
              />
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="operasional" pt="md">
            <Card padding="lg" radius="md" withBorder shadow="xs">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
                      Status
                    </Text>
                    <StatusBadge
                      variant="custom"
                      label={STATUS_OPERASIONAL_LABEL[kandang.statusOperasional]}
                      color={kandang.statusOperasional === "operasi" ? "accent" : "gray"}
                    />
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
                      Jumlah Ayam
                    </Text>
                    <Text fz="md" fw={500}>
                      {kandang.jumlahAyam
                        ? KAPASITAS_LABEL[kandang.jumlahAyam]
                        : "—"}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
                      Jenis Usaha
                    </Text>
                    <Text fz="md" fw={500}>
                      {kandang.jenisUsaha
                        ? JENIS_USAHA_LABEL[kandang.jenisUsaha]
                        : "—"}
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Stack gap={4}>
                    <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: "0.04em" }}>
                      Nama Kemitraan
                    </Text>
                    <Text fz="md" fw={500}>
                      {kandang.kemitraan || "—"}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <Modal
        opened={confirmOpen}
        onClose={closeConfirm}
        title="Hapus kandang ini?"
        size="sm"
      >
        <Stack gap="md">
          <Text fz="sm">
            Tindakan ini akan menghapus{" "}
            <Text component="span" fw={700}>
              {kandang.nama || "kandang ini"}
            </Text>{" "}
            dari data {peternak.nama}. Tindakan tidak dapat dibatalkan.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={closeConfirm}>
              Batal
            </Button>
            <Button color="red" leftSection={<IconTrash size={14} />} onClick={handleDelete}>
              Hapus Permanen
            </Button>
          </Group>
        </Stack>
      </Modal>
    <PhotoLightbox
        photos={lightboxPhotos}
        opened={lightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </Container>
  );
}

function ConditionCard({
  title,
  kondisi,
  foto,
  compact = false,
}: {
  title: string;
  kondisi: string;
  foto: string | null | undefined;
  compact?: boolean;
}) {
  return (
    <Card padding="md" radius="md" withBorder shadow="xs" h="100%">
      <Stack gap="sm" h="100%">
        <Group justify="space-between" align="center">
          <Text fz="sm" fw={600} tt="uppercase" style={{ letterSpacing: "0.04em" }}>
            {title}
          </Text>
          <StatusBadge
            variant="custom"
            label={KONDISI_LABEL[kondisi as keyof typeof KONDISI_LABEL] || "—"}
            color={kondisi === "baik" ? "primary" : kondisi === "sedang" ? "accent" : "red"}
          />
        </Group>
        {foto ? (
          <Image
            src={foto}
            alt={title}
            radius="sm"
            h={compact ? 100 : 180}
            fit="cover"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            style={{
              height: compact ? 100 : 180,
              background: "var(--app-surface-sunken)",
              border: "1px dashed var(--app-border)",
              borderRadius: 6,
              display: "grid",
              placeItems: "center",
              color: "var(--app-text-subtle)",
            }}
          >
            <Stack gap={2} align="center">
              <IconPhoto size={18} />
              <Text fz="xs">Tidak ada foto</Text>
            </Stack>
          </Box>
        )}
        {kondisi && <ConditionBar kondisi={kondisi as any} />}
      </Stack>
    </Card>
  );
}
