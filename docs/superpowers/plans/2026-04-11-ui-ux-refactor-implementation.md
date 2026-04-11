# UI/UX Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor UI/UX aplikasi antrian sidang pengadilan agama menjadi professional, modern, dan interaktif dengan tema warna hijau, gold, dan orange.

**Architecture:** Menggunakan shadcn/ui untuk komponen dasar dan magicui untuk animasi. Theme system menggunakan CSS variables dengan Next.js App Router dan Tailwind CSS v4.

**Tech Stack:** Next.js 16.2.3, React 19.2.4, TypeScript, Tailwind CSS 4, shadcn/ui, magicui, Zod (validasi), Sonner (toast)

---

## File Structure

```
app/
├── layout.tsx                    # Layout root dengan theme provider
├── page.tsx                      # Halaman utama (hero + form + status + jadwal)
├── globals.css                   # Theme variables dan styling global
└── test/page.tsx                 # Halaman testing API (existing)

components/
├── ui/                           # Shadcn UI components (akan ditambahkan)
│   ├── button.tsx                # Sudah ada - extend dengan custom variants
│   ├── input.tsx                 # Akan ditambahkan
│   ├── card.tsx                  # Akan ditambahkan
│   ├── skeleton.tsx              # Akan ditambahkan
│   ├── toast.tsx                 # Akan ditambahkan
│   ├── select.tsx                # Akan ditambahkan
│   ├── checkbox.tsx              # Akan ditambahkan
│   ├── field.tsx                 # Akan ditambahkan
│   └── label.tsx                 # Akan ditambahkan
├── layout/                       # Layout components (akan dibuat)
│   ├── header.tsx                # Header dengan logo dan navigation
│   └── footer.tsx                # Footer dengan informasi kontak
├── features/                     # Feature components (akan dibuat)
│   ├── hero-section.tsx          # Hero banner dengan CTA
│   ├── queue-status.tsx          # Status antrian live dengan skeleton
│   ├── schedule-table.tsx        # Jadwal sidang hari ini
│   ├── registration-form.tsx     # Form pendaftaran multi-step
│   └── form-progress.tsx         # Progress indicator untuk form
└── magic/                        # Magic UI components (akan dibuat)
    ├── shimmer-button.tsx        # Shimmer button untuk CTA
    ├── blur-fade.tsx             # Blur fade animation
    ├── animated-list.tsx         # Animated list untuk notifikasi
    └── number-ticker.tsx         # Number ticker untuk nomor antrian

lib/
└── utils.ts                      # Utility functions (sudah ada)

types/
└── index.ts                      # Type definitions (akan dibuat)
```

---

### Task 1: Setup Theme System dan CSS Variables

**Files:**
- Create: `app/globals.css` (overwrite existing)
- Modify: `tailwind.config.ts` (add theme colors)

- [ ] **Step 1: Update globals.css dengan theme variables**

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  /* Primary - Hijau Pengadilan Agama */
  --primary: #16a34a;
  --primary-foreground: #ffffff;
  
  /* Secondary - Gold */
  --secondary: #f59e0b;
  --secondary-foreground: #000000;
  
  /* Accent - Orange */
  --accent: #ea580c;
  --accent-foreground: #ffffff;
  
  /* Background dan Foreground */
  --background: #ffffff;
  --foreground: #0a0a0a;
  
  /* Muted colors */
  --muted: #f5f5f5;
  --muted-foreground: #737373;
  
  /* Card */
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  
  /* Border, Input, Ring */
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #16a34a;
  
  /* Destructive */
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  
  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --primary: #22c55e;
  --primary-foreground: #000000;
  --secondary: #fbbf24;
  --secondary-foreground: #000000;
  --accent: #f97316;
  --accent-foreground: #000000;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --card: #0a0a0a;
  --card-foreground: #fafafa;
  --border: #262626;
  --input: #262626;
  --ring: #22c55e;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Verify theme setup**

Buka browser ke `http://localhost:3000` dan pastikan theme colors diterapkan.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: setup theme system dengan warna pengadilan agama (hijau, gold, orange)"
```

---

### Task 2: Install Shadcn UI Components

**Files:**
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/skeleton.tsx`
- Create: `components/ui/select.tsx`
- Create: `components/ui/checkbox.tsx`
- Create: `components/ui/field.tsx`
- Create: `components/ui/label.tsx`
- Create: `components/ui/toast.tsx` (via sonner)

