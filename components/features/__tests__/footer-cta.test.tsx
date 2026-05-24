import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FooterCta } from '@/components/features/footer-cta'

vi.mock('@/contexts/booking-modal-context', () => ({
  useBookingModal: () => ({ isOpen: false, setIsOpen: vi.fn() }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FooterCta', () => {
  it('renders pre-kicker with "Siap mendaftar?" text', () => {
    render(<FooterCta />)
    expect(screen.getByText(/Siap mendaftar\?/)).toBeInTheDocument()
  })

  it('renders 2-line heading "Hemat waktu. Daftar online."', () => {
    render(<FooterCta />)
    expect(screen.getByText(/Hemat waktu/)).toBeInTheDocument()
    expect(screen.getByText(/Daftar online/)).toBeInTheDocument()
  })

  it('renders primary CTA "Daftar Antrian Sekarang"', () => {
    render(<FooterCta />)
    expect(screen.getByRole('button', { name: /Daftar Antrian Sekarang/i })).toBeInTheDocument()
  })

  it('renders ghost button "Pelajari Selengkapnya" linking to #sec-panduan', () => {
    render(<FooterCta />)
    const ghostBtn = screen.getByRole('link', { name: /Pelajari Selengkapnya/i })
    expect(ghostBtn).toBeInTheDocument()
    expect(ghostBtn).toHaveAttribute('href', '#sec-panduan')
  })
})
