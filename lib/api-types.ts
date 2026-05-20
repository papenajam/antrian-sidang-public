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

// Schedule types dari SIPP
export interface JadwalSidang {
  perkara_id: number;
  nomor_perkara: string;
  pihak_nama: string;
  ruangan: string;
  waktu: string;
  agenda: string;
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
  data: QueueTicket;
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
  slot_time: string;
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
