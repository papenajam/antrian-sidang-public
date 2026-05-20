import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExistingQueueCard } from '../existing-queue-card'
import type { ExistingQueue } from '@/lib/api-types'

describe('ExistingQueueCard', () => {
  const mockQueue: ExistingQueue = {
    queue_number: 'A-003',
    slot_time: '09:00',
    status: 'waiting',
  }

  const defaultProps = {
    queue: mockQueue,
    onViewStatus: vi.fn(),
    onReschedule: vi.fn(),
    onBookAgain: vi.fn(),
  }

  it('renders existing queue info', () => {
    render(<ExistingQueueCard {...defaultProps} />)
    expect(screen.getByText('A-003')).toBeInTheDocument()
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
    expect(screen.getByText(/menunggu/i)).toBeInTheDocument()
  })

  it('renders info message about shared queue', () => {
    render(<ExistingQueueCard {...defaultProps} />)
    expect(screen.getByText(/sudah memiliki booking/i)).toBeInTheDocument()
  })

  it('calls onViewStatus when button clicked', () => {
    const onViewStatus = vi.fn()
    render(<ExistingQueueCard {...defaultProps} onViewStatus={onViewStatus} />)
    fireEvent.click(screen.getByRole('button', { name: /lihat status/i }))
    expect(onViewStatus).toHaveBeenCalled()
  })

  it('calls onReschedule when button clicked', () => {
    const onReschedule = vi.fn()
    render(<ExistingQueueCard {...defaultProps} onReschedule={onReschedule} />)
    fireEvent.click(screen.getByRole('button', { name: /ganti jadwal/i }))
    expect(onReschedule).toHaveBeenCalled()
  })

  it('calls onBookAgain when button clicked', () => {
    const onBookAgain = vi.fn()
    render(<ExistingQueueCard {...defaultProps} onBookAgain={onBookAgain} />)
    fireEvent.click(screen.getByRole('button', { name: /booking baru/i }))
    expect(onBookAgain).toHaveBeenCalled()
  })
})
