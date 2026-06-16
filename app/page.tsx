"use client";

import React, { useEffect } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  IconBuildingWarehouse,
  IconChartBar,
  IconClipboardCheck,
  IconMapPin,
  IconShieldCheck,
  IconUsers,
  IconArrowRight,
} from "@tabler/icons-react";

const FEATURES = [
  {
    icon: IconClipboardCheck,
    title: "Pendataan Terstruktur",
    desc: "Formulir wizard 5-langkah yang memandu petugas lapangan mendaftarkan peternak secara lengkap dan konsisten.",
  },
  {
    icon: IconMapPin,
    title: "Verifikasi Geolokasi",
    desc: "Setiap titik kandang terekam dengan koordinat GPS untuk mencegah duplikasi data dan mempercepat verifikasi.",
  },
  {
    icon: IconBuildingWarehouse,
    title: "Multi-Kandang",
    desc: "Satu peternak dapat memiliki banyak kandang di lokasi berbeda, lengkap dengan dokumentasi kondisi & peralatan.",
  },
  {
    icon: IconChartBar,
    title: "Dasbor Operasional",
    desc: "Ringkasan statistik, komposisi jenis usaha, dan integrasi kemitraan tampil dalam satu dasbor admin.",
  },
  {
    icon: IconShieldCheck,
    title: "Siap Integrasi",
    desc: "Antarmuka data mengikuti契约 backend sehingga siap diintegrasikan dengan sistem nasional saat API tersedia.",
  },
  {
    icon: IconUsers,
    title: "Multi-Role",
    desc: "Hak akses berbeda untuk admin pusat, operator provinsi, dan petugas lapangan.",
  },
];

export default function LandingPage() {
  const router = useRouter();

  // If the visitor is already authenticated, skip the marketing splash
  // and head straight to the dashboard. Otherwise let them browse the
  // landing page or sign in via the login CTA.
  useEffect(() => {
    try {
      const raw = document.cookie
        .split("; ")
        .find((c) => c.startsWith("siternak-session="));
      if (raw) {
        const value = decodeURIComponent(raw.split("=").slice(1).join("="));
        if (value && value !== "null" && value !== "undefined") {
          router.replace("/dashboard");
        }
      }
    } catch {}
  }, [router]);
  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f0fdf4 0%, #f5f7fa 40%, #f5f7fa 100%)",
      }}
    >
      <Container size="xl" py="xl">
        <Group justify="space-between" align="center" wrap="wrap" mb={60}>
          <Group gap="sm">
            <Box
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #13bc6d 0%, #009450 100%)",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              S
            </Box>
            <Box>
              <Text fz="md" fw={800} lh={1}>
                SITERNAK
              </Text>
              <Text fz="xs" c="dimmed" fw={500} lh={1.2}>
                Pengembangan Ternak Rakyat
              </Text>
            </Box>
          </Group>
          <Group gap="sm">
            <Button
              variant="subtle"
              color="dark"
              onClick={() => router.push("/dashboard")}
            >
              Masuk Dasbor
            </Button>
            <Button
              rightSection={<IconArrowRight size={14} />}
              onClick={() => router.push("/pendaftaran")}
            >
              Daftar Sekarang
            </Button>
          </Group>
        </Group>

        <Grid gutter={60} align="center" mb={80}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="lg">
              <Badge
                size="lg"
                variant="light"
                color="primary"
                radius="sm"
                style={{ alignSelf: "flex-start", textTransform: "none" }}
              >
                v1.0 · Sistem Informasi Pengembangan Ternak Rakyat
              </Badge>
              <Title order={1} fz={{ base: 36, md: 48 }} lh={1.1} fw={800}>
                Pendataan Peternak Ayam Nasional,{" "}
                <Text
                  component="span"
                  inherit
                  variant="gradient"
                  gradient={{ from: "primary.6", to: "primary.9", deg: 135 }}
                >
                  Akurat &amp; Terverifikasi
                </Text>
              </Title>
              <Text fz="lg" c="dimmed" maw={580} lh={1.6}>
                Platform pendataan ayam pedaging dan ayam petelur untuk
                program pengembangan ternak rakyat. Dilengkapi formulir
                multi-langkah, verifikasi GPS, dokumentasi kondisi
                kandang, dan integrasi dengan perusahaan kemitraan.
              </Text>
              <Group gap="sm" wrap="wrap">
                <Button
                  size="md"
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => router.push("/pendaftaran")}
                >
                  Mulai Pendaftaran
                </Button>
                <Button
                  size="md"
                  variant="default"
                  onClick={() => router.push("/dashboard")}
                >
                  Lihat Dasbor
                </Button>
              </Group>

              <Group gap="xl" mt="md" wrap="wrap">
                <Stat label="Provinsi" value="38" />
                <Stat label="Kemitraan" value="9" />
                <Stat label="Skema" value="2" hint="Pedaging &amp; Petelur" />
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <HeroMockup />
          </Grid.Col>
        </Grid>

        <Box mb={40}>
          <Stack gap="xs" mb="lg" align="center" ta="center">
            <Text
              fz="xs"
              fw={700}
              tt="uppercase"
              c="primary.7"
              style={{ letterSpacing: "0.1em" }}
            >
              Fitur Unggulan
            </Text>
            <Title order={2} fz={{ base: 26, md: 32 }}>
              Dirancang untuk Petugas Lapangan
            </Title>
            <Text c="dimmed" maw={600}>
              Setiap alur aplikasi dipertimbangkan dari sisi pengguna
              di lapangan: input cepat, validasi otomatis, dan integrasi
              data yang konsisten.
            </Text>
          </Stack>

          <Grid gutter="md">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Grid.Col key={f.title} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
                    <Stack gap="sm">
                      <ThemeIcon
                        size={44}
                        radius="md"
                        variant="light"
                        color="primary"
                      >
                        <Icon size={22} stroke={1.6} />
                      </ThemeIcon>
                      <Text fw={700} fz="md">
                        {f.title}
                      </Text>
                      <Text fz="sm" c="dimmed" lh={1.55}>
                        {f.desc}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        </Box>

        <Box mt={60} mb={20}>
          <Card
            padding="xl"
            radius="lg"
            withBorder
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1c2538 100%)",
              borderColor: "transparent",
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="lg">
              <Stack gap={4} style={{ flex: 1, minWidth: 280 }}>
                <Text fz="xs" fw={700} tt="uppercase" c="primary.3" lts="0.08em">
                  Mulai sekarang
                </Text>
                <Title order={3} c="white" fz={{ base: 22, md: 28 }}>
                  Daftarkan peternak pertama Anda hari ini
                </Title>
                <Text c="slate.4" fz="sm" maw={520}>
                  Formulir pendaftaran memandu Anda melalui 5 langkah:
                  identitas, kandang, kondisi &amp; peralatan, status
                  operasional, hingga review akhir.
                </Text>
              </Stack>
              <Group gap="sm">
                <Button
                  size="md"
                  color="primary"
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => router.push("/pendaftaran")}
                >
                  Buka Formulir
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  color="gray.4"
                  onClick={() => router.push("/dashboard")}
                >
                  Ke Dasbor
                </Button>
              </Group>
            </Group>
          </Card>
        </Box>

        <Group justify="center" py="lg">
          <Text fz="xs" c="dimmed">
            © {new Date().getFullYear()} Arcson Development · Powered by SITERNAK
          </Text>
        </Group>
      </Container>
    </Box>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Stack gap={0}>
      <Group gap={6} align="baseline">
        <Text fz={28} fw={800} c="primary.7" lh={1}>
          {value}
        </Text>
        <Text fz="sm" c="dimmed" fw={500}>
          {label}
        </Text>
      </Group>
      {hint && (
        <Text fz="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Stack>
  );
}

