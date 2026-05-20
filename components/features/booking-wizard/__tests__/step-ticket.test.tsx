import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepTicket } from '../step-ticket'

describe('StepTicket', () => {
  const defaultProps = {
    ticket: {
      queue_number: 'A-003',
      status: 'waiting' as const,
      slot_time: '09:00',
      pihak_nama: 'Ahmad bin Ahmad',
      nomor_perkara: '123/Pdt.G/2024/PA.Pps',
      ruang_sidang: 'Ruang Sidang 1',
    },
    onCheckStatus: vi.fn(),
    onBookAgain: vi.fn(),
  }

  it('renders queue number prominently', () => {
    render(<StepTicket {...defaultProps} />)
    expect(screen.getByText('A-003')).toBeInTheDocument()
  })

  it('renders ticket details', () => {
    render(<StepTicket {...defaultProps} />)

    // Slot time ditampilkan sebagai "09:00 - 10:00"
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
    expect(screen.getByText('Ruang Sidang 1')).toBeInTheDocument()
    expect(screen.getByText('123/Pdt.G/2024/PA.Pps')).toBeInTheDocument()
    expect(screen.getByText('Ahmad bin Ahmad')).toBeInTheDocument()
  })

  it('renders success message', () => {
    render(<StepTicket {...defaultProps} />)
    expect(screen.getByText(/booking berhasil/i)).toBeInTheDocument()
  })

  it('calls onCheckStatus when button clicked', () => {
    const onCheckStatus = vi.fn()
    render(<StepTicket {...defaultProps} onCheckStatus={onCheckStatus} />)

    fireEvent.click(screen.getByRole('button', { name: /cek status/i }))
    expect(onCheckStatus).toHaveBeenCalled()
  })

  it('calls onBookAgain when button clicked', () => {
    const onBookAgain = vi.fn()
    render(<StepTicket {...defaultProps} onBookAgain={onBookAgain} />)

    fireEvent.click(screen.getByRole('button', { name: /booking lagi/i }))
    expect(onBookAgain).toHaveBeenCalled()
  })
})
