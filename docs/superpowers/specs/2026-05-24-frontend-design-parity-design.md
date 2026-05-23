# Frontend Design Parity — Design Specification

**Date:** 2026-05-24
**Revision:** v2 (post-review round 2, footer Opsi C applied, 20+ CSS detail findings)
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

### 2.1 Hero Section — Stats Delta Text + Tag Badges + Dark Variant

**File:** `components/features/hero-section.tsx`

#### A. Stat Label Tag Badges (NEW finding)

Setiap stat card punya **tag badge** kecil di area label (flex justify-between dengan stat title):

| Stat | Title | Tag Badge |
|---|---|---|
| Card 1 | Antrian Terdaftar | `HARI INI` |
| Card 2 | Sidang Hari Ini | `SIPP` |
| Card 3 | Tingkat Kehadiran | `30 HARI` |

Tag styling: `font-mono text-[.62rem] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground`. Card 3 (dark variant): `bg-gold/18 text-gold-3 border border-white`.

#### B. Card 3 Dark Variant

Card "Tingkat Kehadiran" pakai `.as-stat.dark` styling:
- Background: `bg-gradient-to-br from-[var(--primary-3)] via-[#0a4e25] to-[#062f17]`
- Number: gold gradient text `bg-gradient-to-b from-white to-[var(--gold-3)] bg-clip-text text-transparent`
- Ambient overlay: radial gradient gold + accent (pseudo `::before` atau div absolute)
- Label color: `text-white/65`
- Delta color: `text-white/65`

#### C. Stats Delta Text Update

| Stat | Before | After |
|---|---|---|
| Antrian Terdaftar | `"Data SIPP hari ini"` | `"↑ 12% vs kemarin · ${currentTime} WITA"` |
| Sidang Hari Ini | `"Sinkronisasi otomatis tiap 60 detik"` | `"${liveCount} sedang berlangsung · ${doneCount} selesai"` |
| Tingkat Kehadiran | `"Peningkatan vs bulan lalu"` | `"▲ 4.2% improvement · ${attended}/${total} hadir"` |

**Data source:** Reuse `getTodaySchedule()` + `calculateQueueStatistics()`. `currentTime` dari `Date.now()` formatted ke `HH:MM` WITA.

**Fallback:** Bila data 0/null, gunakan text statis lama (hindari `"NaN sedang berlangsung"`).

#### D. Hero Meta — Today Date (NEW finding)

Tambah item meta terakhir dengan `marginLeft: auto` (pushed right) yang menampilkan tanggal hari ini:

```tsx
<span className="ml-auto inline-flex items-center px-3.5 py-1.5 bg-muted rounded-full border border-border font-mono text-[.75rem]">
  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
</span>
```

#### E. Feature Cards — Alternating Icon Colors (NEW finding)

Icon badge di setiap feature card pakai warna bergantian (sudah seperti design `.as-letter:nth-child(N)`):

- Card 1: primary green / primary-soft bg
- Card 2: gold `#92580a` / gold-soft bg
- Card 3: accent `#9a3412` / accent-soft bg
- Card 4: primary green / primary-soft bg

Verifikasi current implementation — bila masih monochrome, tambahkan alternasi.

#### F. Hero H1 Gradient Text (NEW finding)

H1 pakai gradient text fg → primary:
```css
background: linear-gradient(180deg, var(--fg) 0%, color-mix(in oklab, var(--fg) 55%, var(--primary)) 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

Sebagai Tailwind: `bg-gradient-to-b from-foreground to-[color-mix(in_oklab,var(--foreground)_55%,var(--primary))] bg-clip-text text-transparent`.

### 2.2 Panduan Section — Header + Step Numbering

**File:** `components/features/panduan-section.tsx`

#### Perubahan struktural:

1. **Section header** → 2-column grid:
   - Kiri: kicker pill `"Empat langkah · ±2 menit"` + heading `"Cara mendaftar antrian"` (bukan `"Panduan Pendaftaran"`)
   - Kanan: button `"Mulai Daftar →"` (primary, large)

2. **Step card badge** → ganti text dekoratif ke **box 42×42px** dengan **mono number "01" font-size 1.5rem semibold**. Background soft tint, color tinted text, border 1px tinted:

   | Step | Number Color | Background | Border |
   |---|---|---|---|
   | 01 | `var(--primary-3)` | `var(--primary-soft)` | `color-mix(primary 18%, transparent)` |
   | 02 | `#92580a` | `var(--gold-soft)` | `color-mix(gold-2 30%, transparent)` |
   | 03 | `#9a3412` | `var(--accent-soft)` | `color-mix(accent 25%, transparent)` |
   | 04 | `var(--gold)` | `var(--gold-soft)` | `color-mix(gold-2 30%, transparent)` |

   Render: `<span class="inline-grid place-items-center w-[42px] h-[42px] rounded-[10px] border font-mono text-[1.5rem] font-semibold leading-none">01</span>` dengan styling per nth-child.

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

