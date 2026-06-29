"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getKabupaten,
  getKecamatan,
  getKelurahan,
  getProvinsi,
} from "./data/regions";
import { useTernakStore } from "./store/ternakStore";
import { DOMAIN_API } from "../../utils/contants/env";
import {
  approveForm,
  createPeternak,
  deleteForm,
  exportFormToExcel,
  fetchFormById,
  fetchFormList,
  fetchFarmLocations,
  fetchKabupaten,
  fetchKecamatan,
  fetchKelurahan,
  fetchProvinsi,
  rejectForm,
  submitForm,
  toApiError,
  type FormItem,
  type FormListResponse,
} from "../../lib/api";
import { ensurePeternakToken } from "../../lib/auth/peternakAuth";
import type { Peternak, RegionRef } from "./types";

/** Centralised query key for the form list so any mutation that
 *  affects it can invalidate consistently. */
export const formListQueryKey = ["form", "list"] as const;

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Peternak): Promise<Peternak> => {
      if (USE_REAL_API) {
        try {
          const token = await ensurePeternakToken();
          const saved = await submitForm(data, token);
          // The backend confirms a 201 with a thin envelope —
          //   { status: 201, error: false, message: "Form created successfully" }
          // — and does NOT echo the created record. If we tried to
          // read data.data we'd get undefined. Synthesize a "saved"
          // entry from the local payload so the dashboard can show
          // the new row immediately without a follow-up GET, and
          // prefer the backend's record if it ever decides to echo
          // one (future enhancement).
          const finalSaved: Peternak = saved?.id
            ? saved
            : {
                ...data,
                id:
                  data.id ||
                  `pt-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                createdAt: data.createdAt || new Date().toISOString(),
              };
          add(finalSaved);
          // Refresh the backend-backed list (admin + public) so the
          // new submission appears without a manual page reload.
          queryClient.invalidateQueries({ queryKey: formListQueryKey });
          return finalSaved;
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
                catatan: data.catatan ?? "",
                kandang: data.kandang,
              });
        if (!saved || !saved.id) {
          throw new Error(
            "Respons server tidak berisi data peternak yang valid."
          );
        }
        add(saved);
        return saved;
      } catch (err) {
        const e = toApiError(err);
        throw new Error(e.message);
      }
    },
  });
}

/**
 * Returns the list of all registered Peternak, with any undefined /
 * invalid entries filtered out as a safety net. Defensive because the
 * dashboard's command palette (`SpotlightProvider`) and many list pages
 * call `.id` on each item, and a stray `undefined` would crash the
 * whole layout (one bad `add()` in the store breaks every page).
 *
 * Hydration safety: returns `[]` until the component is mounted on
 * the client. The underlying Zustand store is wrapped in a `persist`
 * middleware that synchronously reads localStorage on first import
 * — that means SSR sees the store defaults (empty), but the very
 * first CSR render can already see populated data, which causes
 * React #418/#423 mismatches in any consumer (notably the
 * Spotlight command palette in the root layout). The mounted gate
 * ensures SSR and the first CSR render both see `[]`, then the
 * real data lands in a follow-up render after `useEffect` fires.
 *
 * The filter is memoised on the raw store reference so consumers that
 * compare the result with `===` (React, useEffect deps) don't see a
 * "new" array on every render.
 */
export function usePeternakList(): Peternak[] {
  const list = useTernakStore((s) => s.peternak);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return useMemo(
    () =>
      hydrated
        ? list.filter((p): p is Peternak => Boolean(p && p.id))
        : [],
    [list, hydrated]
  );
}

/**
 * Hooks for the backend-driven form list. Used by:
 *   - `/dashboard/peternak` (admin list)
 *   - `/pendaftaran/daftar` (public list)
 *
 * Both pages authenticate with the same petenak token used by
 * /form/create, so no admin session is required. The list cache is
 * 30s; `placeholderData: keepPreviousData` keeps the table stable
 * during pagination so it doesn't flash empty.
 */
export function useFormList(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  return useQuery<FormListResponse>({
    queryKey: [...formListQueryKey, page, limit, search],
    queryFn: () => fetchFormList(page, limit, search),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useFormById(id: string | number | undefined) {
  return useQuery<FormItem>({
    queryKey: ["form", "detail", id],
    queryFn: () => fetchFormById(id as string | number),
    enabled: id !== undefined && id !== null && `${id}`.length > 0,
    staleTime: 60 * 1000,
  });
}

/**
 * Delete mutation. Invalidates the form list cache on success so any
 * open list view (admin or public) refetches without the deleted row.
 */
export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formListQueryKey });
    },
  });
}

// ---------- farm locations ----------

export function useFarmLocations(type: "Ayam Petelur" | "Ayam Pedaging") {
  return useQuery({
    queryKey: ["form", "locations", type],
    queryFn: () => fetchFarmLocations(type),
    staleTime: 60 * 1000,
  });
}

/** Lets the UI show which mode we're in (good for the Settings page). */
export const isMockMode = !USE_REAL_API;

export * from "./types";
export { useTernakStore } from "./store/ternakStore";
export { formItemToPeternak } from "./adapter";
export type { FormItem, FormListResponse } from "../../lib/api";
export { approveForm, rejectForm, exportFormToExcel } from "../../lib/api";
export { fetchFarmLocations } from "../../lib/api";
