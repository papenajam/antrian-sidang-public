# Frontend Design Parity — Design Specification

**Date:** 2026-05-24
**Author:** brainstorming session (user + Claude)
**Status:** Approved — ready for plan
**Related design source:** `docs/design-antrian/`

---

## 1. Overview & Arsitektur

### 1.1 Tujuan

Menyelesaikan **semua gap** antara design reference di `docs/design-antrian/` dan implementasi frontend Next.js, dengan target **pixel-perfect** untuk struktur, layout, dan copy text — sambil **mempertahankan semua improvements** yang sudah ada di implementasi (dark mode, real QR code, ExistingQueueCard, reschedule API, FAB, footer elaborate).

### 1.2 Keputusan Brainstorming

| # | Keputusan | Pilihan |
|---|---|---|
| Q1 | Backend dependency handling | **D (Hybrid)** — skip obsolete, implement yang feasible, request backend untuk gap kritis |
| Q2 | Improvements existing | **B (Keep all)** — design adalah baseline minimum |
| Q3 | Visual fidelity | **A (Pixel-perfect)** — match struktur design |
| Q4 | Delivery strategy | **B (Batched)** — 4 batch independent dengan checkpoint |
| Q5 | Backend requests | **A (Request semua)** — frontend lanjut dengan loading skeleton + graceful fallback |
| Pendekatan | Styling paradigm | **Pure Tailwind utility (existing pattern)** |

### 1.3 Scope

**IN scope:**
- Komponen visual: Hero stats, Panduan section, Footer CTA, Footer bar, Schedule Table, Queue Status
- Komponen interaktif: CekStatusDialog (NEW), Booking Wizard (Step 1-4 + Stepper)
- Custom CSS variables tambahan di `globals.css`
- Backend requirements doc untuk endpoint/extension baru

**OUT scope:**
- Refactor styling paradigm (tetap Tailwind utility)
- Penghapusan improvements existing
- Backend implementation (hanya tulis requirements)

### 1.4 Arsitektur Layer

```
components/
├─ layout/
│   ├─ header.tsx          (no change)
│   └─ footer.tsx          refactor → compact 4-col
├─ features/
│   ├─ hero-section.tsx    update stats delta text
│   ├─ panduan-section.tsx refactor → kicker + ctrls header
│   ├─ footer-cta.tsx      update heading + ghost button
│   ├─ schedule-table.tsx  refactor → 7-col + chip + count
│   ├─ queue-status.tsx    refactor → live case info
│   ├─ cek-status-dialog.tsx       NEW component
│   └─ booking-wizard/
│       ├─ form-progress.tsx       refactor → pill stepper
│       ├─ step-validate.tsx       add nama + telepon fields
│       ├─ step-slot.tsx           add alert + improved slot UI
│       ├─ step-confirm.tsx        refactor → 8-row review grid
│       └─ step-ticket.tsx         refactor → 2-col layout

lib/
└─ hooks/
    └─ use-current-call.ts         NEW custom hook
```

### 1.5 Design Tokens Tambahan

Append ke `app/globals.css`:

