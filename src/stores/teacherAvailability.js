import { defineStore } from 'pinia'
import api from '../plugins/api'

export const useTeacherAvailabilityStore = defineStore('teacherAvailability', {
  state: () => ({
    teachers: [],
    bells: [],
    weekdays: [],
    availability: {},
    loading: false,
    saving: false,
    error: null,
  }),

  actions: {
    async fetchBulkEditorData() {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get('/teacher-availability/bulk-editor-data')

        this.teachers = data.data.teachers || []
        this.bells = data.data.bells || []
        this.weekdays = data.data.weekdays || []
        this.availability = data.data.availability || {}
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Failed to load teacher availability.'
      } finally {
        this.loading = false
      }
    },

    async bulkSave(items) {
      this.saving = true
      this.error = null

      try {
        await api.post('/teacher-availability/bulk-save', { items })
        await this.fetchBulkEditorData()
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Failed to save teacher availability.'
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})