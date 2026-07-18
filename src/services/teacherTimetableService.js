import api from '../plugins/api'

const BASE_URL = '/teacher-timetable'
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
const rows = (payload) => payload?.data?.data ?? payload?.data ?? payload ?? []

const download = async (url, params, fallbackName) => {
  const response = await api.get(url, { params: clean(params), responseType: 'blob' })
  const disposition = response.headers?.['content-disposition'] || ''
  const match = disposition.match(/filename\*=UTF-8''([^;]+)/i) || disposition.match(/filename="?([^";]+)"?/i)
  const filename = match?.[1] ? decodeURIComponent(match[1]) : fallbackName
  const objectUrl = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
  return response
}

export default {
  async getFilters() {
    const [years, teachers, grades, sections, streams] = await Promise.all([
      api.get('/academic-years'), api.get('/teachers'), api.get('/grades'), api.get('/sections'), api.get('/streams'),
    ])
    return {
      academic_years: rows(years), teachers: rows(teachers), grades: rows(grades), sections: rows(sections), streams: rows(streams),
    }
  },
  async getTimetable(params = {}) {
    const { data } = await api.get(BASE_URL, { params: clean({ mode: 'teacher', ...params }) })
    return data
  },
  exportExcel: (params = {}) => download(`${BASE_URL}/export`, { mode: 'teacher', ...params }, 'teacher-timetable.xlsx'),
  downloadPdf: (params = {}) => download(`${BASE_URL}/print`, { mode: 'teacher', ...params }, 'teacher-timetable.pdf'),
}
