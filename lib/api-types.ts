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
