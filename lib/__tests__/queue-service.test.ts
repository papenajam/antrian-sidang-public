import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePerkara, getAvailableSlots, rescheduleQueue, bookQueueWizard } from '../queue-service'
import { api } from '../api'

// Mock api module
vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message)
      this.name = 'ApiError'
    }
  },
}))

describe('validatePerkara', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('memanggil POST /public/queue/validate dengan data yang benar', async () => {
    const mockResponse = {
      valid: true,
      data: {
        perkara_id: 123,
        pihak_nama: 'Ahmad',
        pihak_role: 'Penggugat',
        jadwal: { tanggal: '2026-05-30' },
        existing_queue: null,
      },
    }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await validatePerkara({
      nomor_perkara: '123/Pdt.G/2024/PA.Pps',
      nik: '3201234567890001',
    })

    expect(api.post).toHaveBeenCalledWith('/public/queue/validate', {
      nomor_perkara: '123/Pdt.G/2024/PA.Pps',
      nik: '3201234567890001',
    })
    expect(result).toEqual(mockResponse)
  })

  it('mengembalikan response invalid ketika NIK tidak terdaftar', async () => {
    const mockResponse = {
      valid: false,
      message: 'NIK tidak terdaftar',
    }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await validatePerkara({
      nomor_perkara: '123/Pdt.G/2024/PA.Pps',
      nik: '0000000000000000',
    })

    expect(result.valid).toBe(false)
    expect(result.message).toBe('NIK tidak terdaftar')
  })
})

describe('getAvailableSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('memanggil GET /public/queue/slots dengan params', async () => {
    const mockResponse = {
      data: {
        tanggal: '2026-05-30',
        slots: [
          { time: '09:00', capacity: 6, booked: 4, available: 2 },
        ],
      },
    }
    vi.mocked(api.get).mockResolvedValue(mockResponse)

    const result = await getAvailableSlots(123, '2026-05-30')

    expect(api.get).toHaveBeenCalledWith('/public/queue/slots?perkara_id=123&date=2026-05-30')
    expect(result).toEqual(mockResponse)
  })
})

describe('rescheduleQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('memanggil PUT /public/queue/reschedule dengan data yang benar', async () => {
    const mockResponse = {
      data: {
        queue_number: 'A-003',
        slot_time: '10:00',
        status: 'waiting',
      },
      message: 'Jadwal berhasil diubah',
    }
    vi.mocked(api.put).mockResolvedValue(mockResponse)

    const result = await rescheduleQueue({
      queue_number: 'A-003',
      perkara_id: 123,
      new_slot_time: '10:00',
    })

    expect(api.put).toHaveBeenCalledWith('/public/queue/reschedule', {
      queue_number: 'A-003',
      perkara_id: 123,
      new_slot_time: '10:00',
    })
    expect(result).toEqual(mockResponse)
  })
})

describe('bookQueueWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('memanggil POST /public/queue/book dengan parameter wizard', async () => {
    const mockResponse = {
      data: {
        queue_number: 'A-003',
        status: 'waiting',
        slot_time: '09:00',
        pihak_nama: 'Ahmad',
        nomor_perkara: '123/Pdt.G/2024/PA.Pps',
        ruang_sidang: 'Ruang Sidang 1',
      },
      message: 'Booking berhasil',
    }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const result = await bookQueueWizard({
      perkara_id: 123,
      nik: '3201234567890001',
      slot_time: '09:00',
    })

    expect(api.post).toHaveBeenCalledWith('/public/queue/book', {
      perkara_id: 123,
      nik: '3201234567890001',
      slot_time: '09:00',
    })
    expect(result).toEqual(mockResponse)
  })
})
