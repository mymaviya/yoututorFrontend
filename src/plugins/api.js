import axios from 'axios'
import router from '../router'
import { useUIStore } from '../stores/snackBar'

const silentRoutes = [
  '/heartbeat',
  '/notifications',
  '/notifications/unread-count'
]

const isSilentRequest = (config = {}) => {
  return silentRoutes.some((route) => config.url?.includes(route))
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 600000,
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
  (error) => Promise.reject(error)
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
    const status = error.response?.status
    const data = error.response?.data || {}

    if (!isSilentRequest(config)) {
      ui.stopLoading()
    }

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common.Authorization

      if (!isSilentRequest(config)) {
        ui.showSnackbar('Session expired. Please login again.', 'error')
      }

      if (router.currentRoute.value.name !== 'login') {
        router.replace({ name: 'login' })
      }
    }

    if (status === 403) {
      if (data.subscription_expired) {
        if (router.currentRoute.value.name !== 'subscription.expired') {
          router.replace({ name: 'subscription.expired' })
        }
      } else if (!isSilentRequest(config)) {
        ui.showSnackbar(data.message || 'Access denied', 'error')
      }
    }

    if (status === 422 && !isSilentRequest(config)) {
      ui.showSnackbar(data.message || 'Validation error', 'error')
    }

    if (status === 500 && !isSilentRequest(config)) {
      ui.showSnackbar('Server error', 'error')
    }

    return Promise.reject(error)
  }
)

export default api
