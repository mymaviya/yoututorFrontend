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
    academicYearId: null,
    loading: false,
    refreshing: false,
    error: null,
    partialErrors: [],
    lastFetchedAt: null,
    activeRequestId: 0,
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
    clearDashboard() {
      this.activeRequestId += 1
      this.dashboard = null
      this.weeklyTimetables = []
      this.generationRuns = []
      this.conflictReport = null
      this.workloadReport = null
      this.academicYearId = null
      this.loading = false
      this.refreshing = false
      this.error = null
      this.partialErrors = []
      this.lastFetchedAt = null
    },

    async fetchDashboard({ silent = false, academicYearId = null } = {}) {
      const selectedYearId = Number(academicYearId) || null

      if (!selectedYearId) {
        this.clearDashboard()
        this.error = 'Select an academic session from the app bar to load Academic Planning.'
        return
      }

      const requestId = ++this.activeRequestId
      this.academicYearId = selectedYearId

      if (silent) this.refreshing = true
      else this.loading = true

      this.error = null
      this.partialErrors = []

      const params = { academic_year_id: selectedYearId }
      const requests = [
        ['dashboard', () => timetableApi.dashboard(params)],
        ['weeklyTimetables', () => timetableApi.weeklyTimetables({ ...params, per_page: 12 })],
        ['generationRuns', () => timetableApi.generationRuns({ ...params, per_page: 12 })],
        ['conflictReport', () => timetableApi.conflicts(params)],
        ['workloadReport', () => timetableApi.workload(params)],
      ]

      try {
        const results = await Promise.allSettled(requests.map(([, request]) => request()))

        if (requestId !== this.activeRequestId || Number(this.academicYearId) !== selectedYearId) {
          return
        }

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
        if (requestId === this.activeRequestId) {
          this.loading = false
          this.refreshing = false
        }
      }
    },

    async cancelGenerationRun(id) {
      await timetableApi.cancelRun(id)
      await this.fetchDashboard({
        silent: true,
        academicYearId: this.academicYearId,
      })
    },

    async retryGenerationRun(id) {
      await timetableApi.retryRun(id, true)
      await this.fetchDashboard({
        silent: true,
        academicYearId: this.academicYearId,
      })
    },
  },
})