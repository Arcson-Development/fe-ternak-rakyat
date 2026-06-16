"use client";

import * as XLSX from "xlsx";
import {
  JENIS_USAHA_LABEL,
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  KONDISI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  type Kandang,
  type Peternak,
} from "../../hooks/useTernakRakyat";

/**
 * Enterprise-grade Excel export. Builds a proper .xlsx with:
 *   - Multiple sheets (Ringkasan, Peternak, Kandang, Kondisi, Operasional)
 *   - Frozen header row
 *   - Auto-width columns
 *   - Title row with metadata
 *   - Date-stamped filename
 */

const BRAND = {
  primary: "FF13BC6D",
  headerBg: "FF13BC6D",
  headerFg: "FFFFFFFF",
  altRow: "FFF1F5F9",
  title: "FF0F172A",
  subtitle: "FF64748B",
  border: "FFCBD5E1",
};

const FILENAME_TS = () => {
  const d = new Date();
  return d.toISOString().slice(0, 19).replace(/[:T]/g, "-");
};

const labelOf = (v: string | null | undefined, map: Record<string, string>): string =>
  v ? (map[v] ?? "—") : "—";

/** Build workbook from list of Peternak records. */
export function buildLaporanWorkbook(peternak: Peternak[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. RINGKASAN
  const ringkasan = XLSX.utils.aoa_to_sheet([
    ["SITERNAK — Laporan Pengembangan Ternak Rakyat"],
    [`Digenerate: ${new Date().toLocaleString("id-ID")}`],
    [""],
    ["Total Peternak", peternak.length],
    ["Total Kandang", peternak.reduce((s, p) => s + p.kandang.length, 0)],
    [
      "Kandang Operasi",
      peternak.reduce(
        (s, p) => s + p.kandang.filter((k) => k.statusOperasional === "operasi").length,
        0
      ),
    ],
    [
      "Ayam Pedaging",
      peternak.filter((p) => p.kategori === "ayam_pedaging").length,
    ],
    [
      "Ayam Petelur",
      peternak.filter((p) => p.kategori === "ayam_petelur").length,
    ],
    [
      "Mandiri",
      peternak.reduce(
        (s, p) =>
          s +
          p.kandang.filter(
            (k) => k.jenisUsaha === "mandiri"
          ).length,
        0
      ),
    ],
    [
      "Kemitraan",
      peternak.reduce(
        (s, p) =>
          s +
          p.kandang.filter(
            (k) => k.jenisUsaha === "kemitraan"
          ).length,
        0
      ),
    ],
  ]);
  ringkasan["!cols"] = [{ wch: 24 }, { wch: 16 }];
  ringkasan["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
  ];
  XLSX.utils.book_append_sheet(wb, ringkasan, "Ringkasan");

  // 2. PETERNAK
  const peternakRows: (string | number)[][] = [
    [
      "No",
      "ID Pendaftaran",
      "Tanggal Daftar",
      "Nama",
      "No. KTP",
      "Kategori",
      "Provinsi",
      "Kabupaten",
      "Kecamatan",
      "Kelurahan",
      "Alamat Detail",
      "Jumlah Kandang",
    ],
    ...peternak.map((p, i) => [
      i + 1,
      p.id,
      new Date(p.createdAt).toLocaleDateString("id-ID"),
      p.nama,
      p.noKtp,
      labelOf(p.kategori, KATEGORI_LABEL),
      p.alamat.provinsi?.name ?? "—",
      p.alamat.kabupaten?.name ?? "—",
      p.alamat.kecamatan?.name ?? "—",
      p.alamat.kelurahan?.name ?? "—",
      p.alamat.detail,
      p.kandang.length,
    ]),
  ];
  const wsPeternak = XLSX.utils.aoa_to_sheet(peternakRows);
  wsPeternak["!cols"] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 14 },
    { wch: 24 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 32 },
    { wch: 12 },
  ];
  wsPeternak["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsPeternak, "Peternak");

  // 3. KANDANG
  const kandangRows: (string | number)[][] = [
    [
      "No",
      "Pemilik",
      "No. KTP",
      "Kategori",
      "Provinsi",
      "Kabupaten",
      "Kandang",
      "Kapasitas",
      "Lat",
      "Lng",
      "Alamat Kandang",
    ],
  ];
  let idx = 0;
  peternak.forEach((p) => {
    p.kandang.forEach((k) => {
      idx++;
      kandangRows.push([
        idx,
        p.nama,
        p.noKtp,
        labelOf(p.kategori, KATEGORI_LABEL),
        p.alamat.provinsi?.name ?? "—",
        p.alamat.kabupaten?.name ?? "—",
        k.nama || `Kandang ${p.kandang.indexOf(k) + 1}`,
        labelOf(k.kapasitas, KAPASITAS_LABEL),
        k.lokasi.lat ?? "—",
        k.lokasi.lng ?? "—",
        k.lokasi.alamat,
      ]);
    });
  });
  const wsKandang = XLSX.utils.aoa_to_sheet(kandangRows);
  wsKandang["!cols"] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 32 },
  ];
  wsKandang["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsKandang, "Kandang");

  // 4. KONDISI
  const kondisiRows: (string | number)[][] = [
    [
      "No",
      "Pemilik",
      "Kandang",
      "Dinding",
      "Foto Dinding",
      "Atap",
      "Foto Atap",
      "Lantai",
      "Foto Lantai",
      "Tempat Minum",
      "Tempat Makan",
      "Brooding",
      "Kipas",
    ],
  ];
  let idx2 = 0;
  peternak.forEach((p) => {
    p.kandang.forEach((k) => {
      idx2++;
      kondisiRows.push([
        idx2,
        p.nama,
        k.nama || `Kandang ${p.kandang.indexOf(k) + 1}`,
        labelOf(k.kondisi.dinding.kondisi, KONDISI_LABEL),
        k.kondisi.dinding.foto.preview ? "Ada" : "Tidak",
        labelOf(k.kondisi.atap.kondisi, KONDISI_LABEL),
        k.kondisi.atap.foto.preview ? "Ada" : "Tidak",
        labelOf(k.kondisi.lantai.kondisi, KONDISI_LABEL),
        k.kondisi.lantai.foto.preview ? "Ada" : "Tidak",
        labelOf(k.peralatan.tempatMinum.kondisi, KONDISI_LABEL),
        labelOf(k.peralatan.tempatMakan.kondisi, KONDISI_LABEL),
        labelOf(k.peralatan.brooding.kondisi, KONDISI_LABEL),
        labelOf(k.peralatan.kipas.kondisi, KONDISI_LABEL),
      ]);
    });
  });
  const wsKondisi = XLSX.utils.aoa_to_sheet(kondisiRows);
  wsKondisi["!cols"] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];
  wsKondisi["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsKondisi, "Kondisi & Peralatan");

  // 5. OPERASIONAL
  const opsRows: (string | number)[][] = [
    [
      "No",
      "Pemilik",
      "Kandang",
      "Status",
      "Jumlah Ayam",
      "Jenis Usaha",
      "Nama Kemitraan",
    ],
  ];
  let idx3 = 0;
  peternak.forEach((p) => {
    p.kandang.forEach((k) => {
      idx3++;
      opsRows.push([
        idx3,
        p.nama,
        k.nama || `Kandang ${p.kandang.indexOf(k) + 1}`,
        labelOf(k.statusOperasional, STATUS_OPERASIONAL_LABEL),
        k.jumlahAyam
          ? labelOf(k.jumlahAyam, KAPASITAS_LABEL)
          : "—",
        k.jenisUsaha
          ? labelOf(k.jenisUsaha, JENIS_USAHA_LABEL)
          : "—",
        k.kemitraan || "—",
      ]);
    });
  });
  const wsOps = XLSX.utils.aoa_to_sheet(opsRows);
  wsOps["!cols"] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 26 },
  ];
  wsOps["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsOps, "Operasional");

  return wb;
}

