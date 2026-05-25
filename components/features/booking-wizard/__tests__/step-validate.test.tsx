import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepValidate } from '../step-validate'
import * as queueService from '@/lib/queue-service'

vi.mock('@/lib/queue-service', () => ({
  validatePerkara: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

describe('StepValidate', () => {
  const defaultProps = {
    onNext: vi.fn(),
    onMultiPihak: vi.fn(),
    onError: vi.fn(),
    onPersonalDataChange: vi.fn(),
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
    // Label button sekarang "Verifikasi & Lanjut →"
    expect(screen.getByRole('button', { name: /Verifikasi & Lanjut/i })).toBeInTheDocument()
  })

  it('shows validation error when fields are empty', async () => {
    const { container } = render(<StepValidate {...defaultProps} />)
    // Isi nomor_perkara dan nik agar hanya nama yang kosong saat submit
    await userEvent.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await userEvent.type(screen.getByLabelText(/nik/i), '3201234567890001')
    // Submit form langsung (bypass disabled button) — nama kosong menyebabkan error
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByText(/nama lengkap wajib diisi/i)).toBeInTheDocument()
    })
  })

  it('calls validatePerkara on valid submission', async () => {
    const mockResponse = {
      valid: true,
      data: {
        perkara_id: 123,
        // pihak_nama harus sama dengan nama yang diisi agar tidak ada window.confirm
        pihak_nama: 'Ahmad',
        pihak_role: 'Penggugat',
        jadwal: {
          id: 1,
          perkara_id: 123,
          ruangan: 'Ruang 1',
          waktu: '2026-05-30T09:00:00',
          jam_sidang: '09:00',
          agenda: 'Sidang Pertama',
          status: 'scheduled' as const,
          perkara: {
            nomor_perkara: '123/Pdt.G/2024/PA.Pps',
            para_pihak: 'Ahmad',
            jenis_perkara_nama: 'Perdata Gugatan',
          },
        },
        existing_queue: null,
      },
    }
    vi.mocked(queueService.validatePerkara).mockResolvedValue(mockResponse)

    const onNext = vi.fn()
    render(<StepValidate onNext={onNext} onMultiPihak={vi.fn()} onError={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await userEvent.type(screen.getByLabelText(/nik/i), '3201234567890001')
    // Isi nama sesuai pihak_nama agar SIPP cross-check tidak muncul window.confirm
    await userEvent.type(screen.getByLabelText(/nama lengkap/i), 'Ahmad')
    fireEvent.click(screen.getByRole('button', { name: /Verifikasi & Lanjut/i }))

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
    render(<StepValidate onNext={vi.fn()} onMultiPihak={vi.fn()} onError={onError} />)

    await userEvent.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await userEvent.type(screen.getByLabelText(/nik/i), '0000000000000000')
    await userEvent.type(screen.getByLabelText(/nama lengkap/i), 'Ahmad')
    fireEvent.click(screen.getByRole('button', { name: /Verifikasi & Lanjut/i }))

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
        jadwal: {
          id: 1,
          perkara_id: 123,
          ruangan: 'Ruang 1',
          waktu: '2026-05-30T09:00:00',
          jam_sidang: '09:00',
          agenda: 'Sidang Pertama',
          status: 'scheduled' as const,
          perkara: {
            nomor_perkara: '123/Pdt.G/2024/PA.Pps',
            para_pihak: 'Ahmad',
            jenis_perkara_nama: 'Perdata Gugatan',
          },
        },
        existing_queue: {
          queue_number: 'A-003',
          slot_time: '09:00',
          status: 'waiting' as const,
        },
      },
    }
    vi.mocked(queueService.validatePerkara).mockResolvedValue(mockResponse)

    const onMultiPihak = vi.fn()
    render(<StepValidate onNext={vi.fn()} onMultiPihak={onMultiPihak} onError={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/nomor perkara/i), '123/Pdt.G/2024/PA.Pps')
    await userEvent.type(screen.getByLabelText(/nik/i), '3201234567890001')
    // Nama harus sama dengan pihak_nama agar tidak ada window.confirm
    await userEvent.type(screen.getByLabelText(/nama lengkap/i), 'Ahmad')
    fireEvent.click(screen.getByRole('button', { name: /Verifikasi & Lanjut/i }))

    await waitFor(() => {
      expect(onMultiPihak).toHaveBeenCalledWith(mockResponse.data)
    })
  })
})

// ===== Test baru: Form Fields Nama + Telepon =====
describe('StepValidate — Form Fields', () => {
  const mockProps = {
    onNext: vi.fn(),
    onMultiPihak: vi.fn(),
    onError: vi.fn(),
    onPersonalDataChange: vi.fn(),
  }

  it('renders 4 fields: nomor perkara, NIK, nama, telepon', () => {
    render(<StepValidate {...mockProps} />)
    expect(screen.getByLabelText(/Nomor Perkara/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/NIK/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/No\. WhatsApp/i)).toBeInTheDocument()
  })

  it('renders alert info text', () => {
    render(<StepValidate {...mockProps} />)
    expect(screen.getByText(/Data Anda hanya dipakai untuk verifikasi/)).toBeInTheDocument()
  })

  it('submit button labeled "Verifikasi & Lanjut →"', () => {
    render(<StepValidate {...mockProps} />)
    expect(screen.getByRole('button', { name: /Verifikasi & Lanjut/ })).toBeInTheDocument()
  })

  it('disables submit when required fields empty', () => {
    render(<StepValidate {...mockProps} />)
    const submit = screen.getByRole('button', { name: /Verifikasi & Lanjut/ })
    expect(submit).toBeDisabled()
  })
})
