"use client";

import React from "react";
import { Box, Center, Loader, Text } from "@mantine/core";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Datum = { name: string; value: number; color: string };

type Props = {
  data: Datum[];
  height?: number;
  loading?: boolean;
};

export function KategoriDonut({ data, height = 220, loading }: Props) {
  if (loading) {
    return (
      <Center h={height}>
        <Loader size="sm" color="primary" />
      </Center>
    );
  }
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <Center h={height}>
        <Text fz="xs" c="dimmed">Belum ada data</Text>
      </Center>
    );
  }
  return (
    <Box style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: any, name: any) => [value, name]}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
