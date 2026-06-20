"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Modal,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconBuildingWarehouse,
  IconCalendar,
  IconCheck,
  IconClipboardList,
  IconCurrentLocation,
  IconDownload,
  IconFileSpreadsheet,
  IconEdit,
  IconFileText,
  IconId,
  IconMapPin,
  IconPhoto,
  IconPrinter,
  IconShare,
  IconShieldCheck,
  IconTool,
  IconTrash,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "../../../../components/ui/PageHeader";
import { StatCard } from "../../../../components/ui/StatCard";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { PhotoLightbox, PhotoThumb, type PhotoItem } from "../../../../components/ui/PhotoLightbox";
import { DetailSkeleton } from "../../../../components/skeletons";
import { EmptyState } from "../../../../components/ui/EmptyState";
import {
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  kemitraanLabel,
  useFormById,
  useDeleteForm,
  formItemToPeternak,
  type Kandang,
  type Peternak,
} from "../../../../hooks/useTernakRakyat";
import { buildSinglePeternakWorkbook, downloadWorkbook, TIMESTAMP } from "../../../../lib/export";

function PeternakDetailContent() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 250);
    return () => clearTimeout(t);
  }, []);
  if (!ready) return <DetailSkeleton />;
  return <PeternakDetailInner />;
}

function PeternakDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<PhotoItem[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = (photos: PhotoItem[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Fetch directly from the backend by id. The transform converts
  // the snake_case FormItem envelope into the local Peternak shape
  // the rest of this page was built around (status badges, lightbox
  // photos via ${IMAGE_BASE}/<path>, etc.).
  const { data: formData, isLoading, isError, error, refetch } = useFormById(
    params.id as string | undefined
  );
  const deleteForm = useDeleteForm();
  const peternak: Peternak | null = formData
    ? formItemToPeternak(formData)
    : null;

  if (isLoading) return <DetailSkeleton />;

  if (isError || !peternak) {
    return (
      <Container size="md">
        <EmptyState
          icon={IconUserCircle}
          title="Peternak tidak ditemukan"
          description={
            (error as Error)?.message ||
            "Data ini mungkin telah dihapus atau tidak tersedia."
          }
          action={
            <Button leftSection={<IconArrowLeft size={14} />} onClick={() => router.push("/dashboard/peternak")}>
              Kembali ke daftar
            </Button>
          }
        />
      </Container>
    );
  }

  const totalKandang = peternak.kandang.length;
  const operasi = peternak.kandang.filter((k) => k.statusOperasional === "operasi").length;
  const kemitraan = peternak.kandang.filter(
    (k) => k.jenisUsaha === "kemitraan"
  ).length;

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `SITERNAK — ${peternak.nama}`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      notifications.show({
        title: "Tautan disalin",
        message: "URL telah disalin ke papan klip.",
        color: "green",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteForm.mutateAsync(peternak.id);
      notifications.show({
        title: "Pendaftaran dihapus",
        message: `${peternak.nama} telah dihapus dari server.`,
        color: "green",
      });
      router.push("/dashboard/peternak");
    } catch (err) {
      notifications.show({
        title: "Gagal menghapus",
        message: (err as Error)?.message || "Periksa koneksi Anda.",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" px={0} className="print-area">
      <Stack gap="md" mb="md" className="no-print-when-needed">
        <Breadcrumbs separator="/">
          <Anchor fz="xs" c="dimmed" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Anchor>
          <Anchor fz="xs" c="dimmed" onClick={() => router.push("/dashboard/peternak")}>
            Peternak
          </Anchor>
          <Text fz="xs" fw={600}>{peternak.nama}</Text>
        </Breadcrumbs>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Group gap="md" wrap="nowrap">
            <Avatar size={56} radius="md" color="primary" variant="light">
              <IconUser size={28} />
            </Avatar>
            <Stack gap={2}>
              <Group gap="sm" wrap="wrap">
                <Title order={2} fz="xl" fw={800}>{peternak.nama}</Title>
                {peternak.kategori && (
                  <StatusBadge
                    variant="custom"
                    label={KATEGORI_LABEL[peternak.kategori]}
                    color="primary"
                  />
                )}
              </Group>
              <Text fz="sm" c="dimmed">
                No. KTP <span style={{ fontFamily: "monospace" }}>{peternak.noKtp}</span> · Terdaftar{" "}
                {new Date(peternak.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            <Tooltip label="Salin tautan / Bagikan">
              <ActionIcon variant="default" size="lg" onClick={handleShare}>
                <IconShare size={16} />
              </ActionIcon>
            </Tooltip>
            <Button
              variant="default"
              leftSection={<IconEdit size={14} />}
              onClick={() => router.push(`/pendaftaran?edit=${peternak.id}`)}
            >
              Edit
            </Button>
            <Button
              variant="default"
              leftSection={<IconPrinter size={14} />}
              onClick={() => window.open(`/dashboard/peternak/${peternak.id}/print`, "_blank")}
            >
              Cetak PDF
            </Button>
            <Button
              variant="default"
              leftSection={<IconDownload size={14} />}
              onClick={() => exportJson(peternak)}
            >
              Ekspor JSON
            </Button>
            <Button
              variant="default"
              leftSection={<IconFileSpreadsheet size={14} />}
              onClick={() => {
                try {
                  const wb = buildSinglePeternakWorkbook(peternak);
                  downloadWorkbook(
                    wb,
                    `siternak-${peternak.nama.replace(/\s+/g, "-")}-${TIMESTAMP()}.xlsx`
                  );
                  notifications.show({
                    title: "Berhasil diekspor",
                    message: `Data ${peternak.nama} disimpan ke Excel.`,
                    color: "green",
                    icon: <IconFileSpreadsheet size={18} />,
                  });
                } catch (e) {
                  notifications.show({
                    title: "Gagal mengekspor",
                    message: "Terjadi kesalahan saat membuat file Excel.",
                    color: "red",
                  });
                }
              }}
            >
              Ekspor Excel
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={14} />}
              onClick={() => setConfirmOpen(true)}
            >
              Hapus
            </Button>
          </Group>
        </Group>
      </Stack>

      {/* Stat cards */}
      <Grid gutter="md" mb="md" className="no-print-when-needed">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Kandang" value={totalKandang} icon={IconBuildingWarehouse} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard label="Sedang Operasi" value={operasi} icon={IconShieldCheck} iconColor="primary" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard label="Kemitraan" value={kemitraan} icon={IconClipboardList} iconColor="accent" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Kandang Tidak Operasi"
            value={totalKandang - operasi}
            icon={IconBuildingWarehouse}
            iconColor="gray"
          />
        </Grid.Col>
      </Grid>

      <Tabs defaultValue="identitas" variant="pills" radius="md">
        <Tabs.List className="no-print-when-needed">
          <Tabs.Tab value="identitas" leftSection={<IconId size={14} />}>
            Identitas
          </Tabs.Tab>
          <Tabs.Tab value="kandang" leftSection={<IconBuildingWarehouse size={14} />}>
            Kandang ({totalKandang})
          </Tabs.Tab>
          <Tabs.Tab value="dokumen" leftSection={<IconFileText size={14} />}>
            Dokumen
          </Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconCalendar size={14} />}>
            Linimasa
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="identitas" pt="md">
          <IdentitasTab p={peternak} onOpenLightbox={openLightbox} />
        </Tabs.Panel>
        <Tabs.Panel value="kandang" pt="md">
          <KandangListTab p={peternak} onOpenLightbox={openLightbox} />
        </Tabs.Panel>
        <Tabs.Panel value="dokumen" pt="md">
          <DokumenTab p={peternak} onOpenLightbox={openLightbox} />
        </Tabs.Panel>
        <Tabs.Panel value="timeline" pt="md">
          <TimelineTab p={peternak} />
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Hapus Pendaftaran"
        centered
      >
        <Stack gap="md">
          <Text fz="sm">
            Yakin ingin menghapus data <strong>{peternak.nama}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
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

function IdentitasTab({ p, onOpenLightbox }: { p: Peternak; onOpenLightbox: (photos: PhotoItem[], index: number) => void }) {
  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Card withBorder padding="lg" radius="md" shadow="xs">
          <Group gap="sm" mb="md">
            <ThemeIcon variant="light" color="primary" size="lg" radius="md">
              <IconUserCircle size={20} />
            </ThemeIcon>
            <Text fw={700} fz="lg">Identitas Peternak</Text>
          </Group>
          <Stack gap="sm">
            <Row k="Nama Lengkap" v={p.nama} />
            <Row k="No. KTP" v={<span style={{ fontFamily: "monospace" }}>{p.noKtp}</span>} />
            <Row k="Kategori" v={p.kategori ? KATEGORI_LABEL[p.kategori] : "—"} />
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="md" shadow="xs" mt="md">
          <Group gap="sm" mb="md">
            <ThemeIcon variant="light" color="blue" size="lg" radius="md">
              <IconMapPin size={20} />
            </ThemeIcon>
            <Text fw={700} fz="lg">Alamat</Text>
          </Group>
          <Stack gap="sm">
            <Row k="Provinsi" v={p.alamat.provinsi?.name ?? "—"} />
            <Row k="Kabupaten / Kota" v={p.alamat.kabupaten?.name ?? "—"} />
            <Row k="Kecamatan" v={p.alamat.kecamatan?.name ?? "—"} />
            <Row k="Kelurahan / Desa" v={p.alamat.kelurahan?.name ?? "—"} />
            <Divider my="xs" />
            <Row k="Alamat Lengkap" v={p.alamat.detail || "—"} />
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 5 }}>
        <Card withBorder padding="lg" radius="md" shadow="xs">
          <Group gap="sm" mb="md">
            <ThemeIcon variant="light" color="accent" size="lg" radius="md">
              <IconPhoto size={20} />
            </ThemeIcon>
            <Text fw={700} fz="lg">Foto KTP</Text>
          </Group>
          {p.ktp.preview ? (
            <Stack gap="xs">
              <Box
                style={{ cursor: "pointer", borderRadius: 8, overflow: "hidden" }}
                onClick={() =>
                  onOpenLightbox(
                    [{ id: "ktp", url: p.ktp.preview!, title: "Foto KTP", caption: p.nama }],
                    0
                  )
                }
              >
                <Image src={p.ktp.preview} alt="KTP" radius="md" />
              </Box>
              <Group gap="xs">
                <Badge variant="light" color="primary" size="sm">
                  {p.ktp.name || "ktp.jpg"}
                </Badge>
                {p.ktp.size && (
                  <Badge variant="light" color="gray" size="sm">
                    {(p.ktp.size / 1024).toFixed(1)} KB
                  </Badge>
                )}
              </Group>
            </Stack>
          ) : (
            <EmptyState
              icon={IconPhoto}
              title="Belum ada foto"
              description="Tidak ada foto KTP yang dilampirkan."
            />
          )}
        </Card>
      </Grid.Col>
    </Grid>
  );
}

function KandangListTab({ p, onOpenLightbox }: { p: Peternak; onOpenLightbox: (photos: PhotoItem[], index: number) => void }) {
  if (p.kandang.length === 0) {
    return (
      <EmptyState
        icon={IconBuildingWarehouse}
        title="Belum ada kandang"
        description="Peternak ini belum mendaftarkan kandangnya."
      />
    );
  }
  return (
    <Stack gap="md">
      {p.kandang.map((k, i) => (
        <KandangCard key={k.id} k={k} index={i} onOpenLightbox={onOpenLightbox} />
      ))}
    </Stack>
  );
}

function KandangCard({ k, index, onOpenLightbox }: { k: Kandang; index: number; onOpenLightbox: (photos: PhotoItem[], index: number) => void }) {
  return (
    <Card withBorder padding="lg" radius="md" shadow="xs">
      <Group justify="space-between" wrap="wrap" gap="sm" mb="md">
        <Group gap="sm">
          <Avatar size={42} radius="md" color="primary" variant="light">
            <IconBuildingWarehouse size={22} />
          </Avatar>
          <Stack gap={0}>
            <Text fw={700} fz="md">{k.nama || `Kandang ${index + 1}`}</Text>
            <Text fz="xs" c="dimmed">Kapasitas {KAPASITAS_LABEL[k.kapasitas] || "—"}</Text>
          </Stack>
        </Group>
        <StatusBadge variant="operasional" value={k.statusOperasional} />
      </Group>

      <Divider my="sm" />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xs">
            <Text fz="xs" fw={700} tt="uppercase" c="dimmed" lts="0.06em">
              Lokasi
            </Text>
            <Group gap={4}>
              <IconMapPin size={14} color="var(--app-primary)" />
              <Text fz="sm" ff="monospace">
                {k.lokasi.lat?.toFixed(6)}, {k.lokasi.lng?.toFixed(6)}
              </Text>
            </Group>
            <Text fz="sm" c="dimmed">{k.lokasi.alamat || "—"}</Text>
            {k.lokasi.lat !== null && k.lokasi.lng !== null && (
              <Anchor
                fz="xs"
                c="primary.7"
                target="_blank"
                href={`https://www.openstreetmap.org/?mlat=${k.lokasi.lat}&mlon=${k.lokasi.lng}#map=15/${k.lokasi.lat}/${k.lokasi.lng}`}
              >
                <Group gap={4}>
                  <IconCurrentLocation size={12} />
                  <Text fz="xs" inherit>Lihat di Peta</Text>
                </Group>
              </Anchor>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" lts="0.06em" mb="xs">
            Kondisi
          </Text>
          <Grid gutter="xs">
            <Grid.Col span={6}><CondRow label="Dinding" v={k.kondisi.dinding.kondisi} /></Grid.Col>
            <Grid.Col span={6}><CondRow label="Atap" v={k.kondisi.atap.kondisi} /></Grid.Col>
            <Grid.Col span={6}><CondRow label="Lantai" v={k.kondisi.lantai.kondisi} /></Grid.Col>
          </Grid>
        </Grid.Col>

        <Grid.Col span={12}>
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" lts="0.06em" mb="xs">
            <Group gap={4}><IconTool size={12} /> Peralatan</Group>
          </Text>
          <Grid gutter="xs">
            <Grid.Col span={{ base: 6, sm: 3 }}><CondRow label="Tempat Minum" v={k.peralatan.tempatMinum.kondisi} /></Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}><CondRow label="Tempat Makan" v={k.peralatan.tempatMakan.kondisi} /></Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}><CondRow label="Brooding" v={k.peralatan.brooding.kondisi} /></Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}><CondRow label="Kipas" v={k.peralatan.kipas.kondisi} /></Grid.Col>
          </Grid>
        </Grid.Col>

        {k.statusOperasional === "operasi" && (
          <Grid.Col span={12}>
            <Divider my="xs" />
            <Text fz="xs" fw={700} tt="uppercase" c="dimmed" lts="0.06em" mb="xs">
              Operasional
            </Text>
            <Group gap="lg" wrap="wrap">
              <Stack gap={2}>
                <Text fz="xs" c="dimmed">Jumlah Ayam</Text>
                <Text fz="sm" fw={600}>{KAPASITAS_LABEL[k.jumlahAyam] || "—"}</Text>
              </Stack>
              <Stack gap={2}>
                <Text fz="xs" c="dimmed">Jenis Usaha</Text>
                <Text fz="sm" fw={600}>
                  {k.jenisUsaha
                    ? JENIS_USAHA_LABEL[k.jenisUsaha]
                    : "—"}
                </Text>
              </Stack>
              {k.jenisUsaha === "kemitraan" && (
                <Stack gap={2}>
                  <Text fz="xs" c="dimmed">Mitra</Text>
                  <Text fz="sm" fw={600}>{kemitraanLabel(k.kemitraan)}</Text>
                </Stack>
              )}
            </Group>
          </Grid.Col>
        )}
      </Grid>
    </Card>
  );
}

function DokumenTab({ p, onOpenLightbox }: { p: Peternak; onOpenLightbox: (photos: PhotoItem[], index: number) => void }) {
  const allPhotos = collectPhotos(p);
  if (allPhotos.length === 0) {
    return (
      <EmptyState
        icon={IconPhoto}
        title="Belum ada dokumen"
        description="Tidak ada foto kondisi atau peralatan yang diunggah."
      />
    );
  }
  return (
    <Card withBorder padding="lg" radius="md" shadow="xs">
      <Group gap="sm" mb="md">
        <ThemeIcon variant="light" color="primary" size="lg" radius="md">
          <IconPhoto size={20} />
        </ThemeIcon>
        <Text fw={700} fz="lg">Galeri Foto</Text>
        <Badge variant="light" color="primary" radius="sm">{allPhotos.length} foto</Badge>
      </Group>
      <Grid gutter="sm">
        {allPhotos.map((photo, i) => (
          <Grid.Col key={i} span={{ base: 6, sm: 4, md: 3 }}>
            <Stack gap={4}>
              <PhotoThumb
                        url={photo.preview}
                        title={photo.label}
                        caption={p.nama}
                        allPhotos={allPhotos.map((x) => ({ id: x.label, url: x.preview, title: x.label, caption: p.nama }))}
                        index={i}
                        onOpen={(i: number) => onOpenLightbox(allPhotos.map((x) => ({ id: x.label, url: x.preview, title: x.label, caption: p.nama })), i)}
                        height={88}
                      />
              <Text fz="xs" fw={600} ta="center" c="dimmed">{photo.label}</Text>
            </Stack>
          </Grid.Col>
        ))}
      </Grid>
    </Card>
  );
}

function TimelineTab({ p }: { p: Peternak }) {
  return (
    <Card withBorder padding="lg" radius="md" shadow="xs">
      <Text fw={700} fz="lg" mb="md">Linimasa Pendaftaran</Text>
      <Stack gap="sm">
        <TimelineEvent
          icon={IconCheck}
          color="primary"
          title="Pendaftaran dibuat"
          when={p.createdAt}
          description={`${p.nama} terdaftar sebagai ${KATEGORI_LABEL[p.kategori] || "peternak"}.`}
        />
        {p.kandang.map((k, i) => (
          <React.Fragment key={k.id}>
            <TimelineEvent
              icon={IconBuildingWarehouse}
              color="blue"
              title={`${k.nama || `Kandang ${i + 1}`} ditambahkan`}
              when={p.createdAt}
              description={`Lokasi: ${k.lokasi.lat?.toFixed(4)}, ${k.lokasi.lng?.toFixed(4)}`}
            />
            {k.statusOperasional && (
              <TimelineEvent
                icon={IconShieldCheck}
                color="teal"
                title={`Status: ${STATUS_OPERASIONAL_LABEL[k.statusOperasional]}`}
                when={p.createdAt}
                description={
                  k.statusOperasional === "operasi"
                    ? `${KAPASITAS_LABEL[k.jumlahAyam]} · ${
                        k.jenisUsaha === "kemitraan"
                          ? `Kemitraan ${kemitraanLabel(k.kemitraan)}`
                          : "Mandiri"
                      }`
                    : "Kandang tidak beroperasi"
                }
              />
            )}
          </React.Fragment>
        ))}
      </Stack>
    </Card>
  );
}

function TimelineEvent({
  icon: Icon,
  color,
  title,
  when,
  description,
}: {
  icon: any;
  color: string;
  title: string;
  when: string;
  description: string;
}) {
  return (
    <Group gap="md" wrap="nowrap" align="flex-start">
      <ThemeIcon variant="light" color={color} size="lg" radius="xl">
        <Icon size={16} />
      </ThemeIcon>
      <Stack gap={0} style={{ flex: 1 }}>
        <Text fz="sm" fw={600}>{title}</Text>
        <Text fz="xs" c="dimmed">{description}</Text>
        <Text fz={10} c="dimmed" mt={2}>
          {new Date(when).toLocaleString("id-ID")}
        </Text>
      </Stack>
    </Group>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <Group justify="space-between" gap="md" wrap="wrap" align="flex-start">
      <Text fz="sm" c="dimmed">{k}</Text>
      <Text fz="sm" fw={500} style={{ textAlign: "right" }}>{v}</Text>
    </Group>
  );
}

function CondRow({ label, v }: { label: string; v: any }) {
  return (
    <Group justify="space-between" gap="xs" py={4}>
      <Text fz="xs" c="dimmed">{label}</Text>
      <StatusBadge variant="kondisi" value={v} />
    </Group>
  );
}

function collectPhotos(p: Peternak) {
  const out: { label: string; preview: string }[] = [];
  if (p.ktp.preview) out.push({ label: "KTP", preview: p.ktp.preview });
  p.kandang.forEach((k, i) => {
    const c = k.kondisi;
    if (c.dinding.foto) out.push({ label: `${k.nama || `Kandang ${i + 1}`} — Dinding`, preview: c.dinding.foto.preview! });
    if (c.atap.foto) out.push({ label: `${k.nama || `Kandang ${i + 1}`} — Atap`, preview: c.atap.foto.preview! });
    if (c.lantai.foto) out.push({ label: `${k.nama || `Kandang ${i + 1}`} — Lantai`, preview: c.lantai.foto.preview! });
    const pe = k.peralatan;
    if (pe.tempatMinum.foto) out.push({ label: `${k.nama || `Kandang ${i + 1}`} — Tempat Minum`, preview: pe.tempatMinum.foto.preview! });
    if (pe.tempatMakan.foto) out.push({ label: `${k.nama || `Kandang ${i + 1}`} — Tempat Makan`, preview: pe.tempatMakan.foto.preview! });
    if (pe.brooding.foto) out.push({ label: `${k.nama || `Kandang ${i + 1}`} — Brooding`, preview: pe.brooding.foto.preview! });
    if (pe.kipas.foto) out.push({ label: `${k.nama || `Kandang ${i + 1}`} — Kipas`, preview: pe.kipas.foto.preview! });
  });
  return out;
}

function exportJson(p: Peternak) {
  // Strip base64 data URL previews to keep file small but include metadata
  const stripped: any = {
    ...p,
    ktp: { ...p.ktp, preview: p.ktp.preview ? `[BASE64:${p.ktp.name}]` : null },
  };
  stripped.kandang = p.kandang.map((k) => ({
    ...k,
    kondisi: {
      dinding: { ...k.kondisi.dinding, foto: k.kondisi.dinding.foto ? { ...k.kondisi.dinding.foto, preview: "[BASE64]" } : null },
      atap: { ...k.kondisi.atap, foto: k.kondisi.atap.foto ? { ...k.kondisi.atap.foto, preview: "[BASE64]" } : null },
      lantai: { ...k.kondisi.lantai, foto: k.kondisi.lantai.foto ? { ...k.kondisi.lantai.foto, preview: "[BASE64]" } : null },
    },
    peralatan: {
      tempatMinum: { ...k.peralatan.tempatMinum, foto: k.peralatan.tempatMinum.foto ? { ...k.peralatan.tempatMinum.foto, preview: "[BASE64]" } : null },
      tempatMakan: { ...k.peralatan.tempatMakan, foto: k.peralatan.tempatMakan.foto ? { ...k.peralatan.tempatMakan.foto, preview: "[BASE64]" } : null },
      brooding: { ...k.peralatan.brooding, foto: k.peralatan.brooding.foto ? { ...k.peralatan.brooding.foto, preview: "[BASE64]" } : null },
      kipas: { ...k.peralatan.kipas, foto: k.peralatan.kipas.foto ? { ...k.peralatan.kipas.foto, preview: "[BASE64]" } : null },
    },
  }));
  const blob = new Blob([JSON.stringify(stripped, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `peternak-${p.nama.replace(/\s+/g, "-").toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  notifications.show({
    title: "JSON diunduh",
    message: `Data ${p.nama} telah diekspor.`,
    color: "green",
  });
}


// Exposed as a NAMED export so `app/.../page.tsx` can
// `dynamic()`-load this file with `ssr: false` — bypasses
// React #418/#423 hydration mismatches that come from
// data-driven Recharts + Mantine Tabs + API-timing races
// during SSR.
export function PeternakDetailClient() {
  return <PeternakDetailContent />;
}