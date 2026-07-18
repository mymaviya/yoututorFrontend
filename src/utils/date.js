export const formatDate = (
  date,
  options = {}
) => {
  if (!date) return '-'

  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      ...defaultOptions,
      ...options
    }
  ).format(new Date(date))
}

export const formatDateTime = (
  date
) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  ).format(new Date(date))
}

export const formatFullDate = (
  date
) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
  ).format(new Date(date))
}

export const formatTime = (time) => {
  if (!time) return '-'

  const date = new Date()

  if (typeof time === 'string' && time.includes(':')) {
    const parts = time.split(':')
    date.setHours(
      Number(parts[0]),
      Number(parts[1]),
      Number(parts[2] || 0)
    )
  } else {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
  ).format(date)
}

export const formatDateTimeWithSeconds = (
  date
) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  ).format(new Date(date))
}

export const formatShortDate = (
  date
) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
    }
  ).format(new Date(date))
}