"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  label?: string;
};

/**
 * Single-marker Leaflet map for embedding in kandang cards.
 */
export default function MapSingle({ lat, lng, label }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const genRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    // Bump generation — any in-flight async from a previous run bails out.
    const gen = ++genRef.current;
    // Kill previous map synchronously so the container is free.
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    (async () => {
      const L = (await import("leaflet")).default;
      // Only the latest generation may touch the container.
      if (gen !== genRef.current || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        scrollWheelZoom: true,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: "#f59e0b",
        color: "#fff",
        weight: 2,
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindPopup(label || "");
      setTimeout(() => map.invalidateSize(), 100);
      // Only set ref if we're still the latest generation.
      if (gen === genRef.current) mapRef.current = map;
    })();
    return () => {
      genRef.current++;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, label]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 160 }}
    />
  );
}
