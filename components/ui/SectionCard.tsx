"use client";

import React from "react";
import { Card, Group, Stack, Text } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import { ThemeIcon } from "@mantine/core";

type Props = {
  title: string;
  description?: string;
  icon?: Icon;
  iconColor?: string;
  children: React.ReactNode;
  /** Right-aligned actions (e.g. "Hapus Kandang" button). */
  actions?: React.ReactNode;
};

/**
 * Reusable container that groups related fields inside a step. Provides
 * a consistent header (icon, title, description) and a clean card
 * background. Use one per logical group in the wizard.
 */
export function SectionCard({
  title,
  description,
  icon: IconComp,
  iconColor = "primary",
  children,
  actions,
}: Props) {
  return (
    <Card padding="lg" radius="md" withBorder shadow="xs">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
            {IconComp && (
              <ThemeIcon
                size={36}
                radius="md"
                variant="light"
                color={iconColor}
                style={{ flexShrink: 0 }}
              >
                <IconComp size={20} stroke={1.6} />
              </ThemeIcon>
            )}
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Text fz="md" fw={700} lh={1.25}>
                {title}
              </Text>
              {description && (
                <Text fz="xs" c="dimmed" lh={1.4}>
                  {description}
                </Text>
              )}
            </Stack>
          </Group>
          {actions}
        </Group>
        {children}
      </Stack>
    </Card>
  );
}