/** Build workbook for a single Peternak record. */
export function buildSinglePeternakWorkbook(p: Peternak): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Identitas sheet
  const identitas = XLSX.utils.aoa_to_sheet([
    ["SITERNAK — Data Peternak"],
    [`ID: ${p.id}`],
    [`Tanggal Daftar: ${new Date(p.createdAt).toLocaleString("id-ID")}`],
    [""],
    ["Field", "Nilai"],
    ["Nama Lengkap", p.nama],
    ["Nomor KTP", p.noKtp],
    ["Kategori", labelOf(p.kategori, KATEGORI_LABEL)],
    ["KTP (Lampiran)", p.ktp.preview ? "Terlampir" : "Tidak ada"],
    ["Provinsi", p.alamat.provinsi?.name ?? "—"],
    ["Kabupaten/Kota", p.alamat.kabupaten?.name ?? "—"],
    ["Kecamatan", p.alamat.kecamatan?.name ?? "—"],
    ["Kelurahan/Desa", p.alamat.kelurahan?.name ?? "—"],
    ["Alamat Detail", p.alamat.detail],
  ]);
  identitas["!cols"] = [{ wch: 22 }, { wch: 36 }];
  identitas["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
  ];
  XLSX.utils.book_append_sheet(wb, identitas, "Identitas");

  // Kandang sheet (one row per kandang)
  const kRows: (string | number)[][] = [
    [
      "No",
      "Nama Kandang",
      "Kapasitas",
      "Lat",
      "Lng",
      "Alamat",
      "Dinding",
      "Atap",
      "Lantai",
      "Tempat Minum",
      "Tempat Makan",
      "Brooding",
      "Kipas",
      "Status",
      "Jumlah Ayam",
      "Jenis Usaha",
      "Kemitraan",
    ],
  ];
  p.kandang.forEach((k, i) => {
    kRows.push([
      i + 1,
      k.nama || `Kandang ${i + 1}`,
      labelOf(k.kapasitas, KAPASITAS_LABEL),
      k.lokasi.lat ?? "—",
      k.lokasi.lng ?? "—",
      k.lokasi.alamat,
      labelOf(k.kondisi.dinding.kondisi, KONDISI_LABEL),
      labelOf(k.kondisi.atap.kondisi, KONDISI_LABEL),
      labelOf(k.kondisi.lantai.kondisi, KONDISI_LABEL),
      labelOf(k.peralatan.tempatMinum.kondisi, KONDISI_LABEL),
      labelOf(k.peralatan.tempatMakan.kondisi, KONDISI_LABEL),
      labelOf(k.peralatan.brooding.kondisi, KONDISI_LABEL),
      labelOf(k.peralatan.kipas.kondisi, KONDISI_LABEL),
      labelOf(k.statusOperasional, STATUS_OPERASIONAL_LABEL),
      k.jumlahAyam
        ? labelOf(k.jumlahAyam, KAPASITAS_LABEL)
        : "—",
      k.jenisUsaha
        ? labelOf(k.jenisUsaha, JENIS_USAHA_LABEL)
        : "—",
      k.kemitraan || "—",
    ]);
  });
  const wsK = XLSX.utils.aoa_to_sheet(kRows);
  wsK["!cols"] = Array(17).fill({ wch: 14 });
  wsK["!cols"][0] = { wch: 5 };
  wsK["!cols"][1] = { wch: 18 };
  wsK["!cols"][5] = { wch: 32 };
  wsK["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsK, "Kandang");

  return wb;
}

