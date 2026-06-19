/**
 * Adapters that translate the BACKEND's snake_case FormItem envelope
 * into the LOCAL Peternak shape the rest of the dashboard was built
 * around. This keeps the existing rendering code (status badges,
 * kemitraan labels, Excel export) unchanged while letting every list
 * and detail view read straight from the backend.
 *
 * The transform is one-way only — we never write back to the API
 * through the local store. Submissions go through the wizard →
 * `submitForm()` directly; everything else is a read.
 */

import type { FormItem, FormKandangItem } from "../../lib/api";
import type { Peternak, Kandang, PhotoRef, Kondisi } from "./types";
import { safeRandomUUID } from "../../utils/lib/safeUuid";

/**
 * Reverse of KATEGORI_LABEL: display string ("Ayam Petelur") → enum
 * key ("ayam_petelur"). Case-insensitive + substring match so
 * "Petelur", "petelur", "ayam petelur" all resolve to the same
 * enum. Returns "" when nothing matches — caller decides how to
 * render the missing state.
 */
function mapKategori(raw: string): Peternak["kategori"] {
  const v = raw.toLowerCase();
  if (v.includes("petelur") || v.includes("layer")) return "ayam_petelur";
  if (v.includes("pedaging") || v.includes("broiler")) return "ayam_pedaging";
  return "";
}

function mapKondisi(raw: string): Kondisi | "" {
  const v = raw.toLowerCase();
  if (v.includes("baik")) return "baik";
  if (v.includes("sedang") || v.includes("cukup")) return "sedang";
  if (v.includes("rusak") || v.includes("buruk") || v.includes("jelek")) return "rusak";
  return "";
}

function mapStatusOperasional(isOperating: boolean): "operasi" | "berhenti" {
  return isOperating ? "operasi" : "berhenti";
}

function mapJenisUsaha(raw: string): Kandang["jenisUsaha"] {
  const v = raw.toLowerCase();
  if (v.includes("kemitraan")) return "kemitraan";
  if (v.includes("mandiri")) return "mandiri";
  return "";
}

function mapKapasitas(raw: string): "2500-5000" | "<2500" | ">5000" | "" {
  // Backend returns display strings like "< 2500", "2500 - 5000",
  // "> 5000". Strip spaces and normalise the arrow to a dash.
  const v = raw.replace(/\s+/g, "").replace("-", "-");
  if (v === "<2500") return "<2500";
  if (v === "2500-5000") return "2500-5000";
  if (v === ">5000") return ">5000";
  return "";
}

/**
 * Map the BACKEND's display name for a kemitraan (e.g. "Mitra
 * Mahkota Buana") to the local enum key ("mitra_mahkota_buana").
 * Used so the existing KEMITRAAN_LABEL lookup still works.
 * Returns "" when nothing matches — the row's `kemitraan` is then
 * "—" in the UI.
 */
function mapKemitraan(raw: string): import("./types").Kemitraan | "" {
  const v = raw.toLowerCase();
  if (v.includes("charoen")) return "charoen_phokphan";
  if (v.includes("japfa")) return "japfa_comfeed";
  if (v.includes("ciomas")) return "ciomas_adistawa";
  if (v.includes("sierad")) return "sierad";
  if (v.includes("malindo")) return "malindo_feedmill";
  if (v.includes("mahkita")) return "mitra_mahkita";
  if (v.includes("sreeya")) return "sreeya_sewu";
  if (v.includes("mahkota")) return "mitra_mahkota_buana";
  if (v.includes("super")) return "super_unggas_jaya";
  return "";
}

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE || "";

/**
 * Build a PhotoRef whose `preview` is a fully-qualified image URL
 * (so `<img src>` works) but carries no `file` (the bytes live on
 * ImageKit now, not the browser). `name` and `size` are unknown
 * once the upload is committed, so we leave them off.
 */
function makeFoto(path: string | null | undefined): PhotoRef {
  return {
    id: safeRandomUUID(),
    preview: path ? `${IMAGE_BASE}/${path}` : null,
  };
}

function mapKandang(k: FormKandangItem): Kandang {
  return {
    id: safeRandomUUID(), // local Kandang.id is decorative; backend uses numeric
    nama: "",
    lokasi: {
      lat: k.latitude && !Number.isNaN(parseFloat(k.latitude))
        ? parseFloat(k.latitude)
        : null,
      lng: k.longitude && !Number.isNaN(parseFloat(k.longitude))
        ? parseFloat(k.longitude)
        : null,
      alamat: "",
    },
    kapasitas: mapKapasitas(k.kapasitas),
    statusOperasional: mapStatusOperasional(k.is_operating),
    kondisi: {
      dinding: {
        kondisi: mapKondisi(k.dinding),
        foto: makeFoto(k.dinding_foto),
      },
      atap: {
        kondisi: mapKondisi(k.atap),
        foto: makeFoto(k.atap_foto),
      },
      lantai: {
        kondisi: mapKondisi(k.lantai),
        foto: makeFoto(k.lantai_foto),
      },
    },
    peralatan: {
      tempatMinum: {
        kondisi: mapKondisi(k.tmp_mnm),
        foto: makeFoto(k.tmp_mnm_foto),
      },
      tempatMakan: {
        kondisi: mapKondisi(k.tmp_mkn),
        foto: makeFoto(k.tmp_mkn_foto),
      },
      brooding: {
        kondisi: mapKondisi(k.brooding),
        foto: makeFoto(k.brooding_foto),
      },
      kipas: {
        kondisi: mapKondisi(k.kipas),
        foto: makeFoto(k.kipas_foto),
      },
    },
    // Only populate operational fields when actually operating,
    // so the wizard's "required if operating" validation passes
    // when the user reopens this record to edit it.
    jumlahAyam: k.is_operating ? mapKapasitas(k.jml_ayam) : "",
    jenisUsaha: k.is_operating ? mapJenisUsaha(k.jenis_usaha) : "",
    kemitraan: k.is_operating ? mapKemitraan(k.jenis_kemitraan) : "",
  };
}

/**
 * Convert a backend FormItem into a local Peternak so the existing
 * dashboard / wizard / Excel-export code keeps working unchanged.
 * `id` is stringified (Peternak uses string ids throughout the FE).
 */
export function formItemToPeternak(item: FormItem): Peternak {
  return {
    id: String(item.id),
    createdAt: item.created_at,
    nama: item.nama,
    noKtp: item.ktp_no,
    ktp: makeFoto(item.ktp_foto),
    kategori: mapKategori(item.kategori_peternak),
    alamat: {
      provinsi: item.provinsi
        ? { id: String(item.provinsi_id), name: item.provinsi }
        : null,
      kabupaten: item.kabupaten
        ? { id: String(item.kabupaten_id), name: item.kabupaten }
        : null,
      kecamatan: item.kecamatan
        ? { id: String(item.kecamatan_id), name: item.kecamatan }
        : null,
      kelurahan: item.kelurahan
        ? { id: item.kelurahan_id, name: item.kelurahan }
        : null,
      detail: item.alamat,
    },
    kandang: item.form_peternakan_kandang.map(mapKandang),
  };
}