### 2.4 Footer Bar — Hybrid Layout (Opsi C, RESOLVED)

**File:** `components/layout/footer.tsx`

**Decision:** Opsi C (Hybrid) — kombinasi compact row design di atas + detail row existing di bawah, dipisah border-top yang halus.

#### Struktur

```
┌────────────────────────────────────────────────────────────┐
│ COMPACT ROW (design-style, grid 1.4fr 1fr 1fr 1fr)         │
│ [Instansi] [Jam Op] [Sistem] [Kontak]                       │
├────────────────────────────────────────────────────────────┤
│ DETAIL ROW (existing, grid 3-col responsive)                │
│ ┌─Logo+Deskripsi─┐ ┌──Kontak detail──┐ ┌──Jam detail──┐    │
│ │ [PA] PA Penajam │ │ ☎ (0542)…       │ │ Sen-Kam ...   │    │
│ │ Layanan digital │ │ ✉ admin@…       │ │ Jum 08-17     │    │
│ │ ...             │ │ 📍 Jl. …         │ │               │    │
│ └─────────────────┘ └─────────────────┘ └────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ COPYRIGHT BAR (existing)                                    │
│ © 2026 PA Penajam · v0.1.0                                  │
└────────────────────────────────────────────────────────────┘
```

#### A. Compact Row (NEW — top section)

Sesuai design `.as-footer` (CSS line 918-947):

- Grid `1.4fr 1fr 1fr 1fr` (kolom Instansi lebih lebar)
- Background `bg-card` (var(--bg-elev))
- Border 1px, rounded `var(--r-xl)`, shadow-sm
- Each cell: `padding: 1.25rem 1.5rem`, `border-right: 1px solid var(--border)` (last no border)
- **Mobile breakpoint < 900px**: 2-col grid, switch ke `border-bottom` separator

| Cell | Label | Value |
|---|---|---|
| 1 | `Instansi` | `useAppSettings().institution.name` |
| 2 | `Jam Operasional` | `Sen — Jum · 08:00 — 16:00 WITA` |
| 3 | `Sistem` | `v0.1.0 · MVP · Live` |
| 4 | `Kontak` | `useAppSettings().institution.phone` |

Label styling: `text-[.68rem] uppercase tracking-[.04em] font-medium text-muted-foreground mb-1`
Value styling: `text-[.88rem] font-medium text-foreground`

#### B. Detail Row (EXISTING — preserved)

Pertahankan layout 3-column existing dengan logo+deskripsi, kontak detail (phone/email/alamat), jam detail per hari (Sen-Kam, Jum). Ini SPBE compliance — alamat lengkap diperlukan.

Tambah top margin/border untuk pemisah visual dari compact row:
```tsx
<div className="mt-6 pt-6 border-t border-border/40">
  {/* existing 3-col detail */}
</div>
```

#### C. Copyright Bar (EXISTING — preserved)

Tetap di bawah, tidak ada perubahan.

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

### 3.5 Desktop Row Layout (UPDATED with CSS detail)

```tsx
<div className="hidden md:grid grid-cols-[76px_1.4fr_1.3fr_96px_1.2fr_96px_130px]">
  {/* Antrian — PILL bg-muted mono semibold 0.85rem */}
  <div className="px-3 py-3.5 flex items-center">
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted font-mono font-semibold text-[.85rem] whitespace-nowrap">
      {queueNumber || '—'}
    </span>
  </div>
  
  {/* Perkara — caseNumber 0.85rem medium + jenis 0.7rem NOT uppercase */}
  <div className="px-3 py-3.5">
    <div className="text-[.85rem] font-medium text-foreground truncate">{caseNumber}</div>
    <div className="text-[.7rem] text-muted-foreground mt-0.5">{caseType}</div>
  </div>
  
  {/* Para Pihak — 0.85rem medium + small lawan 0.75rem */}
  <div className="px-3 py-3.5">
    <div className="text-[.85rem] font-medium truncate">{partyName}</div>
    {opposingParty && (
      <small className="block text-[.75rem] text-muted-foreground mt-0.5">vs. {opposingParty}</small>
    )}
  </div>
  
  {/* Waktu — mono semibold 1rem + WITA uppercase 0.68rem */}
  <div className="px-3 py-3.5">
    <div className="font-mono font-semibold text-[1rem]">{time}</div>
    <small className="block text-[.68rem] uppercase tracking-[.04em] text-muted-foreground/60 mt-0.5">WITA</small>
  </div>
  
  {/* Agenda — 0.88rem fg-2 line-height 1.35 */}
  <div className="px-3 py-3.5 text-[.88rem] text-foreground/80 leading-[1.35]">{agenda}</div>
  
  {/* Ruangan — 0.88rem medium */}
  <div className="px-3 py-3.5 text-[.88rem] font-medium">{room}</div>
  
  {/* Status — badge with pip + label */}
  <div className="px-3 py-3.5 flex items-center justify-end">
    <StatusBadge status={status} />
  </div>
</div>
```

