"use client";

import * as XLSX from "xlsx";
import {
  KAPASITAS_LABEL,
  KATEGORI_LABEL,
  KONDISI_LABEL,
  STATUS_OPERASIONAL_LABEL,
  JENIS_USAHA_LABEL,
} from "../../hooks/useTernakRakyat";
import { safeRandomUUID } from "../../utils/lib/safeUuid";

/**
 * Read an .xlsx file and return the first sheet as rows.
 * Used by the Laporan page "Impor Excel" feature.
 */
export function readExcelFile(file: File): Promise<{
  sheetName: string;
  rows: Record<string, string | number>[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error("File Excel tidak memiliki sheet."));
          return;
        }
        const ws = wb.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, {
          defval: "",
        });
        resolve({ sheetName: firstSheetName, rows: json });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsArrayBuffer(file);
  });
}

/** Get the list of sheet names from an .xlsx file. */
export function listSheets(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        resolve(wb.SheetNames);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsArrayBuffer(file);
  });
}

export type ImportColumn = {
  /** Display name shown in mapping UI */
  label: string;
  /** Possible header names in the uploaded Excel */
  aliases: string[];
  /** Required to import */
  required?: boolean;
  /** Description / help text */
  description: string;
};

/**
 * Column definitions for bulk import of Peternak.
 * These map spreadsheet headers -> Peternak fields.
 */
export const PETERNAK_IMPORT_COLUMNS: ImportColumn[] = [
  { label: "Nama Lengkap", aliases: ["Nama", "Nama Lengkap", "Nama Peternak", "nama"], required: true, description: "Nama lengkap sesuai KTP" },
  { label: "No. KTP", aliases: ["No. KTP", "KTP", "NIK", "Nomor KTP", "no_ktp"], required: true, description: "16 digit nomor KTP" },
  { label: "Kategori", aliases: ["Kategori", "Jenis Ayam", "Kategori Peternak"], description: "Ayam Pedaging atau Ayam Petelur" },
  { label: "Provinsi", aliases: ["Provinsi", "Province"], description: "Nama provinsi" },
  { label: "Kabupaten", aliases: ["Kabupaten", "Kabupaten/Kota", "Kab / Kota", "Kabupaten Kota"], description: "Nama kabupaten/kota" },
  { label: "Kecamatan", aliases: ["Kecamatan", "District"], description: "Nama kecamatan" },
  { label: "Kelurahan", aliases: ["Kelurahan", "Desa", "Kelurahan/Desa", "Village"], description: "Nama kelurahan/desa" },
  { label: "Alamat Detail", aliases: ["Alamat", "Alamat Detail", "Jalan", "Detail Alamat"], description: "Jalan, RT/RW, nomor rumah" },
  { label: "Tanggal Daftar", aliases: ["Tanggal Daftar", "Terdaftar", "Tanggal"], description: "Format YYYY-MM-DD" },
];

/** Validate one row and collect errors. */
export type RowError = { row: number; field: string; message: string };
export type ValidatedRow = { row: number; data: Record<string, string>; errors: RowError[] };

/** Resolve a header to a column by trying aliases (case-insensitive). */
export function resolveColumn(
  header: string,
  columns: ImportColumn[]
): ImportColumn | null {
  const h = header.toLowerCase().trim();
  for (const col of columns) {
    for (const alias of col.aliases) {
      if (alias.toLowerCase().trim() === h) return col;
    }
  }
  return null;
}

export type ColumnMapping = Record<string, ImportColumn | null>;

/** Build mapping from uploaded headers to our columns. */
export function buildAutoMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  headers.forEach((h) => {
    mapping[h] = resolveColumn(h, PETERNAK_IMPORT_COLUMNS);
  });
  return mapping;
}

/** Validate rows with the given mapping. */
export function validateRows(
  rows: Record<string, string | number>[],
  mapping: ColumnMapping
): { valid: ValidatedRow[]; errors: RowError[] } {
  const valid: ValidatedRow[] = [];
  const errors: RowError[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // Excel row 1 is header
    const data: Record<string, string> = {};
    const rowErrors: RowError[] = [];

    for (const [header, col] of Object.entries(mapping)) {
      if (!col) continue;
      const value = String(row[header] ?? "").trim();
      data[col.label] = value;
      if (col.required && !value) {
        rowErrors.push({
          row: rowNum,
          field: col.label,
          message: `${col.label} wajib diisi.`,
        });
      }
    }

    // Validate kategori if present
    if (data.Kategori) {
      const katValue = data.Kategori;
      if (!Object.values(KATEGORI_LABEL).includes(katValue as any) &&
          !Object.keys(KATEGORI_LABEL).includes(katValue as any)) {
        rowErrors.push({
          row: rowNum,
          field: "Kategori",
          message: `Kategori harus "Ayam Pedaging" atau "Ayam Petelur", dapat: "${katValue}"`,
        });
      }
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      valid.push({ row: rowNum, data, errors: rowErrors });
    }
  });

  return { valid, errors };
}

/** Build a sample Peternak record from validated row. */
export function buildPeternakFromRow(
  row: Record<string, string>,
  rowNum: number
): {
  id: string;
  nama: string;
  noKtp: string;
  kategori: "ayam_pedaging" | "ayam_petelur" | "";
  alamat: {
    provinsi: null;
    kabupaten: null;
    kecamatan: null;
    kelurahan: null;
    detail: string;
  };
  ktp: { id: string; preview: string | null };
  kandang: [];
  createdAt: string;
} {
  // Map kategori string to code
  const kategoriCode = (() => {
    const v = (row.Kategori || "").toLowerCase();
    if (v.includes("pedaging") || v === "ayam_pedaging") return "ayam_pedaging" as const;
    if (v.includes("petelur") || v === "ayam_petelur") return "ayam_petelur" as const;
    return "" as const;
  })();

  return {
    id: `pt-imp-${Date.now()}-${rowNum}-${Math.random().toString(36).slice(2, 6)}`,
    nama: row["Nama Lengkap"] || "",
    noKtp: row["No. KTP"] || "",
    kategori: kategoriCode,
    alamat: {
      provinsi: null,
      kabupaten: null,
      kecamatan: null,
      kelurahan: null,
      detail: row["Alamat Detail"] || "",
    },
    ktp: { id: safeRandomUUID(), preview: null },
    kandang: [],
    createdAt: row["Tanggal Daftar"]
      ? new Date(row["Tanggal Daftar"]).toISOString()
      : new Date().toISOString(),
  };
}

/** Generate a downloadable Excel template. */
export function downloadImportTemplate(): void {
  const headers = PETERNAK_IMPORT_COLUMNS.map((c) => c.label);
  const sample = [
    "Budi Santoso",
    "3201234567890001",
    "Ayam Pedaging",
    "Jawa Barat",
    "Bandung",
    "Cilengkrang",
    "Jatiendah",
    "Jl. Raya Jatiendah No. 12",
    new Date().toISOString().slice(0, 10),
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
  // Style header row
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(20, h.length + 2) }));
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "siternak-template-impor.xlsx";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
