"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppShell,
  Box,
  Burger,
  Button,
  Container,
  Group,
  Stack,
  Stepper,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconCloudCheck,
  IconDeviceFloppy,
  IconEdit,
  IconHome,
  IconRestore,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { AppShellHeader } from "../layout/AppShellHeader";
import { AppShellSidebar } from "../layout/AppShellSidebar";
import { StepIdentitas } from "./StepIdentitas";
import { StepKandang } from "./StepKandang";
import { StepKondisiPeralatan } from "./StepKondisiPeralatan";
import { StepOperasional } from "./StepOperasional";
import { StepReview } from "./StepReview";
import {
  DAFTAR_KEMITRAAN,
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  KONDISI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  emptyPhoto,
  makeKandang,
  useSubmitPeternak,
  useTernakStore,
  type KategoriPeternak,
  type Kandang,
  type Kondisi,
  type Peternak,
  type RegionRef,
} from "../../hooks/useTernakRakyat";
import { useWizardDraft } from "../../hooks/useTernakRakyat/useWizardDraft";

type IdentitasState = {
  nama: string;
  noKtp: string;
  ktp: { preview: string | null; name?: string; size?: number };
  kategori: KategoriPeternak | "";
  alamat: {
    provinsi: RegionRef | null;
    kabupaten: RegionRef | null;
    kecamatan: RegionRef | null;
    kelurahan: RegionRef | null;
    detail: string;
  };
};

const initialIdentitas: IdentitasState = {
  nama: "",
  noKtp: "",
  ktp: emptyPhoto(),
  kategori: "",
  alamat: {
    provinsi: null,
    kabupaten: null,
    kecamatan: null,
    kelurahan: null,
    detail: "",
  },
};

type Mode = "create" | "edit";

type Props = {
  /** Existing record when editing; undefined when creating. */
  initialValue?: Peternak;
  /** Optional id for the draft slot. Defaults to "new". */
  modeKey?: string;
};

