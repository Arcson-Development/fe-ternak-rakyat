"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  ThemeIcon,
  Button,
  Card,
  Container,
  FileInput,
  Grid,
  Group,
  Modal,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconChartBar,
  IconDownload,
  IconFileSpreadsheet,
  IconPrinter,
  IconReportAnalytics,
  IconCheck,
  IconUpload,
} from "@tabler/icons-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { EmptyState } from "../../../components/ui/EmptyState";
import { usePeternakList, exportFormToExcel, type Peternak } from "../../../hooks/useTernakRakyat";
import {
  buildLaporanWorkbook,
  downloadWorkbook,
  TIMESTAMP,
  readExcelFile,
  buildAutoMapping,
  validateRows,
  buildPeternakFromRow,
  downloadImportTemplate,
  PETERNAK_IMPORT_COLUMNS,
  type ImportColumn,
  type ColumnMapping,
  type ValidatedRow,
} from "../../../lib/export";
import { useTernakStore } from "../../../hooks/useTernakRakyat";
import {
  DAFTAR_KEMITRAAN,
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  kemitraanLabel,
  type KategoriPeternak,
  type Kandang,
} from "../../../hooks/useTernakRakyat";

export default function LaporanPage() {
  const list = usePeternakList();
  const [kategoriFilter, setKategoriFilter] = React.useState<string | null>("all");
  const [provinsiFilter, setProvinsiFilter] = React.useState<string | null>("all");

  const provinsiList = useMemo(() => {
    const set = new Set<string>();
    list.forEach((p) => p.alamat.provinsi && set.add(p.alamat.provinsi.name));
    return Array.from(set).sort();
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter((p) => {
      if (kategoriFilter && kategoriFilter !== "all" && p.kategori !== kategoriFilter) return false;
      if (
        provinsiFilter && provinsiFilter !== "all" &&
        p.alamat.provinsi?.name !== provinsiFilter
      ) return false;
      return true;
    });
  }, [list, kategoriFilter, provinsiFilter]);

  const totalKandang = filtered.reduce((acc, p) => acc + p.kandang.length, 0);
  const totalOperasi = filtered.reduce(
    (acc, p) => acc + p.kandang.filter((k) => k.statusOperasional === "operasi").length,
    0
  );
  const totalAyam = filtered.reduce((acc, p) => {
    return (
      acc +
      p.kandang.reduce((s, k) => {
        if (k.statusOperasional !== "operasi") return s;
        const cap = k.jumlahAyam;
        return s + (cap === "<2500" ? 2000 : cap === "2500-5000" ? 3750 : cap === ">5000" ? 6000 : 0);
      }, 0)
    );
  }, 0);

  // Aggregate by kategori
  const byKategori: Record<string, number> = {};
  filtered.forEach((p) => {
    if (p.kategori) byKategori[p.kategori] = (byKategori[p.kategori] ?? 0) + 1;
  });

  // Aggregate by kemitraan
  const byMitra: Record<string, number> = {};
  filtered.forEach((p) => {
    p.kandang.forEach((k) => {
      if (k.statusOperasional === "operasi" && k.jenisUsaha === "kemitraan") {
        const m = k.kemitraan || "Lainnya";
        byMitra[m] = (byMitra[m] ?? 0) + 1;
      }
    });
  });

  // Aggregate by kapasitas
  const byKapasitas: Record<string, number> = {};
  filtered.forEach((p) => {
    p.kandang.forEach((k) => {
      if (k.kapasitas) byKapasitas[k.kapasitas] = (byKapasitas[k.kapasitas] ?? 0) + 1;
    });
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const addMany = useTernakStore((s) => s.addMany);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importHeaders, setImportHeaders] = useState<string[]>([]);
    const [importMapping, setImportMapping] = useState<ColumnMapping>({});
    const [importRows, setImportRows] = useState<Record<string, string | number>[]>([]);
    const [importValidation, setImportValidation] = useState<{ valid: ValidatedRow[]; errors: any[] } | null>(null);
    const [importStage, setImportStage] = useState<"upload" | "mapping" | "review" | "done">("upload");
    const [importedCount, setImportedCount] = useState(0);

    // Backend-export modal state. `exportRange` is [start, end] picked
    // via Mantine's DatePickerInput; we normalise both ends to YYYY-MM-DD
    // before calling /form-export/export-to-excel.
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportRange, setExportRange] = useState<[Date | null, Date | null]>([
      null,
      null,
    ]);

    const formatYmd = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

  const handleFileSelected = async (file: File | null) => {
    setImportFile(file);
    setImportStage("upload");
    setImportValidation(null);
    if (!file) return;
    try {
      const { rows } = await readExcelFile(file);
      if (rows.length === 0) {
        notifications.show({
          title: "File kosong",
          message: "File Excel tidak memiliki baris data.",
          color: "yellow",
        });
        return;
      }
      const headers = Object.keys(rows[0] || {});
      setImportHeaders(headers);
      setImportRows(rows);
      setImportMapping(buildAutoMapping(headers));
      setImportStage("mapping");
    } catch (e: any) {
      notifications.show({
        title: "Gagal membaca file",
        message: e.message || "File Excel tidak valid.",
        color: "red",
      });
    }
  };

  const handleValidate = () => {
    const result = validateRows(importRows, importMapping);
    setImportValidation(result);
    setImportStage("review");
  };

  const handleConfirmImport = () => {
    if (!importValidation) return;
    let count = 0;
        importValidation.valid.forEach((row) => {
          const data = buildPeternakFromRow(row.data, row.row);
          // buildPeternakFromRow returns the legacy shape that predates the
          // `catatan` field — coerce via unknown so TS doesn't complain
          // about a missing required property on import-side data.
          addMany([data as unknown as Peternak]);
          count++;
        });
    setImportedCount(count);
    setImportStage("done");
    notifications.show({
      title: "Impor selesai",
      message: `${count} data peternak berhasil ditambahkan.`,
      color: "green",
      icon: <IconFileSpreadsheet size={18} />,
    });
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
    setImportFile(null);
    setImportHeaders([]);
    setImportMapping({});
    setImportRows([]);
    setImportValidation(null);
    setImportStage("upload");
    setImportedCount(0);
  };

  const handleExportExcel = async () => {
      setExportModalOpen(true);
    };

    const confirmExportBackend = async () => {
      if (!exportRange[0] || !exportRange[1]) {
        notifications.show({
          title: "Tanggal belum lengkap",
          message: "Pilih tanggal mulai dan tanggal selesai terlebih dahulu.",
          color: "yellow",
        });
        return;
      }
      const startDate = formatYmd(exportRange[0]);
      const endDate = formatYmd(exportRange[1]);
      setExporting(true);
      try {
        const blob = await exportFormToExcel(startDate, endDate);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `siternak-export-${startDate}-sd-${endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Revoke after a short delay so Safari has time to start the
        // download before the URL dies.
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        notifications.show({
          title: "Berhasil diekspor",
          message: `Data ${startDate} s.d. ${endDate} diunduh dari server.`,
          color: "green",
          icon: <IconFileSpreadsheet size={18} />,
        });
        setExportModalOpen(false);
      } catch (e: any) {
        notifications.show({
          title: "Gagal mengekspor",
          message:
            e?.message ||
            "Server gagal memproses ekspor. Coba lagi atau hubungi admin.",
          color: "red",
        });
      } finally {
        setExporting(false);
      }
    };

    /**
     * Local fallback: build the workbook from the in-memory list when
     * the backend's /form-export/export-to-excel isn't reachable
     * (demo mode, missing admin token, 5xx). Preserves the existing
     * "offline-ish" feel for users who don't want to login as admin.
     */
    const handleExportLocal = (subset?: Peternak[]) => {
      const data = subset ?? list;
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
        const ts = TIMESTAMP();
        const tag = subset ? "-filter" : "";
        downloadWorkbook(wb, `siternak-laporan${tag}-${ts}.xlsx`);
        notifications.show({
          title: "Berhasil diekspor (lokal)",
          message: `${data.length} data peternak disimpan ke Excel dari cache lokal.`,
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
    };


  return (
    <Container size="xl" px={0}>
      <Stack gap="lg" className="no-print-when-needed">
        <PageHeader
          eyebrow="Laporan &amp; Ekspor"
          title="Laporan Peternak"
          description="Rekapitulasi data pendaftaran, dapat difilter per kategori/provinsi dan diekspor ke CSV."
          actions={
            <Group gap="sm">
              <Button
            leftSection={<IconUpload size={14} />}
            onClick={() => setImportModalOpen(true)}
          >
            Impor Excel
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconDownload size={14} />}
            onClick={downloadImportTemplate}
          >
            Template
          </Button>
          <Button
                variant="default"
                leftSection={<IconPrinter size={14} />}
                onClick={handlePrint}
                disabled={filtered.length === 0}
              >
                Cetak
              </Button>
              <Button
                              leftSection={<IconDownload size={14} />}
                              onClick={handleExportExcel}
                              disabled={filtered.length === 0}
                            >
                              Ekspor Excel
                            </Button>
                            <Button
                              variant="subtle"
                              leftSection={<IconDownload size={14} />}
                              onClick={() => handleExportLocal(filtered)}
                              disabled={filtered.length === 0}
                              size="xs"
                            >
                              (Lokal)
                            </Button>
            </Group>
          }
        />

        <Card padding="md" radius="md" withBorder shadow="xs">
          <Group gap="sm" wrap="wrap">
            <Select
              label="Kategori"
              data={[
                { value: "all", label: "Semua Kategori" },
                { value: "ayam_pedaging", label: KATEGORI_LABEL.ayam_pedaging },
                { value: "ayam_petelur", label: KATEGORI_LABEL.ayam_petelur },
              ]}
              value={kategoriFilter}
              onChange={setKategoriFilter}
              w={220}
            />
            <Select
              label="Provinsi"
              data={[
                { value: "all", label: "Semua Provinsi" },
                ...provinsiList.map((p) => ({ value: p, label: p })),
              ]}
              value={provinsiFilter}
              onChange={setProvinsiFilter}
              w={240}
            />
          </Group>
        </Card>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Peternak" value={filtered.length} icon={IconReportAnalytics} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Kandang" value={totalKandang} icon={IconChartBar} iconColor="blue" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard label="Kandang Operasi" value={totalOperasi} icon={IconChartBar} iconColor="primary" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Perkiraan Ayam"
              value={totalAyam.toLocaleString("id-ID")}
              icon={IconChartBar}
              iconColor="accent"
            />
          </Grid.Col>
        </Grid>

        {filtered.length === 0 ? (
          <EmptyState
            icon={IconReportAnalytics}
            title="Belum ada data"
            description="Belum ada peternak yang cocok dengan filter saat ini."
          />
        ) : (
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <BreakdownCard
                title="Komposisi per Kategori"
                rows={(Object.keys(KATEGORI_LABEL) as KategoriPeternak[]).map((k) => ({
                  label: KATEGORI_LABEL[k],
                  value: byKategori[k] ?? 0,
                  total: filtered.length,
                  color: k === "ayam_pedaging" ? "var(--app-primary)" : "var(--app-accent)",
                }))}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <BreakdownCard
                title="Komposisi per Kapasitas Kandang"
                rows={(["<2500", "2500-5000", ">5000"] as const).map((k) => ({
                  label: KAPASITAS_LABEL[k],
                  value: byKapasitas[k] ?? 0,
                  total: totalKandang,
                  color: "#3b82f6",
                }))}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Card padding="lg" radius="md" withBorder shadow="xs">
                <Text fw={700} fz="md" mb="sm">
                  Komposisi per Mitra Kemitraan
                </Text>
                {Object.keys(byMitra).length === 0 ? (
                  <Text fz="sm" c="dimmed">
                    Belum ada data kandang dengan skema kemitraan.
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {DAFTAR_KEMITRAAN.filter((m) => byMitra[m]).map((m) => (
                      <Bar key={m} label={kemitraanLabel(m)} value={byMitra[m]} total={totalOperasi} color="#f59e0b" />
                    ))}
                    {Object.keys(byMitra)
                      .filter((m) => !(DAFTAR_KEMITRAAN as readonly string[]).includes(m))
                      .map((m) => (
                        <Bar key={m} label={kemitraanLabel(m)} value={byMitra[m]} total={totalOperasi} color="#94a3b8" />
                      ))}
                  </Stack>
                )}
              </Card>
            </Grid.Col>
            <Grid.Col span={12}>
              <Card padding="lg" radius="md" withBorder shadow="xs">
                <Group justify="space-between" mb="sm">
                  <Text fw={700} fz="md">Tabel Ringkasan</Text>
                  <Text fz="xs" c="dimmed">{filtered.length} baris</Text>
                </Group>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Nama</Table.Th>
                      <Table.Th>Kategori</Table.Th>
                      <Table.Th>Alamat</Table.Th>
                      <Table.Th>Kandang</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtered.map((p) => {
                      const op = p.kandang.filter((k) => k.statusOperasional === "operasi").length;
                      return (
                        <Table.Tr key={p.id}>
                          <Table.Td>
                            <Text fz="sm" fw={600}>{p.nama}</Text>
                          </Table.Td>
                          <Table.Td>
                            {p.kategori && (
                              <StatusBadge variant="custom" label={KATEGORI_LABEL[p.kategori]} color="primary" />
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Text fz="xs" c="dimmed" lineClamp={1}>
                              {p.alamat.kabupaten?.name}, {p.alamat.provinsi?.name}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm">{p.kandang.length}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="xs">
                              {op} operasi / {p.kandang.length - op} tidak
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Card>
            </Grid.Col>
          </Grid>
        )}
     

      <Modal
        opened={importModalOpen}
        onClose={closeImportModal}
        title={
          <Group gap="xs">
            <ThemeIcon color="primary" variant="light" size="md" radius="md">
              <IconUpload size={14} />
            </ThemeIcon>
            <Text fw={700}>Impor Data Peternak dari Excel</Text>
          </Group>
        }
        size="xl"
        centered
      >
        {importStage === "upload" && (
          <Stack gap="md">
            <Text fz="sm" c="dimmed">
              Unggah file Excel (.xlsx) dengan data peternak. Kolom yang
              akan dikenali otomatis: Nama, No. KTP, Kategori, Provinsi,
              Kabupaten, Kecamatan, Kelurahan, Alamat.
            </Text>
            <FileInput
              label="File Excel"
              placeholder="Pilih file .xlsx"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              leftSection={<IconUpload size={14} />}
              value={importFile}
              onChange={handleFileSelected}
              clearable
            />
            <Group justify="space-between">
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconDownload size={14} />}
                onClick={downloadImportTemplate}
              >
                Unduh Template Kosong
              </Button>
            </Group>
            <Alert color="blue" variant="light">
              <Text fz="sm">
                <b>Tips:</b> Kolom wajib adalah <b>Nama</b> dan <b>No. KTP</b>.
                Header akan dikenali otomatis berdasarkan sinonim. Anda bisa
                memetakan ulang di langkah berikutnya.
              </Text>
            </Alert>
          </Stack>
        )}

        {importStage === "mapping" && (
          <Stack gap="md">
            <Text fz="sm">
              Sistem mengenali <b>{Object.values(importMapping).filter(Boolean).length}</b> dari <b>{importHeaders.length}</b> kolom. Atur pemetaan jika perlu.
            </Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Header di Excel</Table.Th>
                  <Table.Th>Contoh Isi</Table.Th>
                  <Table.Th>Pemetaan ke Field</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {importHeaders.map((h) => {
                  const example = String(importRows[0]?.[h] ?? "");
                  const mapped = importMapping[h];
                  return (
                    <Table.Tr key={h}>
                      <Table.Td>
                        <Text fz="sm" fw={600}>{h}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="xs" c="dimmed" truncate style={{ maxWidth: 200 }}>{example}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Select
                          size="xs"
                          placeholder="(abaikan kolom ini)"
                          data={PETERNAK_IMPORT_COLUMNS.map((c) => ({ value: c.label, label: c.label }))}
                          value={mapped?.label || null}
                          onChange={(v) => {
                            setImportMapping((prev) => ({
                              ...prev,
                              [h]: PETERNAK_IMPORT_COLUMNS.find((c) => c.label === v) || null,
                            }));
                          }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
            <Group justify="space-between">
              <Button variant="default" onClick={() => setImportStage("upload")}>Kembali</Button>
              <Button onClick={handleValidate}>Lanjut ke Validasi</Button>
            </Group>
          </Stack>
        )}

        {importStage === "review" && importValidation && (
          <Stack gap="md">
            <Group gap="md">
              <Alert color="green" variant="light" style={{ flex: 1 }}>
                <Text fz="sm" fw={600}>{importValidation.valid.length} baris valid</Text>
                <Text fz="xs">Siap diimpor</Text>
              </Alert>
              <Alert color={importValidation.errors.length > 0 ? "red" : "gray"} variant="light" style={{ flex: 1 }}>
                <Text fz="sm" fw={600}>{importValidation.errors.length} error</Text>
                <Text fz="xs">{importValidation.errors.length === 0 ? "Tidak ada masalah" : "Perbaiki di file Excel"}</Text>
              </Alert>
            </Group>

            {importValidation.errors.length > 0 && (
              <ScrollArea h={200}>
                <Stack gap={4}>
                  {importValidation.errors.slice(0, 50).map((e, i) => (
                    <Text fz="xs" key={i}>
                      Baris {e.row}, <b>{e.field}</b>: {e.message}
                    </Text>
                  ))}
                </Stack>
              </ScrollArea>
            )}

            {importValidation.valid.length > 0 && (
              <ScrollArea h={200}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Baris</Table.Th>
                      <Table.Th>Nama</Table.Th>
                      <Table.Th>No. KTP</Table.Th>
                      <Table.Th>Kategori</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {importValidation.valid.slice(0, 20).map((r) => (
                      <Table.Tr key={r.row}>
                        <Table.Td><Text fz="xs">{r.row}</Text></Table.Td>
                        <Table.Td><Text fz="xs">{r.data["Nama Lengkap"]}</Text></Table.Td>
                        <Table.Td><Text fz="xs" ff="monospace">{r.data["No. KTP"]}</Text></Table.Td>
                        <Table.Td><Text fz="xs">{r.data.Kategori || "—"}</Text></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                {importValidation.valid.length > 20 && (
                  <Text fz="xs" c="dimmed" ta="center" mt="sm">
                    ... dan {importValidation.valid.length - 20} baris lainnya
                  </Text>
                )}
              </ScrollArea>
            )}

            <Group justify="space-between">
              <Button variant="default" onClick={() => setImportStage("mapping")}>Kembali</Button>
              <Button
                color="green"
                disabled={importValidation.valid.length === 0}
                onClick={handleConfirmImport}
              >
                Impor {importValidation.valid.length} Data
              </Button>
            </Group>
          </Stack>
        )}

        {importStage === "done" && (
          <Stack gap="md" align="center" py="xl">
            <ThemeIcon color="green" size={64} radius="xl">
              <IconCheck size={32} />
            </ThemeIcon>
            <Stack gap={4} align="center">
              <Text fz="lg" fw={700}>Impor Selesai</Text>
              <Text fz="sm" c="dimmed">
                {importedCount} data peternak berhasil ditambahkan ke sistem.
              </Text>
            </Stack>
            <Button onClick={closeImportModal}>Tutup</Button>
                      </Stack>
                    )}
                  </Modal>

                  {/* Export modal — asks for date range, then hits /form-export/export-to-excel */}
                  <Modal
                    opened={exportModalOpen}
                    onClose={() => (exporting ? null : setExportModalOpen(false))}
                    title={
                      <Group gap="xs">
                        <ThemeIcon color="primary" variant="light" size="md" radius="md">
                          <IconFileSpreadsheet size={14} />
                        </ThemeIcon>
                        <Text fw={700}>Ekspor Data ke Excel</Text>
                      </Group>
                    }
                    centered
                    size="md"
                  >
                    <Stack gap="md">
                      <Text fz="sm" c="dimmed">
                        Pilih rentang tanggal pendaftaran. Backend akan membuat file
                        Excel dengan semua data yang dibuat dalam rentang tersebut.
                      </Text>
                      <DatePickerInput
                        type="range"
                        label="Rentang Tanggal"
                        placeholder="Pilih tanggal mulai dan selesai"
                        value={exportRange}
                        onChange={(v) => setExportRange(v as [Date | null, Date | null])}
                        maxDate={new Date()}
                        leftSection={<IconCalendar size={16} />}
                        clearable
                        popoverProps={{ withinPortal: true }}
                      />
                      <Alert color="blue" variant="light">
                        <Text fz="xs">
                          Endpoint <code>POST /form-export/export-to-excel</code>{" "}
                          memerlukan token admin. Login admin akan dilakukan otomatis
                          saat Anda menekan tombol Ekspor.
                        </Text>
                      </Alert>
                      <Group justify="flex-end" gap="sm">
                        <Button
                          variant="default"
                          onClick={() => setExportModalOpen(false)}
                          disabled={exporting}
                        >
                          Batal
                        </Button>
                        <Button
                          leftSection={<IconDownload size={14} />}
                          onClick={confirmExportBackend}
                          loading={exporting}
                          disabled={!exportRange[0] || !exportRange[1]}
                        >
                          Ekspor
                        </Button>
                      </Group>
                    </Stack>
                  </Modal>
                 </Stack>
                </Container>
  );
}

function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; total: number; color: string }[];
}) {
  return (
    <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
      <Text fw={700} fz="md" mb="md">{title}</Text>
      <Stack gap="md">
        {rows.map((r) => (
          <Bar key={r.label} {...r} />
        ))}
      </Stack>
    </Card>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <Stack gap={4}>
      <Group justify="space-between">
        <Text fz="sm" fw={500}>{label}</Text>
        <Text fz="sm" c="dimmed">{value} ({pct}%)</Text>
      </Group>
      <div
        style={{
          height: 8,
          background: "var(--app-surface-sunken)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            transition: "width 0.4s",
          }}
        />
      </div>
    </Stack>
  );
}