```css
:root {
  --primary-3: #0f5f2e;        /* gradient deep green */
  --primary-soft: #e7f4ec;     /* soft surface hijau */
  --fg-2: #3e5145;             /* second-level foreground */
  --fg-4: #9aa49a;             /* fourth-level (decorative meta) */
  --gold-3: #f4d27a;           /* gold variant untuk gradients */
}

@keyframes as-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### 1.6 Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Test suite breaks karena DOM/copy berubah | Update tests per batch (RED → GREEN), bukan after-the-fact |
| Backend belum siap saat frontend selesai | Loading skeleton + graceful degradation (`"—"` placeholder) |
| Visual regression mobile responsive | Manual visual check per batch (light + dark mode, 375px + 768px) |
| Hydration mismatch | Test SSR-safe pattern existing tetap dipertahankan |

---

## 2. Batch 1 — Static Content & Copy Polish

Batch paling rendah risiko. Fokus copy text + styling tweak section static.

### 2.1 Hero Section — Stats Delta Text

**File:** `components/features/hero-section.tsx`

Update stats delta text dari statis ke dinamis:

| Stat | Before | After |
|---|---|---|
| Antrian Saat Ini | `"Data SIPP hari ini"` | `"↑ 12% vs kemarin · ${currentTime} WITA"` |
| Sedang Berlangsung | `"Sinkronisasi otomatis tiap 60 detik"` | `"${liveCount} sedang berlangsung · ${doneCount} selesai"` |
| Tingkat Kehadiran | `"Peningkatan vs bulan lalu"` | `"▲ 4.2% improvement · ${attended}/${total} hadir"` |

**Data source:** Reuse `getTodaySchedule()` + `calculateQueueStatistics()`. `currentTime` dari `Date.now()` formatted ke `HH:MM` WITA.

**Fallback:** Bila data 0/null, gunakan text statis lama (hindari `"NaN sedang berlangsung"`).

### 2.2 Panduan Section — Header + Step Numbering

**File:** `components/features/panduan-section.tsx`

#### Perubahan struktural:

1. **Section header** → 2-column grid:
   - Kiri: kicker pill `"Empat langkah · ±2 menit"` + heading `"Cara mendaftar antrian"` (bukan `"Panduan Pendaftaran"`)
   - Kanan: button `"Mulai Daftar →"` (primary, large)

2. **Step card badge** → ganti text dekoratif ke **badge box 42×42px** warna bergantian:
   - Step 01: `bg-primary text-white`
   - Step 02: `bg-gold text-white`
   - Step 03: `bg-accent text-white`
   - Step 04: `bg-gold text-white`

3. **Step footer line** → tambahkan garis horizontal + label `"Step 0N / 04"` di tiap card.

4. **Copy text** update:
   - Step 3 title: `"Konfirmasi"` (bukan `"Konfirmasi Booking"`)
   - Step 4 title: `"Tiket Digital"` (bukan `"Cetak E-Tiket"`)
   - Step bodies sesuai design `Panduan.jsx:5-9`

### 2.3 Footer CTA — Heading + Ghost Button

**File:** `components/features/footer-cta.tsx`

1. **Pre-kicker baru**: `● Siap mendaftar?` (dot emerald 6×6, mono text, opacity-55)
2. **Heading**: `"Hemat waktu.\nDaftar online."` (2 baris, bukan `"Siap daftar antrian sidang online?"`)
3. **Subtitle**: `"Tidak perlu antre berjam-jam di gedung pengadilan. Daftar dari rumah, datang sesuai slot Anda, selesai."`
4. **CTA group**: 2 button inline:
   - Primary (existing): `"Daftar Antrian Sekarang →"` (accent orange)
   - **NEW Ghost on-dark**: `"Pelajari Selengkapnya"` → link ke `#sec-panduan`

### 2.4 Footer Bar — Compact 4-Column Layout

**File:** `components/layout/footer.tsx`

> ⚠️ **Open Question — see Section 7.1**: Konflik antara Q2 (keep improvements, footer elaborate) dan Q3 (pixel-perfect, footer compact). Spec di bawah merefleksikan Q3 (pixel-perfect). Bila user reaffirm Q2 saat review, batalkan section ini.

Refactor dari **3-column elaborate** ke **4-column compact** sesuai `Panduan.jsx:55-72`:

```
[Instansi] [Jam Operasional] [Sistem] [Kontak]
```

- Grid 4-col equal width desktop, 2-col tablet, 1-col mobile
- Padding compact: `py-8 px-6`
- Label uppercase mono 0.7rem `var(--fg-4)`, value 0.95rem regular
- **Copyright bar dihapus** (tidak ada di design)
- **Logo + deskripsi panjang dihapus**

**Data source:**
- Instansi: `useAppSettings().institution.name`
- Jam: hardcoded `"Sen — Jum · 08:00 — 16:00 WITA"`
- Sistem: hardcoded `"v0.1.0 · MVP · Live"`
- Kontak: `useAppSettings().institution.phone`

### 2.5 Batch 1 Test Strategy

Per komponen: RED test → GREEN implementasi → visual check.

Test impact:
- `hero-section.test.tsx` — assertion stats delta text baru
- `panduan-section.test.tsx` — heading + step badge + footer line
- `footer-cta.test.tsx` — pre-kicker + 2 button render
- `footer.test.tsx` — 4 column layout + removed copyright

---

## 3. Batch 2 — Schedule Table

### 3.1 Grid Columns 5 → 7

**Before:** `grid-cols-[80px_1.4fr_1fr_100px_100px]`
`[Waktu | Perkara+Pihak | Agenda | Ruang | Status]`