export function PendaftaranWizard({ initialValue, modeKey = "new" }: Props) {
  const route = useRouter();
  const [opened, { toggle }] = useDisclosure();
  const isEdit = Boolean(initialValue);
  const mode: Mode = isEdit ? "edit" : "create";
  const update = useTernakStore((s) => s.update);

  // Initial payload either from the existing record (edit) or a fresh
  // blank slate with a single empty kandang.
  const buildInitial = (): Peternak =>
    initialValue
      ? structuredClone(initialValue)
      : {
          id: `pt-${Date.now()}`,
          createdAt: new Date().toISOString(),
          nama: "",
          noKtp: "",
          ktp: emptyPhoto(),
          kategori: "",
          alamat: {
            provinsi: null,
            kabupaten: null,
            kecamatan: null,
            kelurahan: null,
            detail: "",
          },
          kandang: [makeKandang()],
        };

  const {
    payload,
    setPayload,
    activeStep,
    setActiveStep,
    savedAt,
    draftAvailable,
    restore,
    clear,
  } = useWizardDraft(modeKey, mode, buildInitial());

  // Mirror payload back into identitas/kandangList so step components
  // can use the same shape as before.
  const identitas: IdentitasState = useMemo(
    () => ({
      nama: payload.nama,
      noKtp: payload.noKtp,
      ktp: payload.ktp,
      kategori: payload.kategori,
      alamat: payload.alamat,
    }),
    [payload]
  );

  const setIdentitas = (next: IdentitasState) =>
    setPayload((p) => ({ ...p, ...next }));

  const kandangList = payload.kandang;
  const setKandangList = (next: Kandang[] | ((prev: Kandang[]) => Kandang[])) =>
    setPayload((p) => ({
      ...p,
      kandang: typeof next === "function" ? next(p.kandang) : next,
    }));

  const submit = useSubmitPeternak();

  // ---------- handlers ----------

  const handleAddKandang = () => {
    setKandangList((prev) => [...prev, makeKandang()]);
  };
  const handleRemoveKandang = (id: string) => {
    setKandangList((prev) => (prev.length === 1 ? prev : prev.filter((k) => k.id !== id)));
  };
  const updateKandang = (id: string, next: Kandang) => {
    setKandangList((prev) => prev.map((k) => (k.id === id ? next : k)));
  };

  // ---------- validation per step ----------

  const stepStatus = useMemo(() => {
    return {
      0: isIdentitasValid(identitas),
      1: isKandangStepValid(kandangList),
      2: isKondisiPeralatanValid(kandangList),
      3: isOperasionalValid(kandangList),
      4: true,
    };
  }, [identitas, kandangList]);

  // ---------- submit ----------

  const handleSubmit = () => {
    const finalPayload: Peternak = {
      ...payload,
      nama: identitas.nama.trim(),
      noKtp: identitas.noKtp.trim(),
      ktp: identitas.ktp,
      kategori: identitas.kategori,
      alamat: identitas.alamat,
      kandang: kandangList,
    };

    if (isEdit) {
      // Local edit: update in place
      update(finalPayload.id, finalPayload);
      clear();
      notifications.show({
        title: "Data diperbarui",
        message: `Perubahan data ${finalPayload.nama} telah disimpan.`,
        color: "green",
        icon: <IconCheck size={18} />,
      });
      route.push(`/dashboard/peternak/${finalPayload.id}`);
      return;
    }

    submit.mutate(finalPayload, {
      onSuccess: () => {
        clear();
        notifications.show({
          title: "Pendaftaran Tersimpan",
          message: `Data ${finalPayload.nama} berhasil dikirim ke server.`,
          color: "green",
          icon: <IconCheck size={18} />,
        });
        route.push("/dashboard/peternak");
      },
      onError: (err: any) => {
        notifications.show({
          title: "Gagal menyimpan",
          message:
            err?.message ||
            "Terjadi kesalahan saat mengirim data ke server. Coba lagi.",
          color: "red",
        });
      },
    });
  };

  // ---------- layout ----------

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: "var(--app-surface)",
          borderBottom: "1px solid var(--app-border)",
        }}
      >
        <AppShellHeader opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          background: "var(--app-sidebar-bg)",
          borderRight: "none",
        }}
      >
        <AppShellSidebar onNavigate={() => opened && toggle()} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg" px={0}>
          <Stack gap="lg">
            <Group justify="space-between" align="flex-end" wrap="wrap">
              <Stack gap={4}>
                <Group gap="xs">
                  <Text
                    tt="uppercase"
                    fz="xs"
                    fw={600}
                    c="dimmed"
                    style={{ letterSpacing: "0.08em" }}
                  >
                    {isEdit ? "Edit Pendaftaran" : "Formulir Pendaftaran"}
                  </Text>
                  {isEdit && (
                    <Group gap={4} c="primary.7">
                      <IconEdit size={12} />
                      <Text fz="xs" fw={600}>Mode Edit</Text>
                    </Group>
                  )}
                </Group>
                <Text fz={26} fw={700} lh={1.1}>
                  {isEdit
                    ? `Edit Data ${payload.nama || "Peternak"}`
                    : "Pendaftaran Peternak Rakyat"}
                </Text>
                <Text c="dimmed" fz="sm" maw={680}>
                  {isEdit
                    ? "Perbarui data yang perlu, lalu simpan."
                    : "Lengkapi data berikut untuk mendaftarkan peternak baru. Disimpan otomatis ke dasbor admin dan dapat diedit sewaktu-waktu."}
                </Text>
              </Stack>

              {/* Autosave indicator */}
              <AutosaveIndicator savedAt={savedAt} />
            </Group>

            {/* Restore draft banner */}
            {draftAvailable && (
              <Alert
                variant="light"
                color="yellow"
                icon={<IconAlertTriangle size={18} />}
                title="Ada draf yang belum selesai"
              >
                <Group justify="space-between" wrap="wrap" gap="sm">
                  <Text fz="sm">
                    Kami menemukan draf yang sebelumnya tersimpan. Mau
                    lanjutkan dari draf, atau mulai dari awal?
                  </Text>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="yellow"
                      leftSection={<IconTrash size={12} />}
                      onClick={() => {
                        clear();
                        notifications.show({
                          title: "Draf dihapus",
                          message: "Formulir dikosongkan ke nilai awal.",
                          color: "gray",
                        });
                      }}
                    >
                      Mulai dari awal
                    </Button>
                    <Button
                      size="xs"
                      color="yellow"
                      leftSection={<IconRestore size={12} />}
                      onClick={() => {
                        if (restore()) {
                          notifications.show({
                            title: "Draf dipulihkan",
                            message: "Formulir diisi ulang dari draf.",
                            color: "green",
                          });
                        }
                      }}
                    >
                      Lanjutkan draf
                    </Button>
                  </Group>
                </Group>
              </Alert>
            )}

            <Box
              p="lg"
              style={{
                background: "var(--app-surface)",
                border: "1px solid var(--app-border)",
                borderRadius: 12,
              }}
            >
              <Stepper
                active={activeStep}
                onStepClick={setActiveStep}
                allowNextStepsSelect={false}
                size="sm"
              >
                <Stepper.Step
                  label="Identitas"
                  description="Data diri & alamat"
                  allowStepSelect={true}
                />
                <Stepper.Step
                  label="Kandang"
                  description="Lokasi & kapasitas"
                  allowStepSelect={stepStatus[0]}
                />
                <Stepper.Step
                  label="Kondisi & Peralatan"
                  description="Foto & rating"
                  allowStepSelect={stepStatus[0] && stepStatus[1]}
                />
                <Stepper.Step
                  label="Status Operasional"
                  description="Jenis usaha"
                  allowStepSelect={
                    stepStatus[0] && stepStatus[1] && stepStatus[2]
                  }
                />
                <Stepper.Step
                  label="Review & Submit"
                  description="Konfirmasi data"
                  allowStepSelect={
                    stepStatus[0] &&
                    stepStatus[1] &&
                    stepStatus[2] &&
                    stepStatus[3]
                  }
                />
              </Stepper>
            </Box>

            <Box>
              {activeStep === 0 && (
                <StepIdentitas
                  value={identitas}
                  onChange={setIdentitas}
                  errors={identitasErrors(identitas)}
                />
              )}
              {activeStep === 1 && (
                <StepKandang
                  list={kandangList}
                  onAdd={handleAddKandang}
                  onRemove={handleRemoveKandang}
                  onChange={updateKandang}
                />
              )}
              {activeStep === 2 && (
                <StepKondisiPeralatan
                  list={kandangList}
                  onChange={updateKandang}
                />
              )}
              {activeStep === 3 && (
                <StepOperasional
                  list={kandangList}
                  onChange={updateKandang}
                />
              )}
              {activeStep === 4 && (
                <StepReview
                  identitas={identitas}
                  kandangList={kandangList}
                  onJumpTo={setActiveStep}
                />
              )}
            </Box>

            <Group justify="space-between" align="center" wrap="wrap">
              <Group gap="xs">
                <Burger
                  opened={opened}
                  onClick={toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                {activeStep > 0 && (
                  <button
                    onClick={() => setActiveStep((a) => Math.max(0, a - 1))}
                    style={navButtonStyle(false)}
                  >
                    <IconArrowLeft size={16} /> Kembali
                  </button>
                )}
              </Group>

              <Group gap="xs">
                {activeStep === 0 && (
                  <button
                    onClick={() => route.push("/dashboard")}
                    style={navButtonStyle(false)}
                  >
                    <IconHome size={14} /> Beranda
                  </button>
                )}

                {activeStep < 4 && (
                  <button
                    disabled={!stepStatus[activeStep as 0 | 1 | 2 | 3]}
                    onClick={() => setActiveStep((a) => Math.min(4, a + 1))}
                    style={navButtonStyle(
                      true,
                      !stepStatus[activeStep as 0 | 1 | 2 | 3]
                    )}
                  >
                    Lanjut <IconArrowRight size={16} />
                  </button>
                )}

                {activeStep === 4 && (
                  <button
                    onClick={handleSubmit}
                    disabled={
                      submit.isPending ||
                      !stepStatus[0] ||
                      !stepStatus[1] ||
                      !stepStatus[2] ||
                      !stepStatus[3]
                    }
                    style={submitButtonStyle(
                      submit.isPending ||
                        !stepStatus[0] ||
                        !stepStatus[1] ||
                        !stepStatus[2] ||
                        !stepStatus[3]
                    )}
                  >
                    {submit.isPending
                      ? "Menyimpan..."
                      : isEdit
                      ? "Simpan Perubahan"
                      : "Simpan Pendaftaran"}
                  </button>
                )}
              </Group>
            </Group>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

// ---------- autosave indicator ----------

function AutosaveIndicator({ savedAt }: { savedAt: Date | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!savedAt) {
    return (
      <Group
        gap={4}
        px="sm"
        py={6}
        style={{
          borderRadius: 8,
          background: "var(--app-surface-sunken)",
          border: "1px solid var(--app-border)",
        }}
      >
        <IconDeviceFloppy size={12} color="var(--app-text-subtle)" />
        <Text fz="xs" c="dimmed">Siap menyimpan</Text>
      </Group>
    );
  }

  const seconds = Math.round((now - savedAt.getTime()) / 1000);
  const rel = seconds < 5
    ? "Baru saja"
    : seconds < 60
    ? `${seconds} detik lalu`
    : seconds < 3600
    ? `${Math.round(seconds / 60)} menit lalu`
    : savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <Tooltip label={`Disimpan ${savedAt.toLocaleString("id-ID")}`}>
      <Group
        gap={4}
        px="sm"
        py={6}
        style={{
          borderRadius: 8,
          background: "var(--app-primary-soft)",
          border: "1px solid var(--app-primary)",
        }}
      >
        <IconCloudCheck size={12} color="var(--app-primary)" />
        <Text fz="xs" c="primary.7" fw={600}>Draf tersimpan · {rel}</Text>
      </Group>
    </Tooltip>
  );
}

