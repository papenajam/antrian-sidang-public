import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepTicket } from '@/components/features/booking-wizard/step-ticket'

vi.mock('@/contexts/app-settings-context', () => ({
  useAppSettings: () => ({
    settings: {
      institution: { name: 'Pengadilan Agama Penajam', short_name: 'PA Penajam' },
      app: { name: 'Antrian Sidang', short_name: 'AS', description: '' },
    },
    isLoading: false,
    error: null,
    refreshSettings: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => { vi.clearAllMocks() })

const mockTicket = {
  queue_number: 'S-014',
  status: 'waiting' as const,
  pihak_nama: 'Andre Pratama',
  nomor_perkara: '0091/Pdt.G/2026/PA.Pnj',
  ruang_sidang: 'Ruang 1',
  slot_time: '10:00',
  tanggal: '2026-05-23',
}

describe('StepTicket — Layout', () => {
  const mockProps = {
    ticket: mockTicket,
    onCheckStatus: vi.fn(),
    onBookAgain: vi.fn(),
  }

  it('renders queue number S-014', () => {
    render(<StepTicket {...mockProps} />)
    expect(screen.getByText('S-014')).toBeInTheDocument()
  })

  it('renders kicker "Antrian Sidang · Pengadilan Agama Penajam"', () => {
    render(<StepTicket {...mockProps} />)
    expect(screen.getByText(/Antrian Sidang · Pengadilan Agama Penajam/)).toBeInTheDocument()
  })

  it('renders TicketRow Atas Nama + Nomor Perkara', () => {
    render(<StepTicket {...mockProps} />)
    expect(screen.getByText('Atas Nama')).toBeInTheDocument()
    expect(screen.getByText('Nomor Perkara')).toBeInTheDocument()
  })

  it('renders real QR code (qrcode.react)', () => {
    const { container } = render(<StepTicket {...mockProps} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders WhatsApp notification footnote', () => {
    render(<StepTicket {...mockProps} telepon="081234567890" />)
    expect(screen.getByText(/Notifikasi WhatsApp akan dikirim/)).toBeInTheDocument()
  })
})

describe('StepTicket — Actions', () => {
  const onCheckStatus = vi.fn()
  const onBookAgain = vi.fn()

  const mockProps = {
    ticket: mockTicket,
    onCheckStatus,
    onBookAgain,
  }

  it('calls onCheckStatus when button clicked', () => {
    render(<StepTicket {...mockProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cek status/i }))
    expect(onCheckStatus).toHaveBeenCalled()
  })

  it('calls onBookAgain when button clicked', () => {
    render(<StepTicket {...mockProps} />)
    fireEvent.click(screen.getByRole('button', { name: /booking lagi/i }))
    expect(onBookAgain).toHaveBeenCalled()
  })
})
