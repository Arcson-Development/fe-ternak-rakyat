"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Drawer,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  IconUserPlus,
  IconUsers,
  IconBuildingWarehouse,
  IconArrowRight,
  IconCalendarPlus,
  IconClipboardCheck,
  IconClock,
  IconActivityHeartbeat,
  IconMap2,
} from "@tabler/icons-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { DashboardSkeleton } from "../../components/skeletons";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { useFormList, formItemToPeternak } from "../../hooks/useTernakRakyat";
import {
  JENIS_USAHA_LABEL,
  KATEGORI_LABEL,
  useFarmLocations,
  useFormById,
} from "../../hooks/useTernakRakyat";
import type { FarmLocationItem } from "../../lib/api";
import { KategoriDonut, TopKabupatenBar, TrendArea } from "../../components/charts";
import dynamic from "next/dynamic";

const FarmersMap = dynamic(() => import("../../components/map/FarmersMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 360,
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
});

function DashboardContent() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Brief initial skeleton so layout is visible while React hydrates
    const t = setTimeout(() => setReady(true), 250);
    return () => clearTimeout(t);
  }, []);
  const router = useRouter();
  const [mapType, setMapType] = useState<"Ayam Petelur" | "Ayam Pedaging">("Ayam Petelur");
  const { data: locationData, isError: locError } = useFarmLocations(mapType);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: selectedPeternak } = useFormById(selectedId ?? undefined);
  const selectedOpen = selectedId !== null;
  // Pull a representative sample (200 most-recent records) directly
  // from the backend so the overview stats reflect the server's
  // view, not whatever happens to be in the local store. For the
  // current dataset (11 rows) this is the entire population. The
  // "Pendaftaran minggu ini" stat and the 14-day trend both need
  // createdAt values, which the backend provides via the FormItem
  // envelope.
  const { data: formList } = useFormList(1, 200, "");
  const list: import("../../hooks/useTernakRakyat").Peternak[] = useMemo(
    () => (formList?.data ?? []).map(formItemToPeternak),
    [formList]
  );

  const stats = useMemo(() => {
    let totalKandang = 0;
    let totalOperasi = 0;
    let totalMandiri = 0;
    let totalKemitraan = 0;
    let totalAyam = 0;
    let broiler = 0;
    let layer = 0;
    let thisWeek = 0;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    list.forEach((p) => {
      // Weekly counter — a new submission counts toward "minggu ini"
      // if createdAt is within the last 7 days.
      if (new Date(p.createdAt) >= weekAgo) thisWeek++;

      p.kandang.forEach((k) => {
        totalKandang++;
        if (k.statusOperasional === "operasi") {
          totalOperasi++;
          if (k.jumlahAyam) {
            const cap = k.jumlahAyam;
            totalAyam +=
              cap === "<2500" ? 2000 : cap === "2500-5000" ? 3750 : 6000;
          }
          if (k.jenisUsaha === "mandiri") totalMandiri++;
          if (k.jenisUsaha === "kemitraan") totalKemitraan++;
        }
      });
      if (p.kategori === "ayam_pedaging") broiler++;
      if (p.kategori === "ayam_petelur") layer++;
    });

    return {
      totalPeternak: list.length,
      thisWeek,
      totalKandang,
      totalOperasi,
      totalMandiri,
      totalKemitraan,
      totalAyam,
      broiler,
      layer,
    };
  }, [list]);

  // Trend: registrations per day (last 14 days)
  const trendData = useMemo(() => {
    const days: { date: string; value: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = list.filter((p) => p.createdAt.slice(0, 10) === key).length;
      days.push({
        date: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        value: count,
      });
    }
    return days;
  }, [list]);

  // Donut: kategori
  const kategoriData = [
    { name: "Ayam Pedaging", value: stats.broiler, color: "#13bc6d" },
    { name: "Ayam Petelur", value: stats.layer, color: "#f59e0b" },
  ];

  // Bar: top 7 kabupaten
  const topKabData = useMemo(() => {
    const counts: Record<string, number> = {};
    list.forEach((p) => {
      const kab = p.alamat.kabupaten?.name;
      if (kab) counts[kab] = (counts[kab] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([name, value]) => ({ name, value }));
  }, [list]);

  // Map: points from the farm-locations API, grouped by peternak
  const mapPoints = useMemo(() => {
    const out: { lat: number; lng: number; label: string; id: number }[] = [];
    (locationData ?? []).forEach((item: FarmLocationItem) => {
      const label = `${item.kategori_peternak} #${item.id}`;
      (item.form_peternakan_kandang ?? []).forEach((k: { latitude: string; longitude: string }) => {
        const lat = parseFloat(k.latitude);
        const lng = parseFloat(k.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          out.push({ lat, lng, label, id: item.id });
        }
      });
    });
    return out;
  }, [locationData]);

  return (
    <Container size="xl" px={0}>
      <Stack gap="lg">
        <PageHeader
          eyebrow="Ringkasan Operasional"
          title="Selamat datang di SITERNAK"
          description="Pantau data peternak rakyat, kandang operasional, dan status kemitraan dalam satu dasbor."
          actions={
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={() => router.push("/pendaftaran")}
            >
              Daftarkan Peternak
            </Button>
          }
        />

        {/* ── Peta Full Width ── */}
        <Card padding="lg" radius="md" withBorder shadow="xs">
          <Group justify="space-between" mb="sm">
            <Stack gap={2}>
              <Text fw={700} fz="md">Peta Lokasi Kandang</Text>
              <Text fz="xs" c="dimmed">
                {mapPoints.length} pin terdaftar
              </Text>
            </Stack>
            <Group gap="xs">
              <Button
                size="xs"
                variant={mapType === "Ayam Petelur" ? "filled" : "outline"}
                color={mapType === "Ayam Petelur" ? "yellow" : "gray"}
                onClick={() => setMapType("Ayam Petelur")}
                radius="xl"
              >
                Ayam Petelur
              </Button>
              <Button
                size="xs"
                variant={mapType === "Ayam Pedaging" ? "filled" : "outline"}
                color={mapType === "Ayam Pedaging" ? "blue" : "gray"}
                onClick={() => setMapType("Ayam Pedaging")}
                radius="xl"
              >
                Ayam Pedaging
              </Button>
            </Group>
          </Group>
          {locationData === undefined && !locError ? (
            <Box style={{ height: 360, display: "grid", placeItems: "center" }}>
              <Loader size="sm" />
            </Box>
          ) : locError ? (
            <Box style={{ height: 360, display: "grid", placeItems: "center" }}>
              <Text fz="sm" c="red">Gagal memuat data peta</Text>
            </Box>
          ) : (
            <FarmersMap points={mapPoints} height={360} onSelect={setSelectedId} />
          )}
        </Card>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Pendaftaran Minggu Ini"
              value={stats.thisWeek}
              icon={IconCalendarPlus}
              hint={
                stats.thisWeek === 0
                  ? "Belum ada 7 hari terakhir"
                  : stats.thisWeek === 1
                  ? "1 pendaftar baru"
                  : `${stats.thisWeek} pendaftar baru`
              }
              iconColor="teal"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Total Peternak"
              value={stats.totalPeternak}
              icon={IconUsers}
              hint="Terdaftar di sistem"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Total Kandang"
              value={stats.totalKandang}
              icon={IconBuildingWarehouse}
              hint={`${stats.totalOperasi} sedang operasi`}
              iconColor="blue"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Kandang Operasi"
              value={stats.totalOperasi}
              icon={IconActivityHeartbeat}
              hint="Sedang aktif berjalan"
              iconColor="accent"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Perkiraan Ayam"
              value={stats.totalAyam.toLocaleString("id-ID")}
              icon={IconClipboardCheck}
              hint="Estimasi total ekor"
            />
          </Grid.Col>
        </Grid>

        {/* Charts row */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Group justify="space-between" mb="md">
                <Stack gap={2}>
                  <Text fw={700} fz="md">Tren Pendaftaran 14 Hari</Text>
                  <Text fz="xs" c="dimmed">Jumlah pendaftaran per hari</Text>
                </Stack>
                <Badge variant="light" color="primary" radius="sm">
                  Total: {trendData.reduce((s, d) => s + d.value, 0)}
                </Badge>
              </Group>
              <TrendArea data={trendData} height={220} />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Text fw={700} fz="md" mb="sm">Komposisi Jenis Peternak</Text>
              <KategoriDonut data={kategoriData} height={220} />
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Text fw={700} fz="md" mb="sm">7 Kabupaten Teratas</Text>
              <Text fz="xs" c="dimmed" mb="md">
                Konsentrasi peternak berdasarkan kabupaten
              </Text>
              <TopKabupatenBar data={topKabData} height={280} />
            </Card>
          </Grid.Col>
        </Grid>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs">
              <Group justify="space-between" mb="md">
                <Stack gap={2}>
                  <Text fw={700} fz="md">Peternak Terbaru</Text>
                  <Text fz="xs" c="dimmed">5 pendaftaran terakhir</Text>
                </Stack>
                <Button
                  variant="subtle"
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={() => router.push("/dashboard/peternak")}
                >
                  Lihat semua
                </Button>
              </Group>

              {list.length === 0 ? (
                <EmptyState
                  icon={IconUsers}
                  title="Belum ada peternak terdaftar"
                  description="Mulai daftarkan peternak pertama untuk melihat data di sini."
                  action={
                    <Button
                      leftSection={<IconUserPlus size={16} />}
                      onClick={() => router.push("/pendaftaran")}
                      size="sm"
                    >
                      Daftarkan Peternak
                    </Button>
                  }
                />
              ) : (
                <Stack gap="sm">
                  {list.slice(0, 5).map((p) => (
                    <Card
                      key={p.id}
                      withBorder
                      padding="md"
                      radius="md"
                      style={{ background: "var(--app-surface-sunken)" }}
                    >
                      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                          <Avatar color="primary" variant="light" radius="xl" size="md">
                            {p.nama.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                          </Avatar>
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text fw={600}>{p.nama}</Text>
                            <Text fz="xs" c="dimmed" lineClamp={1}>
                              {p.alamat.kelurahan?.name}, {p.alamat.kecamatan?.name} · {p.kandang.length} kandang
                            </Text>
                          </Stack>
                        </Group>
                        <Group gap="xs" wrap="wrap">
                          <StatusBadge
                            variant="custom"
                            label={p.kategori ? KATEGORI_LABEL[p.kategori] : "—"}
                            color="primary"
                          />
                          <Text fz="xs" c="dimmed">
                            <IconClock size={10} style={{ verticalAlign: -1 }} />{" "}
                            {new Date(p.createdAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </Text>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Text fw={700} fz="md" mb="md">Komposisi Jenis Usaha</Text>
              <Stack gap="md">
                <CompositionRow
                  label={JENIS_USAHA_LABEL.mandiri}
                  value={stats.totalMandiri}
                  total={stats.totalOperasi}
                  color="#3b82f6"
                />
                <CompositionRow
                  label={JENIS_USAHA_LABEL.kemitraan}
                  value={stats.totalKemitraan}
                  total={stats.totalOperasi}
                  color="#f59e0b"
                />
              </Stack>

              <Card
                padding="md"
                radius="md"
                mt="xl"
                style={{ background: "var(--app-primary-soft)", border: "1px solid var(--app-primary)" }}
              >
                <Text fz="xs" fw={700} c="primary.7" mb={4} tt="uppercase" lts="0.06em">
                  TIPS HARI INI
                </Text>
                <Text fz="sm" c="dark.7">
                  Tingkatkan kualitas data dengan menambahkan foto kondisi
                  dan peralatan untuk setiap kandang. Data yang lengkap
                  mempercepat verifikasi.
                </Text>
              </Card>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* ── Detail Drawer ── */}
      <Drawer
        opened={selectedOpen}
        onClose={() => setSelectedId(null)}
        title={selectedPeternak ? selectedPeternak.nama : "Memuat..."}
        position="right"
        size="md"
        padding="lg"
      >
        {!selectedPeternak ? (
          <Center mih={200}><Loader size="sm" /></Center>
        ) : (
          <Stack gap="md">
            <Group gap="xs">
              <Text fw={600} size="sm" c="dimmed">Kategori:</Text>
              <Badge variant="light" color="primary">
                {selectedPeternak.kategori_peternak}
              </Badge>
            </Group>
            <Group gap="xs">
              <Text fw={600} size="sm" c="dimmed">No. KTP:</Text>
              <Text size="sm">{selectedPeternak.ktp_no || "—"}</Text>
            </Group>
            <Group gap="xs">
              <Text fw={600} size="sm" c="dimmed">Alamat:</Text>
              <Text size="sm">
                {selectedPeternak.alamat}, {selectedPeternak.kelurahan},{" "}
                {selectedPeternak.kecamatan}, {selectedPeternak.kabupaten}
              </Text>
            </Group>
            <Group gap="xs">
              <Text fw={600} size="sm" c="dimmed">Kandang:</Text>
              <Text size="sm">
                {selectedPeternak.form_peternakan_kandang?.length ?? 0} kandang
              </Text>
            </Group>
            <Group gap="xs">
              <Text fw={600} size="sm" c="dimmed">Tgl Daftar:</Text>
              <Text size="sm">
                {new Date(selectedPeternak.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </Text>
            </Group>
            <Button
              fullWidth
              mt="md"
              onClick={() => {
                setSelectedId(null);
                router.push(`/dashboard/peternak/${selectedPeternak.id}`);
              }}
            >
              Lihat Detail Lengkap
            </Button>
          </Stack>
        )}
      </Drawer>
    </Container>
  );
}

function CompositionRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);

    return (
    <Stack gap={4}>
      <Group justify="space-between">
        <Text fz="sm" fw={500}>{label}</Text>
        <Text fz="sm" c="dimmed">{value} ({pct}%)</Text>
      </Group>
      <div
        style={{
          height: 6,
          background: "var(--app-surface-sunken)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            transition: "width 0.3s",
          }}
        />
      </div>
    </Stack>
  );
}


// Named export so page.tsx can dynamic-load this with ssr: false.
// The dashboard renders Recharts + Recharts CartesianGrid which
// generate SVG IDs during render — they routinely diverge
// between SSR and CSR. Disable SSR for this whole page.
export function DashboardClient() {
  return <DashboardPage />;
}

function DashboardPage() {
  return <DashboardContent />;
}
