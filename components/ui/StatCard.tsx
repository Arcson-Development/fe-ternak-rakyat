"use client";

import React from "react";
import { Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: Icon;
  iconColor?: string;
  trend?: { value: string; positive?: boolean };
};

/**
 * Single KPI tile for the dashboard grid. Compact, neutral, and reads
 * well stacked four-across on desktop / two on mobile.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: IconComp,
  iconColor = "primary",
  trend,
}: Props) {
  return (
    <Card padding="lg" radius="md" withBorder shadow="xs">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={6} style={{ minWidth: 0 }}>
          <Text fz="xs" fw={600} tt="uppercase" c="dimmed" lts="0.06em">
            {label}
          </Text>
          <Text fz={26} fw={700} lh={1}>
            {value}
          </Text>
          {hint && (
            <Text fz="xs" c="dimmed">
              {hint}
            </Text>
          )}
          {trend && (
            <Text fz="xs" c={trend.positive ? "primary" : "red"} fw={600}>
              {trend.positive ? "▲" : "▼"} {trend.value}
            </Text>
          )}
        </Stack>
        {IconComp && (
          <ThemeIcon
            size={42}
            radius="md"
            variant="light"
            color={iconColor}
            style={{ flexShrink: 0 }}
          >
            <IconComp size={22} stroke={1.7} />
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}
