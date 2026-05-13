import axios from 'axios'
import { useUIStore } from '../stores/snackBar'

const silentRoutes = [
  '/notifications',
  '/notifications/unread-count'
]

const isSilentRequest = (config) => {
  return silentRoutes.some(route =>
    config.url?.includes(route)
  )
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const ui = useUIStore()

  if (!isSilentRequest(config)) {
    ui.startLoading()
  }

  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

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

    if (!isSilentRequest(error.config || {})) {
      ui.stopLoading()
    }

    if (error.response?.status === 500) {
      ui.showSnackbar('Server error', 'error')
    }

    if (error.response?.status === 401) {
      ui.showSnackbar('Unauthorized - login again', 'error')
    }

    return Promise.reject(error)
  }
)

export default api