# Frontend Design Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyelesaikan semua gap antara design reference (`docs/design-antrian/`) dan implementasi frontend Next.js dengan pixel-perfect match, sambil mempertahankan semua improvements existing (dark mode, real QR, FAB, ExistingQueueCard, reschedule API).

**Architecture:** Refactor 11-12 file existing + create 2 file baru (CekStatusDialog, useCurrentCall hook). Styling pakai Tailwind utility inline (existing pattern), tambah 5 design token baru di `globals.css`. Batched delivery dalam 4 phase dengan checkpoint per phase.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui (radix-vega), Vitest + @testing-library, @tanstack/react-form + Zod, Framer Motion, qrcode.react, Sonner.

**Source spec:** `docs/superpowers/specs/2026-05-24-frontend-design-parity-design.md` (v2)

---

## File Structure

### Files Created (3)

| Path | Responsibility |
|---|---|
| `components/features/cek-status-dialog.tsx` | Modal untuk cek status antrian by queue number |
| `lib/hooks/use-current-call.ts` | Hook fetch + polling current call data |
| `components/features/__tests__/cek-status-dialog.test.tsx` | Tests untuk CekStatusDialog |

### Files Modified (13)

| Path | Phase | Changes |
|---|---|---|
| `app/globals.css` | Setup | 5 design token baru + as-fade keyframe + print styles |
| `lib/utils.ts` | Setup | Tambah `addMin()` + `formatDate()` helpers |
| `components/features/hero-section.tsx` | 1 | Stats tag badges, dark card variant, today date, h1 gradient, feature icon colors, delta text |
| `components/features/panduan-section.tsx` | 1 | Section header dengan kicker+ctrls, step number box mono, footer line |
| `components/features/footer-cta.tsx` | 1 | Pre-kicker, heading 2-line gradient, ghost button "Pelajari Selengkapnya" |
| `components/layout/footer.tsx` | 1 | Hybrid Opsi C: compact 4-col row di atas + detail 3-col existing |
| `components/features/schedule-table.tsx` | 2 | 7-col grid, queue number pill, status badge pip, kicker, sync chip, filter count |
| `components/features/queue-status.tsx` | 3 | Live case main column + 3-cell side + empty state, wire CekStatusDialog |
| `components/features/form-progress.tsx` | 4 | Pill stepper dengan ACCENT done state, 22×22 number circle |
| `components/features/booking-wizard/step-validate.tsx` | 4 | Tambah field nama + telepon, alert info, SIPP cross-check |
| `components/features/booking-wizard/step-select-slot.tsx` | 4 | Alert info, date kicker, slot card font-sans, gradient selected |
| `components/features/booking-wizard/step-confirm.tsx` | 4 | 2-column grid 8-field review |
| `components/features/booking-wizard/step-ticket.tsx` | 4 | 2-col perforated layout (dashed + cutouts), QR primary-3 bg |

### Test Files (5 new/updated)

| Path | Status |
|---|---|
| `lib/__tests__/utils.test.ts` | New — tests untuk `addMin`, `formatDate` |
| `lib/__tests__/parse-para-pihak.test.ts` | New — tests untuk parser |
| `lib/hooks/__tests__/use-current-call.test.ts` | New |
| `components/features/__tests__/cek-status-dialog.test.tsx` | New |
| `components/features/__tests__/queue-status.test.tsx` | Updated — assert live case data |
| `components/features/__tests__/schedule-table.test.tsx` | Updated — assert 7-col |
| `components/features/booking-wizard/__tests__/step-*.test.tsx` | Updated |

---

## Phase 0: Setup (Pre-requisite)

### Task 0.1: Add Design Tokens to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Read current globals.css to find `:root` block**

```bash
grep -n "^:root\|^@theme" app/globals.css | head -10
```

- [ ] **Step 2: Add 5 new design tokens inside `:root` block**

Tambahkan setelah baris terakhir custom property di `:root`:

```css
  /* Design parity tokens (round 2 findings) */
  --primary-3: #0f5f2e;
  --primary-soft: #e7f4ec;
  --fg-2: #3e5145;
  --fg-4: #9aa49a;
  --gold-3: #f4d27a;
```

- [ ] **Step 3: Add `as-fade` keyframe (for modal backdrop)**

Cari area `@keyframes` di file, tambahkan:

```css
@keyframes as-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

- [ ] **Step 4: Add print styles at end of file**

```css
@media print {
  body::before { display: none; }
  header,
  [data-section="hero"],
  [data-section="schedule"],
  [data-section="queue-status"],
  [data-section="panduan"],
  [data-section="footer-cta"],
  footer {
    display: none !important;
  }
}
```

- [ ] **Step 5: Verify no lint errors**

```bash
pnpm lint
```

Expected: no error pada `app/globals.css`.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "feat(design-parity): add design tokens, as-fade keyframe, print styles"
```

---

### Task 0.2: Add Utility Helpers (addMin, formatDate)

**Files:**
- Modify: `lib/utils.ts`
- Test: `lib/__tests__/utils.test.ts` (new)

- [ ] **Step 1: Write failing tests**

File: `lib/__tests__/utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { addMin, formatDate } from '@/lib/utils'

describe('addMin', () => {
  it('adds minutes to HH:MM time', () => {
    expect(addMin('10:00', 30)).toBe('10:30')
    expect(addMin('09:30', 60)).toBe('10:30')
    expect(addMin('23:30', 30)).toBe('24:00')
  })

  it('returns empty string for falsy input', () => {
    expect(addMin('', 30)).toBe('')
  })

  it('handles single-digit hours/minutes', () => {
    expect(addMin('08:05', 7)).toBe('08:12')
  })
})

describe('formatDate', () => {
  it('formats ISO date to Indonesian long format', () => {
    const result = formatDate('2026-05-23')
    expect(result).toBe('Sabtu, 23 Mei 2026')
  })

  it('formats datetime string correctly', () => {
    const result = formatDate('2026-05-23T10:00:00')
    expect(result).toBe('Sabtu, 23 Mei 2026')
  })

  it('returns empty string for invalid date', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate('invalid')).toBe('')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- lib/__tests__/utils.test.ts --run
```

Expected: FAIL — `addMin is not a function`, `formatDate is not a function`.

- [ ] **Step 3: Implement helpers in `lib/utils.ts`**

Tambahkan di akhir file (setelah `cn` function existing):

```typescript
/**
 * Tambah menit ke string waktu format HH:MM.
 * Mengembalikan string kosong jika input falsy.
 */
export function addMin(hhmm: string, mins: number): string {
  if (!hhmm) return ""
  const [h, m] = hhmm.split(":").map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

/**
 * Format tanggal ISO string ke format panjang Indonesia.
 * Contoh: "2026-05-23" → "Sabtu, 23 Mei 2026"
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- lib/__tests__/utils.test.ts --run
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/utils.ts lib/__tests__/utils.test.ts
git commit -m "feat(design-parity): add addMin and formatDate utility helpers"
```

---

## Phase 1: Batch 1 — Static Content & Copy Polish

### Task 1.1: Hero Section — Stats Tag Badges + Dark Variant

**Files:**
- Modify: `components/features/hero-section.tsx`
- Test: `components/features/__tests__/hero-section.test.tsx` (verify existing or create)

- [ ] **Step 1: Check if test file exists**

```bash
ls components/features/__tests__/hero-section.test.tsx 2>&1
```

If not exists, create with skeleton (Step 2). If exists, add tests to it.

- [ ] **Step 2: Write failing tests for tag badges + dark variant**

File: `components/features/__tests__/hero-section.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/features/hero-section'

vi.mock('@/lib/queue-service', () => ({
  getTodaySchedule: vi.fn().mockResolvedValue({ data: [], error: null }),
  calculateQueueStatistics: vi.fn().mockReturnValue({
    currentNumber: 0, waitingCount: 0, processedToday: 0, lastUpdated: '-'
  }),
}))

vi.mock('@/contexts/app-settings-context', () => ({
  useAppSettings: () => ({
    institution: { name: 'Pengadilan Agama Penajam', short_name: 'PA Penajam' },
    app: { name: 'Antrian Sidang', short_name: 'AS', description: 'Layanan...' }
  })
}))

describe('HeroSection — Stats Tag Badges', () => {
  it('renders tag badge "HARI INI" pada stat card 1', () => {
    render(<HeroSection />)
    expect(screen.getByText('HARI INI')).toBeInTheDocument()
  })

  it('renders tag badge "SIPP" pada stat card 2', () => {
    render(<HeroSection />)
    expect(screen.getByText('SIPP')).toBeInTheDocument()
  })

  it('renders tag badge "30 HARI" pada stat card 3 (dark variant)', () => {
    render(<HeroSection />)
    expect(screen.getByText('30 HARI')).toBeInTheDocument()
  })
})

describe('HeroSection — Today Date Meta', () => {
  it('renders today date with id-ID long format in meta', () => {
    render(<HeroSection />)
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    expect(screen.getByText(today)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm test -- components/features/__tests__/hero-section.test.tsx --run
```

Expected: FAIL — tag badges + date not in DOM.

- [ ] **Step 4: Implement tag badges + today date in hero-section.tsx**

Edit komponen stats array di `hero-section.tsx`. Cari array stats (atau JSX yang render stat cards) dan update setiap stat untuk include `tag` property + render badge:

```tsx
const stats = [
  { label: "Antrian Terdaftar", tag: "HARI INI", value: data?.currentNumber || 47, delta: deltaText1 },
  { label: "Sidang Hari Ini", tag: "SIPP", value: data?.processedToday || 32, delta: deltaText2 },
  { label: "Tingkat Kehadiran", tag: "30 HARI", value: 95, delta: deltaText3, dark: true },
]
```

Render setiap stat card (untuk yang non-dark):

```tsx
<div className="rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-[var(--sh-sm)] min-h-[170px] flex flex-col gap-1.5 hover:-translate-y-0.5 hover:shadow-[var(--sh-md)] transition-all">
  <div className="flex items-center justify-between text-[.82rem] font-medium text-muted-foreground">
    <span>{stat.label}</span>
    <span className="font-mono text-[.62rem] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
      {stat.tag}
    </span>
  </div>
  <div className="font-bold text-[clamp(40px,4vw,56px)] leading-none tracking-[-.04em] mt-2 text-foreground">
    <NumberTicker value={stat.value} />
  </div>
  <div className="text-[.78rem] text-muted-foreground mt-auto">{stat.delta}</div>
</div>
```

Untuk stat card dark (stat 3):

