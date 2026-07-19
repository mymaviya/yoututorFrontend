import { defineStore } from 'pinia'
import api from '../plugins/api'
import { useUIStore } from '../stores/snackBar'

const errorMessage = (error, fallback) => (
  error?.response?.data?.message || fallback
)

export const useTeacherSubstitutionStore = defineStore('teacherSubstitution', {
  state: () => ({
    stats: {},
    analytics: {},
    items: [],
    pendingItems: [],
    suggestions: [],
    loading: false,
    saving: false,
    suggestionLoading: false,
  }),

  getters: {
    summary: (state) => state.analytics?.summary || state.stats || {},
    aiStats: (state) => state.analytics?.ai || {},
    teacherLoad: (state) => state.analytics?.teacher_load || [],
    subjectAnalysis: (state) => state.analytics?.subject_analysis || [],
    gradeAnalysis: (state) => state.analytics?.grade_analysis || [],
    monthlyTrend: (state) => state.analytics?.monthly_trend || [],
    weekdayHeatmap: (state) => state.analytics?.weekday_heatmap || [],
  },

  actions: {
    async fetchDashboard(date = null, academicYearId = null) {
      const ui = useUIStore()
      this.loading = true

      try {
        const { data } = await api.get('/teacher-substitutions/dashboard', {
          params: {
            date,
            academic_year_id: academicYearId,
          },
        })

        this.stats = data?.stats || data?.summary || {}
        this.items = Array.isArray(data?.items) ? data.items : []
        this.analytics = data?.analytics || {}

        return data
      } catch (error) {
        this.stats = {}
        this.items = []
        this.analytics = {}
        ui.showSnackbar(
          errorMessage(error, 'Failed to load substitution dashboard.'),
          'error'
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPending(date = null, academicYearId = null) {
      const ui = useUIStore()

      try {
        const { data } = await api.get('/teacher-substitutions/pending', {
          params: {
            date,
            academic_year_id: academicYearId,
          },
        })

        this.pendingItems = Array.isArray(data) ? data : []
        return this.pendingItems
      } catch (error) {
        this.pendingItems = []
        ui.showSnackbar(
          errorMessage(error, 'Failed to load pending substitutions.'),
          'error'
        )
        throw error
      }
    },

    async fetchSuggestions(params) {
      const ui = useUIStore()
      this.suggestionLoading = true
      this.suggestions = []

      try {
        const { data } = await api.get('/teacher-substitutions/suggestions', {
          params,
        })

        this.suggestions = Array.isArray(data) ? data : []
        return this.suggestions
      } catch (error) {
        this.suggestions = []
        ui.showSnackbar(
          errorMessage(error, 'Failed to load substitute suggestions.'),
          'error'
        )
        throw error
      } finally {
        this.suggestionLoading = false
      }
    },

    clearSuggestions() {
      this.suggestions = []
    },

    async create(payload) {
      const ui = useUIStore()
      this.saving = true

      try {
        const { data } = await api.post('/teacher-substitutions', payload)
        ui.showSnackbar(data?.message || 'Substitution created successfully.')
        return data?.data
      } catch (error) {
        ui.showSnackbar(
          errorMessage(error, 'Failed to create substitution.'),
          'error'
        )
        throw error
      } finally {
        this.saving = false
      }
    },

    async assign(id, substituteTeacherId) {
      const ui = useUIStore()
      this.saving = true

      try {
        const { data } = await api.post(`/teacher-substitutions/${id}/assign`, {
          substitute_teacher_id: substituteTeacherId,
        })

        ui.showSnackbar(data?.message || 'Substitute assigned successfully.')
        return data?.data
      } catch (error) {
        ui.showSnackbar(
          errorMessage(error, 'Failed to assign substitute.'),
          'error'
        )
        throw error
      } finally {
        this.saving = false
      }
    },

    async approve(id) {
      const ui = useUIStore()
      this.saving = true

      try {
        const { data } = await api.post(`/teacher-substitutions/${id}/approve`)
        ui.showSnackbar(data?.message || 'Substitution approved.')
        return data?.data
      } catch (error) {
        ui.showSnackbar(
          errorMessage(error, 'Failed to approve substitution.'),
          'error'
        )
        throw error
      } finally {
        this.saving = false
      }
    },

    async cancel(id, remarks = null) {
      const ui = useUIStore()
      this.saving = true

      try {
        const { data } = await api.post(`/teacher-substitutions/${id}/cancel`, {
          remarks,
        })

        ui.showSnackbar(data?.message || 'Substitution cancelled.')
        return data?.data
      } catch (error) {
        ui.showSnackbar(
          errorMessage(error, 'Failed to cancel substitution.'),
          'error'
        )
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
