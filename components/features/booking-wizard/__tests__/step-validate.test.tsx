import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepValidate } from '../step-validate'
import * as queueService from '@/lib/queue-service'

vi.mock('@/lib/queue-service', () => ({
  validatePerkara: vi.fn(),
}))

describe('StepValidate', () => {
  const defaultProps = {
    onNext: vi.fn(),
    onExistingQueue: vi.fn(),
    onMultiPihak: vi.fn(),
    onError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input fields for nomor perkara and NIK', () => {
    render(<StepValidate {...defaultProps} />)
    expect(screen.getByLabelText(/nomor perkara/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nik/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<StepValidate {...defaultProps} />)
    expect(screen.getByRole('button', { name: /cek jadwal/i })).toBeInTheDocument()
  })

  it('shows validation error when fields are empty', async () => {
    render(<StepValidate {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cek jadwal/i }))

    await waitFor(() => {
      expect(screen.getByText(/nomor perkara wajib diisi/i)).toBeInTheDocument()
    })
  })

  it('calls validatePerkara on valid submission', async () => {
    const mockResponse = {
      valid: true,
      data: {
        perkara_id: 123,
        pihak_nama: 'Ahmad',
        pihak_role: 'Penggugat',
        jadwal: { tanggal: '2026-05-30', ruangan: 'Ruang 1' },
        existing_queue: null,
      },
    }
    vi.mocked(queueService.validatePerkara).mockResolvedValue(mockResponse)

    const onNext = vi.fn()
    render(<StepValidate onNext={onNext} onExistingQueue={vi.fn()} onMultiPihak={vi.fn()} onError={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await userEvent.type(screen.getByLabelText(/nik/i), '3201234567890001')
    fireEvent.click(screen.getByRole('button', { name: /cek jadwal/i }))

    await waitFor(() => {
      expect(queueService.validatePerkara).toHaveBeenCalledWith({
        nomor_perkara: '123/Pdt.G/2024/PA.Pps',
        nik: '3201234567890001',
      })
      expect(onNext).toHaveBeenCalledWith(mockResponse.data)
    })
  })

  it('shows error message when NIK is invalid', async () => {
    const mockResponse = {
      valid: false,
      message: 'NIK tidak terdaftar',
    }
    vi.mocked(queueService.validatePerkara).mockResolvedValue(mockResponse)

    const onError = vi.fn()
    render(<StepValidate onNext={vi.fn()} onExistingQueue={vi.fn()} onMultiPihak={vi.fn()} onError={onError} />)

    await userEvent.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await userEvent.type(screen.getByLabelText(/nik/i), '0000000000000000')
    fireEvent.click(screen.getByRole('button', { name: /cek jadwal/i }))

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('NIK tidak terdaftar')
    })
  })

  it('calls onMultiPihak when existing queue found', async () => {
    const mockResponse = {
      valid: true,
      data: {
        perkara_id: 123,
        pihak_nama: 'Ahmad',
        pihak_role: 'Penggugat',
        jadwal: { tanggal: '2026-05-30', ruangan: 'Ruang 1' },
        existing_queue: {
          queue_number: 'A-003',
          slot_time: '09:00',
          status: 'waiting',
        },
      },
    }
    vi.mocked(queueService.validatePerkara).mockResolvedValue(mockResponse)

    const onMultiPihak = vi.fn()
    render(<StepValidate onNext={vi.fn()} onExistingQueue={vi.fn()} onMultiPihak={onMultiPihak} onError={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await userEvent.type(screen.getByLabelText(/nik/i), '3201234567890001')
    fireEvent.click(screen.getByRole('button', { name: /cek jadwal/i }))

    await waitFor(() => {
      expect(onMultiPihak).toHaveBeenCalledWith(mockResponse.data)
    })
  })
})