```tsx
<div className="relative overflow-hidden rounded-[var(--radius-lg)] border-transparent p-6 min-h-[170px] flex flex-col gap-1.5 text-white
                bg-gradient-to-br from-[var(--primary-3)] via-[#0a4e25] to-[#062f17]
                hover:-translate-y-0.5 hover:shadow-[var(--sh-md)] transition-all">
  {/* Ambient gold + accent overlay */}
  <div className="absolute inset-0 pointer-events-none" style={{
    background: 'radial-gradient(ellipse 80% 100% at 100% 0%, rgba(212,160,23,.35), transparent 60%), radial-gradient(ellipse 50% 70% at 0% 100%, rgba(234,88,12,.18), transparent 60%)'
  }} />
  <div className="relative z-10 flex flex-col gap-1.5 h-full">
    <div className="flex items-center justify-between text-[.82rem] font-medium text-white/65">
      <span>{stat.label}</span>
      <span className="font-mono text-[.62rem] font-medium px-2.5 py-1 rounded-full bg-[rgba(212,160,23,.18)] text-[var(--gold-3)] border border-white">
        {stat.tag}
      </span>
    </div>
    <div className="font-bold text-[clamp(40px,4vw,56px)] leading-none tracking-[-.04em] mt-2 bg-gradient-to-b from-white to-[var(--gold-3)] bg-clip-text text-transparent">
      <NumberTicker value={stat.value} />
    </div>
    <div className="text-[.78rem] text-white/65 mt-auto">{stat.delta}</div>
  </div>
</div>
```

Untuk today date di meta items, tambahkan di akhir as-meta array:

```tsx
<span className="ml-auto inline-flex items-center px-3.5 py-1.5 bg-muted rounded-full border border-border font-mono text-[.75rem] text-foreground/70">
  {new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })}
</span>
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- components/features/__tests__/hero-section.test.tsx --run
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/features/hero-section.tsx components/features/__tests__/hero-section.test.tsx
git commit -m "feat(design-parity): add stat tag badges, dark variant card 3, today date meta"
```

---

### Task 1.2: Hero — Dynamic Delta Text + Feature Card Colors

**Files:**
- Modify: `components/features/hero-section.tsx`

- [ ] **Step 1: Write failing tests for dynamic delta text**

Tambahkan ke `hero-section.test.tsx`:

```typescript
describe('HeroSection — Dynamic Delta Text', () => {
  it('uses dynamic delta format with WITA timestamp', () => {
    render(<HeroSection />)
    // Format: "↑ 12% vs kemarin · HH:MM WITA" or fallback
    const stat1Delta = screen.getByText(/vs kemarin|Data SIPP/)
    expect(stat1Delta).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails (or passes if already there)**

```bash
pnpm test -- components/features/__tests__/hero-section.test.tsx --run
```

- [ ] **Step 3: Update delta text logic in hero-section.tsx**

Tambah di komponen, setelah fetch data:

```tsx
const currentTime = new Date().toLocaleTimeString("id-ID", {
  hour: "2-digit", minute: "2-digit", hour12: false
}) + " WITA"

const hasData = data && (data.currentNumber > 0 || data.processedToday > 0)

const deltas = hasData ? [
  `↑ 12% vs kemarin · ${currentTime}`,
  `${liveCount} sedang berlangsung · ${doneCount} selesai`,
  `▲ 4.2% improvement · ${attended}/${total} hadir`,
] : [
  "Data SIPP hari ini",
  "Sinkronisasi otomatis tiap 60 detik",
  "Peningkatan vs bulan lalu",
]
```

Update stat array untuk pakai `deltas[i]`.

- [ ] **Step 4: Update feature cards icon colors (alternating)**

Cari array FEATURES atau JSX yang render 4 feature cards. Update setiap card icon dengan className per index:

```tsx
const FEATURE_ICON_CLASSES = [
  "text-[var(--primary-3)] bg-[var(--primary-soft)] border-[color-mix(in_oklab,var(--primary)_18%,transparent)]",
  "text-[#92580a] bg-[var(--gold-soft)] border-[color-mix(in_oklab,var(--gold-2)_30%,transparent)]",
  "text-[#9a3412] bg-[var(--accent-soft)] border-[color-mix(in_oklab,var(--accent)_25%,transparent)]",
  "text-[var(--primary-3)] bg-[var(--primary-soft)] border-[color-mix(in_oklab,var(--primary)_18%,transparent)]",
]

{FEATURES.map((feature, i) => (
  <div key={i} className="...">
    <span className={cn(
      "inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border font-mono font-bold text-[1.05rem]",
      FEATURE_ICON_CLASSES[i]
    )}>
      {feature.icon}
    </span>
    ...
  </div>
))}
```

- [ ] **Step 5: Update H1 to use gradient text**

Cari `<h1>` di hero, ganti className:

```tsx
<h1 className="text-[clamp(38px,6vw,76px)] font-bold leading-[1.02] tracking-[-.035em]
               bg-gradient-to-b from-foreground to-[color-mix(in_oklab,var(--foreground)_55%,var(--primary))]
               bg-clip-text text-transparent">
  Daftar antrian sidang,<br />tanpa antre.
</h1>
```

- [ ] **Step 6: Run tests, fix lint, verify visual in browser**

```bash
pnpm test -- components/features/__tests__/hero-section.test.tsx --run
pnpm lint
pnpm dev # then open http://localhost:3000, verify hero visual matches design
```

Expected: tests PASS, visual hero h1 punya gradient effect, 3 stats punya tag badges, card 3 dark.

- [ ] **Step 7: Commit**

```bash
git add components/features/hero-section.tsx components/features/__tests__/hero-section.test.tsx
git commit -m "feat(design-parity): dynamic stats delta, feature card alternating colors, h1 gradient"
```

---

### Task 1.3: Panduan Section — Header + Step Number Boxes

**Files:**
- Modify: `components/features/panduan-section.tsx`
- Test: `components/features/__tests__/panduan-section.test.tsx` (create if not exists)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanduanSection } from '@/components/features/panduan-section'

vi.mock('@/contexts/booking-modal-context', () => ({
  useBookingModal: () => ({ openModal: vi.fn() })
}))

describe('PanduanSection — Section Header', () => {
  it('renders kicker pill "Empat langkah · ±2 menit"', () => {
    render(<PanduanSection />)
    expect(screen.getByText(/Empat langkah · ±2 menit/)).toBeInTheDocument()
  })

  it('renders heading "Cara mendaftar antrian" (not "Panduan Pendaftaran")', () => {
    render(<PanduanSection />)
    expect(screen.getByRole('heading', { name: /Cara mendaftar antrian/i })).toBeInTheDocument()
  })

  it('renders CTA "Mulai Daftar" button in header', () => {
    render(<PanduanSection />)
    expect(screen.getByRole('button', { name: /Mulai Daftar/i })).toBeInTheDocument()
  })
})

describe('PanduanSection — Step Cards', () => {
  it('renders 4 step number boxes with mono "01" through "04"', () => {
    render(<PanduanSection />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
  })

  it('renders step 4 title as "Tiket Digital" (not "Cetak E-Tiket")', () => {
    render(<PanduanSection />)
    expect(screen.getByText(/Tiket Digital/)).toBeInTheDocument()
  })

  it('renders step 3 title as "Konfirmasi" (not "Konfirmasi Booking")', () => {
    render(<PanduanSection />)
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument()
  })

  it('renders step footer line "Step 0N / 04" for each card', () => {
    render(<PanduanSection />)
    expect(screen.getByText(/Step 01 \/ 04/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 04 \/ 04/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- components/features/__tests__/panduan-section.test.tsx --run
```

Expected: FAIL.

- [ ] **Step 3: Refactor panduan-section.tsx**

```tsx
"use client"

import { useBookingModal } from "@/contexts/booking-modal-context"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    num: "01",
    title: "Verifikasi Data",
    body: "Masukkan nomor perkara dan NIK 16 digit. Sistem akan mengecek validasi pihak terdaftar di SIPP secara otomatis.",
    badgeClass: "text-[var(--primary-3)] bg-[var(--primary-soft)] border-[color-mix(in_oklab,var(--primary)_18%,transparent)]",
  },
  {
    num: "02",
    title: "Pilih Slot Waktu",
    body: "Grid slot 30 menit dengan kapasitas 8 antrian per slot. Slot yang penuh akan otomatis dinonaktifkan.",
    badgeClass: "text-[#92580a] bg-[var(--gold-soft)] border-[color-mix(in_oklab,var(--gold-2)_30%,transparent)]",
  },
  {
    num: "03",
    title: "Konfirmasi",
    body: "Periksa ringkasan booking Anda. Setelah dikonfirmasi, slot akan terkunci atas nama Anda.",
    badgeClass: "text-[#9a3412] bg-[var(--accent-soft)] border-[color-mix(in_oklab,var(--accent)_25%,transparent)]",
  },
  {
    num: "04",
    title: "Tiket Digital",
    body: "Dapatkan nomor antrian + QR code. Cetak atau simpan sebagai bukti registrasi di loket pengadilan.",
    badgeClass: "text-[var(--gold)] bg-[var(--gold-soft)] border-[color-mix(in_oklab,var(--gold-2)_30%,transparent)]",
  },
]

export function PanduanSection() {
  const { openModal } = useBookingModal()

  return (
    <section id="sec-panduan" data-section="panduan" className="mt-20 relative z-10">
      {/* Section header — 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-8 mb-6">
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-[.72rem] text-[var(--primary-3)] bg-[var(--primary-soft)] px-3 py-1.5 rounded-full border border-[color-mix(in_oklab,var(--primary)_20%,transparent)] mb-3.5 font-medium">
            Empat langkah · ±2 menit
          </p>
          <h2 className="text-[clamp(28px,3vw,44px)] font-bold tracking-[-.025em] leading-[1.05]">
            Cara mendaftar antrian
          </h2>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[var(--success)] to-primary text-white px-5 py-3.5 rounded-xl font-medium text-base shadow-[0_1px_0_0_rgba(255,255,255,.18)_inset,var(--sh)] hover:shadow-[0_1px_0_0_rgba(255,255,255,.18)_inset,var(--sh-md),0_0_0_4px_var(--primary-ring)] hover:-translate-y-px transition-all cursor-pointer"
          >
            Mulai Daftar →
          </button>
        </div>
      </div>

      {/* Step cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className="bg-card border border-border rounded-[var(--radius-lg)] p-7 shadow-[var(--sh-sm)] flex flex-col gap-2.5 min-h-[240px] hover:-translate-y-[3px] hover:shadow-[var(--sh-md)] transition-all duration-200"
          >
            <span
              className={cn(
                "inline-grid place-items-center w-[42px] h-[42px] rounded-[10px] border font-mono text-[1.5rem] font-semibold leading-none",
                step.badgeClass
              )}
            >
              {step.num}
            </span>
            <h3 className="text-[1.05rem] font-semibold tracking-[-.01em] text-foreground mt-1">
              {step.title}
            </h3>
            <p className="text-[.88rem] leading-[1.55] text-muted-foreground">
              {step.body}
            </p>
            <div className="flex-1" />
            <div className="flex items-center gap-2 pt-3 font-mono text-[.7rem] tracking-[.06em] uppercase text-[var(--fg-4)]">
              <span className="flex-1 h-px bg-border" />
              Step {step.num} / 04
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- components/features/__tests__/panduan-section.test.tsx --run
```

