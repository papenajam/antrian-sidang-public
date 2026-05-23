# Layout Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure homepage layout - split sections, convert booking to modal, add FAB

**Architecture:** Global React context for modal state, FAB in header for all-page visibility, modal wraps BookingWizard with full-screen on mobile / large on desktop

**Tech Stack:** Next.js 16, React 19, shadcn Dialog, framer-motion, TypeScript

---

## File Structure

```
Modified:
- app/page.tsx                        # Split into 2 sections
- app/layout.tsx                       # Add providers
- components/features/hero-section.tsx # CTA opens modal
- components/layout/header.tsx         # Add FAB

Created:
- contexts/booking-modal-context.tsx   # Global modal state
- components/features/booking-modal.tsx      # Dialog wrapper
- components/features/floating-action-button.tsx  # FAB component
- docs/superpowers/plans/YYYY-MM-DD-...md  # This plan
```

---

## Task 1: Create Booking Modal Context

**Files:**
- Create: `contexts/booking-modal-context.tsx`

- [ ] **Step 1: Create context file**

```tsx
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface BookingModalContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(
  undefined
)

export function BookingModalProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <BookingModalContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </BookingModalContext.Provider>
  )
}

export function useBookingModal() {
  const context = useContext(BookingModalContext)
  if (context === undefined) {
    throw new Error("useBookingModal must be used within a BookingModalProvider")
  }
  return context
}
```

- [ ] **Step 2: Add provider to layout**

Modify `app/layout.tsx`:
```tsx
// Add import
import { BookingModalProvider } from "@/contexts/booking-modal-context"

// Wrap children in layout:
<BookingModalProvider>
  <AppSettingsProvider>
    <div className="relative flex min-h-screen flex-col">
      ...
    </div>
    <Toaster />
  </AppSettingsProvider>
</BookingModalProvider>
```

Note: In layout.tsx, place BookingModalProvider wrapping AppSettingsProvider, but inside the body div so the context is available.

- [ ] **Step 3: Commit**

```bash
git add contexts/booking-modal-context.tsx app/layout.tsx
git commit -m "feat: add booking modal context for global state management"
```

---

## Task 2: Create BookingModal Component

**Files:**
- Create: `components/features/booking-modal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
"use client"

import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { BookingWizard } from "./booking-wizard/booking-wizard"

export function BookingModal() {
  const { isOpen, setIsOpen } = useBookingModal()

  // Close on Escape key is handled by Dialog primitive automatically

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Daftar Antrian Baru</DialogTitle>
          <DialogDescription>
            Isi formulir untuk mendaftar antrian sidang
          </DialogDescription>
        </DialogHeader>

        {/* Close button - positioned top right */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Booking Wizard */}
        <BookingWizard />
      </DialogContent>
    </Dialog>
  )
}
```

Note: The Dialog component from shadcn already handles backdrop click and escape key to close.

- [ ] **Step 2: Commit**

```bash
git add components/features/booking-modal.tsx
git commit -m "feat: create BookingModal component wrapping BookingWizard"
```

---

## Task 3: Create FloatingActionButton Component

**Files:**
- Create: `components/features/floating-action-button.tsx`

- [ ] **Step 1: Create the FAB component**

```tsx
"use client"

import { Plus } from "lucide-react"
import { useBookingModal } from "@/contexts/booking-modal-context"
import { motion } from "framer-motion"
import { toast } from "sonner"

export function FloatingActionButton() {
  const { setIsOpen } = useBookingModal()

  const handleClick = () => {
    setIsOpen(true)
    toast.info("Membuka formulir pendaftaran antrian")
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-offset-background transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label="Daftar Antrian Baru"
      title="Daftar Antrian Baru"
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/features/floating-action-button.tsx
git commit -m "feat: create floating action button for quick booking access"
```

---

## Task 4: Add FAB to Header (All Pages)

**Files:**
- Modify: `components/layout/header.tsx`

- [ ] **Step 1: Import and add FAB**

Modify the return statement in header.tsx:

```tsx
// Add import at top
import { FloatingActionButton } from "@/components/features/floating-action-button"

// At the end of the return, add FAB (before closing header tag)
return (
  <>
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      {/* ... existing header content ... */}
    </header>

    {/* FAB - visible on all pages */}
    <FloatingActionButton />
  </>
)
```

Note: The header uses fragments `<> </>` to wrap both header and FAB.

- [ ] **Step 2: Commit**

```bash
git add components/layout/header.tsx
git commit -m "feat: add FAB to header for all-page visibility"
```

---

## Task 5: Update HeroSection CTA

