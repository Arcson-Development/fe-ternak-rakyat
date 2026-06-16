"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getKabupaten,
  getKecamatan,
  getKelurahan,
  getProvinsi,
} from "./data/regions";
import { useTernakStore } from "./store/ternakStore";
import { DOMAIN_API } from "../../utils/contants/env";
import { createPeternak, toApiError } from "../../lib/api";
import type { Peternak } from "./types";

/**
 * Public surface for the Ternak Rakyat feature. Mirrors the pattern of
 * the old useRegion/useRegister hooks from the template, but tailored
 * for the livestock domain.
 *
 * Region queries use `useQuery` so the form gets loading/error states for
 * free; the underlying data is static so we can also expose sync
 * helpers. The submission mutation writes to the in-memory + persisted
 * Zustand store when no API is configured, or POSTs to the real backend
 * when NEXT_PUBLIC_DOMAIN_API is set.
 */

const REGION_STALE_TIME = 60 * 60 * 1000; // 1h - regions never change in a session

const USE_REAL_API = Boolean(DOMAIN_API);

export function useProvinsi() {
  return useQuery({
    queryKey: ["region", "provinsi"],
    queryFn: () => Promise.resolve(getProvinsi()),
    staleTime: REGION_STALE_TIME,
  });
}

export function useKabupaten(provinsiId: string | null) {
  return useQuery({
    queryKey: ["region", "kabupaten", provinsiId],
    queryFn: () => Promise.resolve(getKabupaten(provinsiId)),
    enabled: !!provinsiId,
    staleTime: REGION_STALE_TIME,
  });
}

export function useKecamatan(
  provinsiId: string | null,
  kabupatenId: string | null
) {
  return useQuery({
    queryKey: ["region", "kecamatan", provinsiId, kabupatenId],
    queryFn: () => Promise.resolve(getKecamatan(provinsiId, kabupatenId)),
    enabled: !!kabupatenId,
    staleTime: REGION_STALE_TIME,
  });
}

export function useKelurahan(
  provinsiId: string | null,
  kabupatenId: string | null,
  kecamatanId: string | null
) {
  return useQuery({
    queryKey: ["region", "kelurahan", provinsiId, kabupatenId, kecamatanId],
    queryFn: () =>
      Promise.resolve(getKelurahan(provinsiId, kabupatenId, kecamatanId)),
    enabled: !!kecamatanId,
    staleTime: REGION_STALE_TIME,
  });
}

/**
 * Submission hook with feature-flag routing.
 *
 *   - When NEXT_PUBLIC_DOMAIN_API is set → POST to /peternak
 *   - Otherwise → persist to local Zustand store (mock mode)
 *
 * Both branches return the saved record so the wizard can navigate to a
 * confirmation page or print detail.
 */
export function useSubmitPeternak() {
  const add = useTernakStore((s) => s.add);
  return useMutation({
    mutationFn: async (data: Peternak): Promise<Peternak> => {
      if (USE_REAL_API) {
        try {
          const saved = await createPeternak({
            nama: data.nama,
            noKtp: data.noKtp,
            ktp: data.ktp,
            alamat: data.alamat,
            kategori: data.kategori,
            kandang: data.kandang,
          });
          // Mirror to local store so the dashboard works offline
          add(saved);
          return saved;
        } catch (err) {
          const e = toApiError(err);
          throw new Error(e.message);
        }
      }
      // Mock path
      await new Promise((r) => setTimeout(r, 700));
      const stored: Peternak = {
        ...data,
        id: data.id || `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      add(stored);
      return stored;
    },
  });
}

export function usePeternakList() {
  return useTernakStore((s) => s.peternak);
}

/** Lets the UI show which mode we're in (good for the Settings page). */
export const isMockMode = !USE_REAL_API;

export * from "./types";
export { useTernakStore } from "./store/ternakStore";
