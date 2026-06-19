"use client";

import React, { useMemo, useState } from "react";
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
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconChevronRight,
  IconHome,
  IconSearch,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePeternakList, type Peternak } from "../../../hooks/useTernakRakyat";
import { KATEGORI_LABEL } from "../../../hooks/useTernakRakyat";

/**
 * Public list of every submitted registration that lives in the
 * local Zustand store. Reads through `usePeternakList()` — the SAME
 * data source the admin's `/dashboard/peternak` page uses — so
 * visitors who just submitted see their row, and any submissions
 * persisted to localStorage from a previous visit reappear here.
 *
 * Click a row to drill into the detail page at
 * `/pendaftaran/daftar/[id]`.
 */
export default function DaftarPendaftaranPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // The store is persisted via zustand/middleware, so it hydrates
  // synchronously on the client. We set `hydrated` to true on first
  // render so the skeleton shows until the persisted state loads.
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const list = usePeternakList();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      return (
        p.nama.toLowerCase().includes(q) ||
        p.noKtp.toLowerCase().includes(q) ||
        p.alamat.provinsi?.name?.toLowerCase().includes(q) ||
        p.alamat.kabupaten?.name?.toLowerCase().includes(q) ||
        p.alamat.kecamatan?.name?.toLowerCase().includes(q) ||
        p.alamat.kelurahan?.name?.toLowerCase().includes(q) ||
        p.alamat.detail.toLowerCase().includes(q)
      );
    });
  }, [list, search]);

  return (
    <Box className="pendaftaran-shell">
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
              placeholder="Cari nama, No. KTP, atau alamat..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={{ base: "100%", sm: 380 }}
            />
            <Text fz="sm" c="dimmed">
              {!hydrated
                ? "Memuat..."
                : filtered.length > 0
                ? `Menampilkan ${filtered.length} dari ${list.length} pendaftaran`
                : "Belum ada pendaftaran"}
            </Text>
          </Group>

          {/* Loading skeleton (only first render) */}
          {!hydrated && (
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
                  {Array.from({ length: 3 }).map((_, i) => (
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
          {hydrated && list.length === 0 && (
            <Card
              withBorder
              padding="xl"
              radius="md"
              style={{ textAlign: "center" }}
            >
              <Stack align="center" gap="sm">
                <IconSearch size={32} color="var(--app-text-subtle)" />
                <Text fw={600}>Belum ada pendaftaran</Text>
                <Text fz="sm" c="dimmed">
                  Data pendaftaran yang baru Anda submit akan tampil di sini.
                </Text>
                <Button
                  variant="filled"
                  size="sm"
                  leftSection={<IconUserPlus size={14} />}
                  onClick={() => router.push("/pendaftaran")}
                  mt="xs"
                >
                  Daftar sekarang
                </Button>
              </Stack>
            </Card>
          )}

          {/* No search results */}
          {hydrated && list.length > 0 && filtered.length === 0 && (
            <Card
              withBorder
              padding="xl"
              radius="md"
              style={{ textAlign: "center" }}
            >
              <Stack align="center" gap="sm">
                <IconSearch size={32} color="var(--app-text-subtle)" />
                <Text fw={600}>Tidak ada hasil</Text>
                <Text fz="sm" c="dimmed">
                  Pencarian "{search}" tidak menemukan hasil.
                </Text>
                <Button variant="subtle" size="xs" onClick={() => setSearch("")}>
                  Reset pencarian
                </Button>
              </Stack>
            </Card>
          )}

          {/* Data table */}
          {hydrated && filtered.length > 0 && (
            <Card withBorder padding={0} radius="md">
              <Table verticalSpacing="sm" highlightOnHover stickyHeader>
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
                  {filtered.map((item: Peternak, idx: number) => (
                    <Table.Tr
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        router.push(`/pendaftaran/daftar/${item.id}`)
                      }
                    >
                      <Table.Td>
                        <Text fz="xs" c="dimmed" ff="monospace">
                          {idx + 1}
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
                          {item.noKtp}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="primary" size="sm">
                          {KATEGORI_LABEL[item.kategori] || "—"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm">
                          {item.alamat.kabupaten?.name
                            ? `${item.alamat.kabupaten.name}, ${item.alamat.provinsi?.name ?? ""}`
                            : "—"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="default" size="sm">
                          {item.kandang.length}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="xs" c="dimmed">
                          {new Date(item.createdAt).toLocaleDateString(
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

          {/* Back to home hint */}
          {hydrated && (
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