#### Status Badge Component

```tsx
function StatusBadge({ status }: { status: ScheduleStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[.72rem] font-medium",
      config.className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.pipClass, status === 'in_progress' && "animate-as-pulse")} />
      {config.label}
    </span>
  )
}
```

Status mapping (sesuai design `STATUS_LABEL` di data.jsx):
- `in_progress` → `"Sedang Berlangsung"` (bukan "Berlangsung") + accent-soft bg + accent border + pip accent
- `completed` → `"Selesai"` + bg-muted + muted-foreground + pip fg-4
- `scheduled` → `"Terjadwal"` + primary-soft + primary border + pip primary
- `postponed` → `"Ditunda"` + gold-soft + gold-2 border + pip gold-2

#### Row "is-active" State (NEW finding)

Row dengan status `in_progress` punya **gradient bg + left stripe**:

```tsx
<div className={cn(
  "relative hover:bg-muted/50 transition-colors border-t border-border",
  isLive && "bg-gradient-to-r from-accent/10 to-transparent",
)}>
  {isLive && (
    <span className="absolute left-0 top-[10%] bottom-[10%] w-[3px] bg-accent rounded-r" />
  )}
  {/* ... cells ... */}
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

State styling (UPDATED — done pakai ACCENT orange, bukan success green):
- `isActive`: bg-card text-foreground shadow-sm, lingkaran number bg-primary text-white
- `isDone`: text-foreground/80, lingkaran number **bg-accent text-white** (orange, bukan green!)
- `pending`: text-muted-foreground, lingkaran border-border-strong bg-card text-muted-foreground

Container: grid `repeat(4, 1fr)` di bg-muted, padding 0.65rem, gap 0.5rem.

Pill: padding `.55rem .85rem`, rounded 999px, font-sans 0.8rem font-medium.

Icon dalam pill: lingkaran **22×22 px** (bukan 5×5 dari spec lama) dengan mono number atau ✓ untuk done.

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

#### Slot Card (UPDATED with CSS detail)

Grid container: `grid-cols-4` desktop, `grid-cols-2` mobile (<700px), gap 0.65rem.

States:
- **Available**: `bg-card border-border shadow-sm`, hover `translate-y-[-2px] shadow-md border-border-strong`
- **Selected**: `bg-gradient-to-br from-[var(--primary)] to-[var(--primary-2)] text-white border-primary shadow-md ring-[3px] ring-[var(--primary-ring)] translate-y-[-2px]`
- **Full**: `bg-muted opacity-65 cursor-not-allowed shadow-none`

Content:
- Time: **`font-sans text-[1.15rem] font-semibold tracking-[-.02em]`** (BUKAN mono!)
- Capacity: `"{available} dari {capacity} tersedia"` atau badge `"Penuh"` color `var(--danger)`
- Progress bar: **4px height** (bukan 1px), bg-muted, fill linear-gradient `var(--primary-2) → var(--primary)`. Saat selected: bg white/25 dengan fill white.

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

#### Confirm Grid (REVISED — 2-column grid layout, NOT single column)

Sesuai design `.as-confirm` (CSS line 1216-1240) — grid **2-column dengan border separator** (bukan 1-col 8-row dari spec lama):

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
  {rows.map((row, i) => (
    <ConfirmCell
      key={i}
      label={row.label}
      value={row.value}
      // borders: bottom kecuali 2 row terakhir, right kecuali nth even
      isLastRow={i >= rows.length - 2}
      isRightCol={(i + 1) % 2 === 0}
    />
  ))}
</div>

function ConfirmCell({ label, value, isLastRow, isRightCol }) {
  return (
    <div className={cn(
      "px-4 py-3.5 flex flex-col gap-0.5",
      !isLastRow && "border-b border-border",
      !isRightCol && "border-r border-border sm:border-r",
    )}>
      <span className="text-[.72rem] font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-[.92rem] font-medium text-foreground tracking-[-.005em]">
        {value}
      </span>
    </div>
  )
}
```

