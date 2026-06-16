"use client";

/**
 * Lightweight CSV export fallback. Used when the xlsx package can't
 * be loaded (e.g. server-side rendering). Handles escaping quotes
 * and embedded newlines properly per RFC 4180.
 */

const TIMESTAMP = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function rowsToCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const out: string[] = [];
  out.push(headers.map(escapeCell).join(","));
  rows.forEach((r) => out.push(r.map(escapeCell).join(",")));
  return out.join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  // Prepend BOM so Excel detects UTF-8 correctly
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const TIMESTAMP_CSV = TIMESTAMP;
