import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanduanSection } from '@/components/features/panduan-section'

// Mock booking-modal-context: menyediakan setIsOpen agar tidak throw
// Actual return shape: { isOpen, setIsOpen } sesuai BookingModalContextType
vi.mock('@/contexts/booking-modal-context', () => ({
  useBookingModal: () => ({ isOpen: false, setIsOpen: vi.fn() }),
}))

// Bersihkan semua mock sebelum tiap test untuk menghindari state bocor
beforeEach(() => {
  vi.clearAllMocks()
})

describe('PanduanSection — Section Header', () => {
  it('renders kicker pill "Empat langkah · ±2 menit"', () => {
    render(<PanduanSection />)
    expect(screen.getByText(/Empat langkah · ±2 menit/)).toBeInTheDocument()
  })

  it('renders heading "Cara mendaftar antrian"', () => {
    render(<PanduanSection />)
    expect(screen.getByRole('heading', { name: /Cara mendaftar antrian/i })).toBeInTheDocument()
  })

  it('renders CTA "Mulai Daftar" button in header', () => {
    render(<PanduanSection />)
    expect(screen.getByRole('button', { name: /Mulai Daftar/i })).toBeInTheDocument()
  })
})

describe('PanduanSection — Step Cards', () => {
  it('renders 4 step number boxes with mono "01" through "04"', () => {
    render(<PanduanSection />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
  })

  it('renders step 4 title as "Tiket Digital"', () => {
    render(<PanduanSection />)
    expect(screen.getByText(/Tiket Digital/)).toBeInTheDocument()
  })

  it('renders step 3 title as "Konfirmasi"', () => {
    render(<PanduanSection />)
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument()
  })

  it('renders step footer line "Step 0N / 04" for each card', () => {
    render(<PanduanSection />)
    expect(screen.getByText(/Step 01 \/ 04/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 04 \/ 04/i)).toBeInTheDocument()
  })
})
