"use client";

import React from "react";
import { Box, Center, Loader, Text } from "@mantine/core";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = { date: string; value: number };

type Props = {
  data: Datum[];
  height?: number;
  loading?: boolean;
  color?: string;
};

export function TrendArea({ data, height = 200, loading, color = "#13bc6d" }: Props) {
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
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            stroke="#cbd5e1"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            allowDecimals={false}
            stroke="#cbd5e1"
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: any) => [value, "Pendaftaran"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