**After:** `grid-cols-[76px_1.4fr_1.3fr_96px_1.2fr_96px_130px]`
`[Antrian | Perkara | Para Pihak | Waktu | Agenda | Ruangan | Status]`

### 3.2 Schedule Internal Model Update

```typescript
interface Schedule {
  id: string
  perkaraId: number
  queueNumber: string | null   // NEW "S-014", null bila belum ada tiket
  caseNumber: string
  caseType: string             // NEW dari perkara.jenis_perkara_nama
  partyName: string
  opposingParty: string | null // NEW lawan ("vs. ...") bila ada
  time: string
  room: string
  agenda: string
  status: ScheduleStatus
}
```

### 3.3 Parse Helper Baru

```typescript
function parseParaPihak(html: string | null): { pihak: string; lawan: string | null } {
  if (!html) return { pihak: '-', lawan: null }
  const clean = html.replace(/<[^>]*>/g, ' ').trim()
  const match = clean.match(/^(.+?)\s+(?:vs\.?|melawan)\s+(.+)$/i)
  if (match) return { pihak: match[1].trim(), lawan: match[2].trim() }
  return { pihak: clean, lawan: null }
}
```

### 3.4 Data Source Mapping

| Field | Sumber | Status |
|---|---|---|
| `queueNumber` | `jadwal.queue_number` | 🔴 BUTUH backend extension |
| `caseType` | `jadwal.perkara?.jenis_perkara_nama` | ✅ tersedia |
| `partyName` + `opposingParty` | `parseParaPihak(jadwal.perkara?.para_pihak)` | ✅ tersedia |

Bila `queueNumber` null → tampilkan `"—"` (text-muted-foreground/40 placeholder).

### 3.5 Desktop Row Layout

```tsx
<div className="hidden md:grid grid-cols-[76px_1.4fr_1.3fr_96px_1.2fr_96px_130px] items-center gap-4">
  <div>{/* Antrian — font-mono bold primary, "—" fallback */}</div>
  <div>{/* Perkara — caseNumber bold + caseType mono uppercase */}</div>
  <div>{/* Para Pihak — partyName + small "vs. {opposingParty}" */}</div>
  <div>{/* Waktu — mono semibold + small "WITA" */}</div>
  <div>{/* Agenda — text-muted-foreground */}</div>
  <div>{/* Ruangan */}</div>
  <div>{/* Status badge */}</div>
</div>
```

### 3.6 Mobile Layout Update

Tambah baris `opposingParty` setelah `partyName`:
```tsx
<div>{schedule.partyName}{schedule.opposingParty && ` vs. ${schedule.opposingParty}`}</div>
```

Tambah queueNumber pill jika ada:
```tsx
{schedule.queueNumber && (
  <span className="bg-primary/10 px-1.5 py-0.5 font-mono text-[.7rem] font-bold text-primary">
    {schedule.queueNumber}
  </span>
)}
```

### 3.7 Section Header — Kicker Auto-refresh

```tsx
<p className="kicker inline-flex items-center gap-2 text-[.7rem] font-mono uppercase tracking-[.14em] text-muted-foreground mb-2">
  <span className="h-2 w-2 rounded-full bg-success animate-as-pulse" />
  Auto-refresh tiap 60 detik
</p>
<h2 className="!text-xl font-bold">Jadwal Sidang Hari Ini</h2>
```

### 3.8 Refresh Button Text

Update icon-only button menjadi icon + text `"Refresh"` (hidden sm:inline).

### 3.9 Filter Chips Count

Format chip label: `"Semua [12]"` — count di-derive dari `schedules.filter(s => s.status === tab.key).length`.

### 3.10 Timestamp Sync Chip

Tambah di filter row right-aligned:
```tsx
<span className="ml-auto text-[.72rem] font-mono text-muted-foreground/60">
  Terakhir disinkron: {lastSync}
</span>
```

State `lastSync` di-update di tiap `fetchData` success.

---

## 4. Batch 3 — Queue Status + CekStatusDialog

Batch paling kritis: gap functional (CekStatusDialog masih `toast.info`) + restructure Queue Status.

### 4.1 Queue Status Refactor

**File:** `components/features/queue-status.tsx`

#### Layout Refactor

**Before:** stats angka aggregate (currentNumber, waiting, done)
**After:** live case info (queue number + nama + perkara + ruang + agenda) + side stats

#### Data Model Baru

