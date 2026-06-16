"use client";

import React from "react";
import { Box, Center, Loader, Text } from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = { name: string; value: number };

type Props = {
  data: Datum[];
  height?: number;
  loading?: boolean;
  color?: string;
};

export function TopKabupatenBar({
  data,
  height = 240,
  loading,
  color = "#13bc6d",
}: Props) {
  if (loading) {
    return (
      <Center h={height}>
        <Loader size="sm" color="primary" />
      </Center>
    );
  }
  if (data.length === 0) {
    return (
      <Center h={height}>
        <Text fz="xs" c="dimmed">Belum ada data</Text>
      </Center>
    );
  }
  return (
    <Box style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            allowDecimals={false}
            stroke="#cbd5e1"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={120}
            stroke="#cbd5e1"
          />
          <Tooltip
            cursor={{ fill: "rgba(19,188,109,0.05)" }}
            contentStyle={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: any) => [value, "Peternak"]}
          />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
