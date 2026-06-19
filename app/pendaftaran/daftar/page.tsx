"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Pagination,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconChevronRight,
  IconHome,
  IconRefresh,
  IconSearch,
  IconUserPlus,
} from "@tabler/icons-react";
import { useFormList, type FormItem } from "../../../hooks/useTernakRakyat";

/**
 * Public list of every submitted registration. Reads from
 * `/form/get-all?page=&limit=&search=` using the same petenak token
 * the wizard uses for `/form/create`, so anyone can browse without
 * being logged in as an admin.
 *
 * Click a row to drill into the detail page at
 * `/pendaftaran/daftar/[id]`.
 */
export default function DaftarPendaftaranPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const { data, isLoading, isFetching, isError, error, refetch } = useFormList(
    page,
    limit,
    debouncedSearch
  );

  const totalPages = data?.meta?.total_pages ?? 1;
  const total = data?.meta?.total_data ?? 0;
  const items = data?.data ?? [];

  const handleSearch = (val: string) => {
    setSearchInput(val);
    setPage(1); // any search resets to first page
  };

  return (
    <Box className="pendaftaran-shell">
      {/* Sticky top bar — same shell class as the wizard for visual
          consistency. Stays at top while user scrolls the list. */}
      <Box className="pendaftaran-topbar">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              onClick={() => router.push("/")}
              aria-label="Beranda"
            >
              <IconHome size={18} />
            </ActionIcon>
            <Text fw={700} fz="md">
              SITERNAK — Daftar Pendaftaran
            </Text>
            {isFetching && !isLoading && (
              <Loader size="xs" color="primary" />
            )}
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button
              variant="filled"
              size="xs"
              leftSection={<IconUserPlus size={14} />}
              onClick={() => router.push("/pendaftaran")}
            >
              Pendaftaran Baru
            </Button>
          </Group>
        </Group>
      </Box>

      <Container size="lg" py="md">
        <Stack gap="md">
          {/* Search + meta */}
          <Group justify="space-between" align="center" wrap="wrap">
            <TextInput
              placeholder="Cari nama, No. KTP, kabupaten..."
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={(e) => handleSearch(e.currentTarget.value)}
              w={{ base: "100%", sm: 380 }}
              rightSection={
                isFetching ? <Loader size="xs" /> : null
              }
            />
            <Text fz="sm" c="dimmed">
              {isLoading
                ? "Memuat..."
                : total > 0
                ? `Menampilkan ${(page - 1) * limit + 1}–${Math.min(
                    page * limit,
                    total
                  )} dari ${total} pendaftaran`
                : "Belum ada pendaftaran"}
            </Text>
          </Group>

          {/* Error */}
          {isError && (
            <Card
              withBorder
              padding="md"
              radius="md"
              style={{ borderColor: "var(--mantine-color-red-3)" }}
            >
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <IconAlertCircle color="var(--mantine-color-red-6)" />
                  <Stack gap={0}>
                    <Text fw={600} fz="sm" c="red.7">
                      Gagal memuat daftar
                    </Text>
                    <Text fz="xs" c="dimmed">
                      {(error as Error)?.message || "Periksa koneksi Anda"}
                    </Text>
                  </Stack>
                </Group>
                <Button
                  variant="light"
                  color="red"
                  size="xs"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => refetch()}
                >
                  Coba lagi
                </Button>
              </Group>
            </Card>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <Card withBorder padding={0} radius="md">
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nama</Table.Th>
                    <Table.Th>No. KTP</Table.Th>
                    <Table.Th>Kategori</Table.Th>
                    <Table.Th>Wilayah</Table.Th>
                    <Table.Th>Kandang</Table.Th>
                    <Table.Th>Tanggal</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td><Skeleton h={14} w="60%" /></Table.Td>
                      <Table.Td><Skeleton h={14} w="70%" /></Table.Td>
                      <Table.Td><Skeleton h={20} w={80} radius="sm" /></Table.Td>
                      <Table.Td><Skeleton h={14} w="55%" /></Table.Td>
                      <Table.Td><Skeleton h={14} w={20} /></Table.Td>
                      <Table.Td><Skeleton h={14} w="55%" /></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          )}

          {/* Empty state */}
          {!isLoading && !isError && items.length === 0 && (
            <Card
              withBorder
              padding="xl"
              radius="md"
              style={{ textAlign: "center" }}
            >
              <Stack align="center" gap="sm">
                <IconSearch size={32} color="var(--app-text-subtle)" />
                <Text fw={600}>Tidak ada data</Text>
                <Text fz="sm" c="dimmed">
                  {debouncedSearch
                    ? `Pencarian "${debouncedSearch}" tidak menemukan hasil.`
                    : "Belum ada pendaftaran yang tercatat."}
                </Text>
                {debouncedSearch && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => handleSearch("")}
                  >
                    Reset pencarian
                  </Button>
                )}
              </Stack>
            </Card>
          )}

          {/* Data table */}
          {!isLoading && items.length > 0 && (
            <Card withBorder padding={0} radius="md">
              <Table
                verticalSpacing="sm"
                highlightOnHover
                striped={false}
                stickyHeader
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 50 }}>#</Table.Th>
                    <Table.Th>Nama</Table.Th>
                    <Table.Th>No. KTP</Table.Th>
                    <Table.Th>Kategori</Table.Th>
                    <Table.Th>Wilayah</Table.Th>
                    <Table.Th style={{ width: 80 }}>Kandang</Table.Th>
                    <Table.Th>Tanggal</Table.Th>
                    <Table.Th style={{ width: 40 }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item: FormItem, idx: number) => (
                    <Table.Tr
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        router.push(`/pendaftaran/daftar/${item.id}`)
                      }
                    >
                      <Table.Td>
                        <Text fz="xs" c="dimmed" ff="monospace">
                          {(page - 1) * limit + idx + 1}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text fw={500} fz="sm">
                            {item.nama}
                          </Text>
                          <Text fz="xs" c="dimmed">
                            ID: {item.id}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text ff="monospace" fz="sm">
                          {item.ktp_no}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="primary" size="sm">
                          {item.kategori_peternak}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm">
                          {item.kabupaten}, {item.provinsi}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="default" size="sm">
                          {item.form_peternakan_kandang.length}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="xs" c="dimmed">
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label="Lihat detail" withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            size="sm"
                          >
                            <IconChevronRight size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <Center>
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                color="primary"
                radius="md"
                withEdges
              />
            </Center>
          )}

          {/* Back to home hint at bottom */}
          {!isLoading && (
            <Group justify="center" mt="md">
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconArrowLeft size={14} />}
                onClick={() => router.push("/")}
              >
                Kembali ke Beranda
              </Button>
            </Group>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
