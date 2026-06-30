"use client";

import React from "react";
import {
  Box,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCircleCheck,
  IconCircleX,
  IconClipboardCheck,
  IconHome,
  IconTools,
  IconWall,
  IconRulerMeasure,
} from "@tabler/icons-react";
import { SectionCard } from "../ui/SectionCard";
import { RatingSelect } from "../ui/RatingSelect";
import { FileUploadCard } from "../ui/FileUploadCard";
import { StatusBadge } from "../ui/StatusBadge";
import type { Kandang } from "../../hooks/useTernakRakyat";

type Props = {
  list: Kandang[];
  onChange: (id: string, next: Kandang) => void;
};

export function StepKondisiPeralatan({ list, onChange }: Props) {
  const [active, setActive] = React.useState<string>(list[0]?.id ?? "");

  React.useEffect(() => {
    if (!list.find((k) => k.id === active) && list[0]) setActive(list[0].id);
  }, [list, active]);

  return (
    <Stack gap="md">
      <SectionCard
        title="Kondisi & Peralatan Kandang"
        description="Foto dan rating kondisi untuk dinding, atap, lantai, serta peralatan pendukung."
        icon={IconClipboardCheck}
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
              const ok = isKandangComplete(k);
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
        const setKondisi = (path: ["dinding" | "atap" | "lantai", "kondisi" | "foto"], value: any) => {
          const next = structuredClone(k);
          let target: any = next.kondisi;
          for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
          target[path[path.length - 1]] = value;
          onChange(k.id, next);
        };
        const setPeralatan = (path: ["tempatMinum" | "tempatMakan" | "brooding" | "kipas", "kondisi" | "foto"], value: any) => {
          const next = structuredClone(k);
          let target: any = next.peralatan;
          for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
          target[path[path.length - 1]] = value;
          onChange(k.id, next);
        };

        return (
          <Box key={k.id} style={{ display: k.id === active ? "block" : "none" }}>
            <Stack gap="md">
              <SectionCard
                title={`Kondisi Fisik — ${k.nama || "Kandang"}`}
                description="Pilih rating kondisi dan unggah foto untuk setiap aspek."
                icon={IconHome}
              >
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                  <KondisiBlock
                    title="Dinding"
                    icon={<IconWall size={18} />}
                    value={k.kondisi.dinding.kondisi}
                    onChange={(v) => setKondisi(["dinding", "kondisi"], v)}
                    photo={k.kondisi.dinding.foto}
                    onPhotoChange={(p) => setKondisi(["dinding", "foto"], p)}
                  />
                  <KondisiBlock
                    title="Atap"
                    icon={<IconHome size={18} />}
                    value={k.kondisi.atap.kondisi}
                    onChange={(v) => setKondisi(["atap", "kondisi"], v)}
                    photo={k.kondisi.atap.foto}
                    onPhotoChange={(p) => setKondisi(["atap", "foto"], p)}
                  />
                  <KondisiBlock
                    title="Lantai"
                    icon={<IconRulerMeasure size={18} />}
                    value={k.kondisi.lantai.kondisi}
                    onChange={(v) => setKondisi(["lantai", "kondisi"], v)}
                    photo={k.kondisi.lantai.foto}
                    onPhotoChange={(p) => setKondisi(["lantai", "foto"], p)}
                  />
                </SimpleGrid>
              </SectionCard>

              <SectionCard
                title={`Peralatan Kandang — ${k.nama || "Kandang"}`}
                description="Pilih rating kondisi dan unggah foto untuk setiap peralatan."
                icon={IconTools}
                iconColor="blue"
              >
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <KondisiBlock
                    title="Tempat Minum"
                    value={k.peralatan.tempatMinum.kondisi}
                    onChange={(v) => setPeralatan(["tempatMinum", "kondisi"], v)}
                    photo={k.peralatan.tempatMinum.foto}
                    onPhotoChange={(p) => setPeralatan(["tempatMinum", "foto"], p)}
                  />
                  <KondisiBlock
                    title="Tempat Makan"
                    value={k.peralatan.tempatMakan.kondisi}
                    onChange={(v) => setPeralatan(["tempatMakan", "kondisi"], v)}
                    photo={k.peralatan.tempatMakan.foto}
                    onPhotoChange={(p) => setPeralatan(["tempatMakan", "foto"], p)}
                  />
                  <KondisiBlock
                    title="Brooding / Pemanas"
                    value={k.peralatan.brooding.kondisi}
                    onChange={(v) => setPeralatan(["brooding", "kondisi"], v)}
                    photo={k.peralatan.brooding.foto}
                    onPhotoChange={(p) => setPeralatan(["brooding", "foto"], p)}
                  />
                  <KondisiBlock
                    title="Kipas / Ventilasi"
                    value={k.peralatan.kipas.kondisi}
                    onChange={(v) => setPeralatan(["kipas", "kondisi"], v)}
                    photo={k.peralatan.kipas.foto}
                    onPhotoChange={(p) => setPeralatan(["kipas", "foto"], p)}
                  />
                </SimpleGrid>
              </SectionCard>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

function KondisiBlock({
  title,
  icon,
  value,
  onChange,
  photo,
  onPhotoChange,
}: {
  title: string;
  icon?: React.ReactNode;
  value: any;
  onChange: (v: any) => void;
  photo: any;
  onPhotoChange: (p: any) => void;
}) {
  return (
    <Card withBorder padding="md" radius="md" shadow="xs">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap={8}>
            {icon}
            <Text fw={700} fz="sm">
              {title}
            </Text>
          </Group>
          <StatusBadge variant="kondisi" value={value} />
        </Group>
        <RatingSelect label="Kondisi" value={value} onChange={onChange} withAsterisk />
        <FileUploadCard
          label={`Foto ${title}`}
          value={photo}
          onChange={onPhotoChange}
          aspect={4 / 3}
          optional
        />
      </Stack>
    </Card>
  );
}

function isKandangComplete(k: Kandang): boolean {
  // Foto is optional — only the kondisi (rating) is required.
  return Boolean(
    k.kondisi.dinding.kondisi &&
      k.kondisi.atap.kondisi &&
      k.kondisi.lantai.kondisi &&
      k.peralatan.tempatMinum.kondisi &&
      k.peralatan.tempatMakan.kondisi &&
      k.peralatan.brooding.kondisi &&
      k.peralatan.kipas.kondisi
  );
}
