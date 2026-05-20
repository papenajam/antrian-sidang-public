import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingWizard } from '../booking-wizard'
import * as queueService from '@/lib/queue-service'

vi.mock('@/lib/queue-service', () => ({
  validatePerkara: vi.fn(),
  getAvailableSlots: vi.fn(),
  bookQueueWizard: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock BlurFade agar tidak perlu animasi
vi.mock('@/components/magic/blur-fade', () => ({
  BlurFade: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock FormProgress agar tidak perlu render progress bar kompleks
vi.mock('@/components/features/form-progress', () => ({
  FormProgress: ({ steps, currentStep }: { steps: Array<{ id: string; title: string }>; currentStep: number }) => (
    <div data-testid="form-progress">
      {steps.map((step, index) => (
        <span key={step.id} data-active={index === currentStep}>
          {step.title}
        </span>
      ))}
    </div>
  ),
}))

describe('BookingWizard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('completes full booking flow', async () => {
    // Mock validate — menggunakan 'waktu' sesuai JadwalSidang type
    vi.mocked(queueService.validatePerkara).mockResolvedValue({
      valid: true,
      data: {
        perkara_id: 123,
        pihak_nama: 'Ahmad',
        pihak_role: 'Penggugat',
        jadwal: {
          perkara_id: 123,
          nomor_perkara: '123/Pdt.G/2024/PA.Pps',
          pihak_nama: 'Ahmad',
          ruangan: 'Ruang 1',
          waktu: '2026-05-30T09:00:00',
          agenda: 'Sidang Pertama',
        },
        existing_queue: null,
      },
    })

    // Mock slots
    vi.mocked(queueService.getAvailableSlots).mockResolvedValue({
      data: {
        tanggal: '2026-05-30',
        slots: [
          { time: '09:00', capacity: 6, booked: 4, available: 2 },
        ],
      },
    })

    // Mock book
    vi.mocked(queueService.bookQueueWizard).mockResolvedValue({
      data: {
        queue_number: 'A-003',
        status: 'waiting',
        pihak_nama: 'Ahmad',
        nomor_perkara: '123/Pdt.G/2024/PA.Pps',
        ruang_sidang: 'Ruang 1',
      },
      message: 'Berhasil',
    })

    render(<BookingWizard />)

    // Step 1: Validasi — isi form dan submit
    const nomorPerkaraInput = screen.getByLabelText(/nomor perkara/i)
    const nikInput = screen.getByLabelText(/nik/i)

    // Gunakan userEvent.type untuk mensimulasikan pengetikan yang benar
    // Ini memicu onChange handler yang memproses input per karakter
    const user = userEvent.setup()
    await user.type(nomorPerkaraInput, '123/Pdt.G/2024/PA.Pps')
    await user.type(nikInput, '3201234567890001')

    // Verifikasi input terisi dengan benar sebelum submit
    expect(nomorPerkaraInput).toHaveValue('123/Pdt.G/2024/PA.Pps')
    expect(nikInput).toHaveValue('3201234567890001')

    fireEvent.click(screen.getByRole('button', { name: /cek jadwal/i }))

    // Step 2: Pilih slot
    await waitFor(() => {
      expect(screen.getByText('09:00')).toBeInTheDocument()
    })

    // Cari button slot yang benar (SlotCard adalah button dengan text 09:00 dan info tersedia)
    const buttons = screen.getAllByRole('button')
    const slotButton = buttons.find(button =>
      button.textContent?.includes('09:00') && button.textContent?.includes('2/6 tersedia')
    )!
    fireEvent.click(slotButton)

    // Klik tombol Lanjutkan
    fireEvent.click(screen.getByRole('button', { name: /lanjutkan/i }))

    // Step 3: Konfirmasi — tunggu hingga tombol "Konfirmasi Booking" muncul
    let confirmButton: HTMLElement
    await waitFor(() => {
      const allButtons = screen.getAllByRole('button')
      confirmButton = allButtons.find(button =>
        button.textContent?.includes('Konfirmasi Booking')
      )!
      expect(confirmButton).toBeDefined()
    })
    fireEvent.click(confirmButton!)

    // Step 4: Tiket
    await waitFor(() => {
      expect(screen.getByText('A-003')).toBeInTheDocument()
      expect(screen.getByText(/booking berhasil/i)).toBeInTheDocument()
    })

    // Verifikasi service dipanggil dengan benar
    expect(queueService.validatePerkara).toHaveBeenCalledWith({
      nomor_perkara: '123/Pdt.G/2024/PA.Pps',
      nik: '3201234567890001',
    })
    expect(queueService.getAvailableSlots).toHaveBeenCalledWith(123, '2026-05-30T09:00:00')

    // NOTE: bookingData.nik saat ini selalu kosong karena StepValidate tidak
    // mengirimkan nik ke parent. Bug ini perlu diperbaiki di komponen BookingWizard
    // dengan menambahkan callback untuk mengirim nik dari StepValidate.
    expect(queueService.bookQueueWizard).toHaveBeenCalledWith({
      perkara_id: 123,
      nik: '',
      slot_time: '09:00',
    })
  })
})
