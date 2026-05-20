# Design: Booking Wizard Antrian Sidang

**Tanggal:** 2026-05-20
**Status:** Approved
**Scope:** Frontend + Backend API redesign untuk workflow booking antrian sidang

---

## 1. Ringkasan

Mengubah workflow booking antrian sidang dari single-form menjadi step-by-step wizard dengan validasi NIK dan manajemen slot waktu per jam.

**Workflow Lama:** Pilih jadwal dropdown → Masukkan nama → Submit → Dapat nomor antrian

**Workflow Baru:** Input nomor perkara + NIK → Validasi → Pilih slot jam → Konfirmasi → Dapat tiket

---

## 2. Kebutuhan

### 2.1 Booking Window
- Booking bisa dilakukan dari H-N (hari-hari sebelum sidang) sampai H-0 (hari sidang)
- Tidak ada batas waktu spesifik di hari H

### 2.2 Input
- **Nomor Perkara:** Format bebas (contoh: 123/Pdt.G/2024/PA.Pps)
- **NIK:** 16 digit sesuai KTP

### 2.3 Validasi
- Sistem memvalidasi NIK terhadap data pihak di perkara
- Jika NIK tidak terdaftar → tampilkan pesan: "NIK tidak terdaftar sebagai pihak pada perkara ini. Silakan mendaftar secara offline di Pengadilan Agama."
- Jika valid → lanjutkan ke pemilihan slot

### 2.4 Slot Waktu
- Range: 09:00 - 16:00
- Durasi per slot: 1 jam
- Slot tersedia: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00 (7 slot)
- Kuota per slot: 6 perkara (hardcode, bisa diubah nanti)
- 1 slot = 1 perkara (bukan 1 orang)

### 2.5 Multi-pihak
- Jika ada beberapa pihak dalam 1 nomor perkara:
  - Pihak pertama yang booking mendapat nomor antrian baru
  - Pihak berikutnya dari perkara yang sama → mendapat nomor antrian yang SAMA
- Tujuan: validasi operator di ruang sidang (semua pihak dari perkara yang sama terdaftar)

### 2.6 Tampilan Slot
- Card per slot dengan informasi sisa kuota
- Format: "09:00 - 10:00 (4/6 tersedia)"
- Slot yang sudah penuh: disabled (abu-abu, tidak bisa diklik)

### 2.7 Setelah Booking
- Tampilkan tiket (nomor antrian, jam, ruangan, perkara, pihak)
- Tersedia fitur cek status antrian real-time

---

## 3. Arsitektur

### 3.1 Flow Diagram

```
User Input (Nomor Perkara + NIK)
        │
        ▼
POST /api/public/queue/validate
        │
        ├── valid: false → Tampilkan pesan error → STOP
        │
        ▼ (valid: true)
GET /api/public/queue/slots?perkara_id=X&date=Y
        │
        ▼
Tampilkan slot cards (dengan sisa kuota)
        │
        ▼ (user pilih slot)
POST /api/public/queue/book
        │
        ▼
Tampilkan tiket + opsi cek status
```

### 3.2 API Endpoints

#### POST /api/public/queue/validate

**Request:**
```json
{
  "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
  "nik": "3201234567890001"
}
```

**Response (valid):**
```json
{
  "valid": true,
  "data": {
    "perkara_id": 123,
    "pihak_nama": "Ahmad bin Ahmad",
    "pihak_role": "Penggugat",
    "jadwal": {
      "tanggal": "2026-05-30",
      "waktu": "09:00",
      "ruangan": "Ruang Sidang 1",
      "agenda": "Pembacaan Gugatan"
    },
    "existing_queue": null
  }
}
```

**Response (existing queue):**
```json
{
  "valid": true,
  "data": {
    "perkara_id": 123,
    "pihak_nama": "Ahmad bin Ahmad",
    "pihak_role": "Penggugat",
    "jadwal": { ... },
    "existing_queue": {
      "queue_number": "A-003",
      "slot_time": "09:00",
      "status": "waiting"
    }
  }
}
```

**Response (invalid):**
```json
{
  "valid": false,
  "message": "NIK tidak terdaftar sebagai pihak pada perkara ini. Silakan mendaftar secara offline di Pengadilan Agama."
}
```

#### GET /api/public/queue/slots

**Query Parameters:**
- `perkara_id` (required): ID perkara
- `date` (required): Tanggal sidang (format: YYYY-MM-DD)

**Response:**
```json
{
  "data": {
    "tanggal": "2026-05-30",
    "slots": [
      { "time": "09:00", "capacity": 6, "booked": 4, "available": 2 },
      { "time": "10:00", "capacity": 6, "booked": 6, "available": 0 },
      { "time": "11:00", "capacity": 6, "booked": 2, "available": 4 },
      { "time": "12:00", "capacity": 6, "booked": 0, "available": 6 },
      { "time": "13:00", "capacity": 6, "booked": 0, "available": 6 },
      { "time": "14:00", "capacity": 6, "booked": 3, "available": 3 },
      { "time": "15:00", "capacity": 6, "booked": 1, "available": 5 }
    ]
  }
}
```

