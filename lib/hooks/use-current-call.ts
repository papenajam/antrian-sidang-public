"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";

/** Data pihak yang sedang dipanggil */
export interface CurrentCall {
  queueNumber: string;
  pihak: string;
  lawan: string | null;
  nomorPerkara: string;
  jenis: string;
  ruang: string;
  agenda: string;
  waktu: string;
}

/** Data antrian berikutnya */
export interface NextCall {
  queueNumber: string;
  ruang: string;
  waktu: string;
  agenda: string;
}

/** Keseluruhan data status antrian sidang */
export interface QueueStatusData {
  current: CurrentCall | null;
  next: NextCall | null;
  waitingCount: number;
  doneCount: number;
}

/** Tipe respons dari backend untuk field current */
interface BackendCurrent {
  queue_number: string;
  pihak_nama: string;
  lawan_nama: string | null;
  nomor_perkara: string;
  jenis_perkara: string;
  ruang_sidang: string;
  agenda: string;
  jam_mulai: string;
  started_at: string | null;
}

/** Tipe respons dari backend untuk field next */
interface BackendNext {
  queue_number: string;
  ruang_sidang: string;
  jam_mulai: string;
  agenda: string;
}

/** Tipe lengkap respons API dari backend */
interface CurrentCallResponse {
  data: {
    current: BackendCurrent | null;
    next: BackendNext | null;
    waiting_count: number;
    done_count: number;
  };
  error: string | null;
}

/**
 * Mengkonversi data snake_case dari backend ke camelCase untuk frontend.
 *
 * @param res - Respons mentah dari API backend
 * @returns Data status antrian dalam format frontend
 */
function transformBackend(res: CurrentCallResponse): QueueStatusData {
  return {
    current: res.data.current
      ? {
          queueNumber: res.data.current.queue_number,
          pihak: res.data.current.pihak_nama,
          lawan: res.data.current.lawan_nama,
          nomorPerkara: res.data.current.nomor_perkara,
          jenis: res.data.current.jenis_perkara,
          ruang: res.data.current.ruang_sidang,
          agenda: res.data.current.agenda,
          waktu: res.data.current.jam_mulai,
        }
      : null,
    next: res.data.next
      ? {
          queueNumber: res.data.next.queue_number,
          ruang: res.data.next.ruang_sidang,
          waktu: res.data.next.jam_mulai,
          agenda: res.data.next.agenda,
        }
      : null,
    waitingCount: res.data.waiting_count,
    doneCount: res.data.done_count,
  };
}

/**
 * Hook untuk mengambil dan memperbarui data pemanggilan sidang secara otomatis.
 * Polling dilakukan setiap 30 detik.
 * Jika endpoint 404 (belum tersedia di backend), fallback ke empty state tanpa error.
 *
 * @returns Object berisi data, status loading, pesan error, dan fungsi refetch
 */
export function useCurrentCall() {
  const [data, setData] = useState<QueueStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get<CurrentCallResponse>("/public/queue/current-call");
      setData(transformBackend(res));
      setError(null);
    } catch (e) {
      // Endpoint belum tersedia di backend (404) — gunakan empty state, jangan tampilkan error
      if (e instanceof ApiError && e.status === 404) {
        console.warn("[backend-pending] /public/queue/current-call not yet available");
        setData({ current: null, next: null, waitingCount: 0, doneCount: 0 });
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Ambil data pertama kali saat mount
    fetchData();
    // Polling setiap 30 detik untuk update real-time
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
