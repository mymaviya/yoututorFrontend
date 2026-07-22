import { defineStore } from 'pinia'
import api from '../plugins/api'
import { useUIStore } from './snackBar'

const extractPayload = (response) => response?.data?.data || response?.data || {}

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const useTeacherAvailabilityExceptionStore = defineStore('teacherAvailabilityException', {
  state: () => ({
    teachers: [],
    bells: [],
    exceptions: [],
    stats: {},
    week: null,
    academicYearId: null,
    loading: false,
    saving: false,
    deleting: false,
    moving: false,
    error: null,
    activeRequestId: 0,
  }),

  getters: {
    leaveExceptions: (state) =>
      state.exceptions.filter((item) => item.status === 'leave'),

    activeExceptions: (state) =>
      state.exceptions.filter((item) => item.is_active !== false),
  },

  actions: {
    async fetchDashboard(date = null, academicYearId = null) {
      const requestId = ++this.activeRequestId

      this.loading = true
      this.error = null
      this.academicYearId = academicYearId || null

      try {
        const params = {}
        if (date) params.date = date
        if (academicYearId) params.academic_year_id = academicYearId

        const response = await api.get('/teacher-availability-exceptions/dashboard', { params })

        if (requestId !== this.activeRequestId) return null

        const payload = extractPayload(response)

        this.teachers = Array.isArray(payload.teachers) ? payload.teachers : []
        this.bells = Array.isArray(payload.bells) ? payload.bells : []
        this.exceptions = Array.isArray(payload.exceptions) ? payload.exceptions : []
        this.stats = payload.stats && typeof payload.stats === 'object' ? payload.stats : {}
        this.week = payload.week || null
        this.academicYearId = payload.academic_year_id || academicYearId || null

        return payload
      } catch (error) {
        if (requestId === this.activeRequestId) {
          this.error = extractErrorMessage(
            error,
            'Failed to load teacher availability dashboard.'
          )
        }

        throw error
      } finally {
        if (requestId === this.activeRequestId) {
          this.loading = false
        }
      }
    },

    async save(payload, id = null, options = {}) {
      const ui = useUIStore()
      const { silent = false } = options

      this.saving = true
      this.error = null

      try {
        const response = id
          ? await api.put(`/teacher-availability-exceptions/${id}`, payload)
          : await api.post('/teacher-availability-exceptions', payload)

        if (!silent) {
          ui.showSnackbar(
            id
              ? 'Teacher availability exception updated successfully.'
              : 'Teacher availability exception created successfully.'
          )
        }

        return extractPayload(response)
      } catch (error) {
        const message = extractErrorMessage(error, 'Failed to save exception.')
        this.error = message

        if (!silent) {
          ui.showSnackbar(message, 'error')
        }

        throw error
      } finally {
        this.saving = false
      }
    },

    async delete(id, date = null, academicYearId = null) {
      const ui = useUIStore()

      this.deleting = true
      this.error = null

      try {
        await api.delete(`/teacher-availability-exceptions/${id}`)
        ui.showSnackbar('Exception deleted successfully.')
        await this.fetchDashboard(date, academicYearId)
      } catch (error) {
        const message = extractErrorMessage(error, 'Failed to delete exception.')
        this.error = message
        ui.showSnackbar(message, 'error')
        throw error
      } finally {
        this.deleting = false
      }
    },

    async moveException(id, payload) {
      const ui = useUIStore()

      this.moving = true
      this.error = null

      try {
        const response = await api.patch(
          `/teacher-availability-exceptions/${id}/move`,
          payload
        )

        ui.showSnackbar('Exception moved successfully.')
        return extractPayload(response)
      } catch (error) {
        const message = extractErrorMessage(error, 'Failed to move exception.')
        this.error = message
        ui.showSnackbar(message, 'error')
        throw error
      } finally {
        this.moving = false
      }
    },

    reset() {
      this.activeRequestId += 1
      this.teachers = []
      this.bells = []
      this.exceptions = []
      this.stats = {}
      this.week = null
      this.academicYearId = null
      this.loading = false
      this.saving = false
      this.deleting = false
      this.moving = false
      this.error = null
    },
  },
})
