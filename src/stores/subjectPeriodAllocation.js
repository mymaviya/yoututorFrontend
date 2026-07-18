import { defineStore } from 'pinia'
import api from '../plugins/api'

export const useSubjectPeriodAllocationStore = defineStore('subjectPeriodAllocation', {
  state: () => ({
    items: [],
    loading: false,
    saving: false,
    pagination: {},
    filters: {
      grade_id: null,
      section_id: null,
      stream_id: null,
      subject_category: null,
    },
  }),

  actions: {
    async fetch(page = 1) {
      this.loading = true

      try {
        const { data } = await api.get('/subject-period-allocations', {
          params: {
            page,
            ...this.filters,
          },
        })

        this.items = data.data.data
        this.pagination = data.data
      } finally {
        this.loading = false
      }
    },

    async save(payload) {
      this.saving = true

      try {
        await api.post('/subject-period-allocations', payload)
        await this.fetch()
      } finally {
        this.saving = false
      }
    },

    async update(id, payload) {
      this.saving = true

      try {
        await api.put(`/subject-period-allocations/${id}`, payload)
        await this.fetch()
      } finally {
        this.saving = false
      }
    },

    async delete(id) {
      await api.delete(`/subject-period-allocations/${id}`)
      await this.fetch()
    },

    async bulkSave(payload) {
      this.saving = true

      try {
        await api.post('/subject-period-allocations/bulk-save', payload)
        await this.fetch()
      } finally {
        this.saving = false
      }
    },
  },
})