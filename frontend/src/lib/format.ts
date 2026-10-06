const DAY_IN_MS = 24 * 60 * 60 * 1000

const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not recorded'
  // Date-only strings are treated as local dates so they do not shift by timezone.
  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)
  return longDate.format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return 'Not recorded'
  return dateTime.format(new Date(value))
}

export function formatRelativeDate(value: string | null | undefined, now = new Date()): string {
  if (!value) return 'No visit on record'
  const elapsedDays = Math.round((now.getTime() - new Date(value).getTime()) / DAY_IN_MS)
  if (elapsedDays < 1) return 'Today'
  if (elapsedDays < 30) return relative.format(-elapsedDays, 'day')
  if (elapsedDays < 365) return relative.format(-Math.round(elapsedDays / 30), 'month')
  return relative.format(-Math.round(elapsedDays / 365), 'year')
}

export function formatAge(age: number): string {
  return age === 1 ? '1 year' : `${age} years`
}

export function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString('en-US')} ${count === 1 ? singular : plural}`
}

export function toDateTimeLocalValue(date: Date): string {
  const offsetMinutes = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offsetMinutes * 60 * 1000)
  return local.toISOString().slice(0, 16)
}
