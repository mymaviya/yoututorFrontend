import api from '../plugins/api'

const BASE_URL = '/teacher-timetable'

const clean = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => (
    value !== undefined && value !== null && value !== ''
  )),
)

const unwrap = payload => payload?.data?.data ?? payload?.data ?? payload ?? {}

const list = payload => {
  const value = unwrap(payload)
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

const filenameFrom = (response, fallbackName) => {
  const disposition = response.headers?.['content-disposition'] || ''
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1]

  try {
    return decodeURIComponent(encoded || plain || fallbackName)
  } catch {
    return plain || fallbackName
  }
}

const blobErrorMessage = async error => {
  const blob = error?.response?.data
  if (!(blob instanceof Blob)) return null

  try {
    const text = await blob.text()
    const payload = JSON.parse(text)
    return payload?.message || payload?.error || null
  } catch {
    return null
  }
}

const download = async (url, params, fallbackName) => {
  try {
    const response = await api.get(url, {
      params: clean(params),
      responseType: 'blob',
    })

    const objectUrl = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filenameFrom(response, fallbackName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)

    return response
  } catch (error) {
    const message = await blobErrorMessage(error)
    if (message) {
      const readableError = new Error(message)
      readableError.response = error.response
      throw readableError
    }
    throw error
  }
}

export default {
  async getFilters() {
    const [years, teachers] = await Promise.all([
      api.get('/academic-years'),
      api.get('/teachers'),
    ])

    return {
      academic_years: list(years),
      teachers: list(teachers),
    }
  },

  async getTimetable(params = {}) {
    const { data } = await api.get(BASE_URL, {
      params: clean({ mode: 'teacher', ...params }),
    })
    return data
  },

  exportExcel: (params = {}) => download(
    `${BASE_URL}/export`,
    { mode: 'teacher', ...params },
    'teacher-timetable.xlsx',
  ),

  downloadPdf: (params = {}) => download(
    `${BASE_URL}/print`,
    { mode: 'teacher', ...params },
    'teacher-timetable.pdf',
  ),
}