function HeroMockup() {
  return (
    <Card
      padding={0}
      radius="lg"
      withBorder
      shadow="lg"
      style={{ overflow: "hidden" }}
    >
      <Box
        p={6}
        style={{ background: "var(--app-surface-sunken)", borderBottom: "1px solid var(--app-border)" }}
      >
        <Group gap={6}>
          <Box w={10} h={10} bg="red.4" style={{ borderRadius: 999 }} />
          <Box w={10} h={10} bg="yellow.4" style={{ borderRadius: 999 }} />
          <Box w={10} h={10} bg="green.4" style={{ borderRadius: 999 }} />
        </Group>
      </Box>
      <Box p="lg" bg="var(--app-surface)">
        <Stack gap="sm">
          <Group gap={4}>
            <Text fz="xs" fw={700} tt="uppercase" c="dimmed" lts="0.06em">
              Formulir Pendaftaran
            </Text>
          </Group>
          <Text fz="md" fw={700}>
            Kandang Utama · Lokasi &amp; Kapasitas
          </Text>
          <Group gap="xs">
            {["Identitas", "Kandang", "Kondisi", "Operasional", "Review"].map((s, i) => (
              <Box
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i <= 1 ? "var(--app-primary)" : "var(--app-surface-sunken)",
                }}
              />
            ))}
          </Group>
          <Group gap="xs" mt="xs">
            <Box flex={1} h={36} bg="var(--app-surface-sunken)" style={{ borderRadius: 6 }} />
            <Box flex={1} h={36} bg="var(--app-surface-sunken)" style={{ borderRadius: 6 }} />
          </Group>
          <Box h={80} bg="var(--app-surface-sunken)" style={{ borderRadius: 6 }} />
          <Group gap="xs">
            <Box flex={1} h={36} bg="var(--app-primary-soft)" style={{ borderRadius: 6 }} />
            <Box flex={1} h={36} bg="var(--app-primary)" style={{ borderRadius: 6 }} />
          </Group>
        </Stack>
      </Box>
    </Card>
  );
}