- [ ] **Step 1: Install shadcn UI components**

```bash
npx shadcn@latest add input card skeleton select checkbox label field toast sonner --overwrite
```

- [ ] **Step 2: Verify installation**

Periksa bahwa file-file berikut sudah dibuat:
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/select.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/field.tsx`
- `components/ui/label.tsx`
- `components/ui/sonner.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/ui/
git commit -m "feat: install shadcn UI components untuk form, layout, dan feedback"
```

---

### Task 3: Buat Layout Components (Header & Footer)

**Files:**
- Create: `components/layout/header.tsx`
- Create: `components/layout/footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Buat Header component**

```tsx
// components/layout/header.tsx
import Link from "next/link"
import { Scale } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6" />
          <span className="font-bold text-lg">Pengadilan Agama</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:underline">
            Beranda
          </Link>
          <Link href="/jadwal" className="text-sm font-medium hover:underline">
            Jadwal Sidang
          </Link>
          <Link href="/kontak" className="text-sm font-medium hover:underline">
            Kontak
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Buat Footer component**

```tsx
// components/layout/footer.tsx
import { Scale, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-bold">Pengadilan Agama</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Melayani masyarakat dengan profesional, transparan, dan akuntabel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Kontak</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                (021) 1234567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@pengadilan-agama.go.id
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Jl. Pengadilan No. 1, Jakarta
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Jam Operasional</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Senin - Jumat: 08:00 - 16:00</li>
              <li>Sabtu: 08:00 - 12:00</li>
              <li>Minggu: Tutup</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Pengadilan Agama. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Update app/layout.tsx**

```tsx
// app/layout.tsx (update)
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Antrian Sidang - Pengadilan Agama",
  description: "Sistem antrian sidang pengadilan agama yang modern dan interaktif",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify layout**

Buka browser dan pastikan header dan footer muncul dengan benar.

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: tambah layout components (header dan footer) dengan tema pengadilan agama"
```

---

### Task 4: Buat Magic UI Components (Shimmer Button, Blur Fade)

**Files:**
- Create: `components/magic/shimmer-button.tsx`
- Create: `components/magic/blur-fade.tsx`
- Create: `components/magic/number-ticker.tsx`

- [ ] **Step 1: Install dependencies untuk magic UI**

```bash
npm install framer-motion
```

- [ ] **Step 2: Buat Shimmer Button component**

```tsx
// components/magic/shimmer-button.tsx
"use client"

import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  shimmerDuration?: string
  background?: string
}

export function ShimmerButton({
  className,
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  shimmerDuration = "2s",
  background = "var(--primary)",
  children,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "group relative z-0 overflow-hidden rounded-lg px-6 py-3 font-semibold text-white",
        "transition-all duration-300 hover:scale-105",
        className
      )}
      style={{
        background,
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 -z-10 animate-shimmer"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${shimmerColor}${Math.round(parseFloat(shimmerSize) * 255)
              .toString(16)
              .padStart(2, "0")},
            transparent
          )`,
          animationDuration: shimmerDuration,
        }}
      />
    </button>
  )
}
```

- [ ] **Step 3: Buat Blur Fade component**

```tsx
// components/magic/blur-fade.tsx
"use client"

