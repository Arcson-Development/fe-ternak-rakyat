"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Center,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconPrinter,
} from "@tabler/icons-react";
import {
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  KONDISI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  kemitraanLabel,
  useFormById,
  formItemToPeternak,
  type Peternak,
} from "../../../hooks/useTernakRakyat";
import { useThemeStore } from "../../../hooks/useTheme";

/**
 * Bulk-print page: renders N Peternak records, one per page, with
 * a `page-break-before: always` between them. URL form:
 *
 *   /dashboard/print?ids=25,26,27
 *
 * Opened by the BulkActionBar's "Cetak" action on the admin list.
 * After opening, the user just hits the page's "Cetak / Simpan PDF"
 * button and gets a single print dialog covering all selected
 * records.
 *
 * Uses `useFormById` per id (one React Query per record). Up to
 * ~20 ids in one batch is fine; beyond that the print page would
 * get unwieldy and the user can split into two batches.
 */
// Named export so page.tsx can dynamic-load this with ssr: false.
export function BatchPrintClient() {
  return <BatchPrintPage />;
}

function BatchPrintPage() {
  return (
    <Suspense fallback={null}>
      <BatchPrintPageInner />
    </Suspense>
  );
}

function BatchPrintPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = useThemeStore((s) => s.mode);
  const resolved = useThemeStore((s) => s.resolved);

  const ids = (search.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Force light mode for print so we get a clean white background.
  useEffect(() => {
    if (resolved === "dark") {
      useThemeStore.getState().setMode("light");
      return () => {
        useThemeStore.getState().setMode(mode);
      };
    }
  }, [resolved, mode]);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (ids.length === 0) {
    return (
      <Center mih="100vh">
        <Stack align="center" gap="sm">
          <Text fz="lg" fw={700}>Tidak ada ID yang dipilih</Text>
          <Text fz="sm" c="dimmed">
            Buka halaman ini dari tombol "Cetak" di daftar peternak
            setelah memilih minimal satu baris.
          </Text>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => router.push("/dashboard/peternak")}
          >
            Kembali ke daftar
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Toolbar (hidden on print) */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#0f172a",
          color: "white",
          padding: "12px 24px",
        }}
      >
        <Group justify="space-between" maw={920} mx="auto">
          <Text fz="sm" fw={600}>
            Mode Cetak · SITERNAK · {ids.length} lembar data
          </Text>
          <Group gap="xs">
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => router.push("/dashboard/peternak")}
            >
              Kembali
            </Button>
            <Button
              size="xs"
              leftSection={<IconPrinter size={14} />}
              onClick={handlePrint}
            >
              Cetak / Simpan PDF
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Documents: one per id, with hard page break between */}
      <Box className="print-area">
        {ids.map((id, idx) => (
          <RecordSheet
            key={id}
            id={id}
            isFirst={idx === 0}
            onLoaded={() => {
              /* hook for future progress tracking */
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

// ================== single-record sheet (fetches its own data) ==================

function RecordSheet({
  id,
  isFirst,
}: {
  id: string;
  isFirst: boolean;
  onLoaded?: () => void;
}) {
  const { data: formData, isLoading, isError } = useFormById(id);
  const [peternak, setPeternak] = useState<Peternak | null>(null);

  useEffect(() => {
    setPeternak(formData ? formItemToPeternak(formData) : null);
  }, [formData]);

  if (isLoading) {
    return (
      <Box
        className="print-page"
        style={{
          maxWidth: 920,
          margin: "24px auto",
          padding: "60px 48px",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          pageBreakBefore: isFirst ? "auto" : "always",
        }}
      >
        <Text fz="sm" c="dimmed">Memuat lembar #{id}...</Text>
      </Box>
    );
  }

  if (isError || !peternak) {
    return (
      <Box
        className="print-page"
        style={{
          maxWidth: 920,
          margin: "24px auto",
          padding: "60px 48px",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          pageBreakBefore: isFirst ? "auto" : "always",
        }}
      >
        <Text fz="md" fw={700} c="red.7">
          Gagal memuat data untuk ID "{id}"
        </Text>
      </Box>
    );
  }

  return <RecordDocument peternak={peternak} isFirst={isFirst} />;
}

// ================== document layout (same fields as single print) ==================

function RecordDocument({
  peternak,
  isFirst,
}: {
  peternak: Peternak;
  isFirst: boolean;
}) {
  const { nama, noKtp, ktp, kategori, alamat, kandang } = peternak;
  return (
    <Box
      className="print-page"
      style={{
        maxWidth: 920,
        margin: "24px auto",
        padding: "40px 48px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        pageBreakBefore: isFirst ? "auto" : "always",
      }}
    >
      {/* Header */}
      <Group
        justify="space-between"
        align="flex-start"
        mb="xl"
        pb="md"
        style={{ borderBottom: "3px solid #13bc6d" }}
      >
        <Stack gap={4}>
          <Text fz={22} fw={800} c="#0f172a" lh={1.1}>
            SITERNAK
          </Text>
          <Text
            fz="xs"
            c="#64748b"
            tt="uppercase"
            fw={600}
            style={{ letterSpacing: "0.1em" }}
          >
            Pengembangan Ternak Rakyat
          </Text>
          <Text fz="xs" c="#64748b">
            Lembar Data Peternak ·{" "}
            {new Date(peternak.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </Stack>
        <Stack gap={4} align="flex-end">
          <Text fz="xs" c="#64748b">ID Pendaftaran</Text>
          <Text fz="sm" fw={700} ff="monospace">{peternak.id}</Text>
          <Text fz="xs" c="#64748b">Kategori</Text>
          <Text fz="sm" fw={700}>{KATEGORI_LABEL[kategori]}</Text>
        </Stack>
      </Group>

      {/* Identitas */}
      <Section title="Identitas Peternak">
        <Grid2>
          <Field2 label="Nama Lengkap" value={nama} />
          <Field2 label="Nomor KTP" value={noKtp} mono />
          <Field2
            label="KTP (Lampiran)"
            value={ktp.preview ? "Terlampir" : "Tidak ada"}
          />
          <Field2 label="Kategori" value={KATEGORI_LABEL[kategori]} />
          <Field2
            label="Alamat"
            value={[
              alamat.detail,
              alamat.kelurahan?.name,
              alamat.kecamatan?.name,
              alamat.kabupaten?.name,
              alamat.provinsi?.name,
            ]
              .filter(Boolean)
              .join(", ")}
            full
          />
        </Grid2>
      </Section>

      {/* Kandang sections */}
      {kandang.map((k, i) => (
        <Section
          key={k.id}
          title={`Kandang ${i + 1}: ${k.nama || `Kandang ${i + 1}`}`}
          subtitle={`Kapasitas ${KAPASITAS_LABEL[k.kapasitas]}`}
        >
          <Grid2>
            <Field2
              label="Lokasi (GPS)"
              value={
                k.lokasi.lat !== null && k.lokasi.lng !== null
                  ? `${k.lokasi.lat.toFixed(6)}, ${k.lokasi.lng.toFixed(6)}`
                  : "—"
              }
              mono
            />
            <Field2 label="Alamat Kandang" value={k.lokasi.alamat} full />
            <FieldGroup2 title="Kondisi Kandang">
              <ConditionRow2 label="Dinding" kondisi={k.kondisi.dinding.kondisi} />
              <ConditionRow2 label="Atap" kondisi={k.kondisi.atap.kondisi} />
              <ConditionRow2 label="Lantai" kondisi={k.kondisi.lantai.kondisi} />
            </FieldGroup2>
            <FieldGroup2 title="Peralatan">
              <ConditionRow2 label="Tempat Minum" kondisi={k.peralatan.tempatMinum.kondisi} />
              <ConditionRow2 label="Tempat Makan" kondisi={k.peralatan.tempatMakan.kondisi} />
              <ConditionRow2 label="Brooding/Pemanas" kondisi={k.peralatan.brooding.kondisi} />
              <ConditionRow2 label="Kipas" kondisi={k.peralatan.kipas.kondisi} />
            </FieldGroup2>
            <FieldGroup2 title="Status Operasional">
              <Field2
                label="Status"
                value={STATUS_OPERASIONAL_LABEL[k.statusOperasional]}
              />
              {k.statusOperasional === "operasi" && (
                <>
                  <Field2 label="Jumlah Ayam" value={KAPASITAS_LABEL[k.jumlahAyam]} />
                  <Field2 label="Jenis Usaha" value={JENIS_USAHA_LABEL[k.jenisUsaha]} />
                  {k.jenisUsaha === "kemitraan" && (
                    <Field2
                      label="Nama Kemitraan"
                      value={kemitraanLabel(k.kemitraan)}
                      full
                    />
                  )}
                </>
              )}
            </FieldGroup2>
          </Grid2>
        </Section>
      ))}

      {/* Footer */}
      <Text fz="xs" c="#94a3b8" ta="center" mt="xl">
        Dokumen ini dicetak secara otomatis dari SITERNAK. Untuk
        verifikasi keaslian, hubungi administrator.
      </Text>
    </Box>
  );
}

// ================== local subcomponents (renamed with 2 suffix to avoid clash) ==================

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box mb="lg">
      <Box mb="sm">
        <Text fz="md" fw={700} c="#0f172a">{title}</Text>
        {subtitle && <Text fz="xs" c="#64748b">{subtitle}</Text>}
      </Box>
      {children}
    </Box>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <Box style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {children}
    </Box>
  );
}

function Field2({
  label,
  value,
  mono,
  full,
}: {
  label: string;
  value: string;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <Box style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <Text fz="xs" c="#64748b" tt="uppercase" style={{ letterSpacing: "0.04em" }}>
        {label}
      </Text>
      <Text fz="sm" fw={500} ff={mono ? "monospace" : undefined}>
        {value || "—"}
      </Text>
    </Box>
  );
}

function FieldGroup2({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box style={{ gridColumn: "1 / -1" }} p="sm" mt="xs">
      <Text
        fz="xs"
        fw={700}
        c="#13bc6d"
        tt="uppercase"
        mb="xs"
        style={{ letterSpacing: "0.06em" }}
      >
        {title}
      </Text>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function ConditionRow2({ label, kondisi }: { label: string; kondisi: string }) {
  const colors: Record<string, string> = {
    baik: "#13bc6d",
    sedang: "#f59e0b",
    rusak: "#ef4444",
  };
  return (
    <Box
      style={{
        padding: "6px 10px",
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        background: "#f8fafc",
      }}
    >
      <Text fz="xs" c="#64748b">{label}</Text>
      <Text fz="sm" fw={600} style={{ color: colors[kondisi] ?? "#0f172a" }}>
        {KONDISI_LABEL[kondisi as keyof typeof KONDISI_LABEL] || "—"}
      </Text>
    </Box>
  );
}
