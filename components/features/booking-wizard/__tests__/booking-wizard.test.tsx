import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingWizard } from '../booking-wizard'
import * as queueService from '@/lib/queue-service'

vi.mock('@/lib/queue-service', () => ({
  validatePerkara: vi.fn(),
  bookQueueWizard: vi.fn(),
  getAvailableSlots: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('BookingWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders step 1 by default', () => {
    render(<BookingWizard />)
    expect(screen.getByText(/validasi data perkara/i)).toBeInTheDocument()
  })

  it('renders progress bar', () => {
    render(<BookingWizard />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders all 4 step labels in progress bar', () => {
    render(<BookingWizard />)
    // Gunakan queryAllByText karena "Validasi" muncul di progress bar dan StepValidate
    const validasiElements = screen.queryAllByText(/validasi/i)
    expect(validasiElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/pilih slot/i)).toBeInTheDocument()
    expect(screen.getByText(/konfirmasi/i)).toBeInTheDocument()
    expect(screen.getByText(/tiket/i)).toBeInTheDocument()
  })

  it('navigates to step 2 after successful validation', async () => {
    const mockResponse = {
      valid: true,
      data: {
        perkara_id: 123,
        pihak_nama: 'Ahmad',
        pihak_role: 'Penggugat',
        jadwal: {
          perkara_id: 123,
          nomor_perkara: '123/Pdt.G/2024/PA.Pps',
          pihak_nama: 'Ahmad',
          ruangan: 'Ruang 1',
          waktu: '2026-05-30T09:00:00',
          agenda: 'Sidang Pertama',
        },
        existing_queue: null,
      },
    }
    vi.mocked(queueService.validatePerkara).mockResolvedValue(mockResponse)

    render(<BookingWizard />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await user.type(screen.getByLabelText(/nik/i), '3201234567890001')
    await user.click(screen.getByRole('button', { name: /cek jadwal/i }))

    await waitFor(() => {
      expect(screen.getByText(/pilih jam sidang/i)).toBeInTheDocument()
    })
  })

  it('shows existing queue card when existing queue found', async () => {
    const mockResponse = {
      valid: true,
      data: {
        perkara_id: 123,
        pihak_nama: 'Ahmad',
        pihak_role: 'Penggugat',
        jadwal: {
          perkara_id: 123,
          nomor_perkara: '123/Pdt.G/2024/PA.Pps',
          pihak_nama: 'Ahmad',
          ruangan: 'Ruang 1',
          waktu: '2026-05-30T09:00:00',
          agenda: 'Sidang Pertama',
        },
        existing_queue: {
          queue_number: 'A-003',
          slot_time: '09:00',
          status: 'waiting',
        },
      },
    }
    vi.mocked(queueService.validatePerkara).mockResolvedValue(mockResponse)

    render(<BookingWizard />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await user.type(screen.getByLabelText(/nik/i), '3201234567890001')
    await user.click(screen.getByRole('button', { name: /cek jadwal/i }))

    await waitFor(() => {
      expect(screen.getByText(/booking sudah ada/i)).toBeInTheDocument()
    })
  })
})