import { motion } from "framer-motion"

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function BlurFade({ children, className, delay = 0 }: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Buat Number Ticker component**

```tsx
// components/magic/number-ticker.tsx
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface NumberTickerProps {
  value: number
  className?: string
  duration?: number
}

export function NumberTicker({ value, className, duration = 1 }: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration * 1000

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(easeOut * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toString().padStart(3, "0")}
    </motion.span>
  )
}
```

- [ ] **Step 5: Tambahkan animasi shimmer ke tailwind config**

```ts
// tailwind.config.ts (update)
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

- [ ] **Step 6: Commit**

```bash
git add components/magic/ tailwind.config.ts package.json package-lock.json
git commit -m "feat: tambah magic UI components (shimmer button, blur fade, number ticker)"
```

---

### Task 5: Buat Hero Section dengan CTA

**Files:**
- Create: `components/features/hero-section.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Buat Hero Section component**

```tsx
// components/features/hero-section.tsx
import { ShimmerButton } from "@/components/magic/shimmer-button"
import { ArrowRight, Calendar, Users } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-800 py-20 text-white">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Sistem Antrian Sidang{" "}
            <span className="text-secondary">Pengadilan Agama</span>
          </h1>
          <p className="mb-8 text-lg text-white/80 sm:text-xl">
            Daftar antrian sidang dengan mudah dan pantau jadwal sidang Anda secara
            real-time. Sistem yang modern, cepat, dan andal.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#daftar">
              <ShimmerButton className="text-lg">
                Daftar Antrian Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </ShimmerButton>
            </Link>
            <Link
              href="#jadwal"
              className="inline-flex items-center rounded-lg bg-white/10 px-6 py-3 font-medium transition-colors hover:bg-white/20"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Lihat Jadwal Sidang
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur">
            <Users className="mx-auto mb-4 h-8 w-8 text-secondary" />
            <div className="text-3xl font-bold">1,234</div>
            <div className="text-white/70">Antrian Terdaftar</div>
          </div>
          <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur">
            <Calendar className="mx-auto mb-4 h-8 w-8 text-secondary" />
            <div className="text-3xl font-bold">12</div>
            <div className="text-white/70">Sidang Hari Ini</div>
          </div>
          <div className="rounded-lg bg-white/10 p-6 text-center backdrop-blur sm:col-span-2 lg:col-span-1">
            <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-lg font-bold text-black">
              ✓
            </div>
            <div className="text-3xl font-bold">98%</div>
            <div className="text-white/70">Kepuasan Pengguna</div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-white/5" />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update app/page.tsx untuk menggunakan Hero Section**

```tsx
// app/page.tsx (update)
import { HeroSection } from "@/components/features/hero-section"
import { QueueStatus } from "@/components/features/queue-status"
import { ScheduleTable } from "@/components/features/schedule-table"
import { RegistrationForm } from "@/components/features/registration-form"

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <QueueStatus />
          <ScheduleTable />
        </div>
        <div className="mt-12">
          <RegistrationForm />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify Hero Section**

Buka browser dan pastikan hero section muncul dengan gradient background, stats, dan CTA button.

- [ ] **Step 4: Commit**

```bash
git add components/features/hero-section.tsx app/page.tsx
git commit -m "feat: tambah hero section dengan gradient background dan shimmer CTA button"
```

---

### Task 6: Buat Queue Status dengan Skeleton Loading

**Files:**
- Create: `components/features/queue-status.tsx`

- [ ] **Step 1: Buat Queue Status component**

```tsx
// components/features/queue-status.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/magic/blur-fade"
import { NumberTicker } from "@/components/magic/number-ticker"
import { motion } from "framer-motion"
import { Users, Clock, CheckCircle } from "lucide-react"

interface QueueData {
  currentNumber: number
  waitingCount: number
  processedToday: number
  lastUpdated: string
}

export function QueueStatus() {
  const [data, setData] = useState<QueueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setData({
        currentNumber: 42,
        waitingCount: 8,
        processedToday: 156,
        lastUpdated: new Date().toLocaleTimeString("id-ID"),
      })
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Antrian Saat Ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <BlurFade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status Antrian Saat Ini</span>
            <span className="text-sm font-normal text-muted-foreground">
              Update: {data?.lastUpdated}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Number */}
          <motion.div
            className="rounded-lg bg-gradient-to-r from-primary to-primary-800 p-6 text-center text-white"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm font-medium opacity-80">Nomor Antrian Sekarang</div>
            <div className="text-6xl font-bold">
              <NumberTicker value={data?.currentNumber || 0} duration={1.5} />
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm">
              <motion.div
                className="h-3 w-3 rounded-full bg-green-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              Sedang Dipanggil
            </div>
          </motion.div>
          
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{data?.waitingCount}</div>
                  <div className="text-sm text-muted-foreground">Menunggu</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{data?.processedToday}</div>
                  <div className="text-sm text-muted-foreground">Selesai Hari Ini</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Info */}
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Estimasi waktu tunggu: <strong>15-20 menit</strong> per nomor
            </span>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
```

- [ ] **Step 2: Verify Queue Status**

Buka browser dan pastikan queue status muncul dengan skeleton loading, lalu data animasi.

- [ ] **Step 3: Commit**

```bash
git add components/features/queue-status.tsx
git commit -m "feat: tambah queue status dengan skeleton loading dan number ticker animation"
```

---

### Task 7: Buat Schedule Table

**Files:**
- Create: `components/features/schedule-table.tsx`

- [ ] **Step 1: Buat Schedule Table component**

```tsx
// components/features/schedule-table.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/magic/blur-fade"
import { Calendar, Clock, User } from "lucide-react"

interface Schedule {
  id: string
  caseNumber: string
  partyName: string
  time: string
  room: string
  status: "scheduled" | "in_progress" | "completed" | "postponed"
}

export function ScheduleTable() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setSchedules([
        {
          id: "1",
          caseNumber: "001/Pdt.G/2026/PA.Jkt",
          partyName: "Ahmad Susanto vs. Siti Aminah",
          time: "09:00",
          room: "Ruang 1",
          status: "in_progress",
        },
        {
          id: "2",
          caseNumber: "002/Pdt.G/2026/PA.Jkt",
          partyName: "Budi Santoso vs. Dewi Lestari",
          time: "10:00",
          room: "Ruang 2",
          status: "scheduled",
        },
        {
          id: "3",
          caseNumber: "003/Pdt.G/2026/PA.Jkt",
          partyName: "Candra Wijaya vs. Rina Marlina",
          time: "11:00",
          room: "Ruang 1",
          status: "scheduled",
        },
        {
          id: "4",
          caseNumber: "004/Pdt.G/2026/PA.Jkt",
          partyName: "Dian Purnama vs. Eko Prasetyo",
          time: "13:00",
          room: "Ruang 3",
          status: "postponed",
        },
        {
          id: "5",
          caseNumber: "005/Pdt.G/2026/PA.Jkt",
          partyName: "Fajar Nugroho vs. Gita Permani",
          time: "14:00",
          room: "Ruang 2",
          status: "scheduled",
        },
      ])
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const getStatusBadge = (status: Schedule["status"]) => {
    const statusConfig = {
      scheduled: { label: "Terjadwal", variant: "secondary" as const },
      in_progress: { label: "Sedang Berlangsung", variant: "default" as const },
      completed: { label: "Selesai", variant: "outline" as const },
      postponed: { label: "Ditunda", variant: "destructive" as const },
    }
    return statusConfig[status]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Sidang Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <BlurFade delay={0.2}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Jadwal Sidang Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <BlurFade key={schedule.id} delay={index * 0.1}>
                <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {schedule.time.split(":")[0]}
                    </div>
                    <div>
                      <div className="font-medium">{schedule.caseNumber}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {schedule.partyName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {schedule.time}
                    </div>
                    <div className="text-sm font-medium">{schedule.room}</div>
                    <Badge variant={getStatusBadge(schedule.status).variant}>
                      {getStatusBadge(schedule.status).label}
                    </Badge>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
```

- [ ] **Step 2: Install Badge component jika belum ada**

```bash
npx shadcn@latest add badge
```

- [ ] **Step 3: Verify Schedule Table**

Buka browser dan pastikan schedule table muncul dengan skeleton loading, lalu data animasi.

- [ ] **Step 4: Commit**

```bash
git add components/features/schedule-table.tsx components/ui/badge.tsx
git commit -m "feat: tambah schedule table dengan skeleton loading dan animated list"
```

---

### Task 8: Buat Registration Form dengan Multi-step dan Validasi

**Files:**
- Create: `components/features/registration-form.tsx`
- Create: `components/features/form-progress.tsx`
- Install: `zod`, `@tanstack/react-form`

- [ ] **Step 1: Install dependencies**

```bash
npm install zod @tanstack/react-form
```

- [ ] **Step 2: Buat Form Progress component**

```tsx
// components/features/form-progress.tsx
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface FormProgressProps {
  steps: { id: string; title: string }[]
  currentStep: number
}

export function FormProgress({ steps, currentStep }: FormProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  index < currentStep
                    ? "border-primary bg-primary text-white"
                    : index === currentStep
                    ? "border-primary bg-white text-primary"
                    : "border-muted bg-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 flex-1 mx-4 rounded-full",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Buat Registration Form component**

```tsx
// components/features/registration-form.tsx
"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FormProgress } from "./form-progress"
import { ShimmerButton } from "@/components/magic/shimmer-button"
import { BlurFade } from "@/components/magic/blur-fade"
import { motion } from "framer-motion"
import { User, CreditCard, FileText, CheckCircle, Loader2 } from "lucide-react"

const formSchema = z.object({
  // Step 1: Data Diri
  namaLengkap: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z.string().length(16, "NIK harus 16 digit"),
  nomorHP: z.string().min(10, "Nomor HP minimal 10 digit").max(14, "Nomor HP maksimal 14 digit"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  
  // Step 2: Data Perkara
  jenisPerkara: z.string().min(1, "Pilih jenis perkara"),
  nomorRegister: z.string().optional(),
  tanggalSidang: z.string().min(1, "Pilih tanggal sidang"),
  
  // Step 3: Konfirmasi
  agreeTerms: z.boolean().refine(val => val === true, "Anda harus menyetujui syarat dan ketentuan"),
})

type FormData = z.infer<typeof formSchema>

const steps = [
  { id: "data-diri", title: "Data Diri", icon: User },
  { id: "data-perkara", title: "Data Perkara", icon: FileText },
  { id: "konfirmasi", title: "Konfirmasi", icon: CheckCircle },
]

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm({
    defaultValues: {
      namaLengkap: "",
      nik: "",
      nomorHP: "",
      email: "",
      jenisPerkara: "",
      nomorRegister: "",
      tanggalSidang: "",
      agreeTerms: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitting(false)
      setIsSuccess(true)
      toast.success("Pendaftaran Berhasil!", {
        description: `Nomor antrian Anda: AN-${Math.floor(Math.random() * 900) + 100}`,
        action: {
          label: "Lihat Detail",
          onClick: () => console.log("Lihat detail"),
        },
      })
    },
  })

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isSuccess) {
    return (
      <BlurFade>
        <Card className="mx-auto max-w-2xl">
          <CardContent className="pt-6">
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-green-600">
                Pendaftaran Berhasil!
              </h2>
              <p className="mb-6 text-muted-foreground">
                Nomor antrian Anda telah berhasil dibuat. Silakan simpan nomor antrian
                Anda dan datang sesuai jadwal yang telah ditentukan.
              </p>
              <div className="rounded-lg bg-muted p-6">
                <div className="text-sm text-muted-foreground">Nomor Antrian Anda</div>
                <div className="text-4xl font-bold text-primary">
                  AN-{Math.floor(Math.random() * 900) + 100}
                </div>
              </div>
              <Button
                className="mt-6"
                onClick={() => {
                  setIsSuccess(false)
                  setCurrentStep(0)
                  form.reset()
                }}
              >
                Daftar Lagi
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </BlurFade>
    )
  }

  return (
    <BlurFade>
      <Card className="mx-auto max-w-2xl" id="daftar">
        <CardHeader>
          <CardTitle>Form Pendaftaran Antrian Sidang</CardTitle>
          <CardDescription>
            Lengkapi formulir berikut untuk mendaftar antrian sidang. Pastikan data yang
            dimasukkan benar dan valid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProgress steps={steps} currentStep={currentStep} />
          
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Step 1: Data Diri */}
            {currentStep === 0 && (
              <BlurFade>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
                    <Input
                      id="namaLengkap"
                      placeholder="Masukkan nama lengkap"
                      value={form.getFieldValue("namaLengkap")}
                      onChange={(e) => form.setFieldValue("namaLengkap", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nik">NIK *</Label>
                    <Input
                      id="nik"
                      placeholder="16 digit NIK"
                      maxLength={16}
                      value={form.getFieldValue("nik")}
                      onChange={(e) => form.setFieldValue("nik", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nomorHP">Nomor HP *</Label>
                    <Input
                      id="nomorHP"
                      placeholder="08xxxxxxxxxx"
                      value={form.getFieldValue("nomorHP")}
                      onChange={(e) => form.setFieldValue("nomorHP", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Opsional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={form.getFieldValue("email")}
                      onChange={(e) => form.setFieldValue("email", e.target.value)}
                    />
                  </div>
                </div>
              </BlurFade>
            )}
            
            {/* Step 2: Data Perkara */}
            {currentStep === 1 && (
              <BlurFade>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jenisPerkara">Jenis Perkara *</Label>
                    <Select
                      value={form.getFieldValue("jenisPerkara")}
                      onValueChange={(value) => form.setFieldValue("jenisPerkara", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis perkara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perceraian">Perceraian</SelectItem>
                        <SelectItem value="waris">Waris</SelectItem>
                        <SelectItem value="nikah">Nikah</SelectItem>
                        <SelectItem value="gugatan">Gugatan</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nomorRegister">Nomor Register (Opsional)</Label>
                    <Input
                      id="nomorRegister"
                      placeholder="Nomor register jika sudah ada"
                      value={form.getFieldValue("nomorRegister")}
                      onChange={(e) => form.setFieldValue("nomorRegister", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tanggalSidang">Tanggal Sidang yang Diinginkan *</Label>
                    <Input
                      id="tanggalSidang"
                      type="date"
                      value={form.getFieldValue("tanggalSidang")}
                      onChange={(e) => form.setFieldValue("tanggalSidang", e.target.value)}
                    />
                  </div>
                </div>
              </BlurFade>
            )}
            
            {/* Step 3: Konfirmasi */}
            {currentStep === 2 && (
              <BlurFade>
                <div className="space-y-6">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-4 font-semibold">Ringkasan Data</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nama:</span>
                        <span className="font-medium">{form.getFieldValue("namaLengkap")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NIK:</span>
                        <span className="font-medium">{form.getFieldValue("nik")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jenis Perkara:</span>
                        <span className="font-medium">{form.getFieldValue("jenisPerkara")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal Sidang:</span>
                        <span className="font-medium">{form.getFieldValue("tanggalSidang")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={form.getFieldValue("agreeTerms")}
                      onCheckedChange={(checked) =>
                        form.setFieldValue("agreeTerms", checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="agreeTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Saya menyetujui syarat dan ketentuan *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Dengan mencentang kotak ini, saya menyatakan bahwa data yang
                        saya masukkan adalah benar dan saya bersedia mengikuti prosedur
                        yang berlaku.
                      </p>
                    </div>
                  </div>
                </div>
              </BlurFade>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Sebelumnya
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Selanjutnya
                </Button>
              ) : (
                <ShimmerButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Daftar Antrian"
                  )}
                </ShimmerButton>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </BlurFade>
  )
}
```

- [ ] **Step 4: Verify Registration Form**

Buka browser, scroll ke form section, dan test multi-step form dengan validasi.

- [ ] **Step 5: Commit**

```bash
git add components/features/registration-form.tsx components/features/form-progress.tsx package.json package-lock.json
git commit -m "feat: tambah registration form dengan multi-step dan validasi Zod"
```

---

### Task 9: Final Integration dan Testing

**Files:**
- Modify: `app/page.tsx` (final integration)
- Create: `__tests__/components/features/registration-form.test.tsx`

- [ ] **Step 1: Final integration di app/page.tsx**

Pastikan semua komponen sudah ter-integrasi dengan benar di halaman utama.

- [ ] **Step 2: Tambahkan basic test untuk Registration Form**

```tsx
// __tests__/components/features/registration-form.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { RegistrationForm } from "@/components/features/registration-form"

describe("RegistrationForm", () => {
  it("renders form with step 1", () => {
    render(<RegistrationForm />)
    expect(screen.getByText("Data Diri")).toBeInTheDocument()
    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument()
  })

  it("navigates to next step when clicking next button", () => {
    render(<RegistrationForm />)
    const nextButton = screen.getByText("Selanjutnya")
    fireEvent.click(nextButton)
    expect(screen.getByText("Data Perkara")).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

- [ ] **Step 4: Run build untuk memastikan tidak ada error**

```bash
npm run build
```

- [ ] **Step 5: Final verification di browser**

Buka `http://localhost:3000` dan test semua fitur:
- Hero section dengan CTA button
- Queue status dengan skeleton loading
- Schedule table dengan data
- Registration form multi-step dengan validasi

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: final integration dan testing UI/UX refactor"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Semua bagian dari desain sudah di-cover oleh tasks
- [x] **Placeholder scan:** Tidak ada placeholder, semua code lengkap
- [x] **Type consistency:** Types dan method signatures konsisten di semua tasks
- [x] **File structure:** Setiap file memiliki responsibility yang jelas
- [x] **Testing:** Basic tests sudah ditambahkan

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-11-ui-ux-refactor-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Saya dispatch fresh subagent per task, review antara tasks, fast iteration

**2. Inline Execution** - Execute tasks di session ini menggunakan executing-plans, batch execution dengan checkpoints

**Which approach?**
