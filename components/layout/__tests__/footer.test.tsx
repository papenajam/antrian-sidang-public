import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/footer'

// Mock konteks settings agar test tidak bergantung pada API eksternal
vi.mock('@/contexts/app-settings-context', () => ({
  useAppSettings: () => ({
    settings: {
      institution: {
        name: 'Pengadilan Agama Penajam',
        short_name: 'PA Penajam',
        address: 'Jl. Provinsi Km 9',
        phone: '(0542) 7654321',
        email: 'pa-penajam@mahkamahagung.go.id',
        logo: null,
      },
      app: { name: 'Antrian Sidang', short_name: 'AS', description: 'Test' },
    },
    isLoading: false,
    error: null,
    refreshSettings: vi.fn(),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

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
    expect(screen.getByText(/v0\.1\.0 · MVP · Live/)).toBeInTheDocument()
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
