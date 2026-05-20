import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlotCard } from '../slot-card'
import type { SlotInfo } from '@/lib/api-types'

describe('SlotCard', () => {
  const availableSlot: SlotInfo = {
    time: '09:00',
    capacity: 6,
    booked: 4,
    available: 2,
  }

  const fullSlot: SlotInfo = {
    time: '10:00',
    capacity: 6,
    booked: 6,
    available: 0,
  }

  it('renders slot time range', () => {
    render(<SlotCard slot={availableSlot} selected={false} onSelect={() => {}} />)
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders available quota', () => {
    render(<SlotCard slot={availableSlot} selected={false} onSelect={() => {}} />)
    expect(screen.getByText('2/6 tersedia')).toBeInTheDocument()
  })

  it('renders full status when no availability', () => {
    render(<SlotCard slot={fullSlot} selected={false} onSelect={() => {}} />)
    expect(screen.getByText('PENUH')).toBeInTheDocument()
  })

  it('disables card when slot is full', () => {
    render(<SlotCard slot={fullSlot} selected={false} onSelect={() => {}} />)
    const card = screen.getByRole('button')
    expect(card).toBeDisabled()
  })

  it('calls onSelect when available slot is clicked', () => {
    const onSelect = vi.fn()
    render(<SlotCard slot={availableSlot} selected={false} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith('09:00')
  })

  it('does not call onSelect when full slot is clicked', () => {
    const onSelect = vi.fn()
    render(<SlotCard slot={fullSlot} selected={false} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('applies selected style when selected', () => {
    render(<SlotCard slot={availableSlot} selected={true} onSelect={() => {}} />)
    const card = screen.getByRole('button')
    expect(card.className).toContain('border-primary')
  })
})
