"use client";

import React from "react";
import { Group, Text } from "@mantine/core";

type Kondisi = "baik" | "sedang" | "rusak";

const RANK: Record<Kondisi, number> = { rusak: 0, sedang: 1, baik: 2 };
const COLORS: Record<Kondisi, string> = {
  baik: "#13bc6d",
  sedang: "#f59e0b",
  rusak: "#ef4444",
};
const LABEL: Record<Kondisi, string> = {
  baik: "Baik",
  sedang: "Sedang",
  rusak: "Rusak",
};

/**
 * Small horizontal bar showing where the given condition sits on the
 * Baik → Sedang → Rusak scale. Useful as a quick visual cue.
 */
export function ConditionBar({ kondisi }: { kondisi: Kondisi }) {
  const safe = (["baik", "sedang", "rusak"] as Kondisi[]).includes(kondisi)
    ? (kondisi as Kondisi)
    : "sedang";
  const activeIdx = RANK[safe];
  return (
    <Group gap={4} wrap="nowrap" align="center">
      {(["rusak", "sedang", "baik"] as Kondisi[]).map((k, i) => {
        // map reverse: index 0 is rusak (left), 2 is baik (right)
        const isActive = i === activeIdx;
        return (
          <React.Fragment key={k}>
            <div
              style={{
                flex: 1,
                height: 4,
                background: isActive ? COLORS[k] : "var(--app-border)",
                borderRadius: 2,
                transition: "background 0.2s",
              }}
            />
            {i === 2 && (
              <Text fz="xs" c="dimmed" ml={4}>
                {LABEL[safe]}
              </Text>
            )}
          </React.Fragment>
        );
      })}
    </Group>
  );
}
