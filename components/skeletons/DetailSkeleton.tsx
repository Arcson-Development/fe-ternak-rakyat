"use client";

import React from "react";
import { Card, Container, Grid, Group, Skeleton, Stack } from "@mantine/core";

/** Loading skeleton for detail pages (peternak, kandang). */
export function DetailSkeleton() {
  return (
    <Container size="xl" py="lg">
      <Stack gap="md">
        {/* Breadcrumb */}
        <Skeleton h={12} w={200} />
        {/* PageHeader */}
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap="sm">
            <Skeleton h={28} w={300} />
            <Group gap="sm">
              <Skeleton h={20} w={80} radius="xl" />
              <Skeleton h={20} w={100} radius="xl" />
              <Skeleton h={20} w={120} radius="xl" />
            </Group>
          </Stack>
          <Group gap="xs">
            <Skeleton h={36} w={120} />
            <Skeleton h={36} w={120} />
            <Skeleton h={36} w={120} />
          </Group>
        </Group>
        {/* Stat cards */}
        <Grid gutter="md">
          {[0, 1, 2, 3].map((i) => (
            <Grid.Col key={i} span={{ base: 12, xs: 6, md: 3 }}>
              <Card padding="md" radius="md" withBorder shadow="xs">
                <Stack gap="sm">
                  <Skeleton h={10} w={70} />
                  <Skeleton h={24} w={100} />
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        {/* Main content */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="md" radius="md" withBorder shadow="xs">
              <Stack gap="md">
                <Group gap="xs">
                  <Skeleton h={28} w={80} radius="md" />
                  <Skeleton h={28} w={80} radius="md" />
                  <Skeleton h={28} w={80} radius="md" />
                </Group>
                <Skeleton h={14} w="100%" />
                <Skeleton h={14} w="90%" />
                <Skeleton h={14} w="85%" />
                <Skeleton h={120} />
                <Skeleton h={14} w="75%" />
                <Skeleton h={14} w="80%" />
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="md" radius="md" withBorder shadow="xs">
              <Stack gap="sm">
                <Skeleton h={20} w={120} />
                <Skeleton h={140} />
                <Skeleton h={14} w="80%" />
                <Skeleton h={14} w="60%" />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
