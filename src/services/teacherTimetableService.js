import api from '../plugins/api'

const BASE_URL = '/teacher-timetable'

const cleanParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined && value !== null && value !== ''
    })
  )
}

const downloadResponse = async (url, params = {}, fallbackName = 'teacher-timetable') => {
  const response = await api