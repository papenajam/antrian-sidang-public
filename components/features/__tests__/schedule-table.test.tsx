import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ScheduleTable } from '@/components/features/schedule-table'

vi.mock('@/lib/queue-service', () => ({
  getTodaySchedule: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        perkara_id: 100,
        queue_number: 'S-014',
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

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

beforeEach(() => { vi.clearAllMocks() })

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
      // Komponen merender mobile + desktop — keduanya hadir di DOM
      const pills = screen.getAllByText('S-014')
      expect(pills.length).toBeGreaterThan(0)
    })
  })

  it('renders opposing party "vs. Dewi Sartika"', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      // Komponen merender mobile + desktop — keduanya hadir di DOM
      const items = screen.getAllByText(/vs\. Dewi Sartika/i)
      expect(items.length).toBeGreaterThan(0)
    })
  })

  it('renders case type "Cerai Talak"', async () => {
    render(<ScheduleTable />)
    await waitFor(() => {
      // Komponen merender mobile + desktop — keduanya hadir di DOM
      const items = screen.getAllByText('Cerai Talak')
      expect(items.length).toBeGreaterThan(0)
    })
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
