"use client";

import React from "react";
import { Badge } from "@mantine/core";
import {
  KONDISI_COLOR,
  KONDISI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  type Kondisi,
  type StatusOperasional,
} from "../../hooks/useTernakRakyat/types";

type Variant = "kondisi" | "operasional" | "custom";

type Props =
  | { variant: "kondisi"; value: Kondisi | "" }
  | { variant: "operasional"; value: StatusOperasional | "" }
  | { variant: "custom"; label: string; color: string };

/**
 * Single status-pill component used across the app. The "kondisi" and
 * "operasional" variants know about the domain enums and pick the right
 * Mantine color; the "custom" variant lets the caller pass any label and
 * color (used for "Sedang Operasi: < 2.500 ekor" etc).
 */
export function StatusBadge(props: Props) {
  if (props.variant === "kondisi") {
    const v = props.value;
    if (!v) {
      return (
        <Badge color="gray" variant="light" radius="sm">
          Belum diisi
        </Badge>
      );
    }
    return (
      <Badge color={KONDISI_COLOR[v]} variant="light" radius="sm">
        {KONDISI_LABEL[v]}
      </Badge>
    );
  }
  if (props.variant === "operasional") {
    const v = props.value;
    if (!v) {
      return (
        <Badge color="gray" variant="light" radius="sm">
          Belum diisi
        </Badge>
      );
    }
    return (
      <Badge
        color={v === "operasi" ? "primary" : "gray"}
        variant="light"
        radius="sm"
      >
        {STATUS_OPERASIONAL_LABEL[v]}
      </Badge>
    );
  }
  return (
    <Badge color={props.color} variant="light" radius="sm">
      {props.label}
    </Badge>
  );
}