#### POST /api/public/queue/book (diperbarui)

**Request:**
```json
{
  "perkara_id": 123,
  "nik": "3201234567890001",
  "slot_time": "09:00"
}
```

**Response:**
```json
{
  "data": {
    "queue_number": "A-003",
    "status": "waiting",
    "slot_time": "09:00",
    "pihak_nama": "Ahmad bin Ahmad",
    "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
    "ruang_sidang": "Ruang Sidang 1",
    "created_at": "2026-05-28T10:30:00Z"
  },
  "message": "Booking berhasil. Nomor antrian Anda: A-003"
}
```

#### GET /api/public/queue/status/{queue_number} (tetap)

**Response:**
```json
{
  "data": {
    "queue_number": "A-003",
    "status": "waiting",
    "position": 2,
    "estimated_wait": "30 menit",
    "slot_time": "09:00",
    "pihak_nama": "Ahmad bin Ahmad",
    "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
    "ruang_sidang": "Ruang Sidang 1"
  }
}
```

---

## 4. UI Design

### 4.1 Wizard Container
- Progress bar dengan 4 langkah
- Navigasi: Kembali / Lanjutkan
- State management dengan React useState

### 4.2 Langkah 1: Validasi
- Input: Nomor Perkara (text) + NIK (text, 16 digit)
- Tombol: "Cek Jadwal & Lanjutkan"
- Loading state saat validasi
- Error state jika NIK tidak valid

### 4.3 Langkah 2: Pilih Slot
- Header: Info jadwal sidang (tanggal, perkara, pihak, ruangan)
- Grid card slot (7 slot)
- Card format:
  - Atas: Jam (09:00 - 10:00)
  - Tengah: Status kuota (4/6 tersedia)
  - Bawah: Indikator (available/disabled)
- Slot penuh: disabled, abu-abu
- Slot tersedia: bisa diklik, hijau/biru
- Slot terpilih: highlight/border

### 4.4 Langkah 3: Konfirmasi
- Ringkasan data booking
- Peringatan: "Booking yang sudah dikonfirmasi tidak dapat dibatalkan"
- Tombol: "Konfirmasi Booking"

### 4.5 Langkah 4: Tiket
- Card tiket dengan nomor antrian besar
- Detail: jam, tanggal, ruangan, perkara, pihak
- Status: Menunggu/Dipanggil/Selesai
- Tombol: "Cek Status Antrian" + "Booking Lagi"

---

## 5. Struktur File

### 5.1 Frontend (Next.js)

```
components/features/
├── booking-wizard/
│   ├── booking-wizard.tsx        # Container wizard
│   ├── step-validate.tsx         # Langkah 1
│   ├── step-select-slot.tsx      # Langkah 2
│   ├── step-confirm.tsx          # Langkah 3
│   └── step-ticket.tsx           # Langkah 4
├── slot-card.tsx                 # Komponen card slot
├── queue-status.tsx              # (tetap)
├── schedule-table.tsx            # (tetap)
└── hero-section.tsx              # (tetap)

lib/
├── api.ts                        # (tetap)
├── api-types.ts                  # Ditambah tipe baru
└── queue-service.ts              # Ditambah fungsi baru
```

### 5.2 Tipe Data Baru (api-types.ts)

```typescript
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

// Booking request (diperbarui)
export interface QueueBookRequest {
  perkara_id: number;
  nik: string;
  slot_time: string;
}
```

### 5.3 Service Functions Baru (queue-service.ts)

```typescript
// Validasi perkara + NIK
export async function validatePerkara(
  data: ValidateRequest
): Promise<ValidateResponse>;

// Ambil slot ketersediaan
export async function getAvailableSlots(
  perkaraId: number,
  date: string
): Promise<SlotsResponse>;
```

---

## 6. Aturan Bisnis

| Aturan | Detail |
|--------|--------|
| Booking Window | H-N sampai H-0 (bebas) |
| Slot Range | 09:00 - 16:00 |
| Jumlah Slot | 7 (09, 10, 11, 12, 13, 14, 15) |
| Kuota per Slot | 6 perkara (hardcode) |
| Multi-pihak | 1 perkara = 1 nomor antrian (berlaku untuk semua pihak) |
| Validasi NIK | Wajib terdaftar di perkara |
| Slot Penuh | Disabled, tidak bisa dipilih |
| Existing Queue | Return nomor antrian yang sudah ada |

---

## 7. Error Handling

| Kondisi | Penanganan |
|---------|------------|
| NIK tidak valid | Toast error + pesan arahkan ke offline |
| Nomor perkara tidak ditemukan | Toast error |
| Slot sudah penuh (race condition) | Toast error + refresh slot |
| Network error | Toast error + retry button |
| API timeout | Toast error + retry button |

---

## 8. Dependencies

### Frontend (sudah ada)
- @tanstack/react-form
- zod
- framer-motion
- sonner
- lucide-react

### Backend (perlu ditambah)
- Endpoint validasi NIK + perkara
- Endpoint slot ketersediaan
- Logika multi-pihak (shared queue number)
- Manajemen kuota per slot
