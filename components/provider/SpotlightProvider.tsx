"use client";

import React, { useEffect, useMemo } from "react";
import { Spotlight, spotlight } from "@mantine/spotlight";
import { useRouter } from "next/navigation";
import {
  IconDashboard,
  IconUserPlus,
  IconUsers,
  IconReportAnalytics,
  IconSettings,
  IconHelp,
  IconLogout,
  IconHome,
  IconSearch,
  IconLogin,
  IconPrinter,
} from "@tabler/icons-react";
import { usePeternakList } from "../../hooks/useTernakRakyat";
import { logout } from "../../lib/auth";

/**
 * Global command palette. Opens with Ctrl/Cmd+K, "/" on any input,
 * or by clicking the search button in the header. Provides:
 *   - Quick navigation between every page
 *   - Direct search across all registered farmers
 *   - One-click actions: print, settings, logout
 */
export function GlobalSpotlight() {
  const router = useRouter();
  const list = usePeternakList();

  // Farmer-level search items (only the first ~10 to keep it light)
  const farmerActions = useMemo(
    () =>
      list.slice(0, 10).map((p) => ({
        id: `farmer-${p.id}`,
        label: p.nama,
        description: `${p.alamat.kabupaten?.name ?? "—"}, ${p.alamat.provinsi?.name ?? "—"}`,
        leftSection: <IconUsers size={18} />,
        onClick: () => router.push(`/dashboard/peternak/${p.id}`),
      })),
    [list, router]
  );

  const navActions = [
    {
      group: "Navigasi",
      actions: [
        { id: "go-home", label: "Beranda", description: "Halaman utama", leftSection: <IconHome size={18} />, onClick: () => router.push("/") },
        { id: "go-dashboard", label: "Dashboard", description: "Ringkasan operasional", leftSection: <IconDashboard size={18} />, onClick: () => router.push("/dashboard") },
        { id: "go-pendaftaran", label: "Pendaftaran Baru", description: "Tambah peternak", leftSection: <IconUserPlus size={18} />, onClick: () => router.push("/pendaftaran") },
        { id: "go-peternak", label: "Daftar Peternak", description: "Lihat semua", leftSection: <IconUsers size={18} />, onClick: () => router.push("/dashboard/peternak") },
        { id: "go-laporan", label: "Laporan", description: "Rekap & ekspor", leftSection: <IconReportAnalytics size={18} />, onClick: () => router.push("/dashboard/laporan") },
      ],
    },
    {
      group: "Akun",
      actions: [
        { id: "go-pengaturan", label: "Pengaturan", description: "Profil, tema, data", leftSection: <IconSettings size={18} />, onClick: () => router.push("/dashboard/pengaturan") },
        { id: "go-bantuan", label: "Pusat Bantuan", description: "FAQ & dukungan", leftSection: <IconHelp size={18} />, onClick: () => router.push("/dashboard/bantuan") },
        { id: "act-logout", label: "Keluar", description: "Logout dari akun", leftSection: <IconLogout size={18} />, onClick: () => logout() },
      ],
    },
  ];

  if (farmerActions.length > 0) {
    navActions.splice(1, 0, {
      group: "Peternak",
      actions: farmerActions,
    });
  }

  return (
    <Spotlight
      actions={navActions}
      shortcut={["mod + K", "mod + P", "/"]}
      nothingFound={
        <div style={{ padding: 16, textAlign: "center", color: "var(--app-text-subtle)", fontSize: 13 }}>
          Tidak ada hasil untuk pencarian ini
        </div>
      }
      searchProps={{
        leftSection: <IconSearch size={18} />,
        placeholder: "Cari halaman, peternak, atau aksi...",
      }}
      highlightQuery
      scrollable
      maxHeight={420}
    />
  );
}
