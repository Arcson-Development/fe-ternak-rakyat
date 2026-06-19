"use client";

import React from "react";
import {
  Box,
  Card,
  Grid,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleX,
  IconClipboardList,
} from "@tabler/icons-react";
import { SectionCard } from "../ui/SectionCard";
import { StatusBadge } from "../ui/StatusBadge";
import {
  DAFTAR_KEMITRAAN,
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  kemitraanLabel,
  type JenisUsaha,
  type Kandang,
  type KapasitasKandang,
  type StatusOperasional,
} from "../../hooks/useTernakRakyat";

type Props = {
  list: Kandang[];
  onChange: (id: string, next: Kandang) => void;
};

export function StepOperasional({ list, onChange }: Props) {
  const [active, setActive] = React.useState<string>(list[0]?.id ?? "");

  React.useEffect(() => {
    if (!list.find((k) => k.id === active) && list[0]) setActive(list[0].id);
  }, [list, active]);

  return (
    <Stack gap="md">
      <SectionCard
        title="Status Operasional"
        description="Status saat ini, jumlah ayam, dan jenis usaha setiap kandang."
        icon={IconClipboardList}
      >
        <Tabs
          value={active}
          onChange={(v) => v && setActive(v)}
          variant="pills"
          radius="md"
          color="primary"
        >
          <Tabs.List>
            {list.map((k, i) => {
              const ok = isOperasionalComplete(k);
              return (
                <Tabs.Tab
                  key={k.id}
                  value={k.id}
                  leftSection={
                    ok ? (
                      <IconCircleCheck size={14} color="var(--app-primary)" />
                    ) : (
                      <IconCircleX size={14} color="var(--app-text-subtle)" />
                    )
                  }
                >
                  {k.nama || `Kandang ${i + 1}`}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs>
      </SectionCard>

      {list.map((k) => {
        const setOp = (key: "statusOperasional" | "jumlahAyam" | "jenisUsaha" | "kemitraan", value: any) => {
          onChange(k.id, { ...k, [key]: value } as any);
        };

        const isOperasional = k.statusOperasional === "operasi";

        return (
          <Box key={k.id} style={{ display: k.id === active ? "block" : "none" }}>
            <SectionCard
              title={k.nama || "Kandang"}
              description="Tentukan status operasional dan detail usaha."
              icon={IconClipboardList}
              actions={<StatusBadge variant="operasional" value={k.statusOperasional} />}
            >
              <Stack gap="md">
                <Stack gap={6}>
                  <Text fz="sm" fw={500}>
                    Status Operasional
                    <Text component="span" c="red" inherit>{" *"}</Text>
                  </Text>
                  <SegmentedControl
                    fullWidth
                    value={k.statusOperasional}
                    onChange={(v) => setOp("statusOperasional", v as StatusOperasional)}
                    data={[
                      { value: "operasi", label: "Sedang Operasi" },
                      { value: "berhenti", label: "Tidak Operasi" },
                    ]}
                    color="primary"
                  />
                </Stack>

                {!isOperasional ? (
                  <Card
                    withBorder
                    padding="md"
                    radius="md"
                    style={{ background: "var(--app-surface-sunken)" }}
                  >
                    <Text fz="sm" c="dimmed" ta="center">
                      Kandang ini sedang tidak beroperasi. Detail jumlah
                      ayam, jenis usaha, dan kemitraan tidak diperlukan.
                    </Text>
                  </Card>
                ) : (
                  <Grid gutter="md">
                    <Grid.Col span={12}>
                      <Stack gap={6}>
                        <Text fz="sm" fw={500}>
                          Jumlah Ayam
                          <Text component="span" c="red" inherit>{" *"}</Text>
                        </Text>
                        <SegmentedControl
                          fullWidth
                          value={k.jumlahAyam}
                          onChange={(v) =>
                            setOp("jumlahAyam", v as KapasitasKandang)
                          }
                          data={(Object.keys(KAPASITAS_LABEL) as KapasitasKandang[]).map(
                            (key) => ({ value: key, label: KAPASITAS_LABEL[key] })
                          )}
                          color="primary"
                        />
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Stack gap={6}>
                        <Text fz="sm" fw={500}>
                          Jenis Usaha
                          <Text component="span" c="red" inherit>{" *"}</Text>
                        </Text>
                        <SegmentedControl
                          fullWidth
                          value={k.jenisUsaha}
                          onChange={(v) => {
                            const next = v as JenisUsaha;
                            // Single atomic update. Calling `setOp`
                            // twice in a row used to fight itself: both
                            // calls spread the same stale `k` from the
                            // closure, so the second call (clearing
                            // `kemitraan`) would also overwrite
                            // `jenisUsaha` back to "" — making the
                            // "Mandiri" click look like it did nothing.
                            onChange(k.id, {
                              ...k,
                              jenisUsaha: next,
                              kemitraan:
                                next === "mandiri" ? "" : k.kemitraan,
                            } as any);
                          }}
                          data={[
                            { value: "mandiri", label: JENIS_USAHA_LABEL.mandiri },
                            { value: "kemitraan", label: JENIS_USAHA_LABEL.kemitraan },
                          ]}
                          color="primary"
                        />
                      </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Select
                        label={
                          k.jenisUsaha === "kemitraan"
                            ? "Nama Kemitraan"
                            : "Nama Kemitraan (opsional)"
                        }
                        placeholder={
                          k.jenisUsaha === "kemitraan"
                            ? "Pilih perusahaan mitra"
                            : "—"
                        }
                        withAsterisk={k.jenisUsaha === "kemitraan"}
                        data={DAFTAR_KEMITRAAN.map((n) => ({
                          value: n,
                          label: kemitraanLabel(n),
                        }))}
                        value={k.kemitraan || null}
                        onChange={(v) => setOp("kemitraan", (v as any) || "")}
                        searchable
                        clearable
                        disabled={
                          k.jenisUsaha === "" ||
                          k.jenisUsaha === "mandiri"
                        }
                        description={
                          k.jenisUsaha === "kemitraan"
                            ? "Pilih dari daftar perusahaan mitra yang tersedia."
                            : "Aktifkan jenis usaha 'Kemitraan' untuk memilih."
                        }
                      />
                    </Grid.Col>
                  </Grid>
                )}
              </Stack>
            </SectionCard>
          </Box>
        );
      })}
    </Stack>
  );
}

function isOperasionalComplete(k: Kandang): boolean {
  if (k.statusOperasional === "") return false;
  if (k.statusOperasional === "berhenti") return true;
  return Boolean(
    k.jumlahAyam &&
      k.jenisUsaha &&
      (k.jenisUsaha === "mandiri" ||
        (k.jenisUsaha === "kemitraan" && k.kemitraan))
  );
}
