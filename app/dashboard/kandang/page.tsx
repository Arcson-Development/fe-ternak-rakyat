"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Modal, ThemeIcon } from "@mantine/core";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Drawer,
  Grid,
  Group,
  Image,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  IconBuildingWarehouse,
  IconExternalLink,
  IconFileSpreadsheet,
  IconMapPin,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { BulkActionBar, BulkActions } from "../../../components/ui/BulkActionBar";
import { ListSkeleton } from "../../../components/skeletons";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { EmptyState } from "../../../components/ui/EmptyState";
import { usePeternakList, useTernakStore } from "../../../hooks/useTernakRakyat";
import { buildKandangWorkbook, downloadWorkbook, TIMESTAMP } from "../../../lib/export";
import {
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  kemitraanLabel,
  type Kandang,
  type Peternak,
} from "../../../hooks/useTernakRakyat";

type Row = {
  peternak: Peternak;
  kandang: Kandang;
};

function KandangListPageContent() {
  // ─── Rules of Hooks: ALL hooks must be called before any early return ───
  // Skeleton gate (briefly hidden until store hydrates from localStorage)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const router = useRouter();
  const list = usePeternakList();
  const removeMany = useTernakStore((s) => s.removeMany);
  const updateKandang = useTernakStore((s) => s.update);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Row | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [kapasitasFilter, setKapasitasFilter] = useState<string | null>("all");
  const [selected, setSelected] = useState<Row | null>(null);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    list.forEach((p) => p.kandang.forEach((k) => out.push({ peternak: p, kandang: k })));
    return out;
  }, [list]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      operasi: rows.filter((r) => r.kandang.statusOperasional === "operasi").length,
      tidak: rows.filter((r) => r.kandang.statusOperasional === "berhenti").length,
      kemitraan: rows.filter(
        (r) => r.kandang.jenisUsaha === "kemitraan"
      ).length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (
        statusFilter && statusFilter !== "all" &&
        r.kandang.statusOperasional !== statusFilter
      ) return false;
      if (
        kapasitasFilter && kapasitasFilter !== "all" &&
        r.kandang.kapasitas !== kapasitasFilter
      ) return false;
      if (!q) return true;
      return (
        r.peternak.nama.toLowerCase().includes(q) ||
        r.kandang.nama.toLowerCase().includes(q) ||
        (r.kandang.lokasi.alamat ?? "").toLowerCase().includes(q) ||
        (r.peternak.alamat.kabupaten?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter, kapasitasFilter]);

  // Key is "peternakId|kandangIndex" to identify a unique kandang
  const filteredKeys = useMemo(
    () => new Set(filtered.map((r) => `${r.peternak.id}|${r.kandang.lokasi.alamat || ""}`)),
    [filtered]
  );

  // ─── Early return AFTER all hooks (safe to skip rendering body) ───
  if (!ready) return <ListSkeleton />;

  // ─── Derived state (no hooks) ───
  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((r) => selectedKeys.has(`${r.peternak.id}|${r.kandang.lokasi.alamat || ""}`));
  const someFilteredSelected = filtered.some(
    (r) => selectedKeys.has(`${r.peternak.id}|${r.kandang.lokasi.alamat || ""}`)
  );

  // ─── Action handlers (no hooks, just closures over state) ───
  const handleBulkDeleteKandang = () => {
    if (selectedKeys.size === 0) return;
    try {
      // Remove all selected kandangs from their respective peternak
      const useStore = useTernakStore.getState();
      const groupById = new Map<string, typeof filtered>();
      filtered.forEach((r) => {
        if (selectedKeys.has(`${r.peternak.id}|${r.kandang.lokasi.alamat || ""}`)) {
          const key = r.peternak.id;
          if (!groupById.has(key)) groupById.set(key, [] as any);
          (groupById.get(key) as any).push(r);
        }
      });
      // If a peternak has all of its kandangs selected we remove the whole
      // record; otherwise we patch with the remaining kandangs.
      let count = 0;
      groupById.forEach((rows, peternakId) => {
        const p = useStore.peternak.find((x) => x.id === peternakId);
        if (p) {
          const remainingKandang = p.kandang.filter(
            (k) => !rows.some((r: any) => r.kandang === k)
          );
          if (remainingKandang.length === 0) {
            useStore.remove(peternakId);
            count++;
          } else {
            useStore.update(peternakId, { kandang: remainingKandang });
            count++;
          }
        }
      });
      notifications.show({
        title: "Berhasil dihapus",
        message: `${count} data kandang telah dihapus.`,
        color: "green",
      });
      clearSelectionKandang();
    } catch {
      notifications.show({
        title: "Gagal menghapus",
        message: "Terjadi kesalahan saat menghapus data.",
        color: "red",
      });
    } finally {
      setConfirmBulkDel(false);
    }
  };

  const handleBulkExportKandang = () => {
    const rows = filtered.filter((r) =>
      selectedKeys.has(`${r.peternak.id}|${r.kandang.lokasi.alamat || ""}`)
    );
    if (rows.length === 0) return;
    try {
      const wb = buildKandangWorkbook(rows);
      downloadWorkbook(wb, `siternak-kandang-terpilih-${TIMESTAMP()}.xlsx`);
      notifications.show({
        title: "Berhasil diekspor",
        message: `${rows.length} data kandang dipilih diekspor.`,
        color: "green",
        icon: <IconFileSpreadsheet size={18} />,
      });
    } catch {
      notifications.show({
        title: "Gagal mengekspor",
        message: "Terjadi kesalahan saat membuat file Excel.",
        color: "red",
      });
    }
  };

  const handleExportExcel = (rows: Row[]) => {
    if (rows.length === 0) {
      notifications.show({
        title: "Tidak ada data",
        message: "Tidak ada data untuk diekspor.",
        color: "yellow",
      });
      return;
    }
    try {
      const wb = buildKandangWorkbook(rows);
      downloadWorkbook(wb, `siternak-master-kandang-${TIMESTAMP()}.xlsx`);
      notifications.show({
        title: "Berhasil diekspor",
        message: `${rows.length} data kandang disimpan ke Excel.`,
        color: "green",
        icon: <IconFileSpreadsheet size={18} />,
      });
    } catch {
      notifications.show({
        title: "Gagal mengekspor",
        message: "Terjadi kesalahan saat membuat file Excel.",
        color: "red",
      });
    }
  };

  const toggleOneKandang = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllFilteredKandang = () => {
    setSelectedKeys((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        filteredKeys.forEach((k) => next.delete(k));
        return next;
      }
      const next = new Set(prev);
      filteredKeys.forEach((k) => next.add(k));
      return next;
    });
  };

  const clearSelectionKandang = () => setSelectedKeys(new Set());

  return (
    <Container size="xl" px={0}>
      <Stack gap="lg">
        <PageHeader
          eyebrow="Master Kandang"
          title="Daftar Kandang"
          description="Seluruh kandang yang terdaftar, lintas peternak. Klik baris untuk melihat detail."
          actions={
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push("/pendaftaran")}
            >
              Pendaftaran Baru
            </Button>
          }
        />

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Kandang" value={stats.total} icon={IconBuildingWarehouse} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Sedang Operasi"
              value={stats.operasi}
              icon={IconBuildingWarehouse}
              iconColor="primary"
              hint={`${Math.round((stats.operasi / Math.max(1, stats.total)) * 100)}% aktif`}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Tidak Operasi"
              value={stats.tidak}
              icon={IconBuildingWarehouse}
              iconColor="gray"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Kandang Kemitraan"
              value={stats.kemitraan}
              icon={IconBuildingWarehouse}
              iconColor="accent"
            />
          </Grid.Col>
        </Grid>

        <Card padding="md" radius="md" withBorder shadow="xs">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm" wrap="wrap" style={{ flex: 1 }}>
              <TextInput
                placeholder="Cari nama peternak, kandang, atau alamat..."
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
            />
            <Button
              variant="light"
              leftSection={<IconFileSpreadsheet size={14} />}
              onClick={() => handleExportExcel(filtered)}
              disabled={filtered.length === 0}
              w={{ base: "100%", sm: 200 }}
            >
              Ekspor Excel
            </Button>
              <Select
                placeholder="Status"
                data={[
                  { value: "all", label: "Semua Status" },
                  { value: "operasi", label: "Sedang Operasi" },
                  { value: "berhenti", label: "Tidak Operasi" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                w={180}
              />
              <Select
                placeholder="Kapasitas"
                data={[
                  { value: "all", label: "Semua Kapasitas" },
                  { value: "<2500", label: "< 2.500" },
                  { value: "2500-5000", label: "2.500 – 5.000" },
                  { value: ">5000", label: "> 5.000" },
                ]}
                value={kapasitasFilter}
                onChange={setKapasitasFilter}
                w={180}
              />
            </Group>

            <BulkActionBar
              count={selectedKeys.size}
              total={filtered.length}
              noun="kandang"
              onClear={clearSelectionKandang}
              actions={[
                BulkActions.exportExcel(handleBulkExportKandang),
                BulkActions.delete(() => setConfirmBulkDel(true)),
              ]}
            />
          
            <Group gap="xs">
              <Badge variant="light" color="primary" radius="sm">
                {filtered.length} / {rows.length}
              </Badge>
            </Group>
          </Group>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState
            icon={IconBuildingWarehouse}
            title={rows.length === 0 ? "Belum ada kandang" : "Tidak ada hasil"}
            description={
              rows.length === 0
                ? "Daftarkan peternak terlebih dahulu untuk melihat data kandang."
                : "Coba ubah filter atau kata kunci pencarian."
            }
            action={
              rows.length === 0 && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => router.push("/pendaftaran")}
                >
                  Daftarkan Peternak
                </Button>
              )
            }
          />
        ) : (
          <Card padding={0} radius="md" withBorder shadow="xs">
            <ScrollArea>
              <Table
                verticalSpacing="sm"
                horizontalSpacing="md"
                highlightOnHover
                striped
                miw={900}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Peternak</Table.Th>
                    <Table.Th>Kandang</Table.Th>
                    <Table.Th>Lokasi</Table.Th>
                    <Table.Th>Kapasitas</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Jenis Usaha</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((r) => (
                    <Table.Tr
                      key={`${r.peternak.id}-${r.kandang.id}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(r)}
                    >
                      <Table.Td>
                        <Text fz="sm" fw={600}>
                          {r.peternak.nama}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {r.peternak.alamat.kabupaten?.name}, {r.peternak.alamat.provinsi?.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" fw={500}>
                          {r.kandang.nama}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <IconMapPin size={12} color="var(--app-text-muted)" />
                          <Text fz="xs" c="dimmed" lineClamp={1}>
                            {r.kandang.lokasi.lat?.toFixed(4)}, {r.kandang.lokasi.lng?.toFixed(4)}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge
                          variant="custom"
                          label={KAPASITAS_LABEL[r.kandang.kapasitas] || "—"}
                          color="primary"
                        />
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge variant="operasional" value={r.kandang.statusOperasional} />
                      </Table.Td>
                      <Table.Td>
                        {r.kandang.jenisUsaha ? (
                          <Stack gap={2}>
                            <Text fz="xs" fw={500}>
                              {JENIS_USAHA_LABEL[r.kandang.jenisUsaha]}
                            </Text>
                            {r.kandang.jenisUsaha === "kemitraan" && (
                              <Text fz="xs" c="dimmed">
                                {r.kandang.kemitraan || "—"}
                              </Text>
                            )}
                          </Stack>
                        ) : (
                          <Text fz="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Card>
        )}
      </Stack>

      <Drawer
        opened={!!selected}
        onClose={() => setSelected(null)}
        position="right"
        size="lg"
        padding="lg"
        title={
          selected && (
            <Group gap="sm">
              <IconBuildingWarehouse size={18} color="var(--app-primary)" />
              <Text fw={700}>{selected.kandang.nama}</Text>
            </Group>
          )
        }
      >
        {selected && (
          <KandangDetail
            row={selected}
            onClose={() => setSelected(null)}
            onDelete={() => setConfirmDel(selected)}
          />
        )}
      </Drawer>

      <Modal
        opened={confirmBulkDel}
        onClose={() => setConfirmBulkDel(false)}
        title={<Text fw={700}>Konfirmasi Hapus Massal</Text>}
        centered
      >
        <Stack gap="md">
          <Group gap="sm" align="flex-start">
            <ThemeIcon color="red" variant="light" size="lg" radius="md">
              <IconTrash size={18} />
            </ThemeIcon>
            <Stack gap={2} style={{ flex: 1 }}>
              <Text fz="sm">
                Anda akan menghapus <Text span fw={700}>{selectedKeys.size}</Text> data kandang sekaligus.
              </Text>
              <Text fz="xs" c="dimmed">
                Tindakan ini akan menghapus seluruh data peternak jika
                kandangnya sudah tidak ada. Tidak dapat dibatalkan.
              </Text>
            </Stack>
          </Group>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setConfirmBulkDel(false)}>
              Batal
            </Button>
            <Button color="red" onClick={handleBulkDeleteKandang}>
              Ya, Hapus {selectedKeys.size} Kandang
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={confirmDel !== null}
        onClose={() => setConfirmDel(null)}
        title="Hapus kandang ini?"
        size="sm"
      >
        <Stack gap="md">
          <Text fz="sm">
            Tindakan ini akan menghapus{" "}
            <Text component="span" fw={700}>
              {confirmDel?.kandang.nama || "kandang ini"}
            </Text>{" "}
            dari data {confirmDel?.peternak.nama}. Tindakan tidak dapat dibatalkan.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setConfirmDel(null)}>
              Batal
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => {
                if (!confirmDel) return;
                const next = {
                  ...confirmDel.peternak,
                  kandang: confirmDel.peternak.kandang.filter(
                    (k) => k.id !== confirmDel.kandang.id
                  ),
                };
                updateKandang(confirmDel.peternak.id, { kandang: next.kandang });
                notifications.show({
                  title: "Kandang dihapus",
                  message: `Kandang ${confirmDel.kandang.nama || "(tanpa nama)"} telah dihapus.`,
                  color: "green",
                });
                setConfirmDel(null);
                setSelected(null);
              }}
            >
              Hapus Permanen
            </Button>
          </Group>
        </Stack>
      </Modal>

    </Container>
  );
}

function KandangDetail({ row, onClose, onDelete }: { row: Row; onClose: () => void; onDelete: () => void }) {
  const { peternak: p, kandang: k } = row;
  return (
    <Stack gap="md">
      <Group justify="space-between" gap="xs">
        <Button
          size="xs"
          variant="filled"
          color="primary"
          rightSection={<IconExternalLink size={12} />}
          onClick={() => {
            // Navigate to dedicated detail page
            window.location.href = `/dashboard/kandang/${p.id}/${k.id}`;
          }}
        >
          Halaman Detail
        </Button>
        <Group gap={4}>
          <Button
            size="xs"
            color="red"
            variant="light"
            leftSection={<IconTrash size={12} />}
            onClick={() => onDelete()}
          >
            Hapus
          </Button>
        </Group>
      </Group>
      <Card withBorder padding="md" radius="md">
        <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb="xs" lts="0.06em">
          Peternak
        </Text>
        <Stack gap={4}>
          <Text fw={600}>{p.nama}</Text>
          <Text fz="xs" c="dimmed" ff="monospace">
            No. KTP: {p.noKtp}
          </Text>
          <Text fz="xs" c="dimmed">
            {p.alamat.detail}, {p.alamat.kelurahan?.name}, {p.alamat.kabupaten?.name}
          </Text>
        </Stack>
      </Card>

      <Card withBorder padding="md" radius="md">
        <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb="xs" lts="0.06em">
          Lokasi
        </Text>
        <Stack gap={4}>
          <Group gap={4}>
            <IconMapPin size={14} color="var(--app-primary)" />
            <Text fz="sm" fw={500}>
              {k.lokasi.lat?.toFixed(6)}, {k.lokasi.lng?.toFixed(6)}
            </Text>
          </Group>
          <Text fz="sm" c="dimmed">
            {k.lokasi.alamat || "—"}
          </Text>
        </Stack>
      </Card>

      <Card withBorder padding="md" radius="md">
        <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb="sm" lts="0.06em">
          Kondisi &amp; Peralatan
        </Text>
        <Grid gutter="xs">
          <Grid.Col span={6}><Detail label="Dinding" v={k.kondisi.dinding.kondisi} /></Grid.Col>
          <Grid.Col span={6}><Detail label="Atap" v={k.kondisi.atap.kondisi} /></Grid.Col>
          <Grid.Col span={6}><Detail label="Lantai" v={k.kondisi.lantai.kondisi} /></Grid.Col>
          <Grid.Col span={6}><Detail label="Tempat Minum" v={k.peralatan.tempatMinum.kondisi} /></Grid.Col>
          <Grid.Col span={6}><Detail label="Tempat Makan" v={k.peralatan.tempatMakan.kondisi} /></Grid.Col>
          <Grid.Col span={6}><Detail label="Brooding" v={k.peralatan.brooding.kondisi} /></Grid.Col>
          <Grid.Col span={6}><Detail label="Kipas" v={k.peralatan.kipas.kondisi} /></Grid.Col>
        </Grid>
      </Card>

      {k.statusOperasional === "operasi" && (
        <Card withBorder padding="md" radius="md">
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb="sm" lts="0.06em">
            Operasional
          </Text>
          <Stack gap={4}>
            <Group justify="space-between">
              <Text fz="sm" c="dimmed">Jumlah Ayam</Text>
              <Text fz="sm" fw={500}>{KAPASITAS_LABEL[k.jumlahAyam] || "—"}</Text>
            </Group>
            <Group justify="space-between">
              <Text fz="sm" c="dimmed">Jenis Usaha</Text>
              <Text fz="sm" fw={500}>
                {k.jenisUsaha ? JENIS_USAHA_LABEL[k.jenisUsaha] : "—"}
              </Text>
            </Group>
            {k.jenisUsaha === "kemitraan" && (
              <Group justify="space-between">
                <Text fz="sm" c="dimmed">Mitra</Text>
                <Text fz="sm" fw={500}>{kemitraanLabel(k.kemitraan)}</Text>
              </Group>
            )}
          </Stack>
        </Card>
      )}

      {p.ktp.preview && (
        <Card withBorder padding="md" radius="md">
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" mb="xs" lts="0.06em">
            Foto KTP Peternak
          </Text>
          <Image src={p.ktp.preview} alt="KTP" radius="md" />
        </Card>
      )}
    </Stack>
  );
}

function Detail({ label, v }: { label: string; v: any }) {
  return (
    <Group justify="space-between" gap="xs" py={4}>
      <Text fz="xs" c="dimmed">{label}</Text>
      <StatusBadge variant="kondisi" value={v} />
    </Group>
  );
}



export default function KandangListPage() {
  return <KandangListPageContent />;
}
