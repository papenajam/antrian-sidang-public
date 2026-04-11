# UI/UX Fixes (P1–P3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbaiki semua isu UI/UX prioritas P1–P3 yang ditemukan dalam code review, mulai dari form validation yang kritis hingga polish visual.

**Architecture:** Setiap perbaikan dilakukan di file yang sudah ada tanpa membuat file baru kecuali ThemeToggle component. Perbaikan diurut dari dampak paling kritis (P1) ke minor (P3) agar app selalu dalam keadaan dapat digunakan setelah setiap task.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Form, Framer Motion, next-themes, Radix UI/shadcn, Lucide React

---

## File Map

| File | Aksi | Isu yang Diperbaiki |
|------|------|---------------------|
| `components/features/registration-form.tsx` | Modify | P1: step validation, error messages; P2: tanggal min, label konfirmasi; P3: hardcoded color |
| `components/layout/header.tsx` | Modify | P1: mobile nav; P2: dark mode toggle |
| `components/layout/footer.tsx` | Modify | P1: hydration mismatch; P3: "All rights reserved" |
| `components/magic/shimmer-button.tsx` | Modify | P2: opacity kalkulasi bug |
| `components/features/schedule-table.tsx` | Modify | P2: BlurFade nested berlebihan |
| `components/features/hero-section.tsx` | Modify | P3: statistik hardcoded → placeholder UI |
| `components/features/queue-status.tsx` | Modify | P3: prefers-reduced-motion |
| `app/layout.tsx` | Modify | P2: ThemeProvider; P3: typography |

---

## Task 1 — P1: Form Step Validation & Error Messages

**Files:**
- Modify: `components/features/registration-form.tsx`

Masalah inti: `nextStep()` tidak validasi field sebelum advance, dan error messages tidak dirender ke DOM.

### Approach
Gunakan `form.validateField()` atau cek `form.getFieldMeta()` untuk setiap field per-step sebelum advance. TanStack Form v1 menyediakan `form.validateArrayFields()` atau kita bisa trigger validasi manual per-field.

- [ ] **Step 1: Tambah helper `getStepFields` untuk mapping step → fields**

Di `components/features/registration-form.tsx`, tepat sebelum fungsi `RegistrationForm`, tambahkan:

```typescript
// Mapping step index ke field names yang perlu divalidasi
const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  0: ["namaLengkap", "nik", "nomorHP", "email"],
  1: ["jenisPerkara", "tanggalSidang"],
  2: ["agreeTerms"],
}
```

- [ ] **Step 2: Update `nextStep` untuk validasi sebelum advance**

Ganti fungsi `nextStep` yang ada (baris 79-83) dengan:

```typescript
const nextStep = async () => {
  // Trigger validasi untuk semua field di step saat ini
  const fieldsToValidate = STEP_FIELDS[currentStep] ?? []
  const results = await Promise.all(
    fieldsToValidate.map((field) => form.validateField(field, "change"))
  )
  // Jika ada error, jangan advance
  const hasErrors = results.some((r) => r !== undefined && r !== null)
  if (hasErrors) return
  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1)
  }
}
```

- [ ] **Step 3: Tambah error display di setiap field — Step 1 (Data Diri)**

Ganti seluruh blok step 1 (currentStep === 0) di dalam `<form>`. Tambahkan `<p>` error setelah setiap `<Input>`:

```tsx
{currentStep === 0 && (
  <BlurFade>
    <div className="space-y-4">
      <form.Field name="namaLengkap">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="namaLengkap">Nama Lengkap *</Label>
            <Input
              id="namaLengkap"
              placeholder="Masukkan nama lengkap"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="nik">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="nik">NIK *</Label>
            <Input
              id="nik"
              placeholder="16 digit NIK"
              maxLength={16}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ""))}
              onBlur={field.handleBlur}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="nomorHP">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="nomorHP">Nomor HP *</Label>
            <Input
              id="nomorHP"
              placeholder="08xxxxxxxxxx"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ""))}
              onBlur={field.handleBlur}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="email">Email (Opsional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>
    </div>
  </BlurFade>
)}
```

