/**
 * Type definitions untuk API responses dari backend
 */

// Queue Ticket types
export interface QueueTicket {
  queue_number: string;
  status: QueueStatus;
  pihak_nama: string;
  nomor_perkara: string;
  ruang_sidang: string | null;
}

export type QueueStatus =
  | 'waiting'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'skipped'
  | 'no_show';

// Schedule types dari SIPP (sesuai response API)
export interface JadwalSidang {
  id: number;
  perkara_id: number;
  queue_number?: string | null; // Nomor antrian sidang
  ruangan: string | null; // Bisa null jika ruang sidang belum ditentukan
  waktu: string; // Tanggal dan waktu sidang (datetime string)
  jam_sidang: string | null;
  agenda: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  perkara?: {
    nomor_perkara: string | null;
    para_pihak: string | null;
    jenis_perkara_nama: string | null;
  } | null;
}

// App Settings types
export interface AppSettings {
  app: {
    name: string;
    short_name: string;
    description: string;
  };
  institution: {
    name: string;
    short_name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo: string | null;
  };
}

// API Response types
export interface ScheduleResponse {
  data: JadwalSidang[];
  error: string | null;
}

export interface SettingsResponse {
  data: AppSettings;
}

export interface QueueBookRequest {
  perkara_id: number;
  pihak_nama: string;
  pihak_telepon?: string;
}

export interface QueueBookResponse {
  data: QueueTicket;
  message: string;
}

export interface QueueStatusResponse {
  // data bisa null jika nomor antrian tidak ditemukan
  data: (QueueTicket & {
    position?: number;
    estimated_minutes?: number;
    jenis_perkara?: string;
    agenda?: string;
  }) | null;
  error: string | null;
}

// Queue statistics untuk dashboard
export interface QueueStatistics {
  currentNumber: number;
  waitingCount: number;
  processedToday: number;
  lastUpdated: string;
}

// ============================================
// Booking Wizard Types
// ============================================

// Validasi request/response
export interface ValidateRequest {
  nomor_perkara: string;
  nik: string;
}

export interface ValidateResponse {
  valid: boolean;
  data?: {
    perkara_id: number;
    pihak_nama: string;
    pihak_role: string;
    jadwal: JadwalSidang;
    existing_queue: ExistingQueue | null;
  };
  message?: string;
}

export interface ExistingQueue {
  queue_number: string;
  slot_time: string | null; // Bisa null jika belum ada slot_time
  status: QueueStatus;
}

// Slot types
export interface SlotInfo {
  time: string;
  capacity: number;
  booked: number;
  available: number;
}

export interface SlotsResponse {
  data: {
    tanggal: string;
    slots: SlotInfo[];
  };
}

// Booking request (diperbarui untuk wizard)
export interface QueueBookWizardRequest {
  perkara_id: number;
  nik: string;
  slot_time: string;
}

// Reschedule
export interface RescheduleRequest {
  queue_number: string;
  perkara_id: number;
  new_slot_time: string;
}

export interface RescheduleResponse {
  data: QueueTicket & { slot_time: string };
  message: string;
}
