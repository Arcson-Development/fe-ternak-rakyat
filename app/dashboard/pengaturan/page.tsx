"use client";

import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Modal,
  PasswordInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconBell,
  IconDatabase,
  IconInfoCircle,
  IconMoon,
  IconPalette,
  IconRefresh,
  IconTrash,
  IconSun,
  IconUser
} from "@tabler/icons-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useTernakStore } from "../../../hooks/useTernakRakyat";
import { useNotifier, type SoundType } from "../../../hooks/useNotifier";
import { useTheme, type ThemeMode } from "../../../hooks/useTheme";

export default function PengaturanPage() {
  const reset = useTernakStore((s) => s.reset);
  const total = useTernakStore((s) => s.peternak.length);
  const {
    prefs: notifPrefs,
    permission: notifPermission,
    setSound: setNotifSound,
    setBrowserEnabled,
    beep,
  } = useNotifier();
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const notifSound = notifPrefs.sound;
  const notifBrowser = notifPrefs.browser;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [notif, setNotif] = useState({
    emailPendaftaran: true,
    emailLaporan: false,
    pushStatus: true,
  });

  const handleReset = () => {
    if (confirmText !== "HAPUS") return;
    reset();
    setConfirmOpen(false);
    setConfirmText("");
    notifications.show({
      title: "Data berhasil direset",
      message: `${total} pendaftaran telah dihapus dari penyimpanan lokal.`,
      color: "green",
    });
  };

  return (
    <Container size="lg" px={0}>
      <Stack gap="lg">
        <PageHeader
          eyebrow="Konfigurasi"
          title="Pengaturan"
          description="Preferensi pengguna, notifikasi, dan pengelolaan data lokal."
        />

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="primary" size="lg" radius="md">
                  <IconUser size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={700}>Profil Pengguna</Text>
                  <Text fz="xs" c="dimmed">Akun administrator</Text>
                </Stack>
              </Group>
              <Stack gap="sm">
                <TextInput label="Nama" defaultValue="Admin SITERNAK" />
                <TextInput label="Email" defaultValue="admin@siternak.id" type="email" />
                <TextInput label="Peran" value="Administrator" disabled />
                <Button variant="light" mt="xs">Simpan Profil</Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                  <IconBell size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={700}>Notifikasi</Text>
                  <Text fz="xs" c="dimmed">Preferensi peringatan</Text>
                </Stack>
              </Group>
              <Stack gap="md">
                <Switch
                  label="Email saat ada pendaftaran baru"
                  checked={notif.emailPendaftaran}
                  onChange={(e) =>
                    setNotif((n) => ({ ...n, emailPendaftaran: e.currentTarget.checked }))
                  }
                />
                <Switch
                  label="Laporan mingguan ke email"
                  checked={notif.emailLaporan}
                  onChange={(e) =>
                    setNotif((n) => ({ ...n, emailLaporan: e.currentTarget.checked }))
                  }
                />
                <Switch
                  label="Push notification perubahan status"
                  checked={notif.pushStatus}
                  onChange={(e) =>
                    setNotif((n) => ({ ...n, pushStatus: e.currentTarget.checked }))
                  }
                />
              </Stack>
            </Card>
          </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="primary" size="lg" radius="md">
                  <IconBell size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={700}>Notifikasi</Text>
                  <Text fz="xs" c="dimmed">Suara & browser</Text>
                </Stack>
              </Group>
              <Stack gap="sm">
                <Stack gap={4}>
                  <Text fz="sm" fw={500}>Suara Pemberitahuan</Text>
                  <Text fz="xs" c="dimmed">Nada saat notifikasi masuk</Text>
                </Stack>
                <SegmentedControl
                  value={notifSound}
                  onChange={(v) => {
                    setNotifSound(v as SoundType);
                    if (v !== "none") beep(v as SoundType);
                  }}
                  data={[
                    { value: "ping", label: "🔔 Ping" },
                    { value: "chime", label: "🎵 Chime" },
                    { value: "success", label: "✓ OK" },
                    { value: "alert", label: "⚠ Alert" },
                    { value: "none", label: "Mute" },
                  ]}
                  size="xs"
                  fullWidth
                />
                <Group justify="space-between">
                  <Text fz="xs" c="dimmed">Tes nada "{notifSound}"</Text>
                  <Button
                    size="compact-xs"
                    variant="subtle"
                    onClick={() => beep(notifSound)}
                    disabled={notifSound === "none"}
                  >
                    Tes
                  </Button>
                </Group>
                <Divider my={4} />
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text fz="sm" fw={500}>Notifikasi Browser</Text>
                    <Text fz="xs" c="dimmed">Tampilkan toast OS</Text>
                  </Stack>
                  <Switch
                    checked={notifBrowser}
                    onChange={async (e) => {
                      const ok = await setBrowserEnabled(e.currentTarget.checked);
                      if (e.currentTarget.checked && !ok) {
                        notifications.show({
                          title: "Izin ditolak",
                          message: "Browser memblokir izin notifikasi. Buka pengaturan browser.",
                          color: "yellow",
                        });
                      }
                    }}
                    disabled={notifPermission === "denied"}
                  />
                </Group>
                {notifPermission === "denied" && (
                  <Text fz="xs" c="red">
                    ⚠ Izin browser diblokir
                  </Text>
                )}
                {notifPermission === "granted" && notifBrowser && (
                  <Text fz="xs" c="green">
                    ✓ Notifikasi browser aktif
                  </Text>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="lg" radius="md" withBorder shadow="xs" h="100%">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="accent" size="lg" radius="md">
                  <IconPalette size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={700}>Tampilan</Text>
                  <Text fz="xs" c="dimmed">Mode & bahasa</Text>
                </Stack>
              </Group>
              <Stack gap="sm">
                <Select
                  label="Mode Tampilan"
                  data={[
                    { value: "light", label: "Terang" },
                    { value: "dark", label: "Gelap" },
                    { value: "auto", label: "Otomatis (Sistem)" },
                  ]}
                  value={themeMode}
                  onChange={(v) => setThemeMode((v as ThemeMode) || "light")}
                  allowDeselect={false}
                  leftSection={themeMode === "dark" ? <IconMoon size={14} /> : <IconSun size={14} />}
                />
                <Text fz="xs" c="dimmed">
                  Mode otomatis mengikuti preferensi sistem operasi Anda.
                </Text>
                <Select
                  label="Bahasa"
                  data={[
                    { value: "id", label: "Bahasa Indonesia" },
                    { value: "en", label: "English" },
                  ]}
                  defaultValue="id"
                />
                <Button variant="light" mt="xs">Terapkan</Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card padding="lg" radius="md" withBorder shadow="xs">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="red" size="lg" radius="md">
                  <IconDatabase size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={700}>Data Lokal</Text>
                  <Text fz="xs" c="dimmed">Penyimpanan sampai backend siap</Text>
                </Stack>
              </Group>

              <Alert variant="light" color="blue" icon={<IconInfoCircle size={16} />} mb="md">
                Saat ini data tersimpan di <code>localStorage</code> peramban.
                Setelah backend online, data akan otomatis tersinkronisasi.
              </Alert>

              <Group justify="space-between" wrap="wrap" gap="sm">
                <Stack gap={2}>
                  <Text fz="sm" fw={500}>
                    {total} pendaftaran tersimpan lokal
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Tindakan ini tidak dapat dibatalkan.
                  </Text>
                </Stack>
                <Group gap="sm">
                  <Button
                    variant="default"
                    leftSection={<IconRefresh size={14} />}
                    onClick={() => {
                      notifications.show({
                        title: "Sinkronisasi belum tersedia",
                        message: "Backend belum siap — refresh hanya me-reload halaman.",
                        color: "yellow",
                      });
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => setConfirmOpen(true)}
                    disabled={total === 0}
                  >
                    Reset Semua Data
                  </Button>
                </Group>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card padding="lg" radius="md" withBorder shadow="xs">
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="primary" size="lg" radius="md">
                  <IconInfoCircle size={20} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={700}>Tentang SITERNAK</Text>
                  <Text fz="xs" c="dimmed">Informasi aplikasi</Text>
                </Stack>
              </Group>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Detail k="Versi" v="1.0.0" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Detail k="Build" v={new Date().toISOString().slice(0, 10)} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Detail k="Powered by" v="Arcson Development" />
                </Grid.Col>
              </Grid>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      <Modal
        opened={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmText("");
        }}
        title={
          <Group gap="sm">
            <ThemeIcon color="red" variant="light" size="lg" radius="md">
              <IconAlertTriangle size={20} />
            </ThemeIcon>
            <Text fw={700}>Reset Semua Data</Text>
          </Group>
        }
        centered
      >
        <Stack gap="md">
          <Text fz="sm">
            Tindakan ini akan <strong>menghapus permanen</strong> {total}{" "}
            pendaftaran yang tersimpan di browser ini. Untuk mengkonfirmasi,
            ketik <code>HAPUS</code> di bawah ini.
          </Text>
          <TextInput
            placeholder="Ketik HAPUS untuk konfirmasi"
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={14} />}
              disabled={confirmText !== "HAPUS"}
              onClick={handleReset}
            >
              Hapus Permanen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <Stack gap={2}>
      <Text fz="xs" fw={600} c="dimmed" tt="uppercase" lts="0.06em">{k}</Text>
      <Text fz="sm" fw={500}>{v}</Text>
    </Stack>
  );
}
