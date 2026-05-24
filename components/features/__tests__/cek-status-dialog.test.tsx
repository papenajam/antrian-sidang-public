import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CekStatusDialog } from '@/components/features/cek-status-dialog'

// Mock queue-service agar tidak hit backend nyata
vi.mock('@/lib/queue-service', () => ({
  getStatusByQueueNumber: vi.fn(),
}))

// Mock sonner untuk mencegah side effects notifikasi di test
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { getStatusByQueueNumber } from '@/lib/queue-service'

describe('CekStatusDialog', () => {
  // Reset semua mock sebelum tiap test agar tidak bocor antar test
  beforeEach(() => vi.clearAllMocks())

  it('renders input form when open', () => {
    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    expect(screen.getByLabelText(/Nomor Antrian/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/NIK/i)).toBeInTheDocument()
  })

  it('disables submit when queue number is empty', () => {
    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    const submit = screen.getByRole('button', { name: /Cek Status →/i })
    expect(submit).toBeDisabled()
  })

  it('enables submit when queue number entered', () => {
    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    const input = screen.getByLabelText(/Nomor Antrian/i)
    fireEvent.change(input, { target: { value: 'S-014' } })
    const submit = screen.getByRole('button', { name: /Cek Status →/i })
    expect(submit).not.toBeDisabled()
  })

  it('shows result display on successful lookup', async () => {
    vi.mocked(getStatusByQueueNumber).mockResolvedValueOnce({
      data: {
        queue_number: 'S-014',
        status: 'waiting',
        position: 3,
        estimated_minutes: 53,
        nomor_perkara: '0091/Pdt.G/2026/PA.Pnj',
        jenis_perkara: 'Cerai Talak',
        pihak_nama: 'Andre',
        ruang_sidang: 'Ruang 1',
        agenda: 'Pemeriksaan Saksi',
      },
      error: null,
    })

    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/Nomor Antrian/i), { target: { value: 'S-014' } })
    fireEvent.click(screen.getByRole('button', { name: /Cek Status →/i }))

    await waitFor(() => {
      expect(screen.getByText('3 antrian lagi')).toBeInTheDocument()
      expect(screen.getByText(/Pemeriksaan Saksi/)).toBeInTheDocument()
    })
  })

  it('shows not-found alert when queue not found', async () => {
    vi.mocked(getStatusByQueueNumber).mockResolvedValueOnce({
      data: null,
      error: 'Nomor antrian tidak ditemukan',
    })

    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/Nomor Antrian/i), { target: { value: 'S-999' } })
    fireEvent.click(screen.getByRole('button', { name: /Cek Status →/i }))

    await waitFor(() => {
      // Teks tersebar di beberapa elemen (strong + text node),
      // gunakan fungsi matcher dan filter ke elemen <p> saja
      expect(
        screen.getByText((_, element) => {
          if (element?.tagName !== 'P') return false
          const text = element?.textContent ?? ''
          return /S-999/.test(text) && /tidak ditemukan/i.test(text)
        })
      ).toBeInTheDocument()
    })
  })

  it('allows "Cek Lain" to reset to input state', async () => {
    vi.mocked(getStatusByQueueNumber).mockResolvedValueOnce({
      data: {
        queue_number: 'S-014',
        status: 'waiting',
        position: 3,
        estimated_minutes: 53,
        pihak_nama: 'Test',
        nomor_perkara: '001/Pdt.G/2026',
        ruang_sidang: 'R1',
        agenda: 'A',
      },
      error: null,
    })

    render(<CekStatusDialog open onOpenChange={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/Nomor Antrian/i), { target: { value: 'S-014' } })
    fireEvent.click(screen.getByRole('button', { name: /Cek Status →/i }))

    await waitFor(() => screen.getByRole('button', { name: /Cek Lain/i }))
    fireEvent.click(screen.getByRole('button', { name: /Cek Lain/i }))

    expect(screen.getByLabelText(/Nomor Antrian/i)).toBeInTheDocument()
  })
})
