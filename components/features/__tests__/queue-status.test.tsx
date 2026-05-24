import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

beforeEach(() => { vi.clearAllMocks() })

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