```typescript
interface CurrentCall {
  queueNumber: string         // "S-014"
  pihak: string
  lawan: string | null
  nomorPerkara: string
  jenis: string
  ruang: string
  agenda: string
  waktu: string               // "10:00"
}

interface NextCall {
  queueNumber: string
  ruang: string
  waktu: string
  agenda: string
}

interface QueueStatusData {
  current: CurrentCall | null  // null = no active call
  next: NextCall | null
  waitingCount: number
  doneCount: number
}
```

#### Custom Hook Baru

**File baru:** `lib/hooks/use-current-call.ts`

```typescript
export function useCurrentCall(): {
  data: QueueStatusData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

- Fetch endpoint baru `/public/queue/current-call`
- Polling tiap 30 detik
- Fallback: bila 404, return `current: null` + derive waiting/done dari `calculateQueueStatistics` existing

#### Component Structure

**Main column (kiri):**
- Tag pill: `● Sedang Dipanggil` dengan pulse animation
- Queue number HUGE: `text-[clamp(80px,12vw,180px)]` font-mono, gradient gold
- Nama: `text-xl font-semibold` + opacity-60 `" vs. {lawan}"`
- Mono line: `{nomorPerkara} · {jenis}`
- Meta: `{ruang} · {agenda} · Mulai pukul {waktu} WITA`
- 2 Action buttons ghost on-dark

**Side column (kanan) — 3 cells stacked:**
1. Menunggu: label + value 2rem + sublabel `"Estimasi tunggu ±{waitingCount * 18} menit"`
2. Selesai: label + value 2rem + sublabel `"Rata-rata 16 menit/sidang"`
3. Berikutnya: `{queueNumber} · {ruang}` + `±{waktu} WITA · {agenda}`

**Empty state (current === null):**
- Tag: `○ Tidak ada panggilan aktif` (no pulse, opacity-50)
- Queue number: `"—"`
- Subtitle: `"Menunggu jadwal sidang berikutnya"`
- Side cells tetap tampil

### 4.2 CekStatusDialog NEW

**File baru:** `components/features/cek-status-dialog.tsx`

#### Component Signature

```typescript
interface CekStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

#### State Machine

State enum: `'input' | 'loading' | 'result' | 'not-found' | 'error'`

```
input → (cek) → loading → result|not-found
result → (cek lain) → input
```

#### Structure (built on shadcn Dialog)

```tsx
<Dialog>
  <DialogContent max-w-[640px]>
    <DialogHeader>
      <DialogTitle>Cek Status Antrian</DialogTitle>
    </DialogHeader>
    
    {state === 'input' && <InputForm />}
    {state === 'loading' && <LoadingSkeleton />}
    {state === 'result' && <ResultDisplay data={result} />}
    {state === 'not-found' && <NotFoundAlert qn={searched} />}
    {state === 'error' && <ErrorAlert msg={err} />}
    
    <DialogFooter>{/* contextual buttons */}</DialogFooter>
  </DialogContent>
</Dialog>
```

#### InputForm Fields

- Field 1: `Nomor Antrian *` — text, auto-uppercase, placeholder `"S-014"`, hint `"Format: S-NNN sesuai tiket Anda"`
- Field 2: `NIK (verifikasi)` — numeric, maxLength 16

Submit disabled jika queueNumber kosong.

#### ResultDisplay Layout

- Mini callup gradient dark green dengan queue number huge + nomorPerkara line
- 4-row confirm grid: Posisi, Estimasi Panggilan, Ruang Sidang, Agenda

#### API Integration

Frontend memanggil endpoint baru `/public/queue/status-by-number/:queueNumber`. Bila belum siap, fallback ke search lokal dari `schedules` cache atau toast `"Fitur sedang dipersiapkan"`.

### 4.3 Wiring di QueueStatus

```tsx
const [showCekStatus, setShowCekStatus] = useState(false)

<button onClick={() => setShowCekStatus(true)}>Cek Status Saya</button>
<CekStatusDialog open={showCekStatus} onOpenChange={setShowCekStatus} />
```

Hapus `handleCheckStatus` lama yang panggil `toast.info`.

---

## 5. Batch 4 — Booking Wizard

### 5.1 Stepper — Pill-Based Design

**File:** `components/features/booking-wizard/form-progress.tsx` (refactor)

#### Layout