**Files:**
- Modify: `components/features/hero-section.tsx`

- [ ] **Step 1: Update CTA to use modal**

Modify hero-section.tsx:

```tsx
// Add imports
import { useBookingModal } from "@/contexts/booking-modal-context"
import { Button } from "@/components/ui/button"

// In HeroSection function, add:
const { setIsOpen } = useBookingModal()

// Replace the Link component with Button:
<Button
  onClick={() => setIsOpen(true)}
  className="text-sm sm:text-base"
>
  Daftar Antrian Sekarang
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>

// Remove: import Link from "next/link"
// Remove: <Link href="#daftar">
```

- [ ] **Step 2: Commit**

```bash
git add components/features/hero-section.tsx
git commit -m "feat: update HeroSection CTA to open modal instead of scrolling"
```

---

## Task 6: Update page.tsx - Split Sections

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update page structure**

Replace the entire page.tsx content:

```tsx
import { HeroSection } from "@/components/features/hero-section"
import { QueueStatus } from "@/components/features/queue-status"
import { ScheduleTable } from "@/components/features/schedule-table"
import { BookingModal } from "@/components/features/booking-modal"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />

      <main className="container mx-auto px-4 py-10 sm:px-6 sm:py-14 md:px-8 lg:py-16">
        {/* Section: Status Antrian - Full width */}
        <section className="mb-10 sm:mb-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight sm:mb-8 sm:text-3xl lg:text-4xl">
            Status Antrian
          </h2>
          <QueueStatus />
        </section>

        {/* Section: Jadwal Sidang - Full width */}
        <section id="jadwal" className="mb-10 sm:mb-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight sm:mb-8 sm:text-3xl lg:text-4xl">
            Jadwal Sidang Hari Ini
          </h2>
          <ScheduleTable />
        </section>
      </main>

      {/* Booking Modal - rendered at page level */}
      <BookingModal />
    </div>
  )
}
```

Note: Removed BookingWizard import and inline section. Modal is handled by BookingModal which uses the context.

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: split page into two sections, remove inline booking form"
```

---

## Task 7: Update BookingWizard - Close on Success

**Files:**
- Modify: `components/features/booking-wizard/booking-wizard.tsx`

- [ ] **Step 1: Add close on success**

In booking-wizard.tsx, modify the `handleConfirmNext` function to close the modal:

```tsx
// Add import
import { useBookingModal } from "@/contexts/booking-modal-context"

// In BookingWizard function, add:
const { setIsOpen } = useBookingModal()

// Modify handleConfirmNext:
const handleConfirmNext = (ticketData: QueueTicket) => {
  setTicket({
    ...ticketData,
    slot_time: bookingData.selectedSlot?.time || "",
  })
  setCurrentStep(4)
  toast.success("Booking berhasil!", {
    description: `Nomor antrian Anda: ${ticketData.queue_number}`,
  })
  // Close modal after successful booking
  setIsOpen(false)
}

// Also modify handleBookAgain to close modal:
const handleBookAgain = () => {
  setCurrentStep(1)
  setBookingData(INITIAL_BOOKING_DATA)
  setTicket(null)
  setExistingQueue(null)
  setIsOpen(false)
}
```

Note: After closing, user can reopen via FAB or HeroSection button to book again.

- [ ] **Step 2: Commit**

```bash
git add components/features/booking-wizard/booking-wizard.tsx
git commit -m "feat: close modal on successful booking and book again action"
```

---

## Task 8: Build and Test

- [ ] **Step 1: Run build**

```bash
pnpm build
```

Expected: Successful build with no errors

- [ ] **Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass (or pre-existing failures)

- [ ] **Step 3: Manual verification**

1. Open homepage - should see two sections (Status Antrian, Jadwal Sidang)
2. Click "Daftar Antrian Sekarang" in HeroSection - modal should open
3. Click FAB (bottom-right) - modal should open
4. Close modal via X button, click outside, or Escape
5. Complete a booking - modal should close on success
6. FAB should be visible on all pages (navigate to other routes)

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | contexts/booking-modal-context.tsx | Global modal state |
| 2 | components/features/booking-modal.tsx | Modal wrapper |
| 3 | components/features/floating-action-button.tsx | FAB component |
| 4 | components/layout/header.tsx | Add FAB to header |
| 5 | components/features/hero-section.tsx | Update CTA |
| 6 | app/page.tsx | Split sections |
| 7 | components/features/booking-wizard/booking-wizard.tsx | Close on success |
| 8 | - | Build and test |

---

**Plan complete and saved to:** `docs/superpowers/plans/2026-05-23-layout-restructuring.md`

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?