/** Build workbook for a list of Kandang (master export). */
export function buildKandangWorkbook(
  rows: { peternak: Peternak; kandang: Kandang }[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const header = [
    "No",
    "Pemilik",
    "Kategori",
    "Provinsi",
    "Kabupaten",
    "Kandang",
    "Kapasitas",
    "Status",
    "Jumlah Ayam",
    "Jenis Usaha",
    "Kemitraan",
    "Lat",
    "Lng",
    "Dinding",
    "Atap",
    "Lantai",
  ];
  const data: (string | number)[][] = [header];
  rows.forEach(({ peternak: p, kandang: k }, i) => {
    data.push([
      i + 1,
      p.nama,
      labelOf(p.kategori, KATEGORI_LABEL),
      p.alamat.provinsi?.name ?? "—",
      p.alamat.kabupaten?.name ?? "—",
      k.nama || `Kandang ${i + 1}`,
      labelOf(k.kapasitas, KAPASITAS_LABEL),
      labelOf(k.statusOperasional, STATUS_OPERASIONAL_LABEL),
      k.jumlahAyam
        ? labelOf(k.jumlahAyam, KAPASITAS_LABEL)
        : "—",
      k.jenisUsaha
        ? labelOf(k.jenisUsaha, JENIS_USAHA_LABEL)
        : "—",
      k.kemitraan || "—",
      k.lokasi.lat ?? "—",
      k.lokasi.lng ?? "—",
      labelOf(k.kondisi.dinding.kondisi, KONDISI_LABEL),
      labelOf(k.kondisi.atap.kondisi, KONDISI_LABEL),
      labelOf(k.kondisi.lantai.kondisi, KONDISI_LABEL),
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [
    { wch: 5 },
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ];
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, "Kandang");

  return wb;
}

/** Trigger browser download of a workbook. */
export function downloadWorkbook(
  wb: XLSX.WorkBook,
  filename: string
): void {
  if (typeof window === "undefined") return;
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const TIMESTAMP = FILENAME_TS;
export const _brandColors = BRAND; // expose for advanced styling if needed
