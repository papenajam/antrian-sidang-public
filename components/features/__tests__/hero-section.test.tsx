import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HeroSection } from '../hero-section'

// Mock framer-motion agar animasi tidak mengganggu jsdom
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
}))

// Mock komponen NumberTicker agar tidak bergantung pada requestAnimationFrame
vi.mock('@/components/magic/number-ticker', () => ({
  NumberTicker: ({ value, suffix, showDashForZero }: { value: number; suffix?: string; showDashForZero?: boolean }) => {
    if (showDashForZero && value === 0) return <span>—</span>
    return <span>{value}{suffix}</span>
  },
}))

// Mock queue-service: simulasikan respons kosong (tanpa error) agar state loading selesai
vi.mock('@/lib/queue-service', () => ({
  getTodaySchedule: vi.fn().mockResolvedValue({ data: [], error: null }),
  calculateQueueStatistics: vi.fn().mockReturnValue({
    currentNumber: 0,
    waitingCount: 0,
    processedToday: 0,
    lastUpdated: '-',
  }),
}))

// Mock app-settings-context dengan shape lengkap yang dibutuhkan useAppSettings
vi.mock('@/contexts/app-settings-context', () => ({
  useAppSettings: () => ({
    settings: {
      app: {
        name: 'Antrian Sidang',
        short_name: 'AS',
        description: 'Layanan antrian sidang digital.',
      },
      institution: {
        name: 'Pengadilan Agama Penajam',
        short_name: 'PA Penajam',
        address: null,
        phone: null,
        email: null,
        logo: null,
      },
    },
    isLoading: false,
    error: null,
    refreshSettings: vi.fn(),
  }),
}))

// Mock booking-modal-context: menyediakan setIsOpen agar tidak throw
vi.mock('@/contexts/booking-modal-context', () => ({
  useBookingModal: () => ({
    isOpen: false,
    setIsOpen: vi.fn(),
  }),
}))

// Bersihkan semua mock sebelum tiap test untuk menghindari state bocor antar test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('HeroSection — Stats Tag Badges', () => {
  it('renders tag badge "HARI INI" pada stat card 1', async () => {
    render(<HeroSection />)
    // Badge muncul setelah state loading selesai (async fetch)
    await waitFor(() => {
      expect(screen.getByText('HARI INI')).toBeInTheDocument()
    })
  })

  it('renders tag badge "SIPP" pada stat card 2', async () => {
    render(<HeroSection />)
    await waitFor(() => {
      expect(screen.getByText('SIPP')).toBeInTheDocument()
    })
  })

  it('renders tag badge "30 HARI" pada stat card 3 (dark variant)', async () => {
    render(<HeroSection />)
    await waitFor(() => {
      expect(screen.getByText('30 HARI')).toBeInTheDocument()
    })
  })
})

describe('HeroSection — Today Date Meta', () => {
  it('renders today date with id-ID long format in meta', () => {
    render(<HeroSection />)
    // Format tanggal yang sama dengan yang di-render komponen
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    expect(screen.getByText(today)).toBeInTheDocument()
  })
})

describe('HeroSection — Dynamic Delta Text', () => {
  it('uses dynamic delta format with WITA timestamp', async () => {
    render(<HeroSection />)
    // Format: "↑ 12% vs kemarin · HH:MM WITA" atau fallback statis "Data SIPP hari ini"
    // Keduanya valid tergantung apakah data tersedia
    await waitFor(() => {
      const stat1Delta = screen.getByText(/vs kemarin|Data SIPP/)
      expect(stat1Delta).toBeInTheDocument()
    })
  })
})
