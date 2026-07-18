import api from '../plugins/api'

const BASE_URL = '/teacher-timetable'

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) =>
      value !== undefined && value !== null && value !== ''
    )
  )

const getFilename = (response, fallbackName) => {
  const disposition = response.headers?.['content-disposition'] || ''
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)

  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1])
  if (plainMatch?.[1]) return plainMatch[1]

  return fallbackName
}

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}

const downloadResponse = async (url, params = {}, fallbackName = 'teacher-timetable.xlsx') => {
  const response = await api.get(url, {
    params: cleanParams(params),
    responseType: 'blob',
  })

  downloadBlob(response.data, getFilename(response, fallbackName))
  return response
}

const teacherTimetableService = {
  async getFilters(params = {}) {
    const { data } = await api.get(`${BASE_URL}/filters`, {
      params: cleanParams(params),
    })

    return data
  },

  async getTimetable(params = {}) {
    const { data } = await api.get(BASE_URL, {
      params: cleanParams(params),
    })

    return data
  },

  async exportExcel(params = {}) {
    return downloadResponse(
      `${BASE_URL}/export`,
      params,
      'teacher-timetable.xlsx'
    )
  },

  async downloadPdf(params = {}) {
    return downloadResponse(
      `${BASE_URL}/pdf`,
      params,
      'teacher-timetable.pdf'
    )
  },
}

export default teacherTimetableService
