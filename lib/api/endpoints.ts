"use client";

import { api, toApiError } from "./client";
import {
  DAFTAR_KEMITRAAN,
  type Peternak,
  type RegionRef,
} from "../../hooks/useTernakRakyat";

/**
 * Endpoint functions for the backend (when ready). Each function:
 *   - Returns a typed payload
 *   - Throws an ApiError-friendly rejected value
 *   - Is safe to call from React Query mutations/queries
 *
 * Until NEXT_PUBLIC_DOMAIN_API is set, calling these will simply fail
 * with a network error — components should still fall back to the
 * hardcoded data in `hooks/useTernakRakyat/data/regions.ts`.
 */

// ---------- region ----------

export async function fetchProvinsi(): Promise<RegionRef[]> {
  const { data } = await api.get<{ data: RegionRef[] }>("/region/provinsi");
  return data.data;
}

export async function fetchKabupaten(provinsiId: string): Promise<RegionRef[]> {
  const { data } = await api.get<{ data: RegionRef[] }>(
    `/region/kabupaten?provinsiId=${provinsiId}`
  );
  return data.data;
}

export async function fetchKecamatan(
  provinsiId: string,
  kabupatenId: string
): Promise<RegionRef[]> {
  const { data } = await api.get<{ data: RegionRef[] }>(
    `/region/kecamatan?provinsiId=${provinsiId}&kabupatenId=${kabupatenId}`
  );
  return data.data;
}

export async function fetchKelurahan(
  provinsiId: string,
  kabupatenId: string,
  kecamatanId: string
): Promise<RegionRef[]> {
  const { data } = await api.get<{ data: RegionRef[] }>(
    `/region/kelurahan?provinsiId=${provinsiId}&kabupatenId=${kabupatenId}&kecamatanId=${kecamatanId}`
  );
  return data.data;
}

// ---------- master data ----------

export async function fetchKemitraan(): Promise<readonly string[]> {
  const { data } = await api.get<{ data: string[] }>("/master/kemitraan");
  return data.data ?? DAFTAR_KEMITRAAN;
}

// ---------- peternak ----------

export type CreatePeternakPayload = Omit<Peternak, "id" | "createdAt">;

export async function createPeternak(payload: CreatePeternakPayload): Promise<Peternak> {
  try {
    const { data } = await api.post<{ data: Peternak }>("/peternak", payload);
    return data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function fetchPeternakList(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: Peternak[]; total: number }> {
  const { data } = await api.get<{ data: Peternak[]; total: number }>("/peternak", {
    params,
  });
  return { items: data.data, total: data.total };
}

export async function fetchPeternakById(id: string): Promise<Peternak | null> {
  try {
    const { data } = await api.get<{ data: Peternak }>(`/peternak/${id}`);
    return data.data;
  } catch (err) {
    const e = toApiError(err);
    if (e.status === 404) return null;
    throw e;
  }
}

export async function deletePeternak(id: string): Promise<void> {
  await api.delete(`/peternak/${id}`);
}