```
[✓ Langkah 1 — Validasi] [● 2 Langkah 2 — Pilih Slot] [3 Langkah 3 — Konfirmasi] [4 Langkah 4 — Tiket]
```

#### Component Spec

```tsx
interface FormProgressProps {
  currentStep: 1 | 2 | 3 | 4
}

const STEPS = [
  { n: 1, label: 'Validasi' },
  { n: 2, label: 'Pilih Slot' },
  { n: 3, label: 'Konfirmasi' },
  { n: 4, label: 'Tiket' },
]
```

State styling:
- `isDone`: border-success bg-success/10 text-success
- `isActive`: border-primary bg-primary text-primary-foreground shadow-sm
- `pending`: border-border bg-muted/30 text-muted-foreground

Icon dalam pill: 5×5 lingkaran dengan number (atau ✓ untuk done).

Animasi: `transition-all duration-300` (smooth, no framer-motion).

### 5.2 Step 1 — Validate

**File:** `components/features/booking-wizard/step-validate.tsx`

#### Field Layout

```
[Nomor Perkara *]    [NIK Pemohon *]
[Nama Lengkap *]     [No. WhatsApp/Telp]
```

#### Schema Update

```typescript
const step1Schema = z.object({
  nomor_perkara: z.string().regex(/^\d+\/[A-Za-z.]+\/\d{4}\/PA\.[A-Za-z]+$/,
    'Format nomor perkara tidak sesuai'),
  nik: z.string().length(16, 'NIK harus 16 digit'),
  nama: z.string().min(1, 'Nama wajib diisi'),                    // NEW
  telepon: z.string().optional()                                  // NEW optional
    .refine(v => !v || /^08\d{8,12}$/.test(v), 'Format telepon tidak valid'),
})
```

#### Pre-fill Strategy (Cross-Check dengan SIPP)

Field Nama dan Telepon **bukan obsolete** — design memakainya sebagai layer cross-check (`nama`) dan notification preference (`telepon`):

1. User isi 4 field manual
2. Submit → `validatePerkara({ nomor_perkara, nik })`
3. Response valid → compare `response.data.pihak_nama` dengan `form.nama`
4. Mismatch → toast warning + confirm dialog: `"Nama yang Anda isi berbeda dengan data SIPP: '${response.data.pihak_nama}'. Lanjutkan?"`
5. Match → lanjut step 2
6. Telepon disimpan di context untuk ditampilkan di Step 3 dan Step 4 (notifikasi label)

#### Alert Info

> Masukkan **nomor perkara** sesuai dokumen panggilan sidang dan **NIK** 16 digit yang terdaftar sebagai pihak. Data Anda hanya dipakai untuk verifikasi dan tidak disimpan.

#### Footer Button

- `Batal` (ghost) → close
- `Verifikasi & Lanjut →` (primary) → submit, disabled saat loading

### 5.3 Step 2 — Slot Selection

**File:** `components/features/booking-wizard/step-slot.tsx`

#### Alert Info

> Pilih slot waktu kedatangan Anda. Tiap slot menampung **8 antrian**. Datanglah 15 menit sebelum slot dimulai untuk registrasi ulang.

#### Date Kicker

```tsx
<p className="font-mono text-[.75rem] uppercase tracking-[.14em] opacity-65 mb-4">
  [ Slot tersedia · {formatDate(tanggal)} ]
</p>
```

Helper `formatDate('2026-05-23')` → `"Senin, 23 Mei 2026"` (di `lib/utils.ts`).

#### Slot Card

States:
- **Available**: border-border, hover border-primary/40, cursor-pointer
- **Selected**: border-primary bg-primary/5 ring-2 ring-primary/20
- **Full**: border-border/50 bg-muted/30 opacity-50 cursor-not-allowed

Content:
- Time: `font-mono text-lg font-bold`
- Capacity: `"{available} dari {capacity} tersedia"` atau badge `"Penuh"` (destructive)
- Progress bar: 1px height, width `{(booked/capacity)*100}%`

### 5.4 Step 3 — Confirm

**File:** `components/features/booking-wizard/step-confirm.tsx`

#### 8-Row Review Grid

