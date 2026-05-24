import { describe, it, expect } from 'vitest'
import { addMin, formatDate } from '@/lib/utils'

describe('addMin', () => {
  it('adds minutes to HH:MM time', () => {
    expect(addMin('10:00', 30)).toBe('10:30')
    expect(addMin('09:30', 60)).toBe('10:30')
    expect(addMin('23:30', 30)).toBe('24:00')
  })

  it('returns empty string for falsy input', () => {
    expect(addMin('', 30)).toBe('')
  })

  it('handles single-digit hours/minutes', () => {
    expect(addMin('08:05', 7)).toBe('08:12')
  })
})

describe('formatDate', () => {
  it('formats ISO date to Indonesian long format', () => {
    const result = formatDate('2026-05-23')
    expect(result).toBe('Sabtu, 23 Mei 2026')
  })

  it('formats datetime string correctly', () => {
    const result = formatDate('2026-05-23T10:00:00')
    expect(result).toBe('Sabtu, 23 Mei 2026')
  })

  it('returns empty string for invalid date', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate('invalid')).toBe('')
  })
})
