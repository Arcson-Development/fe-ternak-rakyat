"use client";

import React, { useEffect, useRef } from "react";
import { Box, Center, Stack, Text } from "@mantine/core";
import { IconMap2 } from "@tabler/icons-react";

// Patches `L.Icon.Default` before any marker is created — must run
// before the dynamic leaflet import further down.
import "./leafletInit";

type Lokasi = { lat: number; lng: number; label: string; id: number };

type Props = {
  points: Lokasi[];
  height?: number;
  onSelect?: (id: number) => void;
  selectedData?: {
    id: number;
    nama: string;
    kategori_peternak: string;
    alamat: string;
    kelurahan: string;
    kecamatan: string;
    kabupaten: string;
    ktp_no?: string;
    kandangCount: number;
  } | null;
};

/**
 * Multi-marker Leaflet map with rich popups showing peternak detail.
 */
export default function FarmersMap({ points, height = 360, onSelect, selectedData }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerMapRef = useRef<Map<number, any>>(new Map());
  const resizeObs = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        center: [-2.5, 118],
        zoom: 5,
        scrollWheelZoom: true,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      // Watch container size — whenever it becomes visible (tab switch,
      // layout shift, etc.), force Leaflet to re-measure.
      if (typeof ResizeObserver !== "undefined" && containerRef.current) {
        resizeObs.current = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObs.current.observe(containerRef.current);
      }
      // Watch visibility — when container scrolls into view (e.g. tab
      // becomes active), force Leaflet to re-measure so tiles fill the
      // visible area, not just the initial (often 0×0) size.
      if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
        const visObs = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              map.invalidateSize();
            }
          }
        });
        visObs.observe(containerRef.current);
        // Stash on the map ref for cleanup
        (map as any)._visObs = visObs;
      }

      // Add markers
      const valid = points.filter(
        (p) => typeof p.lat === "number" && typeof p.lng === "number"
      );
      const bounds: [number, number][] = [];
      const layer = L.layerGroup().addTo(map);
      const markerMap = new Map<number, any>();
      valid.forEach((p) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 8,
          fillColor: "#f59e0b",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        })
          .addTo(layer)
          .bindPopup(`<div style="font-size:12px;">${p.label}</div>`);
        marker.on("click", () => onSelect?.(p.id));
        markerMap.set(p.id, marker);
        bounds.push([p.lat, p.lng]);
      });
      markerMapRef.current = markerMap;
      if (bounds.length === 1) {
        // Single point — set view directly
        map.setView([valid[0].lat, valid[0].lng], 15);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
      }
      // Force Leaflet to re-measure container after mount
      // (handles hidden tab containers, layout shifts, etc.)
      requestAnimationFrame(() => {
        map.invalidateSize();
        // Second attempt after tiles start loading
        setTimeout(() => map.invalidateSize(), 100);
        // Third attempt for slow first paint
        setTimeout(() => map.invalidateSize(), 500);
      });
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        if ((mapRef.current as any)._visObs) {
          (mapRef.current as any)._visObs.disconnect();
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerMapRef.current = new Map();
      if (resizeObs.current) {
        resizeObs.current.disconnect();
        resizeObs.current = null;
      }
    };
  }, [points]);

  // Update popup when detail data arrives
  useEffect(() => {
    if (!selectedData) return;
    const marker = markerMapRef.current.get(selectedData.id);
    if (!marker) return;
    const k = selectedData;
    marker.setPopupContent(`
      <div style="font-size:14px;font-weight:700;margin-bottom:2px;">${k.nama}</div>
      <div style="font-size:12px;color:#666;margin-bottom:6px;">
        ${k.kategori_peternak} &middot; #${k.id}
      </div>
      <div style="font-size:11px;line-height:1.5;margin-bottom:4px;">
        ${k.alamat}, ${k.kelurahan}, ${k.kecamatan}, ${k.kabupaten}
      </div>
      <div style="font-size:11px;color:#888;margin-bottom:6px;">
        ${k.ktp_no ? `KTP: ${k.ktp_no} &middot; ` : ""}${k.kandangCount} kandang
      </div>
      <a href="/dashboard/peternak/${k.id}"
         style="font-size:11px;color:#1c7ed6;text-decoration:none;font-weight:600;">
        Lihat Detail &rarr;
      </a>
    `);
    marker.openPopup();
  }, [selectedData]);

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