// ---------- shared styles ----------

function navButtonStyle(primary: boolean, disabled = false): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    border: primary ? "1px solid var(--app-primary)" : "1px solid var(--app-border)",
    background: primary ? "var(--app-primary)" : "var(--app-surface)",
    color: primary ? "white" : "var(--app-text)",
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transition: "all 0.15s",
  };
}

function submitButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 22px",
    borderRadius: 8,
    border: "none",
    background: disabled ? "var(--app-border-strong)" : "var(--app-primary)",
    color: disabled ? "var(--app-text-muted)" : "white",
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 4px 12px rgba(19,188,109,0.25)",
    transition: "all 0.15s",
  };
}

// ---------- validation ----------

function isIdentitasValid(v: IdentitasState): boolean {
  return (
    v.nama.trim().length >= 3 &&
    /^\d{16}$/.test(v.noKtp) &&
    !!v.ktp.preview &&
    !!v.kategori &&
    !!v.alamat.provinsi &&
    !!v.alamat.kabupaten &&
    !!v.alamat.kecamatan &&
    !!v.alamat.kelurahan &&
    v.alamat.detail.trim().length >= 5
  );
}

function identitasErrors(v: IdentitasState) {
  return {
    nama: v.nama.trim().length < 3 ? "Nama minimal 3 karakter" : null,
    noKtp:
      v.noKtp.length === 0
        ? "No KTP wajib diisi"
        : !/^\d{16}$/.test(v.noKtp)
        ? "No KTP harus 16 digit angka"
        : null,
    ktp: !v.ktp.preview ? "Lampirkan foto KTP" : null,
    kategori: !v.kategori ? "Pilih kategori peternak" : null,
    alamat: {
      provinsi: !v.alamat.provinsi ? "Pilih provinsi" : null,
      kabupaten: !v.alamat.kabupaten ? "Pilih kabupaten/kota" : null,
      kecamatan: !v.alamat.kecamatan ? "Pilih kecamatan" : null,
      kelurahan: !v.alamat.kelurahan ? "Pilih kelurahan/desa" : null,
      detail:
        v.alamat.detail.trim().length < 5
          ? "Alamat detail minimal 5 karakter"
          : null,
    },
  };
}