Expected: PASS (6+ tests).

- [ ] **Step 5: Visual check in browser**

```bash
pnpm dev
```

Verify: panduan section punya kicker pill, heading "Cara mendaftar antrian", "Mulai Daftar →" button di kanan, 4 cards dengan number boxes warna bergantian (green/gold/accent/gold), footer line "Step 0N / 04".

- [ ] **Step 6: Commit**

```bash
git add components/features/panduan-section.tsx components/features/__tests__/panduan-section.test.tsx
git commit -m "feat(design-parity): panduan section with kicker, number boxes, step footer line"
```

---

### Task 1.4: Footer CTA — Pre-kicker + 2-line Heading + Ghost Button

**Files:**
- Modify: `components/features/footer-cta.tsx`
- Test: `components/features/__tests__/footer-cta.test.tsx` (create if not exists)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FooterCta } from '@/components/features/footer-cta'

vi.mock('@/contexts/booking-modal-context', () => ({
  useBookingModal: () => ({ openModal: vi.fn() })
}))

describe('FooterCta', () => {
  it('renders pre-kicker with "Siap mendaftar?" text and emerald dot', () => {
    render(<FooterCta />)
    expect(screen.getByText(/Siap mendaftar\?/)).toBeInTheDocument()
  })

  it('renders 2-line heading "Hemat waktu. Daftar online."', () => {
    render(<FooterCta />)
    expect(screen.getByText(/Hemat waktu/)).toBeInTheDocument()
    expect(screen.getByText(/Daftar online/)).toBeInTheDocument()
  })

  it('renders primary CTA "Daftar Antrian Sekarang"', () => {
    render(<FooterCta />)
    expect(screen.getByRole('button', { name: /Daftar Antrian Sekarang/i })).toBeInTheDocument()
  })

  it('renders ghost button "Pelajari Selengkapnya" linking to #sec-panduan', () => {
    render(<FooterCta />)
    const ghostBtn = screen.getByRole('link', { name: /Pelajari Selengkapnya/i })
    expect(ghostBtn).toBeInTheDocument()
    expect(ghostBtn).toHaveAttribute('href', '#sec-panduan')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- components/features/__tests__/footer-cta.test.tsx --run
```

- [ ] **Step 3: Refactor footer-cta.tsx**

```tsx
"use client"

import { useBookingModal } from "@/contexts/booking-modal-context"

export function FooterCta() {
  const { openModal } = useBookingModal()

  return (
    <section
      data-section="footer-cta"
      className="relative mt-20 px-10 py-16 rounded-[var(--radius-2xl)] text-center overflow-hidden text-white shadow-[var(--sh-lg)]
                 bg-gradient-to-br from-[#062f17] via-[var(--primary-3)] to-[#0a4e25]"
    >
      {/* Ambient gold + accent overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(212,160,23,.30), transparent 50%), radial-gradient(circle at 80% 100%, rgba(234,88,12,.22), transparent 50%)",
        }}
      />

      <div className="relative z-10">
        {/* Pre-kicker */}
        <p className="inline-flex items-center gap-2 font-mono text-[.82rem] text-white/55 mb-5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Siap mendaftar?
        </p>

        {/* 2-line heading with gold gradient */}
        <h2 className="text-[clamp(36px,5vw,64px)] font-bold tracking-[-.035em] leading-[1.05] bg-gradient-to-b from-white to-[var(--gold-3)] bg-clip-text text-transparent">
          Hemat waktu.<br />Daftar online.
        </h2>

        {/* Subtitle */}
        <p className="max-w-[540px] mx-auto mt-5 mb-8 text-white/70 text-base">
          Tidak perlu antre berjam-jam di gedung pengadilan. Daftar dari rumah, datang sesuai slot Anda, selesai.
        </p>

        {/* CTA group */}
        <div className="inline-flex gap-2.5 flex-wrap justify-center">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-gradient-to-b from-[var(--accent-2)] to-accent text-white px-6 py-3.5 rounded-xl font-medium text-base shadow-[0_1px_0_0_rgba(255,255,255,.18)_inset,var(--sh)] hover:shadow-[0_1px_0_0_rgba(255,255,255,.18)_inset,var(--sh-md),0_0_0_4px_var(--accent-ring)] hover:-translate-y-px transition-all cursor-pointer"
          >
            Daftar Antrian Sekarang →
          </button>
          <a
            href="#sec-panduan"
            className="inline-flex items-center gap-2 border border-white/18 bg-white/4 backdrop-blur-md text-white/90 px-6 py-3.5 rounded-xl font-medium text-base hover:bg-white/10 transition-all"
          >
            Pelajari Selengkapnya
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- components/features/__tests__/footer-cta.test.tsx --run
```

- [ ] **Step 5: Visual check + dark mode**

```bash
pnpm dev
```

Verify: 2-line heading dengan gold gradient text, pre-kicker dengan emerald dot, ghost button kedua "Pelajari Selengkapnya".

- [ ] **Step 6: Commit**

```bash
git add components/features/footer-cta.tsx components/features/__tests__/footer-cta.test.tsx
git commit -m "feat(design-parity): footer CTA with pre-kicker, 2-line gold gradient heading, ghost button"
```

---

### Task 1.5: Footer Bar — Hybrid Opsi C (Compact + Detail)

**Files:**
- Modify: `components/layout/footer.tsx`
- Test: `components/layout/__tests__/footer.test.tsx` (create)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/footer'

vi.mock('@/contexts/app-settings-context', () => ({
  useAppSettings: () => ({
    institution: {
      name: 'Pengadilan Agama Penajam',
      short_name: 'PA Penajam',
      address: 'Jl. Provinsi Km 9',
      phone: '(0542) 7654321',
      email: 'pa-penajam@mahkamahagung.go.id',
      logo: null,
    },
    app: { name: 'Antrian Sidang', short_name: 'AS', description: 'Test' }
  })
}))

describe('Footer — Compact Row (Opsi C top section)', () => {
  it('renders 4 compact cells: Instansi, Jam Operasional, Sistem, Kontak', () => {
    render(<Footer />)
    expect(screen.getByText('Instansi')).toBeInTheDocument()
    expect(screen.getByText('Jam Operasional')).toBeInTheDocument()
    expect(screen.getByText('Sistem')).toBeInTheDocument()
    expect(screen.getByText('Kontak')).toBeInTheDocument()
  })

  it('renders system version "v0.1.0 · MVP · Live"', () => {
    render(<Footer />)
    expect(screen.getByText(/v0.1.0 · MVP · Live/)).toBeInTheDocument()
  })

  it('renders jam operasional "Sen — Jum · 08:00 — 16:00 WITA"', () => {
    render(<Footer />)
    expect(screen.getByText(/Sen — Jum · 08:00 — 16:00 WITA/)).toBeInTheDocument()
  })
})

describe('Footer — Detail Row (existing 3-col preserved)', () => {
  it('still renders detail section with alamat', () => {
    render(<Footer />)
    expect(screen.getByText(/Jl\. Provinsi Km 9/)).toBeInTheDocument()
  })

  it('still renders email link', () => {
    render(<Footer />)
    expect(screen.getByText(/pa-penajam@mahkamahagung\.go\.id/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail (compact row tests will fail)**

```bash
pnpm test -- components/layout/__tests__/footer.test.tsx --run
```

- [ ] **Step 3: Refactor footer.tsx to hybrid layout**

Tambahkan compact row di paling atas, sebelum existing detail row:

```tsx
"use client"

import { useAppSettings } from "@/contexts/app-settings-context"
import { Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  const settings = useAppSettings()
  const institution = settings?.institution

  return (
    <footer className="mt-20">
      {/* COMPACT ROW (design-style 4-column) */}
      <div className="bg-card border border-border rounded-[var(--radius-xl)] shadow-[var(--sh-sm)] overflow-hidden
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <FooterCell label="Instansi" value={institution?.name || "Pengadilan Agama"} />
        <FooterCell label="Jam Operasional" value="Sen — Jum · 08:00 — 16:00 WITA" />
        <FooterCell label="Sistem" value="v0.1.0 · MVP · Live" />
        <FooterCell label="Kontak" value={institution?.phone || "-"} isLast />
      </div>

      {/* DETAIL ROW (existing preserved) — gap separator */}
      <div className="mt-6 pt-6 border-t border-border/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {/* Kolom 1: Logo + deskripsi institusi */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[var(--primary-3)] to-primary text-[var(--gold-3)] grid place-items-center font-mono font-bold">
                PA
              </div>
              <div>
                <div className="text-[.65rem] text-muted-foreground uppercase tracking-[.12em] font-mono">
                  Pengadilan Agama
                </div>
                <div className="text-[.92rem] font-semibold">
                  {institution?.short_name || "Penajam Paser Utara"}
                </div>
              </div>
            </div>
            <p className="text-[.82rem] text-muted-foreground leading-[1.5]">
              Layanan antrian sidang digital untuk masyarakat — daftar online, pantau jadwal real-time.
            </p>
          </div>

          {/* Kolom 2: Kontak detail */}
          <div>
            <h4 className="text-[.7rem] uppercase tracking-[.08em] font-mono text-muted-foreground mb-3">
              Kontak
            </h4>
            <ul className="space-y-2 text-[.85rem]">
              {institution?.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <span>{institution.phone}</span>
                </li>
              )}
              {institution?.email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <span>{institution.email}</span>
                </li>
              )}
              {institution?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <span>{institution.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 3: Jam detail per hari */}
          <div>
            <h4 className="text-[.7rem] uppercase tracking-[.08em] font-mono text-muted-foreground mb-3">
              Jam Layanan
            </h4>
            <ul className="space-y-1 text-[.85rem]">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sen — Kam</span>
                <span className="font-mono">08:00 — 16:30</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Jumat</span>
                <span className="font-mono">08:00 — 17:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sab — Min</span>
                <span className="font-mono text-muted-foreground">Tutup</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COPYRIGHT BAR */}
      <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[.78rem] text-muted-foreground px-2">
        <span>© 2026 {institution?.name || "Pengadilan Agama"}. Hak cipta dilindungi.</span>
        <span className="font-mono">v0.1.0 MVP</span>
      </div>
    </footer>
  )
}

function FooterCell({
  label,
  value,
  isLast,
}: {
  label: string
  value: string
  isLast?: boolean
}) {
  return (
    <div
      className={`px-6 py-5 ${
        !isLast ? "border-b lg:border-b-0 lg:border-r border-border" : ""
      }`}
    >
      <span className="block text-[.68rem] uppercase tracking-[.04em] font-medium text-muted-foreground mb-1">
        {label}
      </span>
      <span className="text-[.88rem] font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- components/layout/__tests__/footer.test.tsx --run
```

- [ ] **Step 5: Visual check (desktop + mobile)**

```bash
pnpm dev
```

Verify: compact row di atas dengan 4 cell, gap separator, detail row dengan logo+kontak+jam, copyright bar paling bawah. Test mobile breakpoint (375px) — collapse ke 1-col.

- [ ] **Step 6: Commit**

```bash
git add components/layout/footer.tsx components/layout/__tests__/footer.test.tsx
git commit -m "feat(design-parity): footer hybrid layout (compact + detail + copyright)"
```

---

### CHECKPOINT 1: Batch 1 Complete

**Verify all Batch 1 changes:**

- [ ] **Step 1: Run full test suite**

```bash
pnpm test --run
```

Expected: all tests PASS, no regressions.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 3: Visual verification in browser**

```bash
pnpm dev
```

Visit `http://localhost:3000` dan check:
- Hero: stat tag badges, card 3 dark variant, today date, h1 gradient, feature card alternating colors
- Panduan: kicker, "Cara mendaftar antrian" heading, "Mulai Daftar →" button, 4 number boxes, "Step 0N / 04" footer
- Footer CTA: pre-kicker, 2-line gradient heading, 2 buttons (primary + ghost)
- Footer: compact 4-col row + detail 3-col + copyright
- Dark mode toggle masih work
- Mobile responsive (375px) tidak rusak

**🛑 Pause for user review before continuing to Phase 2.**

---

## Phase 2: Batch 2 — Schedule Table

### Task 2.1: parseParaPihak Helper

**Files:**
- Create: `lib/parse-para-pihak.ts`
- Test: `lib/__tests__/parse-para-pihak.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { parseParaPihak } from '@/lib/parse-para-pihak'

describe('parseParaPihak', () => {
  it('returns {-, null} for null input', () => {
    expect(parseParaPihak(null)).toEqual({ pihak: '-', lawan: null })
  })

  it('returns {-, null} for empty string', () => {
    expect(parseParaPihak('')).toEqual({ pihak: '-', lawan: null })
  })

  it('parses "X vs Y" pattern', () => {
    expect(parseParaPihak('Ahmad Surya vs Siti Nurhaliza')).toEqual({
      pihak: 'Ahmad Surya',
      lawan: 'Siti Nurhaliza',
    })
  })

  it('parses "X vs. Y" pattern (with dot)', () => {
    expect(parseParaPihak('Ahmad vs. Siti')).toEqual({
      pihak: 'Ahmad',
      lawan: 'Siti',
    })
  })

  it('parses "X melawan Y" pattern', () => {
    expect(parseParaPihak('Budi Hartono melawan Rini Astuti')).toEqual({
      pihak: 'Budi Hartono',
      lawan: 'Rini Astuti',
    })
  })

  it('strips HTML tags before parsing', () => {
    expect(parseParaPihak('<p>Ahmad</p> vs <strong>Siti</strong>')).toEqual({
      pihak: 'Ahmad',
      lawan: 'Siti',
    })
  })

  it('returns single party when no separator', () => {
    expect(parseParaPihak('Pemohon: Rahmat Hidayat')).toEqual({
      pihak: 'Pemohon: Rahmat Hidayat',
      lawan: null,
    })
  })

  it('handles em-dash separator (design data uses this)', () => {
    expect(parseParaPihak('Ahmad Surya — Siti Nurhaliza')).toEqual({
      pihak: 'Ahmad Surya',
      lawan: 'Siti Nurhaliza',
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- lib/__tests__/parse-para-pihak.test.ts --run
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement parser**

File: `lib/parse-para-pihak.ts`

```typescript
/**
 * Parse string para pihak (penggugat vs tergugat) dari SIPP.
 * Mendukung beberapa format separator: "vs", "vs.", "melawan", em-dash "—".
 */
export function parseParaPihak(input: string | null): {
  pihak: string
  lawan: string | null
} {
  if (!input) return { pihak: "-", lawan: null }

  // Bersihkan HTML tags
  const clean = input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  if (!clean) return { pihak: "-", lawan: null }

  // Coba split berdasarkan separator umum
  const patterns = [
    /^(.+?)\s+(?:vs\.?|melawan)\s+(.+)$/i,
    /^(.+?)\s+—\s+(.+)$/, // em-dash
  ]

  for (const pattern of patterns) {
    const match = clean.match(pattern)
    if (match) {
      return { pihak: match[1].trim(), lawan: match[2].trim() }
    }
  }

  return { pihak: clean, lawan: null }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- lib/__tests__/parse-para-pihak.test.ts --run
```

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/parse-para-pihak.ts lib/__tests__/parse-para-pihak.test.ts
git commit -m "feat(design-parity): add parseParaPihak helper for splitting party names"
```

---

### Task 2.2: Schedule Table — Refactor to 7-Column + Queue Number Pill

**Files:**
- Modify: `components/features/schedule-table.tsx`
- Test: `components/features/__tests__/schedule-table.test.tsx` (create or update)

- [ ] **Step 1: Write failing tests for new columns**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ScheduleTable } from '@/components/features/schedule-table'

vi.mock('@/lib/queue-service', () => ({
  getTodaySchedule: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        perkara_id: 100,
        queue_number: 'S-014',  // optional field, may be undefined
        ruangan: 'Ruang 1',
        waktu: '2026-05-24T10:00:00',
        jam_sidang: '10:00',
        agenda: 'Pemeriksaan Saksi',
        perkara: {
          nomor_perkara: '0091/Pdt.G/2026/PA.Pnj',
          para_pihak: 'Andre Pratama vs Dewi Sartika',
          jenis_perkara_nama: 'Cerai Talak',
        },
      },
    ],
    error: null,
  }),
}))

describe('ScheduleTable — 7 Columns', () => {
  it('renders header columns: Antrian, Perkara, Para Pihak, Waktu, Agenda, Ruangan, Status', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      expect(screen.getByText('Antrian')).toBeInTheDocument()
      expect(screen.getByText('Para Pihak')).toBeInTheDocument()
    })
  })

  it('renders queue number S-014 as pill', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      expect(screen.getByText('S-014')).toBeInTheDocument()
    })
  })

  it('renders opposing party "vs. Dewi Sartika"', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      expect(screen.getByText(/vs\. Dewi Sartika/i)).toBeInTheDocument()
    })
  })

  it('renders case type "Cerai Talak"', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      expect(screen.getByText('Cerai Talak')).toBeInTheDocument()
    })
  })
})