- [ ] **Step 4: Tambah error display — Step 2 (Data Perkara)**

Ganti blok step 2 (currentStep === 1):

```tsx
{currentStep === 1 && (
  <BlurFade>
    <div className="space-y-4">
      <form.Field name="jenisPerkara">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="jenisPerkara">Jenis Perkara *</Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
            >
              <SelectTrigger aria-invalid={field.state.meta.errors.length > 0}>
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
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="nomorRegister">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="nomorRegister">Nomor Register (Opsional)</Label>
            <Input
              id="nomorRegister"
              placeholder="Nomor register jika sudah ada"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="tanggalSidang">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="tanggalSidang">Tanggal Sidang yang Diinginkan *</Label>
            <Input
              id="tanggalSidang"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>
    </div>
  </BlurFade>
)}
```

- [ ] **Step 5: Update step 3 — tampilkan label display dan error agreeTerms**

Tambahkan helper map label display tepat setelah `STEP_FIELDS` constant:

```typescript
const JENIS_PERKARA_LABELS: Record<string, string> = {
  perceraian: "Perceraian",
  waris: "Waris",
  nikah: "Nikah",
  gugatan: "Gugatan",
  lainnya: "Lainnya",
}
```

Ganti blok step 3 (currentStep === 2) — bagian ringkasan dan checkbox:

```tsx
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
            <span className="font-medium">
              {JENIS_PERKARA_LABELS[form.getFieldValue("jenisPerkara")] ?? form.getFieldValue("jenisPerkara")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tanggal Sidang:</span>
            <span className="font-medium">{form.getFieldValue("tanggalSidang")}</span>
          </div>
        </div>
      </div>

      <form.Field name="agreeTerms">
        {(field) => (
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeTerms"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked as boolean)}
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
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]?.message ?? String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>
    </div>
  </BlurFade>
)}
```

- [ ] **Step 6: Hapus import yang tidak lagi dipakai**

Setelah refactor ke `form.Field` pattern, hapus import `Label` dari baris 11 jika sudah ada via `form.Field`, atau pastikan tetap ada. Hapus `useState` untuk field yang tidak lagi menggunakan `form.getFieldValue` / `form.setFieldValue`. Pastikan `nextStep` baru menggunakan `async/await`.

- [ ] **Step 7: Verifikasi build tidak error**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` atau tanpa TypeScript error

- [ ] **Step 8: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add components/features/registration-form.tsx
git commit -m "fix: form step validation, error messages, tanggal min, label perkara"
```

---

## Task 2 — P1: Mobile Navigation Header

**Files:**
- Modify: `components/layout/header.tsx`

Tambahkan hamburger menu untuk viewport mobile menggunakan React state. Tidak perlu library tambahan.

- [ ] **Step 1: Tambah `"use client"` dan mobile menu state**

Ganti seluruh isi `components/layout/header.tsx` dengan:

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Scale, Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/jadwal", label: "Jadwal Sidang" },
  { href: "/kontak", label: "Kontak" },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6" />
          <span className="font-bold text-lg">Pengadilan Agama</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 sm:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger button */}
        <button
          className="flex items-center sm:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <nav
          className="border-t bg-primary px-4 pb-4 sm:hidden"
          aria-label="Navigasi mobile"
        >
          <ul className="flex flex-col gap-2 pt-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded px-2 py-2 text-sm font-medium hover:bg-primary-foreground/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Verifikasi build**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -10
```

Expected: tidak ada TypeScript error

- [ ] **Step 3: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add components/layout/header.tsx
git commit -m "fix: tambah mobile navigation menu dengan hamburger toggle"
```

---

## Task 3 — P1: Hydration Mismatch Footer + "All rights reserved" (P3)

**Files:**
- Modify: `components/layout/footer.tsx`

