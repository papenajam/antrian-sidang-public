import { describe, it, expectTypeOf } from 'vitest'
import type {
  ValidateRequest,
  ValidateResponse,
  SlotInfo,
  SlotsResponse,
  RescheduleRequest,
  RescheduleResponse,
} from '../api-types'

describe('API Types', () => {
  it('ValidateRequest has correct shape', () => {
    expectTypeOf<ValidateRequest>().toMatchTypeOf<{
      nomor_perkara: string
      nik: string
    }>()
  })

  it('SlotInfo has correct shape', () => {
    expectTypeOf<SlotInfo>().toMatchTypeOf<{
      time: string
      capacity: number
      booked: number
      available: number
    }>()
  })
})