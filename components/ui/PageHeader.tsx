"use client";

import React from "react";
import { Group, Stack, Text, Title } from "@mantine/core";

type Props = {
  title: string;
  description?: string;
  /** Right-aligned action area (buttons, filters, etc). */
  actions?: React.ReactNode;
  /** Optional eyebrow text shown above the title (e.g. section name). */
  eyebrow?: string;
};

/**
 * Page-level header. Use at the top of every page in the app for a
 * consistent rhythm: eyebrow (small caps), big title, optional
 * description, action group on the right.
 *
 * On small screens the actions wrap below the title; on larger screens
 * they sit to the right.
 */
export function PageHeader({ title, description, actions, eyebrow }: Props) {
  return (
    <Group
      justify="space-between"
      align="flex-start"
      wrap="wrap"
      gap="md"
      mb="lg"
    >
      <Stack gap={4} style={{ flex: "1 1 280px", minWidth: 0 }}>
        {eyebrow && (
          <Text
            tt="uppercase"
            fz="xs"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: "0.08em" }}
          >
            {eyebrow}
          </Text>
        )}
        <Title order={2} fz={{ base: 22, sm: 26 }} fw={700} lh={1.2}>
          {title}
        </Title>
        {description && (
          <Text c="dimmed" fz="sm" maw={720}>
            {description}
          </Text>
        )}
      </Stack>
      {actions && (
        <Group gap="sm" wrap="wrap" justify="flex-end" style={{ flex: "0 1 auto" }}>
          {actions}
        </Group>
      )}
    </Group>
  );
}