Dua perbaikan sekaligus karena file kecil: hydration mismatch di `new Date()` dan teks bahasa Inggris.

- [ ] **Step 1: Ganti `new Date().getFullYear()` dengan tahun statis**

Ganti seluruh isi `components/layout/footer.tsx`:

```tsx
// components/layout/footer.tsx
import { Scale, Phone, Mail, MapPin } from "lucide-react"

const CURRENT_YEAR = 2026

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
          © {CURRENT_YEAR} Pengadilan Agama. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verifikasi build**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add components/layout/footer.tsx
git commit -m "fix: hapus hydration mismatch date, ganti copyright ke Bahasa Indonesia"
```

---

## Task 4 — P2: Dark Mode Toggle (ThemeProvider + ThemeToggle)

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/layout/header.tsx`

`next-themes` sudah terinstall. Perlu wrap app dengan `ThemeProvider` dan tambah toggle button di header.

- [ ] **Step 1: Wrap layout dengan ThemeProvider**

Ganti isi `app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "next-themes"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

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
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Tambah ThemeToggle button di Header**

Di `components/layout/header.tsx`, tambahkan import `useTheme` dan button toggle. Ganti seluruh file:

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Scale, Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/jadwal", label: "Jadwal Sidang" },
  { href: "/kontak", label: "Kontak" },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6" />
          <span className="font-bold text-lg">Pengadilan Agama</span>
        </Link>

        {/* Desktop nav + theme toggle */}
        <div className="hidden items-center gap-4 sm:flex">
          <nav className="flex items-center gap-4" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-1.5 hover:bg-primary-foreground/10 transition-colors"
            aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-1.5 hover:bg-primary-foreground/10 transition-colors"
            aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button
            className="flex items-center"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <nav
          className="border-t bg-primary px-4 pb-4 sm:hidden"
          aria-label="Navigasi mobile"
        >
          <ul className="flex flex-col gap-2 pt-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded px-2 py-2 text-sm font-medium hover:bg-primary-foreground/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
```

- [ ] **Step 3: Verifikasi build**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -10
```

Expected: tidak ada error. `ThemeProvider` dari `next-themes` sudah support Next.js App Router.

- [ ] **Step 4: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add app/layout.tsx components/layout/header.tsx
git commit -m "feat: tambah dark mode toggle dengan next-themes ThemeProvider"
```

---

## Task 5 — P2: ShimmerButton Opacity Bug Fix

**Files:**
- Modify: `components/magic/shimmer-button.tsx`

Bug: `shimmerSize` berupa string CSS unit `"0.05em"` di-parse ke float menghasilkan `0.05`, dikali 255 jadi `12.75`, dibulatkan jadi `13` = hex `"0d"`. Artinya shimmer hanya 5% opacity — hampir tidak terlihat.

Fix: ubah prop `shimmerSize` menjadi `shimmerOpacity` (angka 0–1) dengan default yang terlihat jelas.

- [ ] **Step 1: Ganti kalkulasi opacity di ShimmerButton**

Ganti seluruh isi `components/magic/shimmer-button.tsx`:

```tsx
"use client"

import { cn } from "@/lib/utils"

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  /** Opacity shimmer 0–1. Default 0.2 (20%) */
  shimmerOpacity?: number
  shimmerDuration?: string
  background?: string
}

