import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StepSelectSlot } from '../step-select-slot'
import * as queueService from '@/lib/queue-service'
import type { SlotInfo } from '@/lib/api-types'

vi.mock('@/lib/queue-service', () => ({
  getAvailableSlots: vi.fn(),
}))

describe('StepSelectSlot', () => {
  const defaultProps = {
    perkaraId: 123,
    tanggal: '2026-05-30',
    onNext: vi.fn(),
    onBack: vi.fn(),
  }

  const mockSlots: SlotInfo[] = [
    { time: '09:00', capacity: 6, booked: 4, available: 2 },
    { time: '10:00', capacity: 6, booked: 6, available: 0 },
    { time: '11:00', capacity: 6, booked: 2, available: 4 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(queueService.getAvailableSlots).mockResolvedValue({
      data: { tanggal: '2026-05-30', slots: mockSlots },
    })
  })

  it('renders loading state initially', () => {
    render(<StepSelectSlot {...defaultProps} />)
    expect(screen.getByText(/memuat slot/i)).toBeInTheDocument()
  })

  it('renders slot cards after loading', async () => {
    render(<StepSelectSlot {...defaultProps} />)

    await waitFor(() => {
      // Verifikasi bahwa slot cards dirender dengan mencari waktu yang unik
      // SlotCard menampilkan start time dan end time yang berbeda
      // Untuk slot 09:00, end time adalah 10:00
      // Untuk slot 10:00, end time adalah 11:00
      // Untuk slot 11:00, end time adalah 12:00
      // Jadi kita perlu mencari kombinasi yang unik

      // Verifikasi bahwa ada 3 slot cards dengan mencari button elements
      const buttons = screen.getAllByRole('button')
      // 3 slot cards + 2 navigation buttons (Kembali dan Lanjutkan)
      expect(buttons.length).toBe(5)

      // Verifikasi bahwa slot 09:00 ada (sebagai start time)
      expect(screen.getByText('09:00')).toBeInTheDocument()

      // Verifikasi bahwa slot 10:00 ada (sebagai start time)
      // Karena 10:00 juga muncul sebagai end time dari slot 09:00,
      // kita perlu memverifikasi dengan cara yang berbeda
      const slot10Elements = screen.getAllByText('10:00')
      // Harus ada minimal 2 elemen: satu sebagai start time, satu sebagai end time
      expect(slot10Elements.length).toBeGreaterThanOrEqual(2)

      // Verifikasi bahwa slot 11:00 ada (sebagai start time)
      const slot11Elements = screen.getAllByText('11:00')
      // Harus ada minimal 2 elemen: satu sebagai start time, satu sebagai end time
      expect(slot11Elements.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('renders schedule info', async () => {
    render(<StepSelectSlot {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/30 Mei 2026/)).toBeInTheDocument()
    })
  })

  it('selects a slot when clicked', async () => {
    render(<StepSelectSlot {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    // Cari button yang memiliki text "09:00" di dalamnya
    // Karena ada multiple elemen dengan text "09:00", kita perlu mencari button yang tepat
    const buttons = screen.getAllByRole('button')
    const slotButton = buttons.find(button =>
      button.textContent?.includes('09:00') && button.textContent?.includes('2/6 tersedia')
    )!

    fireEvent.click(slotButton)

    expect(slotButton.className).toContain('border-primary')
  })

  it('calls onNext with selected slot', async () => {
    const onNext = vi.fn()
    render(<StepSelectSlot {...defaultProps} onNext={onNext} />)

    await waitFor(() => {
      expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    // Cari button slot 09:00
    const buttons = screen.getAllByRole('button')
    const slotButton = buttons.find(button =>
      button.textContent?.includes('09:00') && button.textContent?.includes('2/6 tersedia')
    )!

    fireEvent.click(slotButton)

    // Klik tombol Lanjutkan
    fireEvent.click(screen.getByRole('button', { name: /lanjutkan/i }))

    expect(onNext).toHaveBeenCalledWith({ time: '09:00', capacity: 6, booked: 4, available: 2 })
  })

  it('calls onBack when back button clicked', async () => {
    const onBack = vi.fn()
    render(<StepSelectSlot {...defaultProps} onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /kembali/i }))
    expect(onBack).toHaveBeenCalled()
  })
})

describe('StepSelectSlot — Layout', () => {
  const defaultProps = {
    perkaraId: 123,
    tanggal: '2026-05-30',
    onNext: vi.fn(),
    onBack: vi.fn(),
  }

  const mockSlots: SlotInfo[] = [
    { time: '09:00', capacity: 8, booked: 4, available: 4 },
    { time: '10:00', capacity: 8, booked: 8, available: 0 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(queueService.getAvailableSlots).mockResolvedValue({
      data: { tanggal: '2026-05-30', slots: mockSlots },
    })
  })

  it('renders alert info about slot capacity', async () => {
    render(<StepSelectSlot {...defaultProps} />)

    // Tunggu sampai loading selesai dan slots muncul
    await waitFor(() => {
      expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    // Alert info kapasitas slot harus terlihat
    // Gunakan function matcher karena teks tersplit oleh elemen <strong>
    // Cari elemen <p> yang mengandung teks tersebut
    const alertElements = screen.getAllByText((_, element) =>
      element?.tagName === 'P' &&
      (element?.textContent ?? '').includes('Tiap slot menampung') &&
      (element?.textContent ?? '').includes('8 antrian')
    )
    expect(alertElements.length).toBeGreaterThan(0)
  })

  it('renders date kicker in mono uppercase brackets', async () => {
    render(<StepSelectSlot {...defaultProps} />)

    // Tunggu sampai loading selesai
    await waitFor(() => {
      expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    // Date kicker format bracket harus tampil
    expect(screen.getByText(/\[ Slot tersedia ·/)).toBeInTheDocument()
  })

  it('uses sans font (not mono) for slot time display', async () => {
    render(<StepSelectSlot {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    // Cari elemen yang menampilkan waktu slot
    const timeElement = screen.getByText('09:00')

    // Elemen harus TIDAK menggunakan font-mono (pakai font-sans atau tidak ada class mono)
    expect(timeElement.className).not.toContain('font-mono')
  })
})
