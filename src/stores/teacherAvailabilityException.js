import { defineStore } from 'pinia'
import api from '../plugins/api'
import { useUIStore } from '../stores/snackBar'

export const useTeacherAvailabilityExceptionStore = defineStore('teacherAvailabilityException', {
  state: () => ({
    teachers: [],
    bells: [],
    exceptions: [],
    stats: {},
    week: null,
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    leaveExceptions: (state) => state.exceptions.filter((item) => item.status === 'leave'),
  },

  actions: {
    async fetchDashboard(date = null) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get('/teacher-availability-exceptions/dashboard', {
          params: { date },
        })

        this.teachers = data.data?.teachers || []
        this.bells = data.data?.bells || []
        this.exceptions = data.data?.exceptions || []
        this.stats = data.data?.stats || {}
        this.week = data.data?.week || null
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load teacher availability dashboard.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async save(payload, id = null) {
      const ui = useUIStore()
      this.saving = true

      try {
        if (id) {
          await api.put(`/teacher-availability-exceptions/${id}`, payload)
        } else {
          await api.post('/teacher-availability-exceptions', payload)
        }

        ui.showSnackbar('Teacher availability exception saved successfully.')
      } catch (error) {
        ui.showSnackbar(error.response?.data?.message || 'Failed to save exception.', 'error')
        throw error
      } finally {
        this.saving = false
      }
    },

    async delete(id, date = null) {
      const ui = useUIStore()

      try {
        await api.delete(`/teacher-availability-exceptions/${id}`)
        ui.showSnackbar('Exception deleted successfully.')
        await this.fetchDashboard(date)
      } catch (error) {
        ui.showSnackbar(error.response?.data?.message || 'Failed to delete exception.', 'error')
        throw error
      }
    },

    async moveException(id, payload) {
      const ui = useUIStore()

      try {
        const { data } = await api.patch(
          `/teacher-availability-exceptions/${id}/move`,
          payload
        )

        ui.showSnackbar('Exception moved successfully.')
        return data.data
      } catch (error) {
        ui.showSnackbar(
          error.response?.data?.message || 'Failed to move exception.',
          'error'
        )

        throw error
      }
    },

  },
})


