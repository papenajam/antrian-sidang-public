import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StepConfirm } from '../step-confirm'
import * as queueService from '@/lib/queue-service'

vi.mock('@/lib/queue-service', () => ({
  bookQueueWizard: vi.fn(),
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
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders booking summary', () => {
    render(<StepConfirm {...defaultProps} />)

    expect(screen.getByText('123/Pdt.G/2024/PA.Pps')).toBeInTheDocument()
    expect(screen.getByText('Ahmad bin Ahmad')).toBeInTheDocument()
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument()
    expect(screen.getByText('Ruang Sidang 1')).toBeInTheDocument()
  })

  it('renders confirmation warning', () => {
    render(<StepConfirm {...defaultProps} />)
    expect(screen.getByText(/tidak dapat dibatalkan/i)).toBeInTheDocument()
  })

  it('calls bookQueue on confirm', async () => {
    const mockResponse = {
      data: {
        queue_number: 'A-003',
        status: 'waiting',
        slot_time: '09:00',
      },
      message: 'Booking berhasil',
    }
    vi.mocked(queueService.bookQueueWizard).mockResolvedValue(mockResponse as any)

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
})
