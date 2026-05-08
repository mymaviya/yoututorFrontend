import axios from 'axios'
import { useUIStore } from '../stores/snackBar'


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Accept': 'application/json'
  }
})

// Attach token automatically
api.interceptors.request.use((config) => {
  const ui = useUIStore()

  ui.startLoading()


  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response
api.interceptors.response.use(
  (response) => {
    const ui = useUIStore()
    ui.stopLoading()
    return response
  },
  (error) => {
    const ui = useUIStore()
    ui.stopLoading()

    // Global error handling
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