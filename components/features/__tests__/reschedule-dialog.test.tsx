import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RescheduleDialog } from '../reschedule-dialog'
import * as queueService from '@/lib/queue-service'

vi.mock('@/lib/queue-service', () => ({
  getAvailableSlots: vi.fn(),
  rescheduleQueue: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('RescheduleDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    queueNumber: 'A-003',
    perkaraId: 123,
    currentSlot: '09:00',
    tanggal: '2026-05-30',
    onSuccess: vi.fn(),
  }

  const mockSlots = [
    { time: '09:00', capacity: 6, booked: 4, available: 2 },
    { time: '10:00', capacity: 6, booked: 3, available: 3 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(queueService.getAvailableSlots).mockResolvedValue({
      data: { tanggal: '2026-05-30', slots: mockSlots },
    })
  })

  it('renders dialog when open', () => {
    render(<RescheduleDialog {...defaultProps} />)
    // Gunakan getByRole heading untuk menghindari ambiguitas dengan tombol
    expect(screen.getByRole('heading', { name: /ganti jadwal/i })).toBeInTheDocument()
  })

  it('renders current slot info', () => {
    render(<RescheduleDialog {...defaultProps} />)
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
  })

  it('renders slot options', async () => {
    render(<RescheduleDialog {...defaultProps} />)

    // Tunggu slot dimuat - gunakan getAllByText karena 10:00 muncul di slot saat ini dan opsi slot
    await waitFor(() => {
      const elements = screen.getAllByText('10:00')
      expect(elements.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('calls rescheduleQueue on confirm', async () => {
    vi.mocked(queueService.rescheduleQueue).mockResolvedValue({
      data: { queue_number: 'A-003', slot_time: '10:00', status: 'waiting', pihak_nama: 'Ahmad', nomor_perkara: '123/Pdt.G/2024/PA.Pps', ruang_sidang: 'Ruang 1' },
      message: 'Berhasil',
    })

    const onSuccess = vi.fn()
    render(<RescheduleDialog {...defaultProps} onSuccess={onSuccess} />)

    // Tunggu slot dimuat
    await waitFor(() => {
      const elements = screen.getAllByText('10:00')
      expect(elements.length).toBeGreaterThanOrEqual(2)
    })

    // Klik slot 10:00 - ambil elemen dengan class font-bold (waktu mulai slot)
    const slotButtons = screen.getAllByText('10:00')
    const slotTimeElement = slotButtons.find(el => el.className.includes('font-bold'))
    fireEvent.click(slotTimeElement!.closest('button')!)

    // Klik tombol konfirmasi
    fireEvent.click(screen.getByRole('button', { name: /konfirmasi ganti jadwal/i }))

    await waitFor(() => {
      expect(queueService.rescheduleQueue).toHaveBeenCalledWith({
        queue_number: 'A-003',
        perkara_id: 123,
        new_slot_time: '10:00',
      })
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})
