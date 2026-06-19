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
import {
  createPeternak,
  fetchKabupaten,
  fetchKecamatan,
  fetchKelurahan,
  fetchProvinsi,
  submitForm,
  toApiError,
} from "../../lib/api";
import { ensurePeternakToken } from "../../lib/auth/peternakAuth";
import type { Peternak, RegionRef } from "./types";

/**
 * Public surface for the Ternak Rakyat feature.
 *
 * Region data comes from the backend (`/wilayah/...`) via React Query.
 * If the request fails (network down, 5xx, CORS, etc.) we transparently
 * fall back to the bundled dataset in `data/regions.ts` so the wizard
 * still works offline or during a backend redeploy. The first successful
 * API call also warms React Query's cache for the rest of the session.
 *
 * Submission goes through `useSubmitPeternak` below — it POSTs the
 * wizard payload to `/form/create` with the field names documented in
 * the Postman collection, then mirrors the saved record into the
 * Zustand store so the dashboard list renders without a refetch.
 */

const REGION_STALE_TIME = 60 * 60 * 1000; // 1h — regions change rarely

const USE_REAL_API = Boolean(DOMAIN_API);

// Flatten helpers — bundled data is nested (Province → Regency[] → ...)
// but the dropdowns only need { id, name }.
const toRegionRef = (p: { id: string; name: string }): RegionRef => ({
  id: p.id,
  name: p.name,
});

export function useProvinsi() {
  return useQuery<RegionRef[]>({
    queryKey: ["wilayah", "provinsi"],
    queryFn: async () => {
      try {
        return await fetchProvinsi();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          "[useProvinsi] Endpoint failed, using bundled data:",
          err
        );
        return getProvinsi().map(toRegionRef);
      }
    },
    staleTime: REGION_STALE_TIME,
  });
}

export function useKabupaten(provinsiId: string | null) {
  return useQuery<RegionRef[]>({
    queryKey: ["wilayah", "kabupaten", provinsiId],
    queryFn: async () => {
      if (!provinsiId) return [];
      try {
        return await fetchKabupaten(provinsiId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[useKabupaten] Endpoint failed for ${provinsiId}, using bundled data:`,
          err
        );
        return getKabupaten(provinsiId).map(toRegionRef);
      }
    },
    enabled: !!provinsiId,
    staleTime: REGION_STALE_TIME,
  });
}

export function useKecamatan(
  provinsiId: string | null,
  kabupatenId: string | null
) {
  return useQuery<RegionRef[]>({
    queryKey: ["wilayah", "kecamatan", provinsiId, kabupatenId],
    queryFn: async () => {
      if (!kabupatenId) return [];
      try {
        return await fetchKecamatan(kabupatenId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[useKecamatan] Endpoint failed for ${kabupatenId}, using bundled data:`,
          err
        );
        return getKecamatan(provinsiId, kabupatenId).map(toRegionRef);
      }
    },
    enabled: !!kabupatenId,
    staleTime: REGION_STALE_TIME,
  });
}

export function useKelurahan(
  provinsiId: string | null,
  kabupatenId: string | null,
  kecamatanId: string | null
) {
  return useQuery<RegionRef[]>({
    queryKey: ["wilayah", "kelurahan", provinsiId, kabupatenId, kecamatanId],
    queryFn: async () => {
      if (!kecamatanId) return [];
      try {
        return await fetchKelurahan(kecamatanId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[useKelurahan] Endpoint failed for ${kecamatanId}, using bundled data:`,
          err
        );
        return getKelurahan(provinsiId, kabupatenId, kecamatanId).map(
          toRegionRef
        );
      }
    },
    enabled: !!kecamatanId,
    staleTime: REGION_STALE_TIME,
  });
}

/**
 * Submission hook for the registration wizard.
 *
 * Flow:
 *   1. Resolve a bearer token (cached or freshly obtained from
 *      /auth/peternak/sign-in via hardcodedPeternakLogin).
 *   2. POST the payload to /form/create as multipart/form-data with the
 *      field names documented in the Postman collection.
 *   3. Mirror the saved record into the local Zustand store so the
 *      dashboard list / detail screens can render the entry without
 *      an extra round-trip.
 *
 * The legacy /peternak endpoint and the in-memory mock are kept as a
 * fallback when no API is configured (NEXT_PUBLIC_DOMAIN_API is empty).
 */
export function useSubmitPeternak() {
  const add = useTernakStore((s) => s.add);
  return useMutation({
    mutationFn: async (data: Peternak): Promise<Peternak> => {
      if (USE_REAL_API) {
        try {
          const token = await ensurePeternakToken();
          const saved = await submitForm(data, token);
          add(saved);
          return saved;
        } catch (err) {
          const e = toApiError(err);
          throw new Error(e.message);
        }
      }

      // Legacy /peternak endpoint (kept for backwards compatibility)
      try {
        const saved = await createPeternak({
          nama: data.nama,
          noKtp: data.noKtp,
          ktp: data.ktp,
          alamat: data.alamat,
          kategori: data.kategori,
          kandang: data.kandang,
        });
        add(saved);
        return saved;
      } catch (err) {
        const e = toApiError(err);
        throw new Error(e.message);
      }
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
