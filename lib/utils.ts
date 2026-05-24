import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tambah menit ke string waktu format HH:MM.
 * Mengembalikan string kosong jika input falsy.
 *
 * @param hhmm - Waktu dalam format HH:MM
 * @param mins - Jumlah menit yang ditambahkan
 * @returns Waktu baru dalam format HH:MM, atau string kosong jika input tidak valid
 */
export function addMin(hhmm: string, mins: number): string {
  if (!hhmm) return ""
  const [h, m] = hhmm.split(":").map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

/**
 * Format tanggal ISO string ke format panjang Indonesia.
 * Contoh: "2026-05-23" → "Sabtu, 23 Mei 2026"
 *
 * @param isoDate - Tanggal dalam format ISO (YYYY-MM-DD atau YYYY-MM-DDTHH:MM:SS)
 * @returns Tanggal dalam format panjang Indonesia, atau string kosong jika input tidak valid
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}