"use client";

import axios from "axios";
import { DOMAIN_API } from "../../utils/contants/env";
import { api, toApiError } from "./client";
import { clearPeternakToken, ensurePeternakToken } from "../auth/peternakAuth";
import { clearAdminToken, ensureAdminToken } from "../auth/adminAuth";
import {
  DAFTAR_KEMITRAAN,
  JENIS_USAHA_DISPLAY,
  KAPASITAS_DISPLAY,
  KATEGORI_DISPLAY,
  KEMITRAAN_DISPLAY,
  KONDISI_DISPLAY,
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
//
// Endpoint contract (from Ternak Rakyat.postman_collection.json):
//   GET /wilayah/provinsi
//     → { status, error, message, data: [{ provinsi_id, name, alt_name, latitude, longitude }] }
//   GET /wilayah/kabupaten/{provinsi_id}
//     → { ..., data: [{ kabupaten_id, provinsi_id, name, alt_name, ... }] }
//   GET /wilayah/kecamatan/{kabupaten_id}
//     → { ..., data: [{ kecamatan_id, kabupaten_id, name, ... }] }
//   GET /wilayah/kelurahan/{kecamatan_id}
//     → { ..., data: [{ kelurahan_id, kecamatan_id, name, ... }] }
//
// IDs are returned per-level (provinsi_id / kabupaten_id / ...) — we
// normalize them to RegionRef `{ id, name }` so the rest of the app can
// treat all four levels uniformly.

type WilayahResponse<T> = {
  status: number;
  error: boolean;
  message: string;
  data: T[];
};

type ProvinsiItem = {
  provinsi_id: number;
  name: string;
  alt_name?: string;
  latitude?: string;
  longitude?: string;
};
type KabupatenItem = {
  kabupaten_id: number;
  provinsi_id: number;
  name: string;
  alt_name?: string;
  latitude?: string;
  longitude?: string;
};
type KecamatanItem = {
  kecamatan_id: number;
  kabupaten_id: number;
  name: string;
  alt_name?: string;
  latitude?: string;
  longitude?: string;
};
type KelurahanItem = {
  kelurahan_id: number;
  kecamatan_id: number;
  name: string;
  alt_name?: string;
  latitude?: string;
  longitude?: string;
};

function toRegionRef(item: any, idKey: string): RegionRef {
  return { id: String(item[idKey] ?? ""), name: String(item.name ?? "") };
}

export async function fetchProvinsi(): Promise<RegionRef[]> {
  const { data } = await api.get<WilayahResponse<ProvinsiItem>>(
    "/wilayah/provinsi"
  );
  return (data.data ?? []).map((p) => toRegionRef(p, "provinsi_id"));
}

export async function fetchKabupaten(provinsiId: string): Promise<RegionRef[]> {
  if (!provinsiId) return [];
  const { data } = await api.get<WilayahResponse<KabupatenItem>>(
    `/wilayah/kabupaten/${encodeURIComponent(provinsiId)}`
  );
  return (data.data ?? []).map((k) => toRegionRef(k, "kabupaten_id"));
}

export async function fetchKecamatan(kabupatenId: string): Promise<RegionRef[]> {
  if (!kabupatenId) return [];
  const { data } = await api.get<WilayahResponse<KecamatanItem>>(
    `/wilayah/kecamatan/${encodeURIComponent(kabupatenId)}`
  );
  return (data.data ?? []).map((k) => toRegionRef(k, "kecamatan_id"));
}

export async function fetchKelurahan(kecamatanId: string): Promise<RegionRef[]> {
  if (!kecamatanId) return [];
  const { data } = await api.get<WilayahResponse<KelurahanItem>>(
    `/wilayah/kelurahan/${encodeURIComponent(kecamatanId)}`
  );
  return (data.data ?? []).map((k) => toRegionRef(k, "kelurahan_id"));
}

// ---------- form browse (admin + public) ----------
//
// Backend endpoints exposed to the petenak role (same hardcoded
// token as the registration flow). The admin `/dashboard/peternak`
// list, the admin detail, the public list at `/pendaftaran/daftar`,
// and the public detail all read from the SAME backend API, so
// anything submitted through the wizard appears everywhere
// without manual refresh (a query-invalidation in the submit
// mutation does that for us).
//
// Field names mirror the backend envelope exactly (snake_case). They
// do NOT match the local `Peternak` type used by the wizard.

export type FormKandangItem = {
  id: number;
  form_peternakan_id: number;
  kategori_peternakan: string | null;
  latitude: string;
  longitude: string;
  kapasitas: string;
  dinding: string;
  dinding_foto: string;
  atap: string;
  atap_foto: string;
  lantai: string;
  lantai_foto: string;
  tmp_mkn: string;
  tmp_mkn_foto: string;
  tmp_mnm: string;
  tmp_mnm_foto: string;
  brooding: string;
  brooding_foto: string;
  kipas: string;
  kipas_foto: string;
  is_operating: boolean;
  jml_ayam: string;
  jenis_usaha: string;
  jenis_kemitraan: string;
  created_at: string;
};

export type FormItem = {
  id: number;
  nama: string;
  provinsi_id: number;
  kabupaten_id: number;
  kecamatan_id: number;
  kelurahan_id: string;
  ktp_no: string;
  ktp_foto: string;
  created_at: string;
  kategori_peternak: string;
  alamat: string;
  /**
   * Catatan tambahan dari pendaftar. Backend bisa mengembalikan
   * string kosong / undefined untuk record lama; adapter menormalkan
   * ke "" supaya UI tidak crash.
   */
  catatan?: string;
  form_peternakan_kandang: FormKandangItem[];
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
};

export type FormListMeta = {
  page: number;
  limit: number;
  total_data: number;
  total_pages: number;
};

export type FormListResponse = {
  status: number;
  error: boolean;
  message: string;
  meta: FormListMeta;
  data: FormItem[];
};

export type FormDetailResponse = {
  status: number;
  error: boolean;
  message: string;
  data: FormItem;
};

export type FormDeleteResponse = {
  status: number;
  error: boolean;
  message: string;
};

async function authedPeternakAxios() {
  const token = await ensurePeternakToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 20_000,
  };
}

