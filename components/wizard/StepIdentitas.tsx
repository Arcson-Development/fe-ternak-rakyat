"use client";

import React from "react";
import {
  Card,
  Grid,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconUser, IconMapPin, IconId, IconNotes } from "@tabler/icons-react";
import { SectionCard } from "../ui/SectionCard";
import { FileUploadCard } from "../ui/FileUploadCard";
import {
  KATEGORI_LABEL,
  type KategoriPeternak,
  type RegionRef,
} from "../../hooks/useTernakRakyat";
import {
  useKabupaten,
  useKecamatan,
  useKelurahan,
  useProvinsi,
} from "../../hooks/useTernakRakyat";

type Alamat = {
  provinsi: RegionRef | null;
  kabupaten: RegionRef | null;
  kecamatan: RegionRef | null;
  kelurahan: RegionRef | null;
  detail: string;
};

type Identitas = {
  nama: string;
  noKtp: string;
  ktp: { id: string; preview: string | null; name?: string; size?: number };
  kategori: KategoriPeternak | "";
  catatan: string;
  alamat: Alamat;
};

type Errors = {
  nama: string | null;
  noKtp: string | null;
  ktp: string | null;
  kategori: string | null;
  catatan: string | null;
  alamat: {
    provinsi: string | null;
    kabupaten: string | null;
    kecamatan: string | null;
    kelurahan: string | null;
    detail: string | null;
  };
};

type Props = {
  value: Identitas;
  onChange: (next: Identitas) => void;
  errors: Errors;
};

