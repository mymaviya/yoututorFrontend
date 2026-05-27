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
      
        const res = await api.post('/login', credentials)

        this.token = res.data.token
        this.user = res.data.user

        localStorage.setItem('token', this.token)

        api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`

    },

    async fetchUser() {
      try {
        const res = await api.get('/current-user')
        this.user = res.data
        this.role = res.data.role;
        console.log('Fetched user:', this.user.name)
      } catch {
        this.logout()
      }
    },

    async logout() {
      try {
        await api.post("/logout");
      } catch (e) {
        // ignore
      }

      localStorage.removeItem("token");
      this.user = null;
      this.token = null;
    },
  }
})