export async function fetchFormList(
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<FormListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());
  const config = await authedPeternakAxios();
  const { data } = await axios.get<FormListResponse>(
    `${DOMAIN_API}/form/get-all?${params.toString()}`,
    config
  );
  return data;
}

export async function fetchFormById(id: string | number): Promise<FormItem> {
  const config = await authedPeternakAxios();
  const { data } = await axios.get<FormDetailResponse>(
    `${DOMAIN_API}/form/get-by-id/${id}`,
    config
  );
  return data.data;
}

export async function deleteForm(id: string | number): Promise<FormDeleteResponse> {
  const config = await authedPeternakAxios();
  const { data } = await axios.delete<FormDeleteResponse>(
    `${DOMAIN_API}/form/delete/${id}`,
    config
  );
  return data;
}

// ---------- form approval (admin-gated) ----------
//
// Two separate routes flip the same `is_approved` flag on a form
// record, identified by ID. Both require the admin-role bearer
// (different from the petenak token used by /form/create). The
// route name encodes the target state (`-to-1` = approve,
// `-to-2` = reject) rather than a verb, mirroring the Postman
// collection verbatim.

export type FormApproveResponse = {
  status: number;
  error: boolean;
  message: string;
};

async function authedAdminAxios() {
  const token = await ensureAdminToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 20_000,
  };
}

export async function approveForm(
  id: string | number
): Promise<FormApproveResponse> {
  try {
    const config = await authedAdminAxios();
    const { data } = await axios.put<FormApproveResponse>(
      `${DOMAIN_API}/form/is-approve-to-1/${id}`,
      undefined,
      config
    );
    return data;
  } catch (err) {
    if ((err as any)?.response?.status === 401) clearAdminToken();
    throw toApiError(err);
  }
}

export async function rejectForm(
  id: string | number
): Promise<FormApproveResponse> {
  try {
    const config = await authedAdminAxios();
    const { data } = await axios.put<FormApproveResponse>(
      `${DOMAIN_API}/form/is-approve-to-2/${id}`,
      undefined,
      config
    );
    return data;
  } catch (err) {
    if ((err as any)?.response?.status === 401) clearAdminToken();
    throw toApiError(err);
  }
}

// ---------- form export (admin-gated) ----------
//
// Backend returns the binary .xlsx directly (Content-Type:
// application/vnd.openxmlformats-...). We fetch it as a Blob and
// hand it back to the caller for a download — never try to JSON.parse
// the response body. Admin token is required because the route is
// gated by role.

export async function exportFormToExcel(
  startDate: string,
  endDate: string
): Promise<Blob> {
  try {
    const config = await authedAdminAxios();
    const response = await axios.post<Blob>(
      `${DOMAIN_API}/form-export/export-to-excel`,
      undefined,
      {
        ...config,
        params: { start_date: startDate, end_date: endDate },
        responseType: "blob",
      }
    );
    return response.data;
  } catch (err) {
    if ((err as any)?.response?.status === 401) clearAdminToken();
    throw toApiError(err);
  }
}

// ---------- farm locations (peternak-gated) ----------
//
// Returns peternak coordinates filtered by type (Ayam Petelur / Ayam Pedaging).
// Used by the dashboard map.

export type FarmLocationKandang = {
  latitude: string;
  longitude: string;
};

export type FarmLocationItem = {
  id: number;
  kategori_peternak: string;
  form_peternakan_kandang: FarmLocationKandang[];
};

export type FarmLocationResponse = {
  status: number;
  error: boolean;
  message: string;
  data: FarmLocationItem[];
};

export async function fetchFarmLocations(
  type: "Ayam Petelur" | "Ayam Pedaging"
): Promise<FarmLocationItem[]> {
  const config = await authedPeternakAxios();
  const { data } = await axios.get<FarmLocationResponse>(
    `${DOMAIN_API}/form/get-latitude-longitude`,
    {
      ...config,
      params: { type },
    }
  );
  return data.data ?? [];
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

// =============================================================================
// /form/create — multipart/form-data submission matching the Postman
// collection. Field names below mirror the body of the "Create Form"
// request in "Ternak Rakyat.postman_collection.json".
// =============================================================================

/**
 * Append a file field to FormData when the user actually attached one.
 * Skips silently when missing so the server's validation layer can
 * decide whether the field is required.
 */
function appendFile(fd: FormData, key: string, ref?: { file?: File | null }) {
  if (ref?.file) fd.append(key, ref.file, ref.file.name);
}

/**
 * Submit the wizard payload to POST /form/create. The endpoint expects:
 *   - multipart/form-data
 *   - Authorization header set to the bearer token obtained from
 *     /auth/peternak/sign-in (see lib/auth/peternakAuth.ts).
 *
 * Internal enum values (e.g. `ayam_pedaging`, `baik`) are translated to
 * the display strings the backend expects ("Ayam Pedaging", "Baik") via
 * the *_DISPLAY maps in useTernakRakyat/types.
 */
export async function submitForm(
  payload: Peternak,
  token: string
): Promise<Peternak> {
  const fd = new FormData();

  // --- identitas ---
    fd.append("nama", payload.nama ?? "");
    fd.append("provinsi_id", payload.alamat.provinsi?.id ?? "");
    fd.append("kabupaten_id", payload.alamat.kabupaten?.id ?? "");
    fd.append("kecamatan_id", payload.alamat.kecamatan?.id ?? "");
    fd.append("kelurahan_id", payload.alamat.kelurahan?.id ?? "");
    fd.append("alamat", payload.alamat.detail ?? "");
    fd.append("ktp_no", payload.noKtp ?? "");
    appendFile(fd, "ktp_foto", payload.ktp);
    fd.append("kategori_peternak", KATEGORI_DISPLAY[payload.kategori] ?? "");
    fd.append("catatan", payload.catatan ?? "");

  // --- kandang (repeatable) ---
  payload.kandang.forEach((k, i) => {
    const prefix = `kandang[${i}]`;
    fd.append(`${prefix}[latitude]`, k.lokasi.lat !== null ? String(k.lokasi.lat) : "");
    fd.append(`${prefix}[longitude]`, k.lokasi.lng !== null ? String(k.lokasi.lng) : "");
    fd.append(`${prefix}[kapasitas]`, KAPASITAS_DISPLAY[k.kapasitas] ?? "");
    fd.append(`${prefix}[dinding]`, KONDISI_DISPLAY[k.kondisi.dinding.kondisi] ?? "");
    appendFile(fd, `${prefix}[dinding_foto]`, k.kondisi.dinding.foto);
    fd.append(`${prefix}[lantai]`, KONDISI_DISPLAY[k.kondisi.lantai.kondisi] ?? "");
    appendFile(fd, `${prefix}[lantai_foto]`, k.kondisi.lantai.foto);
    fd.append(`${prefix}[atap]`, KONDISI_DISPLAY[k.kondisi.atap.kondisi] ?? "");
    appendFile(fd, `${prefix}[atap_foto]`, k.kondisi.atap.foto);
    fd.append(`${prefix}[tmp_mkn]`, KONDISI_DISPLAY[k.peralatan.tempatMakan.kondisi] ?? "");
    appendFile(fd, `${prefix}[tmp_mkn_foto]`, k.peralatan.tempatMakan.foto);
    fd.append(`${prefix}[tmp_mnm]`, KONDISI_DISPLAY[k.peralatan.tempatMinum.kondisi] ?? "");
    appendFile(fd, `${prefix}[tmp_mnm_foto]`, k.peralatan.tempatMinum.foto);
    fd.append(`${prefix}[brooding]`, KONDISI_DISPLAY[k.peralatan.brooding.kondisi] ?? "");
    appendFile(fd, `${prefix}[brooding_foto]`, k.peralatan.brooding.foto);
    fd.append(`${prefix}[kipas]`, KONDISI_DISPLAY[k.peralatan.kipas.kondisi] ?? "");
    appendFile(fd, `${prefix}[kipas_foto]`, k.peralatan.kipas.foto);
    fd.append(`${prefix}[is_operating]`, k.statusOperasional === "operasi" ? "true" : "false");
    fd.append(`${prefix}[jml_ayam]`, KAPASITAS_DISPLAY[k.jumlahAyam] ?? "");
    fd.append(`${prefix}[jenis_usaha]`, JENIS_USAHA_DISPLAY[k.jenisUsaha] ?? "");
    fd.append(`${prefix}[jenis_kemitraan]`, KEMITRAAN_DISPLAY[k.kemitraan] ?? "");
  });

  try {
    // Use a raw axios instance (NOT the shared `api` client) so that:
    //   1. The admin Bearer token from localStorage is NOT auto-attached
    //      (the petenak role uses a different token format).
    //   2. The response interceptor doesn't log the admin out when the
    //      petenak token is rejected — they're independent sessions.
    //
    // The backend's auth middleware expects the standard
    // `Authorization: Bearer <token>` shape; sending the raw JWT
    // without prefix yields "Token Wasn't Found" 401s.
    const { data } = await axios.post<{ data: Peternak }>(
      `${DOMAIN_API}/form/create`,
      fd,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60_000, // multipart with photos can be slow
      }
    );
    return data.data;
  } catch (err: any) {
    // Token rejected (401) — clear the cached petenak token so the
    // caller's next attempt re-auths instead of looping forever.
    if (err?.response?.status === 401) {
      clearPeternakToken();
    }
    throw toApiError(err);
  }
}
