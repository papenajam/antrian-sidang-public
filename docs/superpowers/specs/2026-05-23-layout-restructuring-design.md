# Design Spec: Layout Restructure - Modal Booking + Split Sections

**Tanggal:** 2026-05-23
**Status:** Approved

---

## Overview

Restrukturasi layout halaman utama untuk meningkatkan user experience dengan:
1. Memisahkan Status Antrian dan Jadwal Sidang menjadi section terpisah
2. Mengubah form booking menjadi modal instead of inline section
3. Menambahkan Floating Action Button (FAB) untuk quick access

---

## Changes

### 1. Layout Structure

**Before:**
- HeroSection
- Combined "Status & Jadwal" section (grid 2 columns)
- Inline Booking Wizard section

**After:**
- HeroSection (dengan CTA button untuk modal)
- Standalone "Status Antrian" section
- Standalone "Jadwal Sidang" section
- FAB untuk membuka modal booking

### 2. Page Structure (`app/page.tsx`)

```tsx
<div className="flex flex-col">
  <HeroSection />

  <main className="container mx-auto px-4 py-10 sm:px-6 sm:py-14 md:px-8 lg:py-16">
    {/* Section: Status Antrian - Full width */}
    <section className="mb-10 sm:mb-16">
      <h2 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
        Status Antrian
      </h2>
      <QueueStatus />
    </section>

    {/* Section: Jadwal Sidang - Full width */}
    <section id="jadwal" className="mb-10 sm:mb-16">
      <h2 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">
        Jadwal Sidang Hari Ini
      </h2>
      <ScheduleTable />
    </section>
  </main>

  {/* FAB - Fixed position */}
  <FloatingActionButton onClick={() => setIsBookingModalOpen(true)} />

  {/* Booking Modal */}
  <BookingModal
    open={isBookingModalOpen}
    onOpenChange={setIsBookingModalOpen}
  />
</div>
```

### 3. Modal Design

**Component:** `components/features/booking-modal.tsx`

**Props:**
- `open: boolean` - Modal visibility state
- `onOpenChange: (open: boolean) => void` - State setter

**Implementation:**
- Wrap `BookingWizard` in shadcn Dialog component
- Full-screen on mobile (`max-w-full`), large on desktop (`max-w-4xl`)
- Header with title "Daftar Antrian Baru" and close button
- Body contains `BookingWizard` component
- Footer with subtle hint text

**Close behavior:**
- X button in header
- Click outside modal
- Escape key
- "Booking Lagi" success action closes modal

### 4. FAB (Floating Action Button) Design

**Component:** `components/features/floating-action-button.tsx`

**Props:**
- `onClick: () => void` - Click handler to open modal

**Style:**
- Position: `fixed bottom-6 right-6` (24px from edges)
- Size: `h-14 w-14` (56px diameter)
- Icon: `Plus` from lucide-react
- Color: Primary background, white icon
- Shadow: `shadow-lg`
- Animation: Scale on hover (`hover:scale-110`)
- Tooltip: "Daftar Antrian Baru" on hover (desktop only)

**Accessibility:**
- `aria-label="Daftar Antrian Baru"`
- Focus ring on keyboard navigation
- `role="button"`

### 5. HeroSection CTA Update

**Change:**
- Button "Daftar Antrian Sekarang" triggers `onOpenChange(true)` instead of scrolling to `#daftar`
- Remove `id="daftar"` from booking section

### 6. State Management

**Location:** `app/page.tsx`

**State:**
```tsx
const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
```

**Pass to:**
- `BookingModal` component
- `FloatingActionButton` onClick handler

---

## Component Inventory

| Component | File | Description |
|-----------|------|-------------|
| BookingModal | `components/features/booking-modal.tsx` | Dialog wrapper for BookingWizard |
| FloatingActionButton | `components/features/floating-action-button.tsx` | FAB for quick booking access |
| Updated page | `app/page.tsx` | Main page with split sections |

---

## Files to Create/Modify

### Create:
- `components/features/booking-modal.tsx`
- `components/features/floating-action-button.tsx`

### Modify:
- `app/page.tsx` - Split sections, add state, import new components
- `components/features/hero-section.tsx` - Update CTA to open modal
- `components/features/booking-wizard/booking-wizard.tsx` - Handle close on success

---

## Acceptance Criteria

1. ✅ Status Antrian displayed as standalone section with heading
2. ✅ Jadwal Sidang displayed as standalone section with heading
3. ✅ "Daftar Antrian Sekarang" button in HeroSection opens modal
4. ✅ FAB visible on all pages, opens booking modal on click
5. ✅ Modal closes on success booking, close button, click outside, Escape
6. ✅ Responsive: full-screen on mobile, large modal on desktop
7. ✅ Accessibility: proper ARIA labels, keyboard navigation