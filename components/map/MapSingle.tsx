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
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      const map = L.map(ref.current, {
        center: [lat, lng],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
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
      return () => {
        map.remove();
      };
    })();
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