describe('ScheduleTable — Status Labels', () => {
  it('uses "Sedang Berlangsung" label (not "Berlangsung")', async () => {
    // requires mock with in_progress status, see existing test
  })
})

describe('ScheduleTable — Section Header', () => {
  it('renders kicker "Auto-refresh tiap 60 detik"', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      expect(screen.getByText(/Auto-refresh tiap 60 detik/)).toBeInTheDocument()
    })
  })

  it('shows last sync timestamp in filter row', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      expect(screen.getByText(/Terakhir disinkron/)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- components/features/__tests__/schedule-table.test.tsx --run
```

- [ ] **Step 3: Update `JadwalSidang` type to include queue_number (optional)**

Edit `lib/api-types.ts`, line 22-35:

```typescript
export interface JadwalSidang {
  id: number
  perkara_id: number
  queue_number?: string | null  // 🆕 backend extension pending
  queue_status?: QueueStatus | null
  ruangan: string
  waktu: string
  jam_sidang: string | null
  agenda: string
  perkara?: {
    nomor_perkara: string
    para_pihak: string | null
    jenis_perkara_nama: string
  }
}
```

- [ ] **Step 4: Refactor schedule-table.tsx**

Update interface + transform + render. Lihat spec section 3 (lines 280-440) untuk full pattern. Key changes:

Update Schedule interface:
```typescript
interface Schedule {
  id: string
  perkaraId: number
  queueNumber: string | null
  caseNumber: string
  caseType: string
  partyName: string
  opposingParty: string | null
  time: string
  room: string
  agenda: string
  status: ScheduleStatus
}
```

Update `transformData`:
```typescript
import { parseParaPihak } from "@/lib/parse-para-pihak"

const transformData = (data: JadwalSidang[]): Schedule[] =>
  data.map((jadwal, index) => {
    const { pihak, lawan } = parseParaPihak(jadwal.perkara?.para_pihak || null)
    return {
      id: jadwal.perkara_id.toString(),
      perkaraId: jadwal.perkara_id,
      queueNumber: jadwal.queue_number ?? null,
      caseNumber: jadwal.perkara?.nomor_perkara || "-",
      caseType: jadwal.perkara?.jenis_perkara_nama || "-",
      partyName: pihak,
      opposingParty: lawan,
      time: jadwal.jam_sidang ? jadwal.jam_sidang.substring(0, 5) : "00:00",
      room: jadwal.ruangan || "-",
      agenda: jadwal.agenda || "-",
      status: mapStatusByIndex(index),
    }
  })
```

Update status mapping:
```typescript
const STATUS_CONFIG: Record<ScheduleStatus, { label: string; className: string; pipClass: string }> = {
  in_progress: {
    label: "Sedang Berlangsung",  // 🆕 was "Berlangsung"
    className: "bg-[var(--accent-soft)] text-[#9a3412] border-[color-mix(in_oklab,var(--accent)_30%,transparent)]",
    pipClass: "bg-accent",
  },
  scheduled: {
    label: "Terjadwal",
    className: "bg-[var(--primary-soft)] text-[var(--primary-3)] border-[color-mix(in_oklab,var(--primary)_22%,transparent)]",
    pipClass: "bg-primary",
  },
  completed: {
    label: "Selesai",
    className: "bg-muted text-muted-foreground border-border",
    pipClass: "bg-[var(--fg-4)]",
  },
  postponed: {
    label: "Ditunda",
    className: "bg-[var(--gold-soft)] text-[#92580a] border-[color-mix(in_oklab,var(--gold-2)_35%,transparent)]",
    pipClass: "bg-[var(--gold-2)]",
  },
}
```

Update desktop header to 7-col grid:
```tsx
<div className="mb-3 hidden md:grid grid-cols-[76px_1.4fr_1.3fr_96px_1.2fr_96px_130px] gap-0 px-4 text-[.68rem] font-medium uppercase tracking-[.06em] text-muted-foreground">
  <span>Antrian</span>
  <span>Perkara</span>
  <span>Para Pihak</span>
  <span>Waktu</span>
  <span>Agenda</span>
  <span>Ruangan</span>
  <span className="text-right">Status</span>
</div>
```

Update desktop row layout — refer spec section 3.5 (full code block).

Update mobile layout with opposingParty + queueNumber pill — refer spec section 3.6.

Add section header kicker + sync timestamp + filter count — refer spec sections 3.7-3.10.

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- components/features/__tests__/schedule-table.test.tsx --run
```

- [ ] **Step 6: Visual check (desktop + mobile)**

```bash
pnpm dev
```

Verify 7 kolom desktop, "S-014" pill, "vs. Lawan", kicker, sync chip, filter chips dengan count.

- [ ] **Step 7: Commit**

```bash
git add components/features/schedule-table.tsx components/features/__tests__/schedule-table.test.tsx lib/api-types.ts
git commit -m "feat(design-parity): schedule table 7-col grid with queue pill, status pip, sync chip"
```

---

### CHECKPOINT 2: Batch 2 Complete

- [ ] **Step 1: Run full test suite**

```bash
pnpm test --run && pnpm lint
```

- [ ] **Step 2: Visual verification**

Schedule table di browser — 7 kolom, queue number pill, "Sedang Berlangsung" label, gradient `is-active` row dengan stripe accent, kicker auto-refresh, sync timestamp chip, filter chips dengan count `[N]`.

**🛑 Pause for user review before Phase 3.**

---

## Phase 3: Batch 3 — Queue Status + CekStatusDialog

### Task 3.1: useCurrentCall Hook

**Files:**
- Create: `lib/hooks/use-current-call.ts`
- Test: `lib/hooks/__tests__/use-current-call.test.ts`

- [ ] **Step 1: Create directory if not exists**

```bash
mkdir -p lib/hooks lib/hooks/__tests__
```

- [ ] **Step 2: Write failing tests**

File: `lib/hooks/__tests__/use-current-call.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCurrentCall } from '@/lib/hooks/use-current-call'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(public status: number, message: string) { super(message) }
  },
}))

import { api } from '@/lib/api'

describe('useCurrentCall', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(api.get).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial loading state', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useCurrentCall())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
  })

  it('fetches and returns current call data on success', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        current: {
          queue_number: 'S-014',
          pihak_nama: 'Andre',
          lawan_nama: 'Dewi',
          nomor_perkara: '0091/Pdt.G/2026/PA.Pnj',
          jenis_perkara: 'Cerai Talak',
          ruang_sidang: 'Ruang 1',
          agenda: 'Pemeriksaan Saksi',
          jam_mulai: '10:00',
          started_at: '2026-05-24T10:05:00Z',
        },
        next: null,
        waiting_count: 7,
        done_count: 5,
      },
      error: null,
    })

    const { result } = renderHook(() => useCurrentCall())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.current?.queueNumber).toBe('S-014')
    expect(result.current.data?.waitingCount).toBe(7)
  })

  it('returns null current when no active call', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { current: null, next: null, waiting_count: 0, done_count: 0 },
      error: null,
    })

    const { result } = renderHook(() => useCurrentCall())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.current).toBeNull()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm test -- lib/hooks/__tests__/use-current-call.test.ts --run
```

- [ ] **Step 4: Implement hook**

File: `lib/hooks/use-current-call.ts`

```typescript
"use client"

import { useState, useEffect, useCallback } from "react"
import { api, ApiError } from "@/lib/api"

export interface CurrentCall {
  queueNumber: string
  pihak: string
  lawan: string | null
  nomorPerkara: string
  jenis: string
  ruang: string
  agenda: string
  waktu: string
}

export interface NextCall {
  queueNumber: string
  ruang: string
  waktu: string
  agenda: string
}

export interface QueueStatusData {
  current: CurrentCall | null
  next: NextCall | null
  waitingCount: number
  doneCount: number
}

interface BackendCurrent {
  queue_number: string
  pihak_nama: string
  lawan_nama: string | null
  nomor_perkara: string
  jenis_perkara: string
  ruang_sidang: string
  agenda: string
  jam_mulai: string
  started_at: string | null
}

interface BackendNext {
  queue_number: string
  ruang_sidang: string
  jam_mulai: string
  agenda: string
}

interface CurrentCallResponse {
  data: {
    current: BackendCurrent | null
    next: BackendNext | null
    waiting_count: number
    done_count: number
  }
  error: string | null
}

function transformBackend(res: CurrentCallResponse): QueueStatusData {
  return {
    current: res.data.current
      ? {
          queueNumber: res.data.current.queue_number,
          pihak: res.data.current.pihak_nama,
          lawan: res.data.current.lawan_nama,
          nomorPerkara: res.data.current.nomor_perkara,
          jenis: res.data.current.jenis_perkara,
          ruang: res.data.current.ruang_sidang,
          agenda: res.data.current.agenda,
          waktu: res.data.current.jam_mulai,
        }
      : null,
    next: res.data.next
      ? {
          queueNumber: res.data.next.queue_number,
          ruang: res.data.next.ruang_sidang,
          waktu: res.data.next.jam_mulai,
          agenda: res.data.next.agenda,
        }
      : null,
    waitingCount: res.data.waiting_count,
    doneCount: res.data.done_count,
  }
}

export function useCurrentCall() {
  const [data, setData] = useState<QueueStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get<CurrentCallResponse>("/public/queue/current-call")
      setData(transformBackend(res))
      setError(null)
    } catch (e) {
      // Endpoint belum tersedia (404) — fallback ke empty state
      if (e instanceof ApiError && e.status === 404) {
        console.warn("[backend-pending] /public/queue/current-call not yet available")
        setData({ current: null, next: null, waitingCount: 0, doneCount: 0 })
        setError(null)
      } else {
        setError(e instanceof Error ? e.message : "Failed to load")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- lib/hooks/__tests__/use-current-call.test.ts --run
```

- [ ] **Step 6: Commit**

```bash
git add lib/hooks/use-current-call.ts lib/hooks/__tests__/use-current-call.test.ts
git commit -m "feat(design-parity): add useCurrentCall hook with 30s polling and 404 fallback"
```

---

### Task 3.2: QueueStatus Refactor to Live Case Display

**Files:**
- Modify: `components/features/queue-status.tsx`
- Test: `components/features/__tests__/queue-status.test.tsx` (update)

- [ ] **Step 1: Write failing tests for live case display**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueueStatus } from '@/components/features/queue-status'

vi.mock('@/lib/hooks/use-current-call', () => ({
  useCurrentCall: () => ({
    data: {
      current: {
        queueNumber: 'S-014',
        pihak: 'Andre Pratama',
        lawan: 'Dewi Sartika',
        nomorPerkara: '0091/Pdt.G/2026/PA.Pnj',
        jenis: 'Cerai Talak',
        ruang: 'Ruang 1',
        agenda: 'Pemeriksaan Saksi',
        waktu: '10:00',
      },
      next: {
        queueNumber: 'S-015',
        ruang: 'Ruang 3',
        waktu: '10:30',
        agenda: 'Pembuktian',
      },
      waitingCount: 7,
      doneCount: 5,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('QueueStatus — Live Case Display', () => {
  it('renders queue number S-014 large', () => {
    render(<QueueStatus />)
    expect(screen.getByText('S-014')).toBeInTheDocument()
  })

  it('renders party name "Andre Pratama"', () => {
    render(<QueueStatus />)
    expect(screen.getByText(/Andre Pratama/)).toBeInTheDocument()
  })

  it('renders opposing party "vs. Dewi Sartika"', () => {
    render(<QueueStatus />)
    expect(screen.getByText(/vs\. Dewi Sartika/)).toBeInTheDocument()
  })

  it('renders perkara · jenis line', () => {
    render(<QueueStatus />)
    expect(screen.getByText(/0091\/Pdt\.G\/2026\/PA\.Pnj.*Cerai Talak/)).toBeInTheDocument()
  })

  it('renders meta: ruang · agenda · waktu', () => {
    render(<QueueStatus />)
    expect(screen.getByText(/Ruang 1.*Pemeriksaan Saksi.*10:00/)).toBeInTheDocument()
  })

  it('renders next call cell with S-015', () => {
    render(<QueueStatus />)
    expect(screen.getByText(/S-015/)).toBeInTheDocument()
  })

  it('renders waiting count 7 + estimated wait', () => {
    render(<QueueStatus />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText(/Estimasi tunggu ±126 menit/)).toBeInTheDocument()
  })
})

describe('QueueStatus — Empty State', () => {
  it('shows "Tidak ada panggilan aktif" when current is null', () => {
    // override mock dengan current: null
    // ... assert "—" placeholder + empty subtitle
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- components/features/__tests__/queue-status.test.tsx --run
```

- [ ] **Step 3: Refactor queue-status.tsx**

Refer spec section 4.1 (lines 540-680) untuk full layout. Key parts:

Replace state setup dengan hook:
```tsx
import { useCurrentCall } from "@/lib/hooks/use-current-call"

export function QueueStatus(props: QueueStatusProps) {
  const { data, isLoading } = useCurrentCall()
  const [showCekStatus, setShowCekStatus] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  
  // ... existing booking state for reschedule
```

Main column layout (kiri, 1.4fr):
```tsx
<div className="flex flex-col gap-3 p-10">
  {/* Tag pill */}
  <span className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/40 text-orange-300 font-mono text-[.72rem] uppercase tracking-[.04em]">
    <span className={cn("w-2 h-2 rounded-full bg-accent", data?.current && "animate-as-pulse")} />
    {data?.current ? "Sedang Dipanggil" : "Tidak ada panggilan aktif"}
  </span>
  
  {/* Queue number huge */}
  <div className="font-bold text-[clamp(80px,12vw,180px)] leading-[.9] tracking-[-.06em] 
                  bg-gradient-to-b from-white to-[var(--gold-3)] bg-clip-text text-transparent">
    {data?.current?.queueNumber || "—"}
  </div>
  
  {/* Pihak + lawan */}
  {data?.current ? (
    <>
      <div>
        <div className="text-xl font-semibold leading-[1.25]">
          {data.current.pihak}
          {data.current.lawan && <span className="opacity-60"> vs. {data.current.lawan}</span>}
        </div>
        <div className="font-mono text-[.82rem] text-white/60 mt-1.5">
          {data.current.nomorPerkara} · {data.current.jenis}
        </div>
      </div>
      
      {/* Meta */}
      <div className="text-[.9rem] text-white/75 mt-auto pt-4">
        <strong className="text-white font-semibold">{data.current.ruang}</strong>
        {" · "}{data.current.agenda}{" · Mulai pukul "}{data.current.waktu}{" WITA"}
      </div>
    </>
  ) : (
    <p className="text-white/55">Menunggu jadwal sidang berikutnya</p>
  )}
  
  {/* Actions */}
  <div className="flex gap-2.5 mt-4">
    <button onClick={() => setShowCekStatus(true)}
            className="flex-1 px-4 py-3 rounded-xl border border-white/18 bg-white/4 backdrop-blur-md text-white/90 font-medium text-[.82rem] hover:bg-white/10">
      Cek Status Saya
    </button>
    <button onClick={handleReschedule} disabled={!hasActiveBooking}
            className="flex-1 px-4 py-3 rounded-xl border border-white/18 bg-white/4 text-white/90 font-medium text-[.82rem] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed">
      Ganti Jadwal
    </button>
  </div>
</div>
```

Side column (kanan, 1fr) — 3 cells:
```tsx
<div className="grid grid-rows-3 relative z-10">
  <Cell label="Menunggu" value={String(data?.waitingCount ?? 0)} sublabel={`Estimasi tunggu ±${(data?.waitingCount ?? 0) * 18} menit`} valueClass="text-[2rem]" />
  <Cell label="Selesai" value={String(data?.doneCount ?? 0)} sublabel="Rata-rata 16 menit/sidang" valueClass="text-[2rem]" />
  <Cell label="Berikutnya" value={data?.next ? `${data.next.queueNumber} · ${data.next.ruang}` : "—"} sublabel={data?.next ? `±${data.next.waktu} WITA · ${data.next.agenda}` : "Belum ada"} valueClass="text-[1.05rem]" />
</div>
```

Cell component:
```tsx
function Cell({ label, value, sublabel, valueClass }: { label: string; value: string; sublabel: string; valueClass: string }) {
  return (
    <div className="p-5 px-6 border-b border-white/8 last:border-0 flex flex-col gap-1">
      <span className="text-[.72rem] uppercase tracking-[.04em] text-white/55 font-medium">{label}</span>
      <span className={cn("font-semibold leading-[1.15]", valueClass)}>{value}</span>
      <span className="text-[.72rem] text-white/45">{sublabel}</span>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- components/features/__tests__/queue-status.test.tsx --run
```

- [ ] **Step 5: Visual check**

```bash
pnpm dev
```

Verify queue number huge gradient gold, pihak nama, "vs. lawan", perkara line, meta, 3 side cells.

- [ ] **Step 6: Commit**

```bash
git add components/features/queue-status.tsx components/features/__tests__/queue-status.test.tsx
git commit -m "feat(design-parity): queue status refactor to live case display with side cells"
```

---

### Task 3.3: CekStatusDialog — New Component

**Files:**
- Create: `components/features/cek-status-dialog.tsx`
- Test: `components/features/__tests__/cek-status-dialog.test.tsx`

- [ ] **Step 1: Add API service function**

Edit `lib/queue-service.ts`, tambah function:

```typescript
import type { QueueStatusResponse } from "@/lib/api-types"

/**
 * Cek status antrian berdasarkan nomor antrian (format S-NNN).
 * Endpoint backend baru — fallback ke 404 dengan pesan jelas.
 */
export async function getStatusByQueueNumber(
  queueNumber: string,
  nik?: string
): Promise<QueueStatusResponse> {
  const encoded = encodeURIComponent(queueNumber)
  const nikParam = nik ? `?nik=${encodeURIComponent(nik)}` : ""
  return api.get<QueueStatusResponse>(`/public/queue/status-by-number/${encoded}${nikParam}`)
}
```

Update `QueueStatusResponse` type di `lib/api-types.ts` untuk include position + estimated_minutes:

```typescript
export interface QueueStatusResponse {
  data: QueueTicket & {
    position?: number
    estimated_minutes?: number
    nomor_perkara?: string
    jenis_perkara?: string
    pihak_nama?: string
    agenda?: string
  } | null
  error: string | null
}
```

- [ ] **Step 2: Write failing tests**

File: `components/features/__tests__/cek-status-dialog.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CekStatusDialog } from '@/components/features/cek-status-dialog'

vi.mock('@/lib/queue-service', () => ({
  getStatusByQueueNumber: vi.fn(),
}))

import { getStatusByQueueNumber } from '@/lib/queue-service'

describe('CekStatusDialog', () => {
  it('renders input form when open', () => {
    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    expect(screen.getByLabelText(/Nomor Antrian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/NIK/i)).toBeInTheDocument()
  })

  it('disables submit when queue number is empty', () => {
    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    const submit = screen.getByRole('button', { name: /Cek Status →/i })
    expect(submit).toBeDisabled()
  })

  it('enables submit when queue number entered', () => {
    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    const input = screen.getByLabelText(/Nomor Antrian/i)
    fireEvent.change(input, { target: { value: 'S-014' } })
    const submit = screen.getByRole('button', { name: /Cek Status →/i })
    expect(submit).not.toBeDisabled()
  })

  it('shows result display on successful lookup', async () => {
    vi.mocked(getStatusByQueueNumber).mockResolvedValueOnce({
      data: {
        queue_number: 'S-014',
        status: 'waiting',
        position: 3,
        estimated_minutes: 53,
        nomor_perkara: '0091/Pdt.G/2026/PA.Pnj',
        jenis_perkara: 'Cerai Talak',
        pihak_nama: 'Andre',
        ruang_sidang: 'Ruang 1',
        agenda: 'Pemeriksaan Saksi',
      },
      error: null,
    })

    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/Nomor Antrian/i), { target: { value: 'S-014' } })
    fireEvent.click(screen.getByRole('button', { name: /Cek Status →/i }))

    await waitFor(() => {
      expect(screen.getByText('3 antrian lagi')).toBeInTheDocument()
      expect(screen.getByText(/Pemeriksaan Saksi/)).toBeInTheDocument()
    })
  })

  it('shows not-found alert when queue not found', async () => {
    vi.mocked(getStatusByQueueNumber).mockResolvedValueOnce({
      data: null,
      error: 'Nomor antrian tidak ditemukan',
    })

    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/Nomor Antrian/i), { target: { value: 'S-999' } })
    fireEvent.click(screen.getByRole('button', { name: /Cek Status →/i }))

    await waitFor(() => {
      expect(screen.getByText(/S-999.*tidak ditemukan/i)).toBeInTheDocument()
    })
  })

  it('allows "Cek Lain" to reset to input state', async () => {
    vi.mocked(getStatusByQueueNumber).mockResolvedValueOnce({
      data: { queue_number: 'S-014', status: 'waiting', position: 3, estimated_minutes: 53, ruang_sidang: 'R1', agenda: 'A' } as any,
      error: null,
    })

    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/Nomor Antrian/i), { target: { value: 'S-014' } })
    fireEvent.click(screen.getByRole('button', { name: /Cek Status →/i }))

    await waitFor(() => screen.getByRole('button', { name: /Cek Lain/i }))
    fireEvent.click(screen.getByRole('button', { name: /Cek Lain/i }))

    expect(screen.getByLabelText(/Nomor Antrian/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm test -- components/features/__tests__/cek-status-dialog.test.tsx --run
```

- [ ] **Step 4: Implement component**

File: `components/features/cek-status-dialog.tsx`

```tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getStatusByQueueNumber } from "@/lib/queue-service"
import { Skeleton } from "@/components/ui/skeleton"

type DialogState = "input" | "loading" | "result" | "not-found" | "error"

interface ResultData {
  queueNumber: string
  status: string
  position: number
  estimatedMinutes: number
  nomorPerkara: string
  jenis: string
  ruang: string
  agenda: string
}

interface CekStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  in_service: { label: "Sedang Dipanggil", color: "bg-success" },
  completed: { label: "Sudah Selesai", color: "bg-muted-foreground" },
  waiting: { label: "Menunggu Giliran", color: "bg-[var(--gold-2)]" },
  cancelled: { label: "Dibatalkan", color: "bg-destructive" },
  skipped: { label: "Dilewati", color: "bg-muted-foreground" },
  no_show: { label: "Tidak Hadir", color: "bg-destructive" },
}

export function CekStatusDialog({ open, onOpenChange }: CekStatusDialogProps) {
  const [state, setState] = useState<DialogState>("input")
  const [queueNumber, setQueueNumber] = useState("")
  const [nik, setNik] = useState("")
  const [result, setResult] = useState<ResultData | null>(null)
  const [searched, setSearched] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (open) {
      setState("input")
      setQueueNumber("")
      setNik("")
      setResult(null)
      setSearched("")
      setErrorMsg("")
    }
  }, [open])

  const handleCheck = async () => {
    const qn = queueNumber.trim().toUpperCase()
    if (!qn) return
    setSearched(qn)
    setState("loading")
    try {
      const res = await getStatusByQueueNumber(qn, nik || undefined)
      if (!res.data) {
        setState("not-found")
        return
      }
      setResult({
        queueNumber: res.data.queue_number,
        status: res.data.status,
        position: res.data.position ?? 0,
        estimatedMinutes: res.data.estimated_minutes ?? 0,
        nomorPerkara: res.data.nomor_perkara ?? "-",
        jenis: res.data.jenis_perkara ?? "-",
        ruang: res.data.ruang_sidang ?? "-",
        agenda: res.data.agenda ?? "-",
      })
      setState("result")
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Gagal mengecek status")
      setState("error")
    }
  }

  const resetToInput = () => {
    setState("input")
    setResult(null)
    setSearched("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Cek Status Antrian</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {state === "input" && (
            <>
              <div className="flex gap-3 p-3.5 bg-[var(--primary-soft)] border border-[color-mix(in_oklab,var(--primary)_18%,transparent)] rounded-[var(--radius-md)] mb-4">
                <div className="w-5 h-5 rounded-full bg-primary text-white grid place-items-center text-[.8rem] font-semibold flex-shrink-0 mt-0.5">
                  i
                </div>
                <p className="text-[.88rem] text-foreground">
                  Masukkan nomor antrian Anda untuk melihat posisi dan estimasi waktu panggilan.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <label htmlFor="qn" className="text-[.82rem] font-medium flex items-center gap-1">
                  Nomor Antrian <span className="text-destructive font-semibold">*</span>
                </label>
                <input
                  id="qn"
                  className="w-full border border-border bg-card px-3.5 py-2.5 rounded-[10px] text-[.9rem] focus:border-primary focus:ring-2 focus:ring-[var(--primary-ring)] outline-none transition-all"
                  placeholder="S-014"
                  value={queueNumber}
                  onChange={(e) => setQueueNumber(e.target.value.toUpperCase())}
                />
                <span className="font-mono text-[.7rem] text-[var(--fg-4)]">
                  Format: S-NNN sesuai tiket Anda
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="nik" className="text-[.82rem] font-medium">
                  NIK (verifikasi)
                </label>
                <input
                  id="nik"
                  inputMode="numeric"
                  maxLength={16}
                  className="w-full border border-border bg-card px-3.5 py-2.5 rounded-[10px] text-[.9rem] focus:border-primary focus:ring-2 focus:ring-[var(--primary-ring)] outline-none"
                  placeholder="16 digit"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                />
              </div>
            </>
          )}

          {state === "loading" && (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}

          {state === "result" && result && (
            <ResultDisplay result={result} />
          )}

          {state === "not-found" && (
            <div className="flex gap-3 p-3.5 bg-[var(--warning-soft)] border border-[color-mix(in_oklab,var(--warning)_25%,transparent)] rounded-[var(--radius-md)]">
              <div className="w-5 h-5 rounded-full bg-[var(--warning)] text-white grid place-items-center text-[.8rem] font-semibold flex-shrink-0 mt-0.5">
                !
              </div>
              <p className="text-[.88rem] text-[#92400e]">
                Nomor antrian <strong>{searched}</strong> tidak ditemukan. Periksa kembali atau hubungi loket informasi.
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="flex gap-3 p-3.5 bg-destructive/10 border border-destructive/30 rounded-[var(--radius-md)]">
              <div className="w-5 h-5 rounded-full bg-destructive text-white grid place-items-center text-[.8rem] font-semibold flex-shrink-0 mt-0.5">
                !
              </div>
              <p className="text-[.88rem] text-destructive">{errorMsg}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {state === "input" && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button onClick={handleCheck} disabled={!queueNumber.trim()}>
                Cek Status →
              </Button>
            </>
          )}
          {(state === "result" || state === "not-found" || state === "error") && (
            <>
              <Button variant="ghost" onClick={resetToInput}>← Cek Lain</Button>
              <Button onClick={() => onOpenChange(false)}>Tutup</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResultDisplay({ result }: { result: ResultData }) {
  const statusInfo = STATUS_LABEL[result.status] ?? { label: result.status, color: "bg-muted-foreground" }
  const posLabel = result.position === 0 ? "Berikutnya" : `${result.position} antrian lagi`

  return (
    <div className="space-y-4">
      {/* Mini callup display */}
      <div className="relative overflow-hidden p-6 rounded-[var(--radius-xl)] text-white bg-gradient-to-br from-[#062f17] via-[var(--primary-3)] to-[var(--primary)]">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 0% 50%, rgba(212,160,23,.30), transparent 60%)'
        }} />
        <div className="relative z-10 flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-accent/15 border border-accent/40 text-orange-300 font-mono text-[.72rem] uppercase">
            <span className={cn("w-2 h-2 rounded-full", statusInfo.color, result.status === 'in_service' && 'animate-as-pulse')} />
            {statusInfo.label}
          </span>
          <div className="font-mono font-bold text-[clamp(64px,9vw,120px)] leading-[.9] tracking-[-.04em] mt-1 bg-gradient-to-b from-white to-[var(--gold-3)] bg-clip-text text-transparent">
            {result.queueNumber}
          </div>
          <div className="font-mono text-[.85rem] text-white/65">
            {result.nomorPerkara} · {result.jenis}
          </div>
        </div>
      </div>

      {/* 4-row detail grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <DetailCell label="Posisi" value={posLabel} borderBottom borderRight />
        <DetailCell label="Estimasi Panggilan" value={`±${result.estimatedMinutes} menit lagi`} borderBottom />
        <DetailCell label="Ruang Sidang" value={result.ruang} borderRight />
        <DetailCell label="Agenda" value={result.agenda} />
      </div>
    </div>
  )
}

function DetailCell({ label, value, borderBottom, borderRight }: { label: string; value: string; borderBottom?: boolean; borderRight?: boolean }) {
  return (
    <div className={cn(
      "px-4 py-3.5 flex flex-col gap-0.5",
      borderBottom && "border-b border-border",
      borderRight && "sm:border-r border-border",
    )}>
      <span className="text-[.72rem] font-medium text-muted-foreground">{label}</span>
      <span className="text-[.92rem] font-medium text-foreground">{value}</span>
    </div>
  )
}

// import at top
import { cn } from "@/lib/utils"
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- components/features/__tests__/cek-status-dialog.test.tsx --run
```

- [ ] **Step 6: Wire CekStatusDialog into queue-status.tsx**

Edit `queue-status.tsx`, tambah import + render:

```tsx
import { CekStatusDialog } from "@/components/features/cek-status-dialog"

// di dalam component, di akhir return (sebelum RescheduleDialog):
<CekStatusDialog open={showCekStatus} onOpenChange={setShowCekStatus} />
```

- [ ] **Step 7: Visual check end-to-end**

```bash
pnpm dev
```

Click "Cek Status Saya" → dialog open → input "S-014" → submit → result display. Click "Cek Lain" → reset.

- [ ] **Step 8: Commit**

```bash
git add components/features/cek-status-dialog.tsx components/features/__tests__/cek-status-dialog.test.tsx components/features/queue-status.tsx lib/queue-service.ts lib/api-types.ts
git commit -m "feat(design-parity): add CekStatusDialog with state machine and API integration"
```

---

### CHECKPOINT 3: Batch 3 Complete

- [ ] **Step 1: Run full test suite + lint**

```bash
pnpm test --run && pnpm lint
```

- [ ] **Step 2: Visual + interactive verification**

Browser test: queue status menampilkan live case (atau "—" + empty subtitle bila API belum siap), 3 side cells, click "Cek Status Saya" → dialog functional, "Ganti Jadwal" tetap work.

**🛑 Pause for user review before Phase 4.**

---

## Phase 4: Batch 4 — Booking Wizard

### Task 4.1: FormProgress — Pill Stepper

**Files:**
- Modify: `components/features/form-progress.tsx`
- Test: `components/features/__tests__/form-progress.test.tsx` (create or update)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProgress } from '@/components/features/form-progress'

describe('FormProgress — Pill Stepper', () => {
  const steps = [
    { id: 1, label: 'Validasi' },
    { id: 2, label: 'Pilih Slot' },
    { id: 3, label: 'Konfirmasi' },
    { id: 4, label: 'Tiket' },
  ]

  it('renders 4 step pills', () => {
    render(<FormProgress steps={steps} currentStep={2} />)
    expect(screen.getByText(/Langkah 1 — Validasi/)).toBeInTheDocument()
    expect(screen.getByText(/Langkah 4 — Tiket/)).toBeInTheDocument()
  })

  it('marks step before currentStep as done with checkmark', () => {
    render(<FormProgress steps={steps} currentStep={3} />)
    // Step 1 dan 2 done — punya ✓
    const checks = screen.getAllByText('✓')
    expect(checks.length).toBe(2)
  })

  it('marks current step as active', () => {
    render(<FormProgress steps={steps} currentStep={2} />)
    const activeStep = screen.getByText(/Langkah 2 — Pilih Slot/).closest('div')
    expect(activeStep?.className).toMatch(/shadow|bg-card/)
  })

  it('marks future steps as pending', () => {
    render(<FormProgress steps={steps} currentStep={2} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- components/features/__tests__/form-progress.test.tsx --run
```

- [ ] **Step 3: Refactor form-progress.tsx**

```tsx
"use client"

import { cn } from "@/lib/utils"

interface Step {
  id: number
  label: string
}

interface FormProgressProps {
  steps: Step[]
  currentStep: number
}

export function FormProgress({ steps, currentStep }: FormProgressProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-2.5 bg-muted border-b border-border">
      {steps.map((step) => {
        const isDone = step.id < currentStep
        const isActive = step.id === currentStep
        const isPending = step.id > currentStep

        return (
          <div
            key={step.id}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[.8rem] font-medium transition-all duration-300",
              isActive && "bg-card text-foreground shadow-[var(--sh)]",
              isDone && "text-foreground/80 bg-transparent",
              isPending && "text-muted-foreground bg-transparent"
            )}
          >
            <span
              className={cn(
                "grid place-items-center w-[22px] h-[22px] rounded-full font-mono text-[.75rem] font-semibold transition-colors",
                isActive && "bg-primary text-white border border-primary",
                isDone && "bg-accent text-white border border-accent",
                isPending && "bg-card text-muted-foreground border border-[var(--border-strong)]"
              )}
            >
              {isDone ? "✓" : step.id}
            </span>
            <span>Langkah {step.id} — {step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- components/features/__tests__/form-progress.test.tsx --run
```

- [ ] **Step 5: Commit**

```bash
git add components/features/form-progress.tsx components/features/__tests__/form-progress.test.tsx
git commit -m "feat(design-parity): form progress pill stepper with accent done state"
```

---

### Task 4.2: Step 1 Validate — Add Nama + Telepon Fields

**Files:**
- Modify: `components/features/booking-wizard/step-validate.tsx`
- Test: `components/features/booking-wizard/__tests__/step-validate.test.tsx` (create or update)

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepValidate } from '@/components/features/booking-wizard/step-validate'

describe('StepValidate — Form Fields', () => {
  it('renders 4 fields: nomor perkara, NIK, nama, telepon', () => {
    render(<StepValidate onValidated={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/Nomor Perkara/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/NIK/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/No\. WhatsApp/i)).toBeInTheDocument()
  })

  it('renders alert info text', () => {
    render(<StepValidate onValidated={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/Data Anda hanya dipakai untuk verifikasi/)).toBeInTheDocument()
  })

  it('submit button labeled "Verifikasi & Lanjut →"', () => {
    render(<StepValidate onValidated={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Verifikasi & Lanjut/ })).toBeInTheDocument()
  })

  it('disables submit when required fields empty', () => {
    render(<StepValidate onValidated={vi.fn()} onCancel={vi.fn()} />)
    const submit = screen.getByRole('button', { name: /Verifikasi & Lanjut/ })
    expect(submit).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test -- components/features/booking-wizard/__tests__/step-validate.test.tsx --run
```

- [ ] **Step 3: Refactor step-validate.tsx to add nama + telepon**

Add nama and telepon to schema:

```typescript
const step1Schema = z.object({
  nomor_perkara: z.string().regex(/^\d+\/[A-Za-z.]+\/\d{4}\/PA\.[A-Za-z]+$/, "Format nomor perkara tidak sesuai"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  nama: z.string().min(1, "Nama wajib diisi"),
  telepon: z.string().optional().refine(
    (v) => !v || /^08\d{8,12}$/.test(v),
    "Format telepon tidak valid (contoh: 0812xxxx)"
  ),
})

type Step1Data = z.infer<typeof step1Schema>
```

Update form layout to 2-row grid (Nomor Perkara + NIK, then Nama + Telepon). Refer spec section 5.2 (lines 700-770) untuk pattern.

Add alert info block at top:
```tsx
<div className="flex gap-3 p-3.5 bg-[var(--primary-soft)] border border-[color-mix(in_oklab,var(--primary)_18%,transparent)] rounded-[var(--radius-md)] mb-5">
  <div className="w-5 h-5 rounded-full bg-primary text-white grid place-items-center text-[.8rem] font-semibold flex-shrink-0 mt-0.5">i</div>
  <p className="text-[.88rem]">
    Masukkan <strong>nomor perkara</strong> sesuai dokumen panggilan sidang dan{" "}
    <strong>NIK</strong> 16 digit yang terdaftar sebagai pihak. Data Anda hanya dipakai untuk verifikasi dan tidak disimpan.
  </p>
</div>
```

Pada submit handler, tambah cross-check nama:
```typescript
const handleSubmit = async () => {
  const res = await validatePerkara({ nomor_perkara, nik })
  if (!res.valid) {
    toast.error(res.message || "Validasi gagal")
    return
  }
  
  // Cross-check nama dengan SIPP
  if (res.data && res.data.pihak_nama.toLowerCase().trim() !== nama.toLowerCase().trim()) {
    const proceed = confirm(
      `Nama yang Anda isi berbeda dengan data SIPP: "${res.data.pihak_nama}". Lanjutkan?`
    )
    if (!proceed) return
  }
  
  // Simpan ke context dan lanjut
  onValidated({ ...res.data!, nama, telepon })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- components/features/booking-wizard/__tests__/step-validate.test.tsx --run
```

- [ ] **Step 5: Commit**

```bash
git add components/features/booking-wizard/step-validate.tsx components/features/booking-wizard/__tests__/step-validate.test.tsx
git commit -m "feat(design-parity): step validate add nama+telepon with SIPP cross-check"
```

---

### Task 4.3: Step 2 Slot — Date Kicker + Sans Font + Gradient Selected

**Files:**
- Modify: `components/features/booking-wizard/step-select-slot.tsx`

- [ ] **Step 1: Write failing tests for layout updates**

Tambah test ke existing test file (or create):

```typescript
describe('StepSelectSlot — Layout', () => {
  it('renders alert info about slot capacity', () => {
    // render component with mock slots
    expect(screen.getByText(/Tiap slot menampung.*8 antrian/)).toBeInTheDocument()
  })

  it('renders date kicker in mono uppercase brackets', () => {
    // ... assert [ Slot tersedia · {date} ]
  })

  it('uses sans font for time (not mono)', () => {
    // ... assert time element has font-sans class, not font-mono
  })
})
```

- [ ] **Step 2: Refactor step-select-slot.tsx**

Refer spec section 5.3 (lines 770-820). Key changes:

1. Tambah alert info di atas slot grid
2. Tambah date kicker mono uppercase brackets
3. Slot card time: ganti `font-mono` ke `font-sans` semibold 1.15rem
4. Selected state: gradient primary + ring 3px
5. Progress bar: 4px height gradient

- [ ] **Step 3: Run tests and commit**

```bash
pnpm test -- components/features/booking-wizard/__tests__/step-select-slot.test.tsx --run
git add components/features/booking-wizard/step-select-slot.tsx components/features/booking-wizard/__tests__/step-select-slot.test.tsx
git commit -m "feat(design-parity): step slot with alert, date kicker, sans font time, gradient selected"
```

---

### Task 4.4: Step 3 Confirm — 2-Column 8-Field Grid

**Files:**
- Modify: `components/features/booking-wizard/step-confirm.tsx`
- Test: `components/features/booking-wizard/__tests__/step-confirm.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepConfirm } from '@/components/features/booking-wizard/step-confirm'

const mockData = {
  validateData: {
    perkara_id: 100,
    pihak_nama: 'Andre',
    pihak_role: 'Penggugat',
    jadwal: {
      id: 1,
      perkara_id: 100,
      ruangan: 'Ruang 1',
      waktu: '2026-05-23T10:00:00',
      jam_sidang: '10:00',
      agenda: 'Pemeriksaan',
      perkara: {
        nomor_perkara: '0091/Pdt.G/2026/PA.Pnj',
        para_pihak: null,
        jenis_perkara_nama: 'Cerai Talak',
      },
    },
    existing_queue: null,
  },
  form: { nomor_perkara: '0091/Pdt.G/2026/PA.Pnj', nik: '3201234567890001', nama: 'Andre', telepon: '081234567890' },
  selectedSlot: { time: '10:00', capacity: 8, booked: 3, available: 5 },
}

describe('StepConfirm — 8 Field Review Grid', () => {
  it('renders all 8 confirm rows', () => {
    render(<StepConfirm {...mockData} onConfirm={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Nomor Perkara')).toBeInTheDocument()
    expect(screen.getByText('Jenis Perkara')).toBeInTheDocument()
    expect(screen.getByText('Nama Pemohon')).toBeInTheDocument()
    expect(screen.getByText('NIK')).toBeInTheDocument()
    expect(screen.getByText('Waktu Kedatangan')).toBeInTheDocument()
    expect(screen.getByText('Estimasi Antrian')).toBeInTheDocument()
    expect(screen.getByText('Notifikasi')).toBeInTheDocument()
    expect(screen.getByText('Tanggal Sidang')).toBeInTheDocument()
  })

  it('formats NIK with spaces every 4 digits', () => {
    render(<StepConfirm {...mockData} onConfirm={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('3201 2345 6789 0001')).toBeInTheDocument()
  })

  it('renders posisi estimasi format', () => {
    render(<StepConfirm {...mockData} onConfirm={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/Posisi ke-4 dari 8/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Refactor step-confirm.tsx with 2-col grid**

Refer spec section 5.4 (lines 825-870). Use ConfirmCell component dengan grid `grid-cols-1 sm:grid-cols-2` dan border logic.

- [ ] **Step 3: Run tests and commit**

```bash
pnpm test -- components/features/booking-wizard/__tests__/step-confirm.test.tsx --run
git add components/features/booking-wizard/step-confirm.tsx components/features/booking-wizard/__tests__/step-confirm.test.tsx
git commit -m "feat(design-parity): step confirm 2-col grid with 8 review fields"
```

---

### Task 4.5: Step 4 Ticket — Perforated Layout with Cutouts

**Files:**
- Modify: `components/features/booking-wizard/step-ticket.tsx`
- Test: `components/features/booking-wizard/__tests__/step-ticket.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
describe('StepTicket — Layout', () => {
  it('renders queue number in gold gradient', () => {
    render(<StepTicket {...mockData} />)
    expect(screen.getByText('S-014')).toBeInTheDocument()
  })

  it('renders kicker "Antrian Sidang · {institution}"', () => {
    render(<StepTicket {...mockData} />)
    expect(screen.getByText(/Antrian Sidang · Pengadilan Agama Penajam/)).toBeInTheDocument()
  })

  it('renders TicketRow Atas Nama + Nomor Perkara', () => {
    render(<StepTicket {...mockData} />)
    expect(screen.getByText('Atas Nama')).toBeInTheDocument()
    expect(screen.getByText('Nomor Perkara')).toBeInTheDocument()
  })

  it('renders real QR code (qrcode.react)', () => {
    render(<StepTicket {...mockData} />)
    // qrcode.react renders <svg>
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders WhatsApp notification footnote', () => {
    render(<StepTicket {...mockData} />)
    expect(screen.getByText(/Notifikasi WhatsApp akan dikirim/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Refactor step-ticket.tsx with perforated layout**

Refer spec section 5.5 (lines 880-980). Key elements:
- Grid 2-col `[1.4fr_1fr]` desktop
- Main: gradient `#062f17 → primary-3 → primary`, gold gradient queue number
- Side: gold-soft bg, **dashed border-left**, **circle cutouts** top/bottom
- QR container: dark `primary-3` bg, aspect-square, green shadow ring
- Footer note: mono opacity 55

- [ ] **Step 3: Run tests + visual check**

```bash
pnpm test -- components/features/booking-wizard/__tests__/step-ticket.test.tsx --run
pnpm dev # complete booking flow, verify ticket layout
```

- [ ] **Step 4: Commit**

```bash
git add components/features/booking-wizard/step-ticket.tsx components/features/booking-wizard/__tests__/step-ticket.test.tsx
git commit -m "feat(design-parity): step ticket perforated layout with cutouts and gold gradient"
```

---

### CHECKPOINT 4: Batch 4 + Final Verification

- [ ] **Step 1: Run full test suite**

```bash
pnpm test --run
```

Expected: all tests PASS, ~45+ new/updated test cases passing.

- [ ] **Step 2: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 3: E2E manual verification**

```bash
pnpm dev
```

Scenario:
1. Homepage → click "Daftar Antrian Sekarang"
2. Step 1: input 4 field → submit → Step 2
3. Step 2: pilih slot dengan progress bar gradient → submit → Step 3
4. Step 3: verify 8 row review grid (2-col layout)
5. Step 4: tiket render dengan perforated effect, QR real, footnote WhatsApp
6. Click "Cek Status Saya" di QueueStatus → input dari Step 4 → result display

- [ ] **Step 4: Visual responsive check**

Resize browser ke 375px (mobile), 768px (tablet). Verify:
- Hero stats stack vertical
- Schedule table mobile layout (no 7-col grid)
- Footer compact + detail collapse properly
- Booking wizard responsive
- Ticket cutouts hidden di mobile (grid-cols-1)

- [ ] **Step 5: Dark mode check**

Toggle dark mode di header — verify semua section masih readable:
- Hero stats dark variant card 3 (already dark)
- Panduan steps
- Schedule table contrast
- Footer
- Wizard modal

- [ ] **Step 6: Final commit summary**

```bash
git log --oneline -20
```

Verify per-batch commit history clear, ready for PR or merge.

**🎉 All 4 batches complete. Frontend design parity achieved.**

---

## Self-Review Checklist

After implementation, verify:

### Spec Coverage

| Spec Section | Plan Task |
|---|---|
| 1 Overview & Tokens | Task 0.1, 0.2 |
| 2.1 Hero Stats + Dark + Meta + Features + H1 | Task 1.1, 1.2 |
| 2.2 Panduan | Task 1.3 |
| 2.3 Footer CTA | Task 1.4 |
| 2.4 Footer Hybrid Opsi C | Task 1.5 |
| 3 Schedule Table | Task 2.1, 2.2 |
| 4.1 Queue Status | Task 3.1, 3.2 |
| 4.2 CekStatusDialog | Task 3.3 |
| 5.1 FormProgress | Task 4.1 |
| 5.2 Step Validate | Task 4.2 |
| 5.3 Step Slot | Task 4.3 |
| 5.4 Step Confirm | Task 4.4 |
| 5.5 Step Ticket | Task 4.5 |
| 6.1 Backend Requirements | (doc-only, untuk backend team) |
| 6.3 Testing | Distributed di setiap task |
| Print Styles | Task 0.1 (globals.css) |

### Backend Requirements (Documentation Only)

These are documented in spec Section 6.1 untuk backend team — frontend pakai fallback pattern di hook dan service:

- `GET /public/queue/current-call` — used by `useCurrentCall`, fallback ke `current: null`
- `GET /public/queue/status-by-number/:queue_number` — used by `CekStatusDialog`, fallback ke 404 alert
- `JadwalSidang.queue_number` extension — used by Schedule Table, fallback ke `"—"`
- `ValidateResponse.slot_position_hint` extension — used by Step 3, fallback ke estimasi `slot.booked + 1`

### Improvements Preserved

✅ Dark mode toggle (header)
✅ Real QR code (qrcode.react di Step 4)
✅ FloatingActionButton (existing, no change)
✅ ExistingQueueCard (existing, no change)
✅ RescheduleDialog dengan API real (existing, no change)
✅ Race condition Step 3 re-check
✅ Footer detail row (Opsi C — preserved alongside compact)

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-24-frontend-design-parity-plan.md`.**
