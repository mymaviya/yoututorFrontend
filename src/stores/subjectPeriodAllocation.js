import { defineStore } from 'pinia'
import api from '../plugins/api'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const useSubjectPeriodAllocationStore = defineStore('subjectPeriodAllocation', {
  state: () => ({
    items: [],
    loading: false,
    saving: false,
    deleting: false,
    error: null,
    pagination: {},
    filters: {
      academic_year_id: null,
      grade_id: null,
      section_id: null,
      stream_id: null,
      subject_category: null,
    },
  }),

  actions: {
    clearError() {
      this.error = null
    },

    reset() {
      this.items = []
      this.pagination = {}
      this.error = null
      this.loading = false
      this.saving = false
      this.deleting = false
    },

    async fetch(page = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.get('/subject-period-allocations', {
          params: {
            page,
            ...this.filters,
          },
        })

        const payload = data?.data ?? data
        this.items = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []
        this.pagination = payload && !Array.isArray(payload) ? payload : {}

        return this.items
      } catch (error) {
        this.items = []
        this.pagination = {}
        this.error = getErrorMessage(error, 'Failed to load subject allocations.')
        throw error
      } finally {
        this.loading = false
      }
    },

    async save(payload, { refresh = true } = {}) {
      this.saving = true
      this.error = null

      try {
        const response = await api.post('/subject-period-allocations', payload)
        if (refresh) await this.fetch()
        return response?.data
      } catch (error) {
        this.error = getErrorMessage(error, 'Failed to save subject allocation.')
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id, payload, { refresh = true } = {}) {
      this.saving = true
      this.error = null

      try {
        const response = await api.put(`/subject-period-allocations/${id}`, payload)
        if (refresh) await this.fetch()
        return response?.data
      } catch (error) {
        this.error = getErrorMessage(error, 'Failed to update subject allocation.')
        throw error
      } finally {
        this.saving = false
      }
    },

    async delete(id, { refresh = true } = {}) {
      this.deleting = true
      this.error = null

      try {
        const response = await api.delete(`/subject-period-allocations/${id}`)
        if (refresh) await this.fetch()
        return response?.data
      } catch (error) {
        this.error = getErrorMessage(error, 'Failed to delete subject allocation.')
        throw error
      } finally {
        this.deleting = false
      }
    },

    async bulkSave(payload) {
      this.saving = true
      this.error = null

      try {
        const response = await api.post('/subject-period-allocations/bulk-save', payload)
        return response?.data
      } catch (error) {
        this.error = getErrorMessage(error, 'Failed to save subject allocations.')
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
