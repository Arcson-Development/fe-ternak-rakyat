"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  PasswordInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import {
  IconBook,
  IconCheck,
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconCircleNumber4,
  IconCircleNumber5,
  IconList,
  IconLockSquare,
  IconMail,
  IconMapPin,
  IconMessage,
  IconPhone,
  IconShieldCheck,
  IconUserCircle,
  IconUserPlus,
  IconArrowRight,
} from "@tabler/icons-react";
import { login } from "../lib/auth";

export default function LandingPage() {
  const router = useRouter();

  // Contact / Petunjuk modals
  const [contactOpen, contactHandlers] = useDisclosure(false);
  const [guideOpen, guideHandlers] = useDisclosure(false);

  // If the visitor is already authenticated, skip the marketing splash
  // and head straight to the dashboard.
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

  const goToRegister = () => router.push("/pendaftaran");

  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f0fdf4 0%, #f5f7fa 40%, #f5f7fa 100%)",
      }}
    >
      <Container size="xl" py="xl">
        {/* ===== Header ===== */}
        <Group justify="space-between" align="center" wrap="wrap" mb={40}>
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
            {/* Header CTA buttons removed — see history. */}
          </Group>
        </Group>

        {/* ===== Hero: marketing copy + admin login form ===== */}
        <Grid gutter={48} align="center" mb={32}>
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

              <Group gap="xl" mt="md" wrap="wrap">
                <Stat label="Provinsi" value="38" />
                <Stat label="Kemitraan" value="9" />
                <Stat label="Skema" value="2" hint="Pedaging &amp; Petelur" />
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <AdminLoginCard />
          </Grid.Col>
        </Grid>

        {/* ===== CTA buttons row (below login form) ===== */}
        <Paper
          withBorder
          radius="lg"
          p="lg"
          mb={60}
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack gap="sm">
            <Text
              fz="xs"
              fw={700}
              tt="uppercase"
              c="dimmed"
              ta="center"
              style={{ letterSpacing: "0.1em" }}
            >
              Pintasan Cepat
            </Text>
            <Group justify="center" gap="md" wrap="wrap">
              <Button
                size="md"
                variant="light"
                color="blue"
                leftSection={<IconMessage size={16} />}
                onClick={contactHandlers.open}
              >
                Contact Us
              </Button>
              <Button
                size="md"
                variant="light"
                color="grape"
                leftSection={<IconBook size={16} />}
                onClick={guideHandlers.open}
              >
                Petunjuk Penggunaan
              </Button>
              <Button
                size="md"
                variant="light"
                color="teal"
                leftSection={<IconList size={16} />}
                onClick={() => router.push("/pendaftaran/daftar")}
              >
                Lihat Pendaftaran
              </Button>
              <Button
                size="md"
                color="primary"
                leftSection={<IconUserPlus size={16} />}
                rightSection={<IconArrowRight size={14} />}
                onClick={goToRegister}
              >
                Register Ternak Rakyat
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* ===== Footer ===== */}
        <Group justify="center" py="lg">
          <Text fz="xs" c="dimmed">
            © {new Date().getFullYear()} Arcson Development · Powered by SITERNAK
          </Text>
        </Group>
      </Container>

      {/* ===== Contact Us modal ===== */}
      <Modal
        opened={contactOpen}
        onClose={contactHandlers.close}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" radius="md">
              <IconMessage size={18} />
            </ThemeIcon>
            <Text fw={700}>Hubungi Kami</Text>
          </Group>
        }
        centered
        size="md"
      >
        <Stack gap="md">
          <Text fz="sm" c="dimmed" lh={1.55}>
            Jika Anda menemukan kendala saat menggunakan aplikasi,
            silakan hubungi tim pendukung melalui salah satu kanal di
            bawah ini. Tim kami siap membantu pada jam kerja (Senin–Jumat,
            08.00–17.00 WIB).
          </Text>
          <Stack gap="xs">
            <ContactRow
              icon={<IconMail size={18} />}
              label="Email"
              value="support@siternak.id"
              href="mailto:support@siternak.id"
            />
            <ContactRow
              icon={<IconPhone size={18} />}
              label="Telepon / WhatsApp"
              value="+62 21 1234 5678"
              href="tel:+622112345678"
            />
            <ContactRow
              icon={<IconMapPin size={18} />}
              label="Kantor"
              value="Arcson Development · Jakarta, Indonesia"
            />
          </Stack>
          <Alert variant="light" color="blue" icon={<IconShieldCheck size={16} />}>
            <Text fz="sm">
              <b>Catatan:</b> Akun admin hanya dapat dibuat oleh
              administrator pusat. Hubungi kami jika Anda belum memiliki
              kredensial.
            </Text>
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={contactHandlers.close}>
              Tutup
            </Button>
            <Button
              component="a"
              href="mailto:support@siternak.id"
              leftSection={<IconMail size={14} />}
            >
              Kirim Email
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ===== Petunjuk Penggunaan modal ===== */}
      <Modal
        opened={guideOpen}
        onClose={guideHandlers.close}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="grape" radius="md">
              <IconBook size={18} />
            </ThemeIcon>
            <Text fw={700}>Petunjuk Penggunaan</Text>
          </Group>
        }
        centered
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack gap="md">
          <Text fz="sm" c="dimmed" lh={1.55}>
            Ikuti 5 langkah sederhana berikut untuk mendaftarkan
            peternak baru. Pastikan Anda telah menyiapkan foto KTP
            pemilik dan foto-foto kondisi kandang (dinding, atap,
            lantai, tempat makan, tempat minum, brooding, kipas).
          </Text>
          <Divider />
          <GuideStep
            icon={<IconCircleNumber1 size={28} />}
            color="primary"
            title="Login sebagai Admin"
            body="Gunakan akun admin pada formulir di atas untuk masuk ke dasbor. Akun default: admin / admin123 (mode demo)."
          />
          <GuideStep
            icon={<IconCircleNumber2 size={28} />}
            color="blue"
            title="Klik 'Register Ternak Rakyat'"
            body="Tombol ini mengarahkan Anda ke halaman pendaftaran. Halaman akan otomatis melakukan login internal untuk membuka akses submit form ke server."
          />
          <GuideStep
            icon={<IconCircleNumber3 size={28} />}
            color="grape"
            title="Isi Identitas Peternak"
            body="Lengkapi nama, NIK, foto KTP, kategori (pedaging/petelur), dan alamat domisili lengkap (provinsi, kabupaten, kecamatan, kelurahan)."
          />
          <GuideStep
            icon={<IconCircleNumber4 size={28} />}
            color="orange"
            title="Lengkapi Data Kandang"
            body="Tambahkan satu atau lebih kandang. Setiap kandang memerlukan koordinat GPS (klik peta), kapasitas, kondisi dinding/atap/lantai, peralatan, dan status operasional."
          />
          <GuideStep
            icon={<IconCircleNumber5 size={28} />}
            color="green"
            title="Review & Submit"
            body="Periksa ulang ringkasan data pada langkah Review. Klik 'Simpan Pendaftaran' untuk mengirim data ke server. Data akan tampil di daftar peternak setelah berhasil."
          />
          <Alert variant="light" color="grape" icon={<IconShieldCheck size={16} />}>
            <Text fz="sm">
              <b>Tips:</b> Siapkan foto dengan pencahayaan cukup dan
              posisi rapi sebelum mengunggah. Format yang didukung:
              JPG, PNG, WebP.
            </Text>
          </Alert>
          <Group justify="flex-end">
            <Button onClick={guideHandlers.close}>Mengerti</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

// =============================================================================
// Subcomponents
// =============================================================================

function AdminLoginCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { username: "", password: "", remember: true },
    validate: {
      username: (v: string) => (v.trim().length === 0 ? "Username wajib diisi" : null),
      password: (v: string) => (v.length < 6 ? "Minimal 6 karakter" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setAuthError(null);
    setLoading(true);
    try {
      const user = await login(values.username, values.password);
      notifications.show({
        title: "Selamat datang",
        message: `Login berhasil sebagai ${user.name}`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setAuthError(err?.message ?? "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="xl" radius="lg" withBorder shadow="md">
      <Stack gap="md">
        <Stack gap={2}>
          <Title order={3} fw={700}>
            Login Admin
          </Title>
          <Text fz="sm" c="dimmed">
            Masuk untuk mengelola data peternak.
          </Text>
        </Stack>

        {authError && (
          <Alert color="red" variant="light" icon={<IconShieldCheck size={16} />}>
            {authError}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              label="Username"
              placeholder="admin"
              leftSection={<IconUserCircle size={16} />}
              size="md"
              {...form.getInputProps("username")}
            />
            <PasswordInput
              label="Kata Sandi"
              placeholder="••••••"
              leftSection={<IconLockSquare size={16} />}
              size="md"
              {...form.getInputProps("password")}
            />
            <Group justify="space-between">
              <Checkbox
                label="Ingat saya"
                size="sm"
                {...form.getInputProps("remember", { type: "checkbox" })}
              />
              <Anchor size="sm" c="primary.7" href="#">
                Lupa kata sandi?
              </Anchor>
            </Group>
            <Button
              type="submit"
              fullWidth
              size="md"
              loading={loading}
              loaderProps={{ type: "dots" }}
              leftSection={<IconShieldCheck size={16} />}
            >
              Masuk
            </Button>
          </Stack>
        </form>

        <Text fz="xs" c="dimmed" ta="center">
          Default demo: <b>admin</b> / <b>admin123</b>
        </Text>
      </Stack>
    </Card>
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

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <Group gap="sm" align="flex-start" wrap="nowrap">
      <ThemeIcon variant="light" color="blue" radius="md">
        {icon}
      </ThemeIcon>
      <Stack gap={0}>
        <Text fz="xs" c="dimmed" fw={600} tt="uppercase" lts="0.04em">
          {label}
        </Text>
        <Text fz="sm" fw={600}>
          {value}
        </Text>
      </Stack>
    </Group>
  );
  return href ? (
    <Anchor href={href} underline="never" c="inherit">
      {content}
    </Anchor>
  ) : (
    content
  );
}

function GuideStep({
  icon,
  color,
  title,
  body,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  body: string;
}) {
  return (
    <Group gap="sm" align="flex-start" wrap="nowrap">
      <ThemeIcon variant="light" color={color} size={44} radius="md">
        {icon}
      </ThemeIcon>
      <Stack gap={2} style={{ flex: 1 }}>
        <Text fz="sm" fw={700}>
          {title}
        </Text>
        <Text fz="sm" c="dimmed" lh={1.5}>
          {body}
        </Text>
      </Stack>
    </Group>
  );
}
