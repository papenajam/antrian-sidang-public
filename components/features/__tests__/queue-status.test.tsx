import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueueStatus } from '../queue-status'
import * as queueService from '@/lib/queue-service'

vi.mock('@/lib/queue-service', () => ({
  getTodaySchedule: vi.fn(),
  calculateQueueStatistics: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('QueueStatus', () => {
  const mockStatistics = {
    currentNumber: 5,
    waitingCount: 12,
    processedToday: 23,
    lastUpdated: '10:30:00',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(queueService.getTodaySchedule).mockResolvedValue({
      data: [],
      error: null,
    })
    vi.mocked(queueService.calculateQueueStatistics).mockReturnValue(mockStatistics)
  })

  it('renders queue status title', async () => {
    render(<QueueStatus />)

    await waitFor(() => {
      expect(screen.getByText(/status antrian/i)).toBeInTheDocument()
    })
  })

  it('displays current queue number after loading', async () => {
    render(<QueueStatus />)

    await waitFor(() => {
      expect(screen.getByText(/nomor antrian sekarang/i)).toBeInTheDocument()
    })
  })

  it('displays waiting count', async () => {
    render(<QueueStatus />)

    await waitFor(() => {
      expect(screen.getByText(/menunggu/i)).toBeInTheDocument()
    })
  })

  it('displays processed today count', async () => {
    render(<QueueStatus />)

    await waitFor(() => {
      expect(screen.getByText(/selesai hari ini/i)).toBeInTheDocument()
    })
  })

  it('renders reschedule button', async () => {
    render(<QueueStatus />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ganti jadwal/i })).toBeInTheDocument()
    })
  })

  it('shows loading skeleton initially', () => {
    render(<QueueStatus />)

    // Saat loading, judul tetap terlihat di skeleton
    expect(screen.getByText(/status antrian/i)).toBeInTheDocument()
  })

  it('calls getTodaySchedule on mount', async () => {
    render(<QueueStatus />)

    await waitFor(() => {
      expect(queueService.getTodaySchedule).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error toast when schedule fetch fails', async () => {
    const { toast } = await import('sonner')
    vi.mocked(queueService.getTodaySchedule).mockResolvedValue({
      data: [],
      error: 'Network error',
    })

    render(<QueueStatus />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error')
    })
  })
})