**Layout result:** 8 fields → 4 rows × 2 cols, dengan border interior crisp. Label bukan uppercase mono — design pakai sans 0.72rem fg-3 regular. Value sans 0.92rem semibold.

#### Race Condition Re-check

KEEP existing logic (re-check slot tiap 30 detik). Tambah visual indicator small: `🔄 Slot masih tersedia`.

### 5.5 Step 4 — Ticket

**File:** `components/features/booking-wizard/step-ticket.tsx`

#### Layout 2-Column dengan Perforated Effect (UPDATED — round 2)

Sesuai design `.as-ticket-side` (CSS line 1270-1282) — dashed border-left + **circle cutouts** untuk efek tiket sobek.

```tsx
<div className="relative grid grid-cols-1 md:grid-cols-[1.4fr_1fr] overflow-hidden rounded-[var(--radius-xl)] border border-border shadow-md bg-card">
  {/* Main — Dark Green Gradient */}
  <div className="relative p-7 flex flex-col gap-3.5 text-white overflow-hidden bg-gradient-to-br from-[#062f17] via-[var(--primary-3)] to-[var(--primary)]">
    {/* Ambient gold + accent overlay */}
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'radial-gradient(circle at 0% 100%, rgba(212,160,23,.35), transparent 60%), radial-gradient(circle at 100% 0%, rgba(234,88,12,.18), transparent 60%)'
    }} />
    <div className="relative z-10 flex flex-col gap-3.5">
      <span className="font-mono text-[.72rem] text-white/65">
        Antrian Sidang · {institutionName}
      </span>
      <div className="text-[clamp(56px,9vw,110px)] font-bold leading-[.9] tracking-[-.06em] bg-gradient-to-b from-white to-[var(--gold-3)] bg-clip-text text-transparent">
        {queueNumber}
      </div>
      <TicketRow label="Atas Nama" value={form.nama} onDark />
      <TicketRow label="Nomor Perkara" value={form.nomor_perkara} onDark />
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="ghost-on-dark">Salin Nomor</Button>
        <Button size="sm" variant="ghost-on-dark">Cetak Tiket</Button>
      </div>
    </div>
  </div>
  
  {/* Side — Gold soft + DASHED border + CIRCLE CUTOUTS */}
  <div className="relative p-6 flex flex-col gap-3 bg-[var(--gold-soft)] md:border-l md:border-dashed md:border-[var(--border-strong)]">
    {/* Perforated cutouts */}
    <span className="hidden md:block absolute -left-[10px] -top-[10px] w-[18px] h-[18px] rounded-full bg-background" />
    <span className="hidden md:block absolute -left-[10px] -bottom-[10px] w-[18px] h-[18px] rounded-full bg-background" />
    
    <TicketRow label="Tanggal · Waktu" value={`${formatDate(date)} · ${slot.time} WITA`} />
    <TicketRow label="Estimasi Mulai" value={`±${slot.time} – ${addMin(slot.time, 30)} WITA`} />
    <TicketRow label="Ruang" value={ruang || "Akan diumumkan saat panggilan"} />
    
    {/* QR — full width aspect-square, primary-3 dark bg, padding 0.55rem */}
    <div className="mt-auto aspect-square w-full grid place-items-center p-[.55rem] rounded-[var(--radius-md)] bg-[var(--primary-3)] shadow-[inset_0_0_0_1px_var(--border),0_4px_12px_-4px_rgba(15,95,46,.4)]">
      <QRCodeSVG value={qrPayload} size={140} level="M" className="w-full h-full rounded" />
    </div>
  </div>
</div>

<p className="text-center font-mono text-[.75rem] mt-5 opacity-55 tracking-[.06em]">
  Notifikasi WhatsApp akan dikirim ke {form.telepon || '(tidak terdaftar)'} 
  30 menit sebelum panggilan.
</p>
```

#### TicketRow Component

