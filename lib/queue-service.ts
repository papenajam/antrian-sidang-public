/**
 * Queue Service
 * Service layer untuk semua operasi terkait antrian
 */

import { api } from '@/lib/api';
import type {
  ScheduleResponse,
  QueueBookRequest,
  QueueBookResponse,
  QueueStatusResponse,
  QueueStatistics,
  QueueTicket,
  AppSettings,
} from '@/lib/api-types';

/**
 * Fetch jadwal sidang hari ini
 */
export async function getTodaySchedule(): Promise<ScheduleResponse> {
  return api.get<ScheduleResponse>('/public/queue/schedule');
}

/**
 * Fetch aplikasi settings (identity, institution, dll)
 */
export async function getAppSettings(): Promise<{ data: AppSettings }> {
  return api.get<{ data: AppSettings }>('/public/queue/settings');
}

/**
 * Ambil nomor antrian untuk suatu perkara
 */
export async function bookQueue(data: QueueBookRequest): Promise<QueueBookResponse> {
  return api.post<QueueBookResponse>('/public/queue/book', data);
}

/**
 * Cek status antrian berdasarkan nomor perkara
 */
export async function getQueueStatus(nomorPerkara: string): Promise<QueueStatusResponse> {
  // URL encode the perkara number to handle special characters
  const encoded = encodeURIComponent(nomorPerkara);
  return api.get<QueueStatusResponse>(`/public/queue/status/${encoded}`);
}

/**
 * Hitung statistik antrian dari data jadwal dan tiket
 * Ini adalah helper untuk menghitung statistik dari data yang ada
 */
export function calculateQueueStatistics(
  schedules: ScheduleResponse['data'],
  tickets: QueueTicket[]
): QueueStatistics {
  const now = new Date();
  
  // Hitung antrian yang sedang menunggu (status: waiting)
  const waitingCount = tickets.filter(
    (t) => t.status === 'waiting' || t.status === 'in_service'
  ).length;

  // Hitung antrian yang sudah selesai hari ini (status: completed)
  const processedToday = tickets.filter(
    (t) => t.status === 'completed'
  ).length;

  // Ambil nomor antrian yang sedang dipanggil (status: in_service)
  const inServiceTicket = tickets.find(
    (t) => t.status === 'in_service'
  );
  
  // Extract number from queue_number (format: S-001, S-002, etc.)
  const currentNumber = inServiceTicket
    ? parseInt(inServiceTicket.queue_number.split('-')[1] || '0', 10)
    : processedToday;

  return {
    currentNumber,
    waitingCount,
    processedToday,
    lastUpdated: now.toLocaleTimeString('id-ID'),
  };
}
