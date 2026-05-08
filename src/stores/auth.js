import { defineStore } from 'pinia'
import api from '../plugins/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    drawer: true,
    user: null,
    token: localStorage.getItem('token') || null,
    theme: localStorage.getItem('theme') || 'light', // light | dark
  }),

  getters: {
    isAuth: (state) => !!state.token,
    role: (state) => state.user?.role
  },

  actions: {
    toggleDrawer() {
      this.drawer = !this.drawer
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', this.theme)
    },
    
    async login(credentials) {
      try {
        const res = await api.post('/login', credentials)

        this.token = res.data.token
        this.user = res.data.user

        localStorage.setItem('token', this.token)

        return res
      } catch (error) {
        throw error.response?.data || error
      }
    },

    async fetchUser() {
      try {
        const res = await api.get('/current-user')
        this.user = res.data
        console.log('Fetched user:', this.user.name)
      } catch {
        this.logout()
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})