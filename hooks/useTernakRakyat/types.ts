// =============================================================================
// Domain types untuk SITERNAK
// =============================================================================

export type KategoriPeternak = "ayam_pedaging" | "ayam_petelur";

export type KapasitasKandang = "<2500" | "2500-5000" | ">5000";

export type Kondisi = "baik" | "sedang" | "rusak";

export type StatusOperasional = "operasi" | "berhenti";

export type JenisUsaha = "mandiri" | "kemitraan";

export type Kemitraan =
  | "charoen_phokphan"
  | "japfa_comfeed"
  | "ciomas_adistawa"
  | "sierad"
  | "malindo_feedmill"
  | "mitra_mahkita"
  | "sreeya_sewu"
  | "mitra_mahkota_buana"
  | "super_unggas_jaya";

export interface PhotoRef {
  /** object URL or data URL for preview; null means no photo yet. */
  preview: string | null;
  /** Original filename (if user picked a file). */
  name?: string;
  /** File size in bytes, for the small caption under the thumbnail. */
  size?: number;
}

export interface KondisiKandang {
  dinding: { kondisi: Kondisi | ""; foto: PhotoRef };
  atap: { kondisi: Kondisi | ""; foto: PhotoRef };
  lantai: { kondisi: Kondisi | ""; foto: PhotoRef };
}

export interface PeralatanKandang {
  tempatMinum: { kondisi: Kondisi | ""; foto: PhotoRef };
  tempatMakan: { kondisi: Kondisi | ""; foto: PhotoRef };
  brooding: { kondisi: Kondisi | ""; foto: PhotoRef };
  kipas: { kondisi: Kondisi | ""; foto: PhotoRef };
}

export interface Lokasi {
  lat: number | null;
  lng: number | null;
  alamat: string;
}

export interface Kandang {
  id: string;
  nama: string;
  lokasi: Lokasi;
  kapasitas: KapasitasKandang | "";
  kondisi: KondisiKandang;
  peralatan: PeralatanKandang;
  statusOperasional: StatusOperasional | "";
  jumlahAyam: KapasitasKandang | "";
  jenisUsaha: JenisUsaha | "";
  kemitraan: Kemitraan | "";
}

export type RegionRef = { id: string; name: string };

export interface Alamat {
  provinsi: { id: string; name: string } | null;
  kabupaten: { id: string; name: string } | null;
  kecamatan: { id: string; name: string } | null;
  kelurahan: { id: string; name: string } | null;
  detail: string;
}

export interface Peternak {
  id: string;
  createdAt: string;
  nama: string;
  noKtp: string;
  ktp: PhotoRef;
  alamat: Alamat;
  kategori: KategoriPeternak | "";
  kandang: Kandang[];
}

export const KAPASITAS_LABEL: Record<KapasitasKandang | "", string> = {
  "": "Pilih",
  "<2500": "< 2.500 ekor",
  "2500-5000": "2.500 - 5.000 ekor",
  ">5000": "> 5.000 ekor",
};

export const KONDISI_LABEL: Record<Kondisi | "", string> = {
  "": "Pilih",
  baik: "Baik",
  sedang: "Sedang",
  rusak: "Rusak",
};

export const KONDISI_COLOR: Record<Kondisi | "", string> = {
  "": "gray",
  baik: "green",
  sedang: "yellow",
  rusak: "red",
};

export const STATUS_OPERASIONAL_LABEL: Record<StatusOperasional | "", string> = {
  "": "Pilih",
  operasi: "Sedang Operasi",
  berhenti: "Tidak Operasi",
};

export const JENIS_USAHA_LABEL: Record<JenisUsaha | "", string> = {
  "": "Pilih",
  mandiri: "Mandiri",
  kemitraan: "Kemitraan",
};

export const DAFTAR_KEMITRAAN: Kemitraan[] = [
  "charoen_phokphan",
  "japfa_comfeed",
  "ciomas_adistawa",
  "sierad",
  "malindo_feedmill",
  "mitra_mahkita",
  "sreeya_sewu",
  "mitra_mahkota_buana",
  "super_unggas_jaya",
];

export const KEMITRAAN_LABEL: Record<Kemitraan, string> = {
  charoen_phokphan: "Charoen Phokphan",
  japfa_comfeed: "Japfa Comfeed",
  ciomas_adistawa: "Ciomas Adistawa",
  sierad: "Sierad",
  malindo_feedmill: "Malindo Feedmill",
  mitra_mahkita: "Mitra Mahkita",
  sreeya_sewu: "Sreeya Sewu",
  mitra_mahkota_buana: "Mitra Mahkota Buana (MMB)",
  super_unggas_jaya: "Super Unggas Jaya",
};

export const KATEGORI_LABEL: Record<KategoriPeternak | "", string> = {
  "": "Pilih",
  ayam_pedaging: "Ayam Pedaging (Broiler)",
  ayam_petelur: "Ayam Petelur (Layer)",
};

export const emptyPhoto = (): PhotoRef => ({ preview: null });

export const emptyLokasi = (): Lokasi => ({ lat: null, lng: null, alamat: "" });

export const emptyKondisi = (): KondisiKandang => ({
  dinding: { kondisi: "", foto: emptyPhoto() },
  atap: { kondisi: "", foto: emptyPhoto() },
  lantai: { kondisi: "", foto: emptyPhoto() },
});

export const emptyPeralatan = (): PeralatanKandang => ({
  tempatMinum: { kondisi: "", foto: emptyPhoto() },
  tempatMakan: { kondisi: "", foto: emptyPhoto() },
  brooding: { kondisi: "", foto: emptyPhoto() },
  kipas: { kondisi: "", foto: emptyPhoto() },
});

export const makeKandang = (): Kandang => ({
  id: crypto.randomUUID(),
  nama: "",
  lokasi: emptyLokasi(),
  kapasitas: "",
  kondisi: emptyKondisi(),
  peralatan: emptyPeralatan(),
  statusOperasional: "",
  jumlahAyam: "",
  jenisUsaha: "",
  kemitraan: "",
});

export const emptyAlamat = (): Alamat => ({
  provinsi: null,
  kabupaten: null,
  kecamatan: null,
  kelurahan: null,
  detail: "",
});

export const emptyPeternak = (): Peternak => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  nama: "",
  noKtp: "",
  ktp: emptyPhoto(),
  alamat: emptyAlamat(),
  kategori: "",
  kandang: [],
});