| Label | Value Source |
|---|---|
| Nomor Perkara | `form.nomor_perkara` |
| Jenis Perkara | `validateResponse.data.jadwal.perkara.jenis_perkara_nama` |
| Nama Pemohon | `form.nama` |
| NIK | `form.nik.replace(/(\d{4})(?=\d)/g, '$1 ')` |
| Waktu Kedatangan | `selectedSlot.time + ' WITA'` |
| Estimasi Antrian | `"Posisi ke-${slot.booked + 1} dari ${slot.capacity}"` (estimasi) |
| Notifikasi | `form.telepon ? \`WhatsApp · ${form.telepon}\` : 'Tidak ada'` |
| Tanggal Sidang | `formatDate(jadwal.waktu)` |

🔴 Posisi exact butuh backend extension. Sementara: estimasi dari `slot.booked + 1`, label tambah `(estimasi)`.

#### ConfirmRow Component

```tsx
function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-border last:border-0">
      <span className="text-[.78rem] font-mono uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-[.92rem] font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}
```

#### Race Condition Re-check

KEEP existing logic (re-check slot tiap 30 detik). Tambah visual indicator small: `🔄 Slot masih tersedia`.

### 5.5 Step 4 — Ticket

**File:** `components/features/booking-wizard/step-ticket.tsx`

#### Layout 2-Column

```tsx
<div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] overflow-hidden rounded-2xl border">
  {/* Main: callup-gradient dark green */}
  <div className="callup-gradient text-white p-8">
    <span>Antrian Sidang · {institutionName}</span>
    <div className="text-gradient-gold text-[clamp(56px,9vw,110px)]">
      {queueNumber}
    </div>
    <TicketRow label="Atas Nama" value={form.nama} onDark />
    <TicketRow label="Nomor Perkara" value={form.nomor_perkara} onDark />
    <div>
      <Button>Salin Nomor</Button>
      <Button>Cetak Tiket</Button>
    </div>
  </div>
  
  {/* Side: gold-soft bg */}
  <div className="bg-[var(--gold-soft)] p-8">
    <TicketRow label="Tanggal · Waktu" value={...} />
    <TicketRow label="Estimasi Mulai" value={`±${slot.time} – ${addMin(slot.time, 30)} WITA`} />
    <TicketRow label="Ruang" value={ruang || "Akan diumumkan saat panggilan"} />
    
    {/* Real QR — KEEP existing qrcode.react */}
    <QRCodeSVG value={qrPayload} size={140} level="M" />
  </div>
</div>

<p className="text-center font-mono text-[.75rem] mt-5 opacity-55">
  Notifikasi WhatsApp akan dikirim ke {form.telepon || '(tidak terdaftar)'} 
  30 menit sebelum panggilan.
</p>
```

#### Helper Baru

`lib/utils.ts`:
```typescript
export function addMin(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`
}
```

#### Footer Buttons

KEEP improvements existing:
- `Cek Status Antrian` (ghost) — link ke CekStatusDialog dengan queueNumber pre-filled
- `Booking Lagi` (ghost) — reset wizard
- `Cetak Tiket` (primary)

### 5.6 Modal Container — Optional Kicker

Skip kicker `/public/queue/book` di header — fun debug-info di prototype, tidak essential untuk production.

---

## 6. Backend Requirements + Testing & Delivery

### 6.1 Backend Requirements

#### Endpoint Baru #1: Current Call

```http
GET /public/queue/current-call
```

Response shape:
```typescript
{
  data: {
    current: CurrentCall | null
    next: NextCall | null
    waiting_count: number
    done_count: number
  }
  error: string | null
}

interface CurrentCall {
  queue_number: string        // "S-014"
  pihak_nama: string
  lawan_nama: string | null
  nomor_perkara: string
  jenis_perkara: string
  ruang_sidang: string
  agenda: string
  jam_mulai: string
  started_at: string | null   // ISO datetime
}

