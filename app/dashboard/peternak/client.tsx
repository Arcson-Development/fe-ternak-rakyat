"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Drawer,
  Grid,
  Group,
  Image,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import {
  IconBuildingWarehouse,
  IconFileSpreadsheet,
  IconFilter,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconSearch,
  IconUser,
  IconArrowRight,
  IconUsers,
} from "@tabler/icons-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { EmptyState } from "../../../components/ui/EmptyState";
import { BulkActionBar, BulkActions } from "../../../components/ui/BulkActionBar";
import { ListSkeleton } from "../../../components/skeletons";
import { Checkbox } from "@mantine/core";
import { usePeternakList, useTernakStore, type Peternak } from "../../../hooks/useTernakRakyat";
import { buildLaporanWorkbook, downloadWorkbook, TIMESTAMP } from "../../../lib/export";
import {
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  kemitraanLabel,
  useFormList,
  useDeleteForm,
  formItemToPeternak,
  type FormItem,
} from "../../../hooks/useTernakRakyat";

function PeternakListContent() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("");
  const router = useRouter();
  // Backend-driven list with client-side search filter. Server-side
  // search also exists (`?search=` query param) — we debounce it
  // slightly via the search state, but for the common case of "type
  // and press Enter" the local filter is instant.
  const { data, isLoading, isError, error, refetch } = useFormList(
    page,
    limit,
    ""
  );
  const deleteForm = useDeleteForm();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);
  const [selected, setSelected] = useState<Peternak | null>(null);

  // Convert the backend FormItem[] into the local Peternak[] that
  // the rest of this page (rendering, status badges, Excel export)
  // was built around. Photos come back as paths from the API so the
  // transform wires them up as fully-qualified `${IMAGE_BASE}/...`
  // URLs on the resulting PhotoRef.preview.
  const list: Peternak[] = (data?.data ?? []).map(formItemToPeternak);

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAllFiltered = () => {
    setSelectedIds((prev) => {
      if (allFilteredSelected) {
        // Remove all filtered from selection
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      }
      // Add all filtered
      const next = new Set(prev);
      filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const selectedPeternak = useMemo(
    () => list.filter((p) => selectedIds.has(p.id)),
    [list, selectedIds]
  );

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    let success = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        await deleteForm.mutateAsync(id);
        success++;
      } catch {
        failed++;
      }
    }
    if (success > 0) {
      notifications.show({
        title: "Berhasil dihapus",
        message: `${success} data peternak telah dihapus dari server${
          failed > 0 ? `, ${failed} gagal.` : "."
        }`,
        color: failed > 0 ? "yellow" : "green",
      });
    } else {
      notifications.show({
        title: "Gagal menghapus",
        message: "Tidak ada data yang berhasil dihapus dari server.",
        color: "red",
      });
    }
    clearSelection();
    setConfirmBulkDel(false);
  };

  const handleBulkExport = () => {
    if (selectedPeternak.length === 0) return;
    try {
      const wb = buildLaporanWorkbook(selectedPeternak);
      downloadWorkbook(wb, `siternak-peternak-terpilih-${TIMESTAMP()}.xlsx`);
      notifications.show({
        title: "Berhasil diekspor",
        message: `${selectedPeternak.length} data peternak dipilih diekspor.`,
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

  const handleBulkPrint = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(",");
    if (typeof window !== "undefined") {
      window.open(`/dashboard/print?ids=${ids}`, "_blank");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q && !kategoriFilter) return list;
    return list.filter((p) => {
      const matchSearch =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        p.noKtp.toLowerCase().includes(q) ||
        (p.alamat.kelurahan?.name ?? "").toLowerCase().includes(q) ||
        (p.alamat.kabupaten?.name ?? "").toLowerCase().includes(q);
      const matchKategori = !kategoriFilter || p.kategori === kategoriFilter;
      return matchSearch && matchKategori;
    });
  }, [list, search, kategoriFilter]);

  const filteredIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);
  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someFilteredSelected = filtered.some((p) => selectedIds.has(p.id));
  const handleExportExcel = (data: Peternak[]) => {
    if (data.length === 0) {
      notifications.show({
        title: "Tidak ada data",
        message: "Tidak ada data untuk diekspor.",
        color: "yellow",
      });
      return;
    }
    try {
      const wb = buildLaporanWorkbook(data);
      downloadWorkbook(wb, `siternak-peternak-${TIMESTAMP()}.xlsx`);
      notifications.show({
        title: "Berhasil diekspor",
        message: `${data.length} data peternak disimpan ke Excel.`,
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

  if (isLoading) return <ListSkeleton />;

  if (isError) {
    return (
      <Container size="xl" px={0}>
        <Stack gap="md">
          <PageHeader
            eyebrow="Master Data"
            title="Daftar Peternak"
            description="Gagal memuat data dari server."
          />
          <Card withBorder padding="md" radius="md">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text fw={600} c="red.7">Terjadi kesalahan</Text>
                <Text fz="sm" c="dimmed">
                  {(error as Error)?.message || "Periksa koneksi Anda."}
                </Text>
              </Stack>
              <Button
                leftSection={<IconRefresh size={14} />}
                onClick={() => refetch()}
              >
                Coba lagi
              </Button>
            </Group>
          </Card>
        </Stack>
      </Container>
    );
  }

  const totalPages = data?.meta?.total_pages ?? 1;
  const total = data?.meta?.total_data ?? list.length;

  return (
    <Container size="xl" px={0}>
      <Stack gap="lg">
        <PageHeader
          eyebrow="Master Data"
          title="Daftar Peternak"
          description={`${total} peternak terdaftar. Klik baris untuk melihat detail.`}
          actions={
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push("/pendaftaran")}
            >
              Pendaftaran Baru
            </Button>
          }
        />

        <Card padding="md" radius="md" withBorder shadow="xs">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm" wrap="wrap">
              <TextInput
                placeholder="Cari nama, No. KTP, atau alamat..."
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                w={{ base: "100%", xs: 200, sm: 280 }}
              />
              <Select
                placeholder="Semua kategori"
                leftSection={<IconFilter size={14} />}
                value={kategoriFilter}
                onChange={(v) => setKategoriFilter(v || "")}
                data={[
                  { value: "", label: "Semua kategori" },
                  { value: "ayam_pedaging", label: "Ayam Pedaging" },
                  { value: "ayam_petelur", label: "Ayam Petelur" },
                ]}
                clearable={false}
                w={170}
              />
            </Group>
            <Button
              variant="light"
              leftSection={<IconFileSpreadsheet size={14} />}
              onClick={() => handleExportExcel(filtered)}
              disabled={filtered.length === 0}
            >
              Ekspor Excel
            </Button>
            <Group gap="xs">
              <Badge variant="light" color="primary" radius="sm">
                Total: {data?.meta?.total_data ?? list.length}
              </Badge>
              {(search || kategoriFilter) && (
                <Badge variant="light" color="blue" radius="sm">
                  Ditampilkan: {filtered.length}
                </Badge>
              )}
            </Group>

            <BulkActionBar
              count={selectedIds.size}
              total={filtered.length}
              noun="peternak"
              onClear={clearSelection}
              actions={[
                BulkActions.print(handleBulkPrint),
                BulkActions.exportExcel(handleBulkExport),
                BulkActions.delete(() => setConfirmBulkDel(true)),
              ]}
            />
          
          </Group>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState
            icon={IconUsers}
            title={list.length === 0 ? "Belum ada data" : "Tidak ada hasil"}
            description={
              list.length === 0
                ? "Belum ada peternak yang didaftarkan."
                : "Coba ubah kata kunci pencarian Anda."
            }
            action={
              list.length === 0 && (
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
                miw={800}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 44 }}>
                      <Checkbox
                        aria-label="Pilih semua"
                        checked={allFilteredSelected}
                        indeterminate={!allFilteredSelected && someFilteredSelected}
                        onChange={toggleAllFiltered}
                      />
                    </Table.Th>
                    <Table.Th>Nama</Table.Th>
                    <Table.Th>No. KTP</Table.Th>
                    <Table.Th>Kategori</Table.Th>
                    <Table.Th>Alamat</Table.Th>
                    <Table.Th>Kandang</Table.Th>
                    <Table.Th>Terdaftar</Table.Th>
                    <Table.Th style={{ width: 60 }} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((p) => (
                    <Table.Tr
                      key={p.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/dashboard/peternak/${p.id}`)}
                    >
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label={`Pilih ${p.nama}`}
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleOne(p.id)}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar
                            color="primary"
                            variant="light"
                            radius="xl"
                            size="md"
                          >
                            <IconUser size={14} />
                          </Avatar>
                          <Text fw={600}>{p.nama}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" ff="monospace">
                          {p.noKtp}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {p.kategori ? (
                          <StatusBadge
                            variant="custom"
                            label={KATEGORI_LABEL[p.kategori]}
                            color="primary"
                          />
                        ) : (
                          "—"
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" c="dimmed" lineClamp={1}>
                          {[
                            p.alamat.kelurahan?.name,
                            p.alamat.kecamatan?.name,
                            p.alamat.kabupaten?.name,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color="blue"
                          leftSection={<IconBuildingWarehouse size={12} />}
                          radius="sm"
                        >
                          {p.kandang.length}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="xs" c="dimmed">
                          {new Date(p.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                      </Table.Td>
                      <Table.Td onClick={(e) => e.stopPropagation()}>
                        <Group gap={4} justify="flex-end">
                          <Tooltip label="Lihat detail">
                            <ActionIcon
                              variant="light"
                              color="primary"
                              size="sm"
                              onClick={() => router.push(`/dashboard/peternak/${p.id}`)}
                            >
                              <IconArrowRight size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            {totalPages > 1 && (
              <Center p="md">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={totalPages}
                  color="primary"
                  radius="md"
                  withEdges
                />
              </Center>
            )}
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
              <Avatar color="primary" variant="light" radius="xl">
                <IconUser size={16} />
              </Avatar>
              <Text fw={700}>{selected.nama}</Text>
            </Group>
          )
        }
      >
        {selected && <PeternakDetail p={selected} />}
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
                Anda akan menghapus <Text span fw={700}>{selectedIds.size}</Text> data peternak sekaligus.
              </Text>
              <Text fz="xs" c="dimmed">
                Tindakan ini tidak dapat dibatalkan. Semua data termasuk
                foto dan koordinat GPS akan hilang permanen.
              </Text>
            </Stack>
          </Group>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setConfirmBulkDel(false)}>
              Batal
            </Button>
            <Button color="red" onClick={handleBulkDelete}>
              Ya, Hapus {selectedIds.size} Data
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

function PeternakDetail({ p }: { p: Peternak }) {
  return (
    <Stack gap="md">
      <Card withBorder padding="md" radius="md">
        <Stack gap="xs">
          <Group gap="sm">
            <Text fz="xs" fw={600} c="dimmed" w={110}>
              NO. KTP
            </Text>
            <Text fz="sm" ff="monospace">
              {p.noKtp}
            </Text>
          </Group>
          <Group gap="sm">
            <Text fz="xs" fw={600} c="dimmed" w={110}>
              KATEGORI
            </Text>
            {p.kategori && (
              <StatusBadge
                variant="custom"
                label={KATEGORI_LABEL[p.kategori]}
                color="primary"
              />
            )}
          </Group>
          <Group gap="sm" align="flex-start">
            <Text fz="xs" fw={600} c="dimmed" w={110}>
              ALAMAT
            </Text>
            <Text fz="sm" style={{ flex: 1 }}>
              {p.alamat.detail}, {p.alamat.kelurahan?.name},{" "}
              {p.alamat.kecamatan?.name}, {p.alamat.kabupaten?.name},{" "}
              {p.alamat.provinsi?.name}
            </Text>
          </Group>
        </Stack>
      </Card>

      {p.ktp.preview && (
        <Card withBorder padding="md" radius="md">
          <Text fz="xs" fw={600} c="dimmed" mb="xs">
            FOTO KTP
          </Text>
          <Image src={p.ktp.preview} alt="KTP" radius="md" />
        </Card>
      )}

      <Stack gap="sm">
        <Text fw={700}>Kandang ({p.kandang.length})</Text>
        {p.kandang.map((k, i) => (
          <Card key={k.id} withBorder padding="md" radius="md">
            <Stack gap="xs">
              <Group justify="space-between" wrap="wrap">
                <Group gap={6}>
                  <IconBuildingWarehouse size={14} color="var(--app-primary)" />
                  <Text fw={600}>{k.nama || `Kandang ${i + 1}`}</Text>
                </Group>
                <StatusBadge variant="operasional" value={k.statusOperasional} />
              </Group>
              <Text fz="xs" c="dimmed">
                {k.lokasi.lat}, {k.lokasi.lng} · {k.lokasi.alamat}
              </Text>
              <Group gap="xs" wrap="wrap">
                <StatusBadge
                  variant="custom"
                  label={`Kapasitas: ${KAPASITAS_LABEL[k.kapasitas] || "—"}`}
                  color="primary"
                />
                {k.statusOperasional === "operasi" && (
                  <>
                    <StatusBadge
                      variant="custom"
                      label={`Jumlah: ${KAPASITAS_LABEL[k.jumlahAyam] || "—"}`}
                      color="blue"
                    />
                    <StatusBadge
                      variant="custom"
                      label={
                        k.jenisUsaha === "kemitraan"
                          ? `Kemitraan: ${kemitraanLabel(k.kemitraan)}`
                          : JENIS_USAHA_LABEL.mandiri
                      }
                      color={k.jenisUsaha === "kemitraan" ? "accent" : "primary"}
                    />
                  </>
                )}
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}


// Named export so page.tsx can dynamic-load this with ssr: false.
// Same React #418/#423 hydration fix as the detail pages.
export function PeternakListClient() {
  return <PeternakListPage />;
}

function PeternakListPage() {
  return <PeternakListContent />;
}