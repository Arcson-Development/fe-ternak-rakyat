"use client";

import React, { useEffect, useRef } from "react";
import { Box } from "@mantine/core";

type Lokasi = { lat: number | null; lng: number | null; alamat: string };

type Props = {
  value: Lokasi;
  onChange: (next: Lokasi) => void;
  height?: number;
};

/**
 * Leaflet-based map picker. The whole module is only ever loaded on the
 * client (via the parent's dynamic import) because leaflet needs `window`.
 *
 * UX:
 *   1. Click anywhere on the map to set lat/lng
 *   2. Drag the marker to fine-tune
 *   3. Or use the "Ambil Lokasi" button (parent) to grab the device GPS
 *
 * Tiles: OpenStreetMap (no key). Swap for Mapbox/MapTiler in production.
 */
export default function MapPicker({ value, onChange, height = 240 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];
  const hasCoords = value.lat !== null && value.lng !== null;
  const center: [number, number] = hasCoords
    ? [value.lat as number, value.lng as number]
    : DEFAULT_CENTER;

  // Init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center,
        zoom: hasCoords ? 14 : 5,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const placeMarker = (lat: number, lng: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on("dragend", (e: any) => {
            const p = e.target.getLatLng();
            onChange({
              ...value,
              lat: Number(p.lat.toFixed(6)),
              lng: Number(p.lng.toFixed(6)),
            });
          });
        }
      };

      if (hasCoords) placeMarker(value.lat as number, value.lng as number);

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        placeMarker(lat, lng);
        onChange({ ...value, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when value changes externally (e.g. user clicks "Ambil Lokasi")
  useEffect(() => {
    if (!mapRef.current || !hasCoords) return;
    mapRef.current.flyTo([value.lat as number, value.lng as number], 14, {
      duration: 0.6,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.lat, value.lng]);

  return (
    <Box
      ref={containerRef}
      style={{
        height,
        width: "100%",
        borderRadius: 8,
        border: "1px solid var(--app-border)",
        overflow: "hidden",
        background: "var(--app-surface-sunken)",
      }}
    />
  );
}
