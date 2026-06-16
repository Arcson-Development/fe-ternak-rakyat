"use client";

import React from "react";
import {
  Accordion,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBook,
  IconCircleDashed,
  IconHelp,
  IconInfoCircle,
  IconKeyboard,
  IconLifebuoy,
  IconMessageCircle,
  IconShieldCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { PageHeader } from "../../../components/ui/PageHeader";

const FAQS = [
  {
    q: "Bagaimana cara mendaftarkan peternak baru?",
    a: "Buka menu Pendaftaran dari sidebar atau tombol 'Daftarkan Peternak' di dasbor. Isi formulir wizard 5-langkah: Identitas, Kandang, Kondisi & Peralatan, Status Operasional, dan Review. Submit untuk menyimpan.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Sampai backend siap, data disimpan di localStorage peramban Anda (tidak diunggah ke server). Setelah backend online, seluruh data akan otomatis tersinkronisasi.",
  },
  {
    q: "Kenapa GPS saya tidak terdeteksi?",
    a: "Pastikan peramban memiliki izin akses lokasi. Pada ponsel, aktifkan juga Location Services. Jika masih gagal, isi koordinat secara manual — format desimal, contoh: -6.200000, 106.816666.",
  },
  {
    q: "Berapa banyak kandang yang bisa didaftarkan untuk satu peternak?",
    a: "Tidak ada batasan. Gunakan tombol 'Tambah Kandang' di langkah Kandang wizard untuk menambahkan sebanyak yang diperlukan. Tiap kandang memiliki data sendiri.",
  },
  {
    q: "Apa beda Ayam Pedaging dan Ayam Petelur?",
    a: "Ayam Pedaging (Broiler) dibudidayakan untuk diambil dagingnya dengan siklus ±35 hari. Ayam Petelur (Layer) dibudidayakan untuk diambil telur konsumsinya dengan siklus produksi ±1-2 tahun.",
  },
  {
    q: "Bagaimana jika foto upload gagal?",
    a: "Pastikan ukuran file tidak melebihi 5 MB dan berformat JPG/PNG. Jika masih gagal, coba peramban lain atau bersihkan cache.",
  },
  {
    q: "Bagaimana cara menghapus data demo?",
    a: "Buka Pengaturan → Data Lokal → Reset Semua Data. Ketik 'HAPUS' untuk konfirmasi. Tindakan ini tidak dapat dibatalkan.",
  },
];

const GUIDES = [
  {
    icon: IconUserPlus,
    title: "Mulai Cepat: Pendaftaran Pertama",
    desc: "Panduan 5 menit untuk mendaftarkan peternak pertama Anda.",
  },
  {
    icon: IconShieldCheck,
    title: "Standar Verifikasi Kandang",
    desc: "Kriteria kondisi dan peralatan yang perlu didokumentasikan.",
  },
  {
    icon: IconKeyboard,
    title: "Shortcut & Tips Produktivitas",
    desc: "Pintasan keyboard dan trik mempercepat input data lapangan.",
  },
  {
    icon: IconInfoCircle,
    title: "Kebijakan Privasi Data",
    desc: "Bagaimana data Anda ditangani sesuai UU PDP.",
  },
];

const SHORTCUTS = [
  { keys: ["Tab"], desc: "Pindah ke field berikutnya" },
  { keys: ["Shift", "Tab"], desc: "Pindah ke field sebelumnya" },
  { keys: ["Ctrl", "S"], desc: "Simpan draf (halaman formulir)" },
  { keys: ["Esc"], desc: "Tutup drawer/modal" },
  { keys: ["/"], desc: "Fokus ke pencarian global" },
];

export default function BantuanPage() {
  return (
    <Container size="lg" px={0}>
      <Stack gap="lg">
        <PageHeader
          eyebrow="Pusat Bantuan"
          title="Bantuan &amp; Dokumentasi"
          description="Pelajari cara menggunakan SITERNAK, lihat FAQ, dan hubungi tim support."
        />

      <Card
        withBorder
        shadow="xs"
        padding="lg"
        radius="md"
        style={{
          background: "linear-gradient(135deg, var(--app-primary-soft) 0%, transparent 100%)",
          borderColor: "var(--app-primary)",
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Stack gap={4} style={{ flex: 1, minWidth: 240 }}>
            <Group gap="xs">
              <ThemeIcon variant="filled" color="primary" size="md" radius="md">
                <IconHelp size={14} />
              </ThemeIcon>
              <Text fw={700}>Tur Panduan Tersedia</Text>
            </Group>
            <Text fz="sm" c="dimmed">
              Belum familiar dengan antarmuka? Jalankan tur singkat 6-langkah
              untuk mengenal semua fitur utama SITERNAK.
            </Text>
          </Stack>
          <Button
            leftSection={<IconHelp size={14} />}
            onClick={() => {
              try { localStorage.removeItem("siternak-onboarding-done"); } catch {}
              window.location.reload();
            }}
          >
            Mulai Tur Panduan
          </Button>
        </Group>
      </Card>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="primary" size="lg" radius="md">
                  <IconHelp size={20} />
                </ThemeIcon>
                <Text fw={700} fz="lg">Pertanyaan yang Sering Diajukan</Text>
              </Group>
              <Accordion variant="separated" radius="md">
                {FAQS.map((f, i) => (
                  <Accordion.Item key={i} value={`faq-${i}`}>
                    <Accordion.Control icon={<IconCircleDashed size={16} color="var(--app-primary)" />}>
                      <Text fz="sm" fw={600}>{f.q}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text fz="sm" c="dimmed" lh={1.6}>{f.a}</Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Card padding="lg" radius="md" withBorder shadow="xs">
                <Group gap="sm" mb="md">
                  <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                    <IconLifebuoy size={20} />
                  </ThemeIcon>
                  <Text fw={700}>Hubungi Support</Text>
                </Group>
                <Stack gap="xs">
                  <Text fz="sm" c="dimmed">
                    Tim support siap membantu Senin–Jumat, 08.00–17.00 WIB.
                  </Text>
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="primary" size="sm" radius="md">
                      <IconMessageCircle size={12} />
                    </ThemeIcon>
                    <Text fz="sm">WhatsApp: +62 877-7169-7336</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="sm" radius="md">
                      <IconMessageCircle size={12} />
                    </ThemeIcon>
                    <Text fz="sm">support@arcson.dev</Text>
                  </Group>
                </Stack>
              </Card>

              <Card padding="lg" radius="md" withBorder shadow="xs">
                <Group gap="sm" mb="md">
                  <ThemeIcon variant="light" color="accent" size="lg" radius="md">
                    <IconKeyboard size={20} />
                  </ThemeIcon>
                  <Text fw={700}>Shortcut Keyboard</Text>
                </Group>
                <Stack gap="xs">
                  {SHORTCUTS.map((s, i) => (
                    <Group key={i} justify="space-between" gap="sm">
                      <Text fz="xs" c="dimmed">{s.desc}</Text>
                      <Group gap={4}>
                        {s.keys.map((k) => (
                          <Box
                            key={k}
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              border: "1px solid var(--app-border)",
                              background: "var(--app-surface-sunken)",
                              fontSize: 10,
                              fontFamily: "monospace",
                              fontWeight: 600,
                            }}
                          >
                            {k}
                          </Box>
                        ))}
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card padding="lg" radius="md" withBorder shadow="xs">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="primary" size="lg" radius="md">
                  <IconBook size={20} />
                </ThemeIcon>
                <Text fw={700}>Panduan &amp; Dokumentasi</Text>
              </Group>
              <Grid gutter="md">
                {GUIDES.map((g) => {
                  const Icon = g.icon;
                  return (
                    <Grid.Col key={g.title} span={{ base: 12, sm: 6, md: 3 }}>
                      <Card
                        withBorder
                        padding="md"
                        radius="md"
                        style={{ cursor: "pointer", height: "100%" }}
                      >
                        <Stack gap="xs">
                          <ThemeIcon variant="light" color="primary" size="lg" radius="md">
                            <Icon size={18} />
                          </ThemeIcon>
                          <Text fw={600} fz="sm">{g.title}</Text>
                          <Text fz="xs" c="dimmed" lh={1.5}>{g.desc}</Text>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