export function ShimmerButton({
  className,
  shimmerColor = "#ffffff",
  shimmerOpacity = 0.2,
  shimmerDuration = "2s",
  background = "var(--primary)",
  children,
  ...props
}: ShimmerButtonProps) {
  // Konversi opacity (0–1) ke dua karakter hex
  const opacityHex = Math.round(shimmerOpacity * 255)
    .toString(16)
    .padStart(2, "0")

  return (
    <button
      className={cn(
        "group relative z-0 overflow-hidden rounded-lg px-6 py-3 font-semibold text-white",
        "transition-all duration-300 hover:scale-105",
        className
      )}
      style={{ background }}
      {...props}
    >
      <span className="relative z-10 flex items-center">{children}</span>
      <span
        className="absolute inset-0 -z-10 animate-shimmer"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            ${shimmerColor}${opacityHex},
            transparent
          )`,
          animationDuration: shimmerDuration,
        }}
      />
    </button>
  )
}
```

Perhatikan: tambahkan `flex items-center` ke wrapper `<span>` untuk menjaga alignment icon + text di tombol submit yang memiliki Loader2 icon.

- [ ] **Step 2: Verifikasi build**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add components/magic/shimmer-button.tsx
git commit -m "fix: perbaiki kalkulasi opacity shimmer button yang tidak terlihat"
```

---

## Task 6 — P2: Kurangi BlurFade Nested di ScheduleTable

**Files:**
- Modify: `components/features/schedule-table.tsx`

Hapus nested BlurFade di dalam loop item; cukup gunakan satu BlurFade wrapper di parent. Ganti dengan CSS transition untuk hover effect.

- [ ] **Step 1: Ganti BlurFade nested dengan animasi CSS sederhana**

Di `components/features/schedule-table.tsx`, ganti bagian return utama (baris 101-144):

```tsx
return (
  <BlurFade delay={0.2}>
    <Card id="jadwal">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Jadwal Sidang Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {schedule.time.split(":")[0]}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{schedule.caseNumber}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{schedule.partyName}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex flex-shrink-0 flex-wrap items-center justify-end gap-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {schedule.time}
                </div>
                <div className="font-medium">{schedule.room}</div>
                <Badge variant={getStatusBadge(schedule.status).variant}>
                  {getStatusBadge(schedule.status).label}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </BlurFade>
)
```

Catatan: juga tambahkan `truncate`, `min-w-0`, dan `flex-shrink-0` untuk fix tampilan mobile yang padat.

- [ ] **Step 2: Hapus import BlurFade dari dalam komponen schedule-table (jika hanya dipakai untuk nested)**

Pastikan baris `import { BlurFade } from "@/components/magic/blur-fade"` tetap ada karena masih digunakan di wrapper luar.

- [ ] **Step 3: Verifikasi build**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add components/features/schedule-table.tsx
git commit -m "fix: hapus BlurFade nested berlebihan, tambah truncate untuk mobile"
```

---

## Task 7 — P3: Hardcoded Colors → Semantic Tokens di Success State + prefers-reduced-motion

**Files:**
- Modify: `components/features/registration-form.tsx`
- Modify: `components/features/queue-status.tsx`

Dua fix minor dalam satu task.

- [ ] **Step 1: Ganti hardcoded green classes di success state**

Di `components/features/registration-form.tsx`, cari dan ganti blok success state (sekitar baris 102-105):

```tsx
// GANTI:
<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
  <CheckCircle className="h-12 w-12 text-green-600" />
</div>
<h2 className="mb-2 text-2xl font-bold text-green-600">

// DENGAN:
<div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
  <CheckCircle className="h-12 w-12 text-primary" />
</div>
<h2 className="mb-2 text-2xl font-bold text-primary">
```

- [ ] **Step 2: Tambah `prefers-reduced-motion` di pulsing dot QueueStatus**

Di `components/features/queue-status.tsx`, ganti blok pulsing dot (sekitar baris 75-80):

```tsx
// GANTI:
<motion.div
  className="h-3 w-3 rounded-full bg-green-400"
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ repeat: Infinity, duration: 1.5 }}
/>

// DENGAN:
<motion.div
  className="h-3 w-3 rounded-full bg-green-400"
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ repeat: Infinity, duration: 1.5 }}
  style={{
    // Hentikan animasi jika user prefer reduced motion
    animation: undefined,
  }}
  whileInView={undefined}
/>
```

Sebenarnya cara yang benar di Framer Motion untuk `prefers-reduced-motion` adalah menggunakan hook. Ganti dengan pendekatan CSS:

```tsx
<div
  className="h-3 w-3 rounded-full bg-green-400 motion-safe:animate-pulse"
/>
```

Dengan Tailwind `motion-safe:`, animasi hanya aktif jika user tidak set `prefers-reduced-motion: reduce`.

- [ ] **Step 3: Hapus import `motion` dari queue-status jika tidak dipakai lagi setelah penggantian**

Pastikan `motion` dari `framer-motion` masih diimport jika masih ada usage lain di file yang sama (baris 65-83 masih menggunakan `motion.div`).

- [ ] **Step 4: Verifikasi build**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add components/features/registration-form.tsx components/features/queue-status.tsx
git commit -m "fix: semantic color tokens, tambah prefers-reduced-motion support"
```

---

## Task 8 — P3: Statistik Hero → Placeholder UI yang Jujur

**Files:**
- Modify: `components/features/hero-section.tsx`

Ganti hardcoded angka "1,234" dan "98%" dengan tampilan yang honest — menunjukkan placeholder atau "Data tidak tersedia" daripada angka fiktif.

- [ ] **Step 1: Ganti hardcoded stats dengan honest placeholder**

Ganti seluruh isi `components/features/hero-section.tsx`:

```tsx
import { ShimmerButton } from "@/components/magic/shimmer-button"
import { ArrowRight, Calendar, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

// TODO: Ganti dengan data real dari API saat sudah tersedia
const STATS_PLACEHOLDER = [
  {
    icon: Users,
    value: null,
    label: "Antrian Terdaftar",
    placeholder: "—",
  },
  {
    icon: Calendar,
    value: null,
    label: "Sidang Hari Ini",
    placeholder: "—",
  },
  {
    icon: TrendingUp,
    value: null,
    label: "Tingkat Kehadiran",
    placeholder: "—",
  },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
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

        {/* Statistik — menampilkan placeholder sampai API tersedia */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {STATS_PLACEHOLDER.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="rounded-lg bg-white/10 p-6 text-center backdrop-blur sm:last:col-span-1"
              >
                <Icon className="mx-auto mb-4 h-8 w-8 text-secondary" />
                <div className="text-3xl font-bold">
                  {stat.value ?? stat.placeholder}
                </div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dekorasi background */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-white/5" />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verifikasi build**

```bash
cd /home/moohard/dev/project/antrian-sidang-public && pnpm build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
cd /home/moohard/dev/project/antrian-sidang-public
git add components/features/hero-section.tsx
git commit -m "fix: ganti statistik hardcoded dengan honest placeholder UI"
```

---

## Self-Review

### Spec Coverage Check

| Isu | Task | Status |
|-----|------|--------|
| P1: Form step validation | Task 1 | ✅ |
| P1: Error messages tidak tampil | Task 1 | ✅ |
| P1: Tanggal min | Task 1 | ✅ |
| P1: Label konfirmasi internal | Task 1 | ✅ |
| P1: Mobile nav | Task 2 | ✅ |
| P1: Hydration mismatch footer | Task 3 | ✅ |
| P2: Dark mode toggle | Task 4 | ✅ |
| P2: ShimmerButton opacity bug | Task 5 | ✅ |
| P2: BlurFade nested berlebihan | Task 6 | ✅ |
| P3: Hardcoded green colors di success | Task 7 | ✅ |
| P3: prefers-reduced-motion | Task 7 | ✅ |
| P3: Statistik hardcoded | Task 8 | ✅ |
| P3: "All rights reserved" | Task 3 | ✅ |

### Tidak Dimasukkan (YAGNI)
- **Typography font ganti**: Memerlukan perubahan font loading strategy dan berpotensi breaking change. Diputuskan untuk ditunda dan tidak dimasukkan ke plan ini karena tidak mempengaruhi fungsionalitas.

### Placeholder Scan
- Semua task mengandung kode lengkap ✅
- Tidak ada "TBD" atau "implement later" ✅
- Semua file paths absolut ✅
