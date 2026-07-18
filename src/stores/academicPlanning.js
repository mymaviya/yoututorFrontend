import { defineStore } from 'pinia'
import api from '../plugins/api'

export const useAcademicPlanningStore = defineStore('academicPlanning', {
  state: () => ({
    dashboard: null,
    loading: false,
    error: null,
  }),

  getters: {
    statistics: (state) => state.dashboard?.statistics || {},
    readiness: (state) => state.dashboard?.readiness || {},
    warnings: (state) => state.dashboard?.warnings || [],
    overallScore: (state) => state.dashboard?.readiness?.overall_score || 0,
  },

  actions: {
    async fetchDashboard() {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get('/academic-planning/dashboard')
        this.dashboard = data.data
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Failed to load Academic Planning dashboard.'
      } finally {
        this.loading = false
      }
    },
  },
})