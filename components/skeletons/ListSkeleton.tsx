"use client";

import React from "react";
import { Card, Container, Group, Skeleton, Stack, Table } from "@mantine/core";

/** Loading skeleton for table-style list pages. */
export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <Container size="xl" py="lg">
      <Stack gap="md">
        <Skeleton h={36} w={260} />
        <Skeleton h={16} w={340} />
        <Group gap="sm" wrap="wrap">
          <Skeleton h={36} w={260} />
          <Skeleton h={36} w={140} />
          <Skeleton h={36} w={120} />
        </Group>
        <Card padding={0} radius="md" withBorder shadow="xs">
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                {[60, 180, 120, 140, 100, 80].map((w, i) => (
                  <Table.Th key={i}>
                    <Skeleton h={10} w={w} />
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <Table.Tr key={i}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Skeleton circle h={32} />
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Skeleton h={12} w="60%" />
                        <Skeleton h={8} w="40%" />
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td><Skeleton h={10} w="70%" /></Table.Td>
                  <Table.Td><Skeleton h={20} w={80} radius="xl" /></Table.Td>
                  <Table.Td><Skeleton h={10} w="80%" /></Table.Td>
                  <Table.Td><Skeleton h={10} w="40%" /></Table.Td>
                  <Table.Td><Skeleton h={10} w="60%" /></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>
    </Container>
  );
}
