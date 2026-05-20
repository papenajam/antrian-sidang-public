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
  ValidateRequest,
  ValidateResponse,
  SlotsResponse,
  RescheduleRequest,
  RescheduleResponse,
  QueueBookWizardRequest,
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

/**
 * Validasi nomor perkara dan NIK
 * Mengecek apakah NIK terdaftar sebagai pihak di perkara
 */
export async function validatePerkara(data: ValidateRequest): Promise<ValidateResponse> {
  return api.post<ValidateResponse>('/public/queue/validate', data);
}

/**
 * Ambil ketersediaan slot untuk perkara dan tanggal tertentu
 */
export async function getAvailableSlots(
  perkaraId: number,
  date: string
): Promise<SlotsResponse> {
  return api.get<SlotsResponse>(
    `/public/queue/slots?perkara_id=${perkaraId}&date=${date}`
  );
}

/**
 * Ganti jadwal booking (reschedule)
 * Slot lama dilepas, slot baru diambil. Nomor antrian tetap.
 */
export async function rescheduleQueue(data: RescheduleRequest): Promise<RescheduleResponse> {
  return api.put<RescheduleResponse>('/public/queue/reschedule', data);
}

/**
 * Booking antrian untuk wizard (parameter baru: nik + slot_time)
 * Digunakan oleh BookingWizard, bukan RegistrationForm lama
 */
export async function bookQueueWizard(data: QueueBookWizardRequest): Promise<QueueBookResponse> {
  return api.post<QueueBookResponse>('/public/queue/book', data);
}
