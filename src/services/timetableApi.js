import api from '../plugins/api'

const unwrap = (response) => response?.data?.data ?? response?.data ?? null

const timetableApi = {
  async dashboard() {
    const response = await api.get('/academic-planning/dashboard')
    return unwrap(response)
  },

  async weeklyTimetables(params = {}) {
    const response = await api.get('/weekly-timetables', { params })
    return unwrap(response)
  },

  async generationRuns(params = {}) {
    const response = await api.get('/timetable-generation-runs', { params })
    return unwrap(response)
  },

  async generationRun(id) {
    const response = await api.get(`/timetable-generation-runs/${id}`)
    return unwrap(response)
  },

  async conflicts(params = {}) {
    const response = await api.get('/timetable-reports/conflicts', { params })
    return unwrap(response)
  },

  async workload(params = {}) {
    const response = await api.get('/timetable-reports/workload', { params })
    return unwrap(response)
  },

  async rooms(params = {}) {
    const response = await api.get('/timetable-rooms', { params })
    return unwrap(response)
  },

  async parallelGroups(params = {}) {
    const response = await api.get('/parallel-groups', { params })
    return unwrap(response)
  },

  async templates(params = {}) {
    const response = await api.get('/timetable-templates', { params })
    return unwrap(response)
  },

  async rules(params = {}) {
    const response = await api.get('/timetable-rules', { params })
    return unwrap(response)
  },

  async publish(id) {
    const response = await api.post(`/weekly-timetables/${id}/publish`)
    return unwrap(response)
  },

  async archive(id) {
    const response = await api.post(`/weekly-timetables/${id}/archive`)
    return unwrap(response)
  },

  async restore(id) {
    const response = await api.post(`/weekly-timetables/${id}/restore`)
    return unwrap(response)
  },

  async cancelRun(id) {
    const response = await api.post(`/timetable-generation-runs/${id}/cancel`)
    return unwrap(response)
  },

  async retryRun(id, async = true) {
    const response = await api.post(`/timetable-generation-runs/${id}/retry`, { async })
    return unwrap(response)
  },
}

export default timetableApi