```tsx
function TicketRow({ label, value, onDark }: { label: string; value: string; onDark?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn(
        "text-[.68rem] uppercase tracking-[.04em] font-medium",
        onDark ? "text-white/55" : "text-muted-foreground"
      )}>{label}</span>
      <span className={cn(
        "text-[.88rem] font-medium leading-[1.35]",
        onDark ? "text-white" : "text-foreground"
      )}>{value}</span>
    </div>
  )
}
```

#### Print Styles (NEW finding)

Sesuai design CSS line 1343-1346:
```css
@media print {
  body::before { display: none; }
  /* Hide everything except ticket */
  header, .hero-section, .schedule-table, .queue-status, .panduan-section, .footer-cta, footer {
    display: none !important;
  }
}
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

### 7.1 Resolved — Footer Layout Direction (Opsi C)

**Status:** ✅ Resolved — user pilih **Opsi C (Hybrid)** pada review v1.

Spec Section 2.4 sudah di-update merefleksikan Opsi C: compact 4-col row design di atas + detail 3-col existing di bawah + copyright bar tetap. Implementation menambah border separator di antara compact dan detail row untuk visual clarity.

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

---

## 8. Changelog

### v2 — 2026-05-24 (post-review round 2)

**Trigger:** User request `"opsi C, dan lakukan review ulang design"`.

**Footer resolution:**
- Section 2.4 — apply Opsi C (Hybrid): compact row design + existing detail + copyright
- Section 7.1 — resolved, marked closed

**Round 2 findings (dari deep-read `app.css` + komponen design):**

| # | Section | Finding |
|---|---|---|
| 1 | 2.1 (Hero stats) | Tag badges per card ("HARI INI"/"SIPP"/"30 HARI") — mono 0.62rem pill |
| 2 | 2.1 (Hero stats) | Card 3 dark variant: gradient bg primary-3, gold gradient number, white/65 labels |
| 3 | 2.1 (Hero meta) | Today date item dengan `marginLeft: auto` (pushed right), `toLocaleDateString id-ID` |
| 4 | 2.1 (Hero features) | Icon colors alternating: primary, gold, accent, primary per nth-child |
| 5 | 2.1 (Hero h1) | Gradient text `fg → primary` (background-clip text), bukan solid color |
| 6 | 2.2 (Panduan steps) | Step number BOX 42×42 dengan **mono "01" 1.5rem**, soft tint bg + tinted border per nth |
| 7 | 3.5 (Schedule qn) | Queue number adalah **pill** `bg-muted` mono semibold 0.85rem padding `.2rem .5rem` rounded 6px |
| 8 | 3.5 (Schedule perkara.jenis) | Bukan uppercase mono — sans 0.7rem fg-3 regular |
| 9 | 3.5 (Schedule status) | Label `"Sedang Berlangsung"` (bukan `"Berlangsung"`) sesuai design |
| 10 | 3.5 (Schedule row) | `is-active` row: gradient bg + 3px stripe left accent (pseudo before) |
| 11 | 5.1 (Stepper done) | Done state pakai **accent orange** (`var(--accent)`), bukan success green |
| 12 | 5.1 (Stepper container) | Grid `bg-muted` padding 0.65rem, pill rounded 999px, lingkaran 22×22 |
| 13 | 5.3 (Slot time) | Font **sans** 1.15rem semibold, bukan mono |
| 14 | 5.3 (Slot selected) | Background gradient primary, ring 3px primary-ring, text white |
| 15 | 5.3 (Slot progress bar) | 4px height, gradient primary-2 → primary fill |
| 16 | 5.4 (Confirm grid) | **2-column grid** (8 fields = 4 rows × 2 cols), bukan single-col 8-row |
| 17 | 5.4 (Confirm label) | Sans 0.72rem fg-3 regular, bukan uppercase mono |
| 18 | 5.5 (Ticket side) | **Dashed border-left** + **circle cutouts** top/bottom (perforated effect) |
| 19 | 5.5 (Ticket QR) | Full-width aspect-square, dark primary-3 bg, padding 0.55rem, green ring shadow |
| 20 | 5.5 (Print) | `@media print` hide semua kecuali tiket — design supports print |

**Font correction:**
- CLAUDE.md mention "Outfit + Plus Jakarta Sans" outdated. Implementation already uses **Geist + Geist Mono** via `geist/font`. No change needed.

**Removed assumptions:**
- Screenshot `home.png` ternyata stale — diabaikan, JSX + CSS adalah source of truth

### v1 — 2026-05-24 (initial brainstorming)

Initial spec dengan 6 section utama + Open Questions section.

---

**Status:** v2 approved, ready for `writing-plans` skill to break into micro-tasks.
