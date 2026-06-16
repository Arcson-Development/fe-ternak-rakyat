"use client";

import React from "react";
import { Card, Container, Grid, Group, Skeleton, Stack } from "@mantine/core";

/** Loading skeleton for the dashboard page. */
export function DashboardSkeleton() {
  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <Skeleton h={36} w={240} />
        <Skeleton h={16} w={320} />
        {/* Stat cards */}
        <Grid gutter="md">
          {[0, 1, 2, 3].map((i) => (
            <Grid.Col key={i} span={{ base: 12, xs: 6, md: 3 }}>
              <Card padding="md" radius="md" withBorder shadow="xs">
                <Stack gap="sm">
                  <Skeleton h={10} w={80} />
                  <Skeleton h={28} w={120} />
                  <Skeleton h={10} w={100} />
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        {/* Charts */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card padding="md" radius="md" withBorder shadow="xs">
              <Stack gap="md">
                <Skeleton h={20} w={180} />
                <Skeleton h={240} />
              </Stack>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card padding="md" radius="md" withBorder shadow="xs">
              <Stack gap="md">
                <Skeleton h={20} w={140} />
                <Skeleton circle h={180} />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
        <Card padding="md" radius="md" withBorder shadow="xs">
          <Stack gap="sm">
            <Skeleton h={20} w={200} />
            <Skeleton h={180} />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
