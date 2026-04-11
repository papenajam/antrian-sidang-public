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
- `RegistrationForm` component (untuk dropdown jadwal)

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
- `RegistrationForm` component (submit form)

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

## File Structure

```
lib/
├── api.ts              # API client configuration
├── api-types.ts        # TypeScript type definitions
└── queue-service.ts    # Queue service functions

components/features/
├── queue-status.tsx    # Fetch & display queue statistics
├── schedule-table.tsx  # Fetch & display today's schedule
└── registration-form.tsx # Fetch schedule & submit queue booking
```

## Mock Data Status

✅ **All mock data has been removed**

Semua komponen sekarang menggunakan data real dari backend API:
- `QueueStatus`: Fetch dari `/api/public/queue/schedule`
- `ScheduleTable`: Fetch dari `/api/public/queue/schedule`
- `RegistrationForm`: Fetch jadwal dari API, submit ke `/api/public/queue/book`

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
   - Ambil nomor antrian
   - Cek status antrian
