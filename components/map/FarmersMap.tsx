"use client";

import React, { useEffect, useRef } from "react";
import { Box, Center, Stack, Text } from "@mantine/core";
import { IconMap2 } from "@tabler/icons-react";

type Lokasi = { lat: number; lng: number; label: string };

type Props = {
  points: Lokasi[];
  height?: number;
};

/**
 * Multi-marker Leaflet map for the dashboard. Each farmer's first
 * available coordinate is shown as a pin. Click a pin to focus it.
 */
export default function FarmersMap({ points, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        center: [-2.5, 118], // tengah Indonesia
        zoom: 5,
        scrollWheelZoom: true,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      const layer = L.layerGroup().addTo(map);
      layerRef.current = layer;
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      layerRef.current.clearLayers();
      const valid = points.filter(
        (p) => typeof p.lat === "number" && typeof p.lng === "number"
      );
      const bounds: [number, number][] = [];
      valid.forEach((p) => {
        L.marker([p.lat, p.lng])
          .addTo(layerRef.current)
          .bindPopup(`<div style="font-size:12px;font-weight:600;">${p.label}</div>`);
        bounds.push([p.lat, p.lng]);
      });
      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
      }
    })();
  }, [points]);

  if (points.length === 0) {
    return (
      <Box
        style={{
          height,
          border: "1px dashed var(--app-border)",
          borderRadius: 8,
          background: "var(--app-surface-sunken)",
        }}
      >
        <Center h="100%">
          <Stack gap={4} align="center">
            <IconMap2 size={28} color="var(--app-text-subtle)" />
            <Text fz="xs" c="dimmed">
              Belum ada koordinat kandang yang tercatat
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      style={{
        height,
        width: "100%",
        borderRadius: 8,
        border: "1px solid var(--app-border)",
        overflow: "hidden",
      }}
    />
  );
}
