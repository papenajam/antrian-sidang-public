# API Integration Guide

## Setup

1. Copy `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Sesuaikan `NEXT_PUBLIC_API_URL` di `.env.local` dengan URL backend Anda:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

   Untuk production:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   ```

## API Endpoints Used

### 1. GET `/api/public/queue/schedule`
Mengambil jadwal sidang hari ini dari SIPP.

**Response:**
```json
{
  "data": [
    {
      "perkara_id": 123,
      "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
      "pihak_nama": "Ahmad vs Siti",
      "ruangan": "Ruang Sidang 1",
      "waktu": "09:00 WITA",
      "agenda": "Pembacaan Gugatan"
    }
  ],
  "error": null
}
```

**Used in:**
- `ScheduleTable` component
- `QueueStatus` component (untuk statistik)

### 2. POST `/api/public/queue/book`
Mengambil nomor antrian untuk suatu perkara.

**Request:**
```json
{
  "perkara_id": 123,
  "pihak_nama": "Ahmad bin Ahmad",
  "pihak_telepon": "081234567890"
}
```

**Response:**
```json
{
  "data": {
    "queue_number": "S-001",
    "status": "waiting",
    "pihak_nama": "Ahmad bin Ahmad",
    "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
    "ruang_sidang": "Ruang Sidang 1"
  },
  "message": "Nomor antrian berhasil diambil."
}
```

**Used in:**
- `BookingWizard` (via `bookQueueWizard`)

### 3. GET `/api/public/queue/status/{nomor_perkara}`
Cek status antrian berdasarkan nomor perkara.

**Response:**
```json
{
  "data": {
    "queue_number": "S-001",
    "status": "waiting",
    "pihak_nama": "Ahmad bin Ahmad",
    "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
    "ruang_sidang": "Ruang Sidang 1"
  }
}
```

**Used in:**
- Service layer (tersedia tapi belum dipakai di component)

### 4. POST `/api/public/queue/validate`
Validasi nomor perkara dan NIK pihak. Mengecek apakah NIK terdaftar sebagai pihak di perkara.

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
      "perkara_id": 123,
      "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
      "pihak_nama": "Ahmad bin Ahmad",
      "ruangan": "Ruang Sidang 1",
      "waktu": "2026-05-30T09:00:00",
      "agenda": "Pembacaan Gugatan"
    },
    "existing_queue": null
  }
}
```

**Response (invalid):**
```json
{
  "valid": false,
  "message": "NIK tidak terdaftar sebagai pihak pada perkara ini."
}
```

**Response (existing queue / multi-pihak):**
```json
{
  "valid": true,
  "data": {
    "perkara_id": 123,
    "pihak_nama": "Ahmad bin Ahmad",
    "pihak_role": "Penggugat",
    "jadwal": { "..." },
    "existing_queue": {
      "queue_number": "A-003",
      "slot_time": "09:00",
      "status": "waiting"
    }
  }
}
```

**Used in:**
- `StepValidate` component (BookingWizard)

### 5. GET `/api/public/queue/slots`
Ambil ketersediaan slot untuk perkara dan tanggal tertentu.

**Query Parameters:**
- `perkara_id` (required): ID perkara
- `date` (required): Tanggal sidang (YYYY-MM-DD)

**Response:**
```json
{
  "data": {
    "tanggal": "2026-05-30",
    "slots": [
      { "time": "09:00", "capacity": 6, "booked": 4, "available": 2 },
      { "time": "10:00", "capacity": 6, "booked": 6, "available": 0 }
    ]
  }
}
```

**Used in:**
- `StepSelectSlot` component (BookingWizard)
- `RescheduleDialog` component

### 6. PUT `/api/public/queue/reschedule`
Ganti slot waktu booking. Slot lama dilepas, slot baru diambil. Nomor antrian tetap.

**Request:**
```json
{
  "queue_number": "A-003",
  "perkara_id": 123,
  "new_slot_time": "10:00"
}
```

**Response:**
```json
{
  "data": {
    "queue_number": "A-003",
    "status": "waiting",
    "pihak_nama": "Ahmad bin Ahmad",
    "nomor_perkara": "123/Pdt.G/2024/PA.Pps",
    "ruang_sidang": "Ruang Sidang 1",
    "slot_time": "10:00"
  },
  "message": "Jadwal berhasil diubah."
}
```

**Used in:**
- `RescheduleDialog` component

## File Structure

```
lib/
├── api.ts              # API client configuration
├── api-types.ts        # TypeScript type definitions
└── queue-service.ts    # Queue service functions

components/features/
├── queue-status.tsx       # Fetch & display queue statistics
├── schedule-table.tsx     # Fetch & display today's schedule
├── slot-card.tsx          # Slot time card with availability
├── reschedule-dialog.tsx  # Dialog untuk ganti jadwal
└── booking-wizard/
    ├── booking-wizard.tsx     # Main wizard container
    ├── step-validate.tsx      # Step 1: Validasi perkara + NIK
    ├── step-select-slot.tsx   # Step 2: Pilih slot waktu
    ├── step-confirm.tsx       # Step 3: Konfirmasi booking
    ├── step-ticket.tsx        # Step 4: Tiket antrian
    └── existing-queue-card.tsx # Card untuk existing queue
```

## Mock Data Status

✅ **All mock data has been removed**

Semua komponen sekarang menggunakan data real dari backend API:
- `QueueStatus`: Fetch dari `/api/public/queue/schedule`
- `ScheduleTable`: Fetch dari `/api/public/queue/schedule`
- `BookingWizard`: Validasi via `/api/public/queue/validate`, slot via `/api/public/queue/slots`, booking via `/api/public/queue/book`
- `RescheduleDialog`: Reschedule via `/api/public/queue/reschedule`

## Error Handling

Semua komponen dilengkapi dengan error handling:
- Network errors ditampilkan via toast notifications
- Loading states ditampilkan saat fetching data
- Empty states ditampilkan jika data tidak tersedia

## Auto-refresh

Beberapa komponen auto-refresh data:
- `QueueStatus`: Setiap 30 detik
- `ScheduleTable`: Setiap 60 detik

## Testing

Untuk test integrasi:

1. Start backend server:
   ```bash
   cd /home/moohard/dev/project/antrian-sidang
   php artisan serve
   ```

2. Start frontend dev server:
   ```bash
   cd /home/moohard/dev/project/antrian-sidang-public
   pnpm dev
   ```

3. Buka `http://localhost:3000` dan test:
   - Lihat jadwal sidang hari ini
   - Validasi perkara + NIK (BookingWizard Step 1)
   - Pilih slot waktu (BookingWizard Step 2)
   - Konfirmasi booking (BookingWizard Step 3)
   - Lihat tiket antrian (BookingWizard Step 4)
   - Reschedule via QueueStatus
