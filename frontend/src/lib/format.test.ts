import { describe, expect, it } from 'vitest'

import { formatAge, formatDate, formatRelativeDate } from '@/lib/format'

describe('formatDate', () => {
  it('treats date-only strings as local dates', () => {
    expect(formatDate('1990-05-04')).toBe('May 4, 1990')
  })

  it('falls back when the value is missing', () => {
    expect(formatDate(null)).toBe('Not recorded')
  })
})

describe('formatRelativeDate', () => {
  const now = new Date('2026-10-06T12:00:00Z')

  it('says today for the same day', () => {
    expect(formatRelativeDate('2026-10-06T09:00:00Z', now)).toBe('Today')
  })

  it('counts days under a month', () => {
    expect(formatRelativeDate('2026-09-28T09:00:00Z', now)).toBe('8 days ago')
  })

  it('counts months under a year', () => {
    expect(formatRelativeDate('2026-07-06T09:00:00Z', now)).toBe('3 months ago')
  })

  it('counts years beyond that', () => {
    expect(formatRelativeDate('2024-10-01T09:00:00Z', now)).toBe('2 years ago')
  })

  it('explains a missing visit', () => {
    expect(formatRelativeDate(null, now)).toBe('No visit on record')
  })
})

describe('formatAge', () => {
  it('pluralizes correctly', () => {
    expect(formatAge(1)).toBe('1 year')
    expect(formatAge(42)).toBe('42 years')
  })
})
