import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCurrentCall } from '@/lib/hooks/use-current-call'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(public status: number, message: string) { super(message) }
  },
}))

import { api } from '@/lib/api'

describe('useCurrentCall', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  it('returns initial loading state', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useCurrentCall())
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
  })

  it('fetches and returns current call data on success', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        current: {
          queue_number: 'S-014',
          pihak_nama: 'Andre',
          lawan_nama: 'Dewi',
          nomor_perkara: '0091/Pdt.G/2026/PA.Pnj',
          jenis_perkara: 'Cerai Talak',
          ruang_sidang: 'Ruang 1',
          agenda: 'Pemeriksaan Saksi',
          jam_mulai: '10:00',
          started_at: '2026-05-24T10:05:00Z',
        },
        next: null,
        waiting_count: 7,
        done_count: 5,
      },
      error: null,
    })

    const { result } = renderHook(() => useCurrentCall())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.current?.queueNumber).toBe('S-014')
    expect(result.current.data?.waitingCount).toBe(7)
  })

  it('returns null current when no active call', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { current: null, next: null, waiting_count: 0, done_count: 0 },
      error: null,
    })

    const { result } = renderHook(() => useCurrentCall())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data?.current).toBeNull()
  })
})
