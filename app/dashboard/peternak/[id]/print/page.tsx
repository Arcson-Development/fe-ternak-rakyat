"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Center,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconPrinter } from "@tabler/icons-react";
import {
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  KONDISI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  kemitraanLabel,
  usePeternakList,
  type Peternak,
} from "../../../../../hooks/useTernakRakyat";
import { useThemeStore } from "../../../../../hooks/useTheme";

/**
 * Print-optimized one-pager for a single Peternak record. Designed
 * to be opened in a popup or new tab, then printed (or "Save as PDF")
 * via the browser's print dialog.
 *
 * Layout: A4 portrait, single page, large headings, full-width
 * photos, signed footer. No interactivity, no AppShell.
 */
export default function PeternakPrintPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const list = usePeternakList();
  const mode = useThemeStore((s) => s.mode);
  const resolved = useThemeStore((s) => s.resolved);

  const [peternak, setPeternak] = useState<Peternak | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const found = list.find((p) => p.id === params.id) ?? null;
    setPeternak(found);
    setLoaded(true);
  }, [params.id, list]);

  useEffect(() => {
    // Force light mode for print so we get a clean white background
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

  if (!loaded) {
    return (
      <Center mih="100vh">
        <Text fz="sm" c="dimmed">Memuat...</Text>
      </Center>
    );
  }
  if (!peternak) {
    return (
      <Center mih="100vh">
        <Stack align="center" gap="sm">
          <Text fz="lg" fw={700}>Data tidak ditemukan</Text>
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

  const { nama, noKtp, ktp, kategori, alamat, kandang } = peternak;

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
          print: { display: "none" },
        } as any}
      >
        <Group justify="space-between" maw={920} mx="auto">
          <Text fz="sm" fw={600}>Mode Cetak · SITERNAK</Text>
          <Group gap="xs">
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => router.push(`/dashboard/peternak/${peternak.id}`)}
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

      {/* Document */}
      <Box
        style={{
          maxWidth: 920,
          margin: "24px auto",
          padding: "40px 48px",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
        }}
      >
        {/* Header */}
        <Group justify="space-between" align="flex-start" mb="xl" pb="md" style={{ borderBottom: "3px solid #13bc6d" }}>
          <Stack gap={4}>
            <Text fz={22} fw={800} c="#0f172a" lh={1.1}>
              SITERNAK
            </Text>
            <Text fz="xs" c="#64748b" tt="uppercase" fw={600} style={{ letterSpacing: "0.1em" }}>
              Pengembangan Ternak Rakyat
            </Text>
            <Text fz="xs" c="#64748b">
              Lembar Data Peternak · {new Date(peternak.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit", month: "long", year: "numeric",
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
          <Grid>
            <Field label="Nama Lengkap" value={nama} />
            <Field label="Nomor KTP" value={noKtp} mono />
            <Field
              label="KTP (Lampiran)"
              value={ktp.preview ? "Terlampir" : "Tidak ada"}
            />
            <Field
              label="Kategori"
              value={KATEGORI_LABEL[kategori]}
            />
            <Field
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
          </Grid>
        </Section>

        {/* Kandang sections */}
        {kandang.map((k, i) => (
          <Section
            key={k.id}
            title={`Kandang ${i + 1}: ${k.nama || `Kandang ${i + 1}`}`}
            subtitle={`Kapasitas ${KAPASITAS_LABEL[k.kapasitas]}`}
          >
            <Grid>
              <Field
                label="Lokasi (GPS)"
                value={
                  k.lokasi.lat !== null && k.lokasi.lng !== null
                    ? `${k.lokasi.lat.toFixed(6)}, ${k.lokasi.lng.toFixed(6)}`
                    : "—"
                }
                mono
              />
              <Field label="Alamat Kandang" value={k.lokasi.alamat} full />

              <FieldGroup title="Kondisi Kandang">
                <ConditionRow label="Dinding" kondisi={k.kondisi.dinding.kondisi} />
                <ConditionRow label="Atap" kondisi={k.kondisi.atap.kondisi} />
                <ConditionRow label="Lantai" kondisi={k.kondisi.lantai.kondisi} />
              </FieldGroup>

              <FieldGroup title="Peralatan">
                <ConditionRow label="Tempat Minum" kondisi={k.peralatan.tempatMinum.kondisi} />
                <ConditionRow label="Tempat Makan" kondisi={k.peralatan.tempatMakan.kondisi} />
                <ConditionRow label="Brooding/Pemanas" kondisi={k.peralatan.brooding.kondisi} />
                <ConditionRow label="Kipas" kondisi={k.peralatan.kipas.kondisi} />
              </FieldGroup>

              <FieldGroup title="Status Operasional">
                <Field
                  label="Status"
                  value={STATUS_OPERASIONAL_LABEL[k.statusOperasional]}
                />
                {k.statusOperasional === "operasi" && (
                  <>
                    <Field
                      label="Jumlah Ayam"
                      value={KAPASITAS_LABEL[k.jumlahAyam]}
                    />
                    <Field
                      label="Jenis Usaha"
                      value={JENIS_USAHA_LABEL[k.jenisUsaha]}
                    />
                    {k.jenisUsaha === "kemitraan" && (
                      <Field
                        label="Nama Kemitraan"
                        value={kemitraanLabel(k.kemitraan)}
                        full
                      />
                    )}
                  </>
                )}
              </FieldGroup>
            </Grid>
          </Section>
        ))}

        {/* Signature block */}
        <Box
          mt={40}
          pt="lg"
          style={{ borderTop: "1px solid #e2e8f0" }}
        >
          <Grid cols={2}>
            <Stack gap={4} align="center">
              <Text fz="xs" c="#64748b" tt="uppercase" style={{ letterSpacing: "0.08em" }}>
                Peternak
              </Text>
              <Box style={{ height: 80 }} />
              <Text fz="sm" fw={600}>( {nama} )</Text>
            </Stack>
            <Stack gap={4} align="center">
              <Text fz="xs" c="#64748b" tt="uppercase" style={{ letterSpacing: "0.08em" }}>
                Petugas SITERNAK
              </Text>
              <Box style={{ height: 80 }} />
              <Text fz="sm" fw={600}>( __________________ )</Text>
            </Stack>
          </Grid>
        </Box>

        <Text fz="xs" c="#94a3b8" ta="center" mt="xl">
          Dokumen ini dicetak secara otomatis dari SITERNAK. Untuk
          verifikasi keaslian, hubungi administrator.
        </Text>
      </Box>
    </Box>
  );
}

// ---------- local subcomponents ----------

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

function Grid({ children, cols }: { children: React.ReactNode; cols?: number }) {
  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols ?? 2}, 1fr)`,
        gap: 12,
      }}
    >
      {children}
    </Box>
  );
}

function Field({
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

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      style={{ gridColumn: "1 / -1" }}
      p="sm"
      mt="xs"
    >
      <Text fz="xs" fw={700} c="#13bc6d" tt="uppercase" mb="xs" style={{ letterSpacing: "0.06em" }}>
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

function ConditionRow({ label, kondisi }: { label: string; kondisi: string }) {
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
