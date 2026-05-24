import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StepConfirm } from '../step-confirm'
import * as queueService from '@/lib/queue-service'
import type { QueueTicket } from '@/lib/api-types'

interface TestMockResponse {
  data: QueueTicket
  message: string
}

vi.mock('@/lib/queue-service', () => ({
  bookQueueWizard: vi.fn(),
  getAvailableSlots: vi.fn().mockResolvedValue({
    data: {
      tanggal: '2026-05-23',
      slots: [{ time: '10:00', capacity: 8, booked: 3, available: 5 }],
    },
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('StepConfirm', () => {
  const defaultProps = {
    perkaraId: 123,
    nik: '3201234567890001',
    namaPihak: 'Ahmad bin Ahmad',
    nomorPerkara: '123/Pdt.G/2024/PA.Pps',
    tanggal: '2026-05-30',
    slot: { time: '09:00', capacity: 6, booked: 4, available: 2 },
    ruangan: 'Ruang Sidang 1',
    onNext: vi.fn(),
    onBack: vi.fn(),
    onError: vi.fn(),
  }

  // Props lengkap untuk menguji 8-field grid
  const fullProps = {
    perkaraId: 100,
    nik: '3201234567890001',
    namaPihak: 'Andre',
    nomorPerkara: '0091/Pdt.G/2026/PA.Pnj',
    jenisPerkara: 'Cerai Talak',
    nama: 'Andre',
    telepon: '081234567890',
    tanggal: '2026-05-23T10:00:00',
    slot: { time: '10:00', capacity: 8, booked: 3, available: 5 },
    ruangan: 'Ruang 1',
    onNext: vi.fn(),
    onBack: vi.fn(),
    onError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders booking summary', () => {
    render(<StepConfirm {...defaultProps} />)

    expect(screen.getByText('123/Pdt.G/2024/PA.Pps')).toBeInTheDocument()
    expect(screen.getByText('Ahmad bin Ahmad')).toBeInTheDocument()
    // Layout baru: waktu ditampilkan sebagai "09:00 WITA" di sel Waktu Kedatangan
    expect(screen.getByText('09:00 WITA')).toBeInTheDocument()
    expect(screen.getByText('Ruang Sidang 1')).toBeInTheDocument()
  })

  it('renders confirmation warning', () => {
    render(<StepConfirm {...defaultProps} />)
    expect(screen.getByText(/tidak dapat dibatalkan/i)).toBeInTheDocument()
  })

  it('calls bookQueue on confirm', async () => {
    const mockResponse: TestMockResponse = {
      data: {
        queue_number: 'A-003',
        status: 'waiting',
        pihak_nama: 'Ahmad bin Ahmad',
        nomor_perkara: '123/Pdt.G/2024/PA.Pps',
        ruang_sidang: 'Ruang Sidang 1',
      },
      message: 'Booking berhasil',
    }
    vi.mocked(queueService.bookQueueWizard).mockResolvedValue(mockResponse)

    const onNext = vi.fn()
    render(<StepConfirm {...defaultProps} onNext={onNext} />)

    fireEvent.click(screen.getByRole('button', { name: /konfirmasi booking/i }))

    await waitFor(() => {
      expect(queueService.bookQueueWizard).toHaveBeenCalledWith({
        perkara_id: 123,
        nik: '3201234567890001',
        slot_time: '09:00',
      })
      expect(onNext).toHaveBeenCalledWith(mockResponse.data)
    })
  })

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn()
    render(<StepConfirm {...defaultProps} onBack={onBack} />)

    fireEvent.click(screen.getByRole('button', { name: /kembali/i }))
    expect(onBack).toHaveBeenCalled()
  })

  it('calls onError when booking fails', async () => {
    vi.mocked(queueService.bookQueueWizard).mockRejectedValue(new Error('Network error'))

    const onError = vi.fn()
    render(<StepConfirm {...defaultProps} onError={onError} />)

    fireEvent.click(screen.getByRole('button', { name: /konfirmasi booking/i }))

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Terjadi kesalahan saat booking. Silakan coba lagi.')
    })
  })

  describe('StepConfirm — 8 Field Review Grid', () => {
    it('renders all 8 confirm rows', () => {
      render(<StepConfirm {...fullProps} />)
      expect(screen.getByText('Nomor Perkara')).toBeInTheDocument()
      expect(screen.getByText('Jenis Perkara')).toBeInTheDocument()
      expect(screen.getByText('Nama Pemohon')).toBeInTheDocument()
      expect(screen.getByText('NIK')).toBeInTheDocument()
      expect(screen.getByText('Waktu Kedatangan')).toBeInTheDocument()
      expect(screen.getByText('Estimasi Antrian')).toBeInTheDocument()
      expect(screen.getByText('Notifikasi')).toBeInTheDocument()
      expect(screen.getByText('Tanggal Sidang')).toBeInTheDocument()
    })

    it('formats NIK with spaces every 4 digits', () => {
      render(<StepConfirm {...fullProps} />)
      expect(screen.getByText('3201 2345 6789 0001')).toBeInTheDocument()
    })

    it('renders posisi estimasi format', () => {
      render(<StepConfirm {...fullProps} />)
      // booked=3, posisi=4 dari 8
      expect(screen.getByText(/Posisi ke-4 dari 8/)).toBeInTheDocument()
    })
  })
})
