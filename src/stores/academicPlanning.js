import { defineStore } from 'pinia'
import timetableApi from '../services/timetableApi'

const listData = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const useAcademicPlanningStore = defineStore('academicPlanning', {
  state: () => ({
    dashboard: null,
    weeklyTimetables: [],
    generationRuns: [],
    conflictReport: null,
    workloadReport: null,
    loading: false,
    refreshing: false,
    error: null,
    partialErrors: [],
    lastFetchedAt: null,
  }),

  getters: {
    statistics: (state) => state.dashboard?.statistics || {},
    readiness: (state) => state.dashboard?.readiness || {},
    warnings: (state) => state.dashboard?.warnings || [],
    overallScore: (state) => state.dashboard?.readiness?.overall_score || 0,
    recentTimetables: (state) => state.weeklyTimetables.slice(0, 6),
    recentRuns: (state) => state.generationRuns.slice(0, 6),
    activeRuns: (state) => state.generationRuns.filter((run) =>
      ['queued', 'running'].includes(run.status)
    ),
    conflictCount: (state) => {
      const report = state.conflictReport || {}
      return Number(
        report.total_conflicts ??
        report.conflict_count ??
        (report.teacher_conflicts?.length || 0) + (report.room_conflicts?.length || 0)
      )
    },
    teacherCount: (state) => Number(
      state.workloadReport?.teacher_count ?? state.statistics?.teachers ?? 0
    ),
    publishedCount: (state) => state.weeklyTimetables.filter(
      (item) => item.status === 'published'
    ).length,
    draftCount: (state) => state.weeklyTimetables.filter(
      (item) => item.status === 'draft'
    ).length,
  },

  actions: {
    async fetchDashboard({ silent = false } = {}) {
      if (silent) this.refreshing = true
      else this.loading = true

      this.error = null
      this.partialErrors = []

      const requests = [
        ['dashboard', () => timetableApi.dashboard()],
        ['weeklyTimetables', () => timetableApi.weeklyTimetables({ per_page: 12 })],
        ['generationRuns', () => timetableApi.generationRuns({ per_page: 12 })],
        ['conflictReport', () => timetableApi.conflicts()],
        ['workloadReport', () => timetableApi.workload()],
      ]

      try {
        const results = await Promise.allSettled(requests.map(([, request]) => request()))

        results.forEach((result, index) => {
          const key = requests[index][0]

          if (result.status === 'fulfilled') {
            if (key === 'weeklyTimetables' || key === 'generationRuns') {
              this[key] = listData(result.value)
            } else {
              this[key] = result.value
            }
            return
          }

          this.partialErrors.push(
            result.reason?.response?.data?.message ||
            result.reason?.message ||
            `Failed to load ${key}.`
          )
        })

        if (!this.dashboard && this.partialErrors.length === requests.length) {
          this.error = 'Failed to load the Academic Planning dashboard.'
        }

        this.lastFetchedAt = new Date().toISOString()
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },

    async cancelGenerationRun(id) {
      await timetableApi.cancelRun(id)
      await this.fetchDashboard({ silent: true })
    },

    async retryGenerationRun(id) {
      await timetableApi.retryRun(id, true)
      await this.fetchDashboard({ silent: true })
    },
  },
})