export function StepIdentitas({ value, onChange, errors }: Props) {
  const set = <K extends keyof Identitas>(k: K, v: Identitas[K]) =>
    onChange({ ...value, [k]: v });

  const setAlamat = <K extends keyof Alamat>(k: K, v: Alamat[K]) =>
    onChange({ ...value, alamat: { ...value.alamat, [k]: v } });

  const { data: provinsi = [] } = useProvinsi();
  const { data: kabupaten = [] } = useKabupaten(value.alamat.provinsi?.id ?? null);
  const { data: kecamatan = [] } = useKecamatan(
    value.alamat.provinsi?.id ?? null,
    value.alamat.kabupaten?.id ?? null
  );
  const { data: kelurahan = [] } = useKelurahan(
    value.alamat.provinsi?.id ?? null,
    value.alamat.kabupaten?.id ?? null,
    value.alamat.kecamatan?.id ?? null
  );

  return (
    <Stack gap="md">
      {/* Identitas */}
      <SectionCard
        title="Identitas Peternak"
        description="Nama lengkap sesuai KTP dan nomor induk kependudukan."
        icon={IconUser}
      >
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <TextInput
                label="Nama Lengkap"
                placeholder="cth: Ahmad Sudrajat"
                withAsterisk
                value={value.nama}
                onChange={(e) => set("nama", e.currentTarget.value)}
                error={errors.nama}
              />
              <TextInput
                label="No. KTP (NIK)"
                placeholder="16 digit angka"
                withAsterisk
                maxLength={16}
                value={value.noKtp}
                onChange={(e) => {
                  const cleaned = e.currentTarget.value.replace(/\D/g, "").slice(0, 16);
                  set("noKtp", cleaned);
                }}
                error={errors.noKtp}
                description={`${value.noKtp.length}/16 digit`}
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <FileUploadCard
              label="Foto KTP"
              value={value.ktp}
              onChange={(next) => set("ktp", next)}
              description="Pastikan foto jelas, tidak blur, dan semua info terbaca."
              optional
            />
            {errors.ktp && (
              <Text fz="xs" c="red" mt={4}>
                {errors.ktp}
              </Text>
            )}
          </Grid.Col>
        </Grid>
      </SectionCard>

      {/* Alamat */}
      <SectionCard
        title="Alamat Domisili"
        description="Alamat tempat tinggal atau alamat usaha peternakan."
        icon={IconMapPin}
        iconColor="blue"
      >
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Provinsi"
              placeholder="Pilih provinsi"
              withAsterisk
              searchable
              data={provinsi.map((p: any) => ({ value: p.id, label: p.name }))}
              value={value.alamat.provinsi?.id ?? null}
              onChange={(v) =>
                setAlamat("provinsi", v ? { id: v, name: provinsi.find((p: any) => p.id === v)?.name ?? "" } : null)
              }
              error={errors.alamat.provinsi}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Kabupaten / Kota"
              placeholder="Pilih kabupaten"
              withAsterisk
              searchable
              data={kabupaten.map((p: any) => ({ value: p.id, label: p.name }))}
              value={value.alamat.kabupaten?.id ?? null}
              onChange={(v) =>
                setAlamat("kabupaten", v ? { id: v, name: kabupaten.find((p: any) => p.id === v)?.name ?? "" } : null)
              }
              error={errors.alamat.kabupaten}
              disabled={!value.alamat.provinsi}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Kecamatan"
              placeholder="Pilih kecamatan"
              withAsterisk
              searchable
              data={kecamatan.map((p: any) => ({ value: p.id, label: p.name }))}
              value={value.alamat.kecamatan?.id ?? null}
              onChange={(v) =>
                setAlamat("kecamatan", v ? { id: v, name: kecamatan.find((p: any) => p.id === v)?.name ?? "" } : null)
              }
              error={errors.alamat.kecamatan}
              disabled={!value.alamat.kabupaten}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Kelurahan / Desa"
              placeholder="Pilih kelurahan"
              withAsterisk
              searchable
              data={kelurahan.map((p: any) => ({ value: p.id, label: p.name }))}
              value={value.alamat.kelurahan?.id ?? null}
              onChange={(v) =>
                setAlamat("kelurahan", v ? { id: v, name: kelurahan.find((p: any) => p.id === v)?.name ?? "" } : null)
              }
              error={errors.alamat.kelurahan}
              disabled={!value.alamat.kecamatan}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan)"
              placeholder="cth: Jl. Raya Bogor KM 42, No. 17, RT 02/RW 05, samping mushola"
              withAsterisk
              minRows={2}
              autosize
              value={value.alamat.detail}
              onChange={(e) => setAlamat("detail", e.currentTarget.value)}
              error={errors.alamat.detail}
            />
          </Grid.Col>
        </Grid>
      </SectionCard>

      {/* Kategori */}
      <SectionCard
        title="Kategori Peternak"
        description="Pilih jenis usaha utama yang dijalankan."
        icon={IconId}
        iconColor="accent"
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {(Object.keys(KATEGORI_LABEL) as KategoriPeternak[]).map((k: any) => {
            const active = value.kategori === k;
            return (
              <Card
                key={k}
                withBorder
                padding="md"
                radius="md"
                onClick={() => set("kategori", k)}
                style={{
                  cursor: "pointer",
                  borderColor: active ? "var(--app-primary)" : "var(--app-border)",
                  borderWidth: active ? 2 : 1,
                  background: active ? "var(--app-primary-soft)" : "var(--app-surface)",
                  transition: "all 0.15s",
                }}
              >
                <Radio
                  checked={active}
                  onChange={() => set("kategori", k)}
                  label={KATEGORI_LABEL[k as KategoriPeternak]}
                  color="primary"
                />
                <Text fz="xs" c="dimmed" mt={4} pl={28}>
                  {k === "ayam_pedaging"
                    ? "Ayam yang dibudidayakan untuk diambil dagingnya."
                    : "Ayam yang dibudidayakan untuk diambil telur konsumsinya."}
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>
        {errors.kategori && (
          <Text fz="xs" c="red" mt={6}>
            {errors.kategori}
          </Text>
        )}
      </SectionCard>

      {/* Catatan */}
      <SectionCard
        title="Catatan Tambahan"
        description="Informasi pelengkap yang ingin disampaikan ke operator (opsional)."
        icon={IconNotes}
        iconColor="gray"
      >
        <Textarea
          label="Catatan"
          placeholder="cth: Ayam baru beli minggu lalu, sedang adaptasi pakan. Lokasi kandang agak sulit dijangkau saat hujan."
          autosize
          minRows={3}
          maxRows={8}
          maxLength={500}
          value={value.catatan}
          onChange={(e) => set("catatan", e.currentTarget.value)}
          description={`${value.catatan.length}/500 karakter · tidak wajib diisi`}
        />
      </SectionCard>
    </Stack>
  );
}
