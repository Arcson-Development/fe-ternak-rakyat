"use client";

import React from "react";
import { SegmentedControl, Stack, Text } from "@mantine/core";
import { KONDISI_LABEL, type Kondisi } from "../../hooks/useTernakRakyat/types";

type Props = {
  label: string;
  value: Kondisi | "";
  onChange: (v: Kondisi) => void;
  withAsterisk?: boolean;
};

/**
 * Segmented control for the three-state "kondisi" picker used across
 * the form. Labels are pulled from the central enum so this component
 * stays in sync with the rest of the app.
 */
export function RatingSelect({ label, value, onChange, withAsterisk }: Props) {
  return (
    <Stack gap={4}>
      <Text fz="sm" fw={500} component="label">
        {label}
        {withAsterisk && (
          <Text component="span" c="red" inherit>
            {" *"}
          </Text>
        )}
      </Text>
      <SegmentedControl
        fullWidth
        value={value || ""}
        onChange={(v) => onChange(v as Kondisi)}
        data={[
          { value: "baik", label: KONDISI_LABEL.baik },
          { value: "sedang", label: KONDISI_LABEL.sedang },
          { value: "rusak", label: KONDISI_LABEL.rusak },
        ]}
        color={
          value === "baik" ? "primary" : value === "sedang" ? "accent" : "red"
        }
        transitionDuration={150}
      />
    </Stack>
  );
}
