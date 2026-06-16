"use client";

import React, { Suspense, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconCurrentLocation,
  IconMapPin,
  IconRefresh,
  IconMap2,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import dynamic from "next/dynamic";
import { MapPickerFallback } from "../map/MapPickerFallback";

// Lazy load the map - leaflet needs window, so SSR would explode.
const MapPicker = dynamic(() => import("../map/MapPicker"), {
  ssr: false,
  loading: () => <MapPickerFallback />,
});

type Lokasi = { lat: number | null; lng: number | null; alamat: string };

type Props = {
  value: Lokasi;
  onChange: (next: Lokasi) => void;
  withAsterisk?: boolean;
};

/**
 * GPS coordinate capture widget. Combines:
 *   - Manual lat/lng input (with 6-decimal precision)
 *   - Free-text address hint
 *   - "Ambil Lokasi" button using the browser geolocation API
 *   - Visual Leaflet map: click to place, drag to fine-tune
 */
export function GpsPicker({ value, onChange, withAsterisk }: Props) {
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(!!(value.lat !== null && value.lng !== null));

  const handleCapture = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      notifications.show({
        title: "Geolocation tidak tersedia",
        message: "Peramban Anda tidak mendukung fitur lokasi.",
        color: "red",
      });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          alamat: value.alamat,
        });
        setLoading(false);
        setShowMap(true);
        notifications.show({
          title: "Lokasi berhasil diambil",
          message: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          color: "green",
        });
      },
      (err) => {
        setLoading(false);
        notifications.show({
          title: "Gagal mengambil lokasi",
          message: err.message || "Periksa izin lokasi di peramban Anda.",
          color: "red",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const hasCoords = value.lat !== null && value.lng !== null;

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Text fz="sm" fw={500}>
          Koordinat GPS (Lintang, Bujur)
          {withAsterisk && (
            <Text component="span" c="red" inherit>
              {" *"}
            </Text>
          )}
        </Text>
        <Group gap="xs">
          <Tooltip label="Ambil dari lokasi perangkat saat ini">
            <Button
              size="xs"
              variant="light"
              color="primary"
              leftSection={
                loading ? (
                  <Loader size={12} color="primary" />
                ) : (
                  <IconCurrentLocation size={14} />
                )
              }
              onClick={handleCapture}
              disabled={loading}
            >
              {loading ? "Mengambil..." : "Ambil Lokasi"}
            </Button>
          </Tooltip>
          <Tooltip label={showMap ? "Sembunyikan peta" : "Tampilkan peta"}>
            <ActionIcon
              variant={showMap ? "filled" : "light"}
              color="primary"
              onClick={() => setShowMap((s) => !s)}
              size="md"
            >
              <IconMap2 size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Group grow gap="sm" align="flex-end">
        <TextInput
          type="number"
          step="0.000001"
          label="Lintang (Lat)"
          placeholder="cth: -6.200000"
          value={value.lat ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              lat: e.currentTarget.value === "" ? null : Number(e.currentTarget.value),
            })
          }
          leftSection={<IconMapPin size={14} />}
        />
        <TextInput
          step="0.000001"
          label="Bujur (Lng)"
          placeholder="cth: 106.816666"
          value={value.lng ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              lng: e.currentTarget.value === "" ? null : Number(e.currentTarget.value),
            })
          }
          leftSection={<IconMapPin size={14} />}
        />
      </Group>

      <TextInput
        label="Alamat / Patokan Lokasi"
        placeholder="cth: 500 m dari pasar desa, sebelah gudang pak RT"
        value={value.alamat}
        onChange={(e) => onChange({ ...value, alamat: e.currentTarget.value })}
        description="Penanda sederhana agar mudah ditemukan oleh petugas verifikasi."
      />

      {showMap && (
        <Box>
          <Text fz="xs" c="dimmed" mb={6}>
            Klik pada peta untuk menandai koordinat, atau geser pin untuk
            menyempurnakan posisi.
          </Text>
          <Suspense fallback={<MapPickerFallback />}>
            <MapPicker value={value} onChange={onChange} height={280} />
          </Suspense>
        </Box>
      )}

      {hasCoords && (
        <Box
          p="xs"
          style={{
            background: "var(--app-primary-soft)",
            borderRadius: 8,
            border: "1px solid var(--app-border)",
          }}
        >
          <Group gap="xs" justify="space-between">
            <Group gap={6}>
              <IconMapPin size={14} color="var(--app-primary)" />
              <Text fz="xs" c="primary.7" fw={600}>
                {value.lat?.toFixed(6)}, {value.lng?.toFixed(6)}
              </Text>
            </Group>
            <Tooltip label="Reset koordinat">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="primary"
                onClick={() => onChange({ ...value, lat: null, lng: null })}
              >
                <IconRefresh size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Box>
      )}
    </Stack>
  );
}