function isKandangStepValid(list: Kandang[]): boolean {
  return list.every(
    (k) =>
      k.nama.trim().length >= 1 &&
      k.lokasi.lat !== null &&
      k.lokasi.lng !== null &&
      k.lokasi.alamat.trim().length >= 3 &&
      k.kapasitas !== ""
  );
}

function isKondisiPeralatanValid(list: Kandang[]): boolean {
  return list.every(
    (k) =>
      k.kondisi.dinding.kondisi &&
      k.kondisi.atap.kondisi &&
      k.kondisi.lantai.kondisi &&
      k.kondisi.dinding.foto.preview &&
      k.kondisi.atap.foto.preview &&
      k.kondisi.lantai.foto.preview &&
      k.peralatan.tempatMinum.kondisi &&
      k.peralatan.tempatMakan.kondisi &&
      k.peralatan.brooding.kondisi &&
      k.peralatan.kipas.kondisi &&
      k.peralatan.tempatMinum.foto.preview &&
      k.peralatan.tempatMakan.foto.preview &&
      k.peralatan.brooding.foto.preview &&
      k.peralatan.kipas.foto.preview
  );
}

function isOperasionalValid(list: Kandang[]): boolean {
  return list.every((k) => {
    if (k.statusOperasional === "") return false;
    if (k.statusOperasional === "berhenti") return true;
    return (
      k.jumlahAyam !== "" &&
      k.jenisUsaha !== "" &&
      (k.jenisUsaha === "mandiri" ||
        (k.jenisUsaha === "kemitraan" &&
          k.kemitraan !== ""))
    );
  });
}

// expose for review
export const wizardHelpers = {
  KAPASITAS_LABEL,
  KONDISI_LABEL,
  KATEGORI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  JENIS_USAHA_LABEL,
  DAFTAR_KEMITRAAN,
};
export type { Kondisi };
