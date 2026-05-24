import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProgress } from '@/components/features/form-progress'

describe('FormProgress — Pill Stepper', () => {
  const steps = [
    { id: 1, label: 'Validasi' },
    { id: 2, label: 'Pilih Slot' },
    { id: 3, label: 'Konfirmasi' },
    { id: 4, label: 'Tiket' },
  ]

  it('renders 4 step pills', () => {
    render(<FormProgress steps={steps} currentStep={2} />)
    expect(screen.getByText(/Langkah 1 — Validasi/)).toBeInTheDocument()
    expect(screen.getByText(/Langkah 4 — Tiket/)).toBeInTheDocument()
  })

  it('marks step before currentStep as done with checkmark', () => {
    render(<FormProgress steps={steps} currentStep={3} />)
    const checks = screen.getAllByText('✓')
    expect(checks.length).toBe(2)
  })

  it('marks current step as active', () => {
    render(<FormProgress steps={steps} currentStep={2} />)
    const activeStep = screen.getByText(/Langkah 2 — Pilih Slot/).closest('div')
    expect(activeStep?.className).toMatch(/shadow|bg-card/)
  })

  it('marks future steps as pending', () => {
    render(<FormProgress steps={steps} currentStep={2} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})
