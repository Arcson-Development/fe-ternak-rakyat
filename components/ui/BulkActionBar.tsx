"use client";

import React from "react";
import { ActionIcon, Button, Group, Text, Transition } from "@mantine/core";
import { IconCheckbox, IconTrash, IconX, IconFileExport } from "@tabler/icons-react";

type Action = {
  label: string;
  icon: React.ReactNode;
  color?: string;
  variant?: "filled" | "light" | "subtle" | "default";
  onClick: () => void;
};

type Props = {
  /** Number of selected rows. Component hides itself when 0. */
  count: number;
  /** Total rows visible. Shown as "{count} dari {total} dipilih" when > 0 */
  total?: number;
  /** Clear all selections. */
  onClear: () => void;
  /** Optional bulk actions. First action is treated as primary. */
  actions?: Action[];
  /** Optional extra label like "peternak" / "kandang" for context. */
  noun?: string;
};

/**
 * Floating bar that appears at the top of a list when the user has
 * selected one or more rows. Shows count, a clear button, and any
 * bulk actions. Designed to feel like Gmail / Linear selection bar.
 */
export function BulkActionBar({
  count,
  total,
  onClear,
  actions = [],
  noun = "item",
}: Props) {
  if (count === 0) return null;
  return (
    <Transition mounted transition="slide-down" duration={200}>
      {(styles) => (
        <Group
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="sm"
          p="sm"
          style={{
            ...styles,
            background: "var(--app-primary-soft)",
            border: "1px solid var(--app-primary)",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Group gap="sm" wrap="nowrap">
            <ActionIcon
              variant="filled"
              color="primary"
              size="md"
              radius="md"
              aria-label="Dipilih"
            >
              <IconCheckbox size={14} />
            </ActionIcon>
            <Text fz="sm" fw={600}>
              {count}
              {total !== undefined && total !== count ? ` dari ${total}` : ""} {noun} dipilih
            </Text>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onClear}
              aria-label="Bersihkan pilihan"
            >
              <IconX size={14} />
            </ActionIcon>
          </Group>
          <Group gap="xs">
            {actions.map((a, i) => (
              <Button
                key={i}
                size="xs"
                variant={a.variant ?? "light"}
                color={a.color}
                leftSection={a.icon}
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            ))}
          </Group>
        </Group>
      )}
    </Transition>
  );
}

/** Pre-built bulk action sets for common patterns. */
export const BulkActions = {
  delete: (onClick: () => void): Action => ({
    label: "Hapus",
    icon: <IconTrash size={14} />,
    color: "red",
    variant: "light",
    onClick,
  }),
  exportExcel: (onClick: () => void): Action => ({
    label: "Ekspor Excel",
    icon: <IconFileExport size={14} />,
    color: "primary",
    variant: "light",
    onClick,
  }),
};
