import axios from 'axios'
import { useUIStore } from '../stores/snackBar'

const silentRoutes = [
  '/heartbeat',
  '/notifications',
  '/notifications/unread-count'
]

const isSilentRequest = (config = {}) => {
  return silentRoutes.some(route =>
    config.url?.includes(route)
  )
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const ui = useUIStore()

    if (!isSilentRequest(config)) {
      ui.startLoading()
    }

    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    const ui = useUIStore()

    if (!isSilentRequest(response.config)) {
      ui.stopLoading()
    }

    return response
  },

  (error) => {
    const ui = useUIStore()
    const config = error.config || {}

    if (!isSilentRequest(config)) {
      ui.stopLoading()
    }

    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (!isSilentRequest(config)) {
        ui.showSnackbar('Session expired. Please login again.', 'error')
      }
    }

    if (status === 403) {
      ui.showSnackbar(error.response?.data?.message || 'Access denied', 'error')
    }

    if (status === 422) {
      ui.showSnackbar(error.response?.data?.message || 'Validation error', 'error')
    }

    if (status === 500) {
      ui.showSnackbar('Server error', 'error')
    }

    return Promise.reject(error)
  }
)

export default api