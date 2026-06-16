"use client";

import React, { Suspense, useEffect, useState } from "react";
import {
  Alert,
  Anchor,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  IconAlertCircle,
  IconBrandWindows,
  IconCheck,
  IconLockSquare,
  IconMoon,
  IconShieldCheck,
  IconTrendingUp,
  IconUserCircle,
  IconUserPlus,
} from "@tabler/icons-react";
import { login, DEMO_ACCOUNTS } from "../../lib/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const expired = params.get("expired") === "1";
  const [loading, setLoading] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  useEffect(() => {
    if (expired) {
      notifications.show({
        title: "Sesi berakhir",
        message: "Silakan login kembali untuk melanjutkan.",
        color: "yellow",
        icon: <IconAlertCircle size={16} />,
      });
    }
  }, [expired]);

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      remember: true,
    },
    validate: {
      username: (v: string) => (v.trim().length === 0 ? "Username wajib diisi" : null),
      password: (v: string) => (v.length < 6 ? "Minimal 6 karakter" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
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
      notifications.show({
        title: "Login gagal",
        message: err?.message ?? "Periksa kredensial Anda",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const useDemo = (idx: number) => {
    const acc = DEMO_ACCOUNTS[idx];
    form.setValues({ username: acc.username, password: acc.password });
  };

  return (
    <Container size={460} px={0}>
      <Title order={3} fw={700} mb="xs">
        Masuk ke akun Anda
      </Title>
      <Text c="dimmed" fz="sm" mb="xl">
        Masukkan kredensial yang terdaftar untuk melanjutkan.
      </Text>

      {expired && (
        <Alert
          variant="light"
          color="yellow"
          icon={<IconAlertCircle size={16} />}
          mb="md"
          title="Sesi berakhir"
        >
          Silakan login kembali untuk mengakses dashboard.
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Username / Email"
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
            <Anchor size="sm" c="primary.7" component={Link} href="#">
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

      <Paper withBorder p="md" radius="md" mt="xl" bg="var(--app-surface-sunken)">
        <Group justify="space-between" mb="sm">
          <Text fz="sm" fw={600}>
            Akun Demo
          </Text>
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => setShowCreds((s) => !s)}
          >
            {showCreds ? "Sembunyikan" : "Tampilkan"}
          </Button>
        </Group>
        {showCreds ? (
          <Stack gap="xs">
            {DEMO_ACCOUNTS.map((acc, i) => (
              <Group key={acc.username} justify="space-between" gap="sm">
                <Stack gap={0}>
                  <Text fz="xs" fw={600}>{acc.username} / {acc.password}</Text>
                  <Text fz="xs" c="dimmed">{acc.name} · {acc.role}</Text>
                </Stack>
                <Button
                  size="compact-xs"
                  variant="light"
                  onClick={() => useDemo(i)}
                >
                  Isi
                </Button>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text fz="xs" c="dimmed">
            Klik "Tampilkan" untuk melihat kredensial demo. Hanya tersedia
            saat mode mock (belum ada backend).
          </Text>
        )}
      </Paper>

      <Text c="dimmed" fz="xs" ta="center" mt="xl">
        Belum punya akun?{" "}
        <Anchor c="primary.7" fw={600} component={Link} href="/pendaftaran">
          Daftarkan Peternak
        </Anchor>
      </Text>
    </Container>
  );
}

function LoginFallback() {
  return (
    <Container size={460} px={0}>
      <Group justify="center" py="xl">
        <Loader color="primary" />
      </Group>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--app-bg)",
      }}
      className="login-shell"
    >
      {/* Left: brand panel */}
      <Box
        visibleFrom="md"
        style={{
          position: "relative",
          background: `linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-700, #0a8b54) 100%)`,
          color: "white",
          padding: 60,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        {/* Decorative grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0, transparent 40%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0, transparent 40%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <Group gap="sm">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <IconBrandWindows size={22} />
            </Box>
            <Stack gap={0}>
              <Text fz="lg" fw={700}>SITERNAK</Text>
              <Text fz="xs" opacity={0.8}>Pengembangan Ternak Rakyat</Text>
            </Stack>
          </Group>
        </div>

        <Stack gap="lg" style={{ position: "relative" }}>
          <Title order={2} fw={800} lh={1.2} style={{ fontSize: 36 }}>
            Platform registrasi
            <br />
            peternak modern.
          </Title>
          <Text fz="md" style={{ opacity: 0.92, maxWidth: 420 }}>
            Kelola data peternak ayam pedaging dan petelur di seluruh
            Indonesia. Pemetaan GPS, dokumentasi kandang, dan integrasi
            kemitraan — semua dalam satu aplikasi enterprise.
          </Text>

          <Stack gap="sm" mt="md">
            <Feature icon={IconShieldCheck} text="Data terenkripsi &amp; terisolasi per-role" />
            <Feature icon={IconTrendingUp} text="Dashboard real-time &amp; laporan ekspor CSV" />
            <Feature icon={IconUserPlus} text="Wizard pendaftaran 5-langkah, mobile-friendly" />
          </Stack>
        </Stack>

        <Text fz="xs" style={{ opacity: 0.7, position: "relative" }}>
          © {new Date().getFullYear()} Arcson Development. Hak cipta dilindungi.
        </Text>
      </Box>

      {/* Right: form */}
      <Box
        p={{ base: 24, md: 60 }}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box maw={460} mx="auto" w="100%">
          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

function Feature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <Group gap="sm">
      <Box
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "rgba(255,255,255,0.18)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon size={14} />
      </Box>
      <Text fz="sm" style={{ opacity: 0.95 }}>{text}</Text>
    </Group>
  );
}