interface NextCall {
  queue_number: string
  ruang_sidang: string
  jam_mulai: string
  agenda: string
}
```

**No active call:** Return `current: null, next: null` (bukan HTTP 404).

**Polling:** Frontend poll tiap 30 detik.

#### Endpoint Baru #2: Status by Queue Number

```http
GET /public/queue/status-by-number/:queue_number
```

Path param: `queue_number` URL-encoded (e.g., `S-014`)
Optional query: `?nik={16digit}`

Response 200:
```typescript
{
  data: {
    queue_number: string
    status: QueueStatus
    position: number             // 0 = next, n = n antrian lagi
    estimated_minutes: number
    pihak_nama: string
    nomor_perkara: string
    jenis_perkara: string
    ruang_sidang: string | null
    agenda: string
  }
  error: string | null
}
```

Response 404:
```typescript
{ data: null, error: "Nomor antrian tidak ditemukan" }
```

#### Extension #1: JadwalSidang dengan Queue Info

Tambah field di response `/public/queue/schedule`:

```typescript
interface JadwalSidang {
  // ... existing ...
  queue_number: string | null    // NEW "S-014" atau null
  queue_status: QueueStatus | null  // NEW status tiket
}
```

#### Extension #2: ValidateResponse dengan Position Hint

Tambah field di `ValidateResponse.data`:

```typescript
{
  // ... existing ...
  slot_position_hint?: {
    slot_time: string
    expected_position: number
    slot_capacity: number
  } | null
}
```

### 6.2 Frontend Fallback Pattern

```typescript
async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    return await api.get<T>(url)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      console.warn(`[backend-pending] ${url} not yet available`)
      return fallback
    }
    throw e
  }
}
```

Visual placeholders per case:
- Queue Status no API → `"—"` + `"Belum ada panggilan aktif"`
- Schedule no queue_number → `"—"` (text-muted-foreground/40)
- Step 3 no position_hint → estimasi dari `slot.booked + 1`, label tambah `(estimasi)`

### 6.3 Testing Strategy

#### Unit Tests Coverage Target

| Batch | New/Updated Tests | Approx Count |
|---|---|---|
| 1 — Static | hero-section, panduan, footer-cta, footer | 8-10 |
| 2 — Schedule | schedule-table, parseParaPihak | 6-8 |
| 3 — Queue/Cek | cek-status-dialog, use-current-call, queue-status | 10-12 |
| 4 — Wizard | form-progress, step-1/2/3/4 | 15-18 |
| **Total** | | **~45** |

#### Test Pattern Wajib

1. **RED first** — fail test sebelum implementasi
2. **Mocking** — `vi.mock()` untuk service layer
3. **Provider wrap** — `BookingModalProvider` saat test Step components
4. **Accessibility** — `getByRole('button', { name: /pattern/i })`
5. **No snapshot tests**

#### Manual Visual Verification Checklist

Per batch setelah `pnpm dev`:
- [ ] Light mode visual match design
- [ ] Dark mode functional dan readable
- [ ] Mobile breakpoint 375px — no overflow
- [ ] Tablet breakpoint 768px — grid transition smooth
- [ ] Hydration: no console error
- [ ] Animations: smooth, no jank

#### Integration Test (Manual E2E)

Scenario setelah Batch 4:
1. Homepage → click `"Daftar Antrian Sekarang"`
2. Step 1: input valid → submit → Step 2
3. Step 2: pilih slot → submit → Step 3
4. Step 3: verify 8 rows render → submit
5. Step 4: tiket render, QR valid, copy/print work
6. Click `"Cek Status Saya"` di QueueStatus → dialog open → input dari Step 4 → result render

### 6.4 Delivery Strategy

#### Batch Execution Order

```
Batch 1 (Static) ──┐
                   ├─ Independent
Batch 2 (Schedule) ┘
                                
Batch 3 (Queue+Cek) ── Establishes dialog + hook patterns
                                
