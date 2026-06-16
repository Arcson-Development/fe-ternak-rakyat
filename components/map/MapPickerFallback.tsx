"use client";

import React from "react";
import { Box, Center, Text } from "@mantine/core";
import { IconMap2 } from "@tabler/icons-react";

export function MapPickerFallback({ height = 240 }: { height?: number }) {
  return (
    <Box
      style={{
        height,
        width: "100%",
        borderRadius: 8,
        border: "1px dashed var(--app-border)",
        background: "var(--app-surface-sunken)",
      }}
    >
      <Center h="100%">
        <div style={{ textAlign: "center" }}>
          <IconMap2 size={28} color="var(--app-text-subtle)" />
          <Text fz="xs" c="dimmed" mt={4}>
            Memuat peta...
          </Text>
        </div>
      </Center>
    </Box>
  );
}
