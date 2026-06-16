"use client";

import React from "react";
import { Card, Stack, Text, ThemeIcon } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";

type Props = {
  icon?: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: IconComp, title, description, action }: Props) {
  return (
    <Card padding="xl" radius="md" withBorder>
      <Stack align="center" gap="sm" py="md">
        {IconComp && (
          <ThemeIcon size={56} radius="xl" variant="light" color="primary">
            <IconComp size={28} stroke={1.5} />
          </ThemeIcon>
        )}
        <Text fw={600} fz="md" ta="center">
          {title}
        </Text>
        {description && (
          <Text c="dimmed" fz="sm" ta="center" maw={420}>
            {description}
          </Text>
        )}
        {action && <div>{action}</div>}
      </Stack>
    </Card>
  );
}