Batch 4 (Wizard) ────── Uses dialog wrapper, ConfirmRow utility
```

Sequence rekomendasi: **1 → 2 → 3 → 4** (sequential, per-batch commit dengan checkpoint).

#### Per-Batch Checkpoint

Setiap batch selesai dengan:
1. All new tests passing (`pnpm test`)
2. No regressions di existing tests
3. Lint clean (`pnpm lint`)
4. Manual visual check selesai
5. Commit: `feat(design-parity): batch N - [name]`
6. **Pause for user review** sebelum lanjut

#### Effort Estimate

| Batch | Files Modified | Files Created | Estimated Time |
|---|---|---|---|
| 1 — Static | 4 (+globals.css) | 0 | ~3-4h |
| 2 — Schedule | 1 | 0 | ~2-3h |
| 3 — Queue/Cek | 1 | 2 | ~4-5h |
| 4 — Wizard | 5-6 | 0 | ~5-6h |
| **Total** | **11-12** | **2** | **~14-18h** |

Plus backend coordination: ~2h

#### Definition of Done

- [ ] Semua 4 batch merged
- [ ] All test suite green (existing + new)
- [ ] Visual review approved by user
- [ ] Backend requirements doc shared
- [ ] Commit history clear per batch
- [ ] Dark mode + responsive functional di semua section

---

## 7. Open Questions & Preservation Notes

### 7.1 Open Question — Footer Layout Direction

**Issue:** Q2 (Pertahankan semua improvements) explicitly mencantumkan footer existing sebagai improvement (3-col elaborate dengan logo, alamat, jam detail per hari). Q3 (Pixel-perfect) mengarahkan ke design 4-col compact.

**Recommendation:** Klarifikasi saat spec review. 3 opsi:

- **Opsi A** — Strict pixel-perfect (current spec) → refactor ke 4-col compact, hapus copyright/logo/alamat
- **Opsi B** — Keep existing improvement → batalkan Section 2.4, footer stay 3-col elaborate
- **Opsi C** — Hybrid → Tambahkan 4-col compact row di atas existing 3-col detail (best of both, paling panjang vertically)

**Resolution akan menentukan apakah Section 2.4 valid atau di-discard.**

### 7.2 Improvements Existing yang Harus Dipertahankan

Section ini explicit untuk menghindari penghapusan tidak sengaja saat implementasi:

| Komponen / Feature | File | Rationale Preservation |
|---|---|---|
| **Dark mode toggle** | `components/layout/header.tsx` | UX value-add, tidak konflik dengan design |
| **Real QR code** (qrcode.react) | `components/features/booking-wizard/step-ticket.tsx` | Production necessity (scannable QR), bukan dekoratif |
| **FloatingActionButton** | `components/features/floating-action-button.tsx` | Mobile UX entrypoint, tidak di design tapi tidak konflik |
| **ExistingQueueCard** | `components/features/booking-wizard/` | Multi-pihak flow, business requirement |
| **RescheduleDialog API integration** | `components/features/reschedule-dialog.tsx` | Lebih lengkap dari design (real API call vs mock) |
| **Race condition re-check Step 3** | step-confirm.tsx | Production safety mechanism |
| **Search-by-perkara endpoint** | `getQueueStatus(nomorPerkara)` | Backwards compat, mungkin dipakai oleh API consumer lain |

### 7.3 Test File Path Convention

Spec menyebut nama test seperti `cek-status-dialog.test.tsx`. Path lengkap mengikuti pattern existing project:
- Component tests: `components/features/__tests__/<name>.test.tsx`
- Hook tests: `lib/__tests__/<name>.test.tsx`
- Lib tests: `lib/__tests__/<name>.test.ts`

### 7.4 Backend Coordination Timing

Frontend tidak boleh blocking pada backend readiness. Sequence yang direkomendasikan:

1. Setelah spec approved, **share Section 6.1 ke backend team segera** (async, parallel kerja)
2. Frontend mulai Batch 1 + 2 (zero backend dependency)
3. Batch 3 dimulai dengan pattern fallback (`fetchWithFallback`) — bekerja dengan atau tanpa endpoint baru
4. Batch 4 dimulai independent dari backend status
5. Switch dari fallback ke real API setelah backend ready (1-2 line code change per endpoint)

---

## Lampiran: Design Token Reference

### Color Tokens (sudah ada)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#15803d` | Brand green |
| `--gold` | `#b8860b` | Accent gold (badges, decorative) |
| `--accent` | `#ea580c` | Orange CTA |
| `--success` | `#16a34a` | Success states |
| `--background` | `#fbfaf6` | Page background |
| `--foreground` | `#1a2e22` | Primary text |
| `--muted-foreground` | `#6b7568` | Secondary text |
| `--border` | `#e8e3d3` | Borders |
| `--gold-soft` | `#fbf3df` | Soft gold surface (tiket side) |

### Color Tokens (perlu ditambah)

| Token | Value | Usage |
|---|---|---|
| `--primary-3` | `#0f5f2e` | Deep green gradient |
| `--primary-soft` | `#e7f4ec` | Soft green surface |
| `--fg-2` | `#3e5145` | Second-level foreground |
| `--fg-4` | `#9aa49a` | Decorative meta text |
| `--gold-3` | `#f4d27a` | Light gold variant |

### Radius & Shadow (sudah lengkap)

`--radius-sm/md/lg/xl/2xl`, `--sh-sm/sh/sh-md/lg/xl`, `--ease`

---

**Status:** Approved, ready for `writing-plans` skill to break into micro-tasks.
