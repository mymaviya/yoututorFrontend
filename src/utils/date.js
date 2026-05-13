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