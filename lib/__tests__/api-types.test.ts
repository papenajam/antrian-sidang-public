import { describe, it, expect } from 'vitest'
import type {
  ValidateRequest,
  SlotInfo,
} from '../api-types'

describe('API Types', () => {
  it('ValidateRequest has correct shape', () => {
    const request: ValidateRequest = {
      nomor_perkara: '123/Pdt.G/2024/PA.Pps',
      nik: '3201234567890001',
    }
    expect(request.nomor_perkara).toBeDefined()
    expect(request.nik).toBeDefined()
  })

  it('SlotInfo has correct shape', () => {
    const slot: SlotInfo = {
      time: '09:00',
      capacity: 6,
      booked: 4,
      available: 2,
    }
    expect(slot.time).toBeDefined()
    expect(slot.capacity).toBeDefined()
  })
})