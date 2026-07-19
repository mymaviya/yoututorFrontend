import api from '../plugins/api'

const unwrap = (response) => response?.data?.data ?? response?.data ?? null

const resource = (base) => ({
  async list(params = {}) {
    const response = await api.get(base, { params })
    return unwrap(response)
  },
  async create(payload) {
    const response = await api.post(base, payload)
    return unwrap(response)
  },
  async update(id, payload) {
    const response = await api.put(`${base}/${id}`, payload)
    return unwrap(response)
  },
  async remove(id) {
    const response = await api.delete(`${base}/${id}`)
    return unwrap(response)
  },
  async activate(id, payload = {}) {
    const response = await api.post(`${base}/${id}/activate`, payload)
    return unwrap(response)
  },
  async deactivate(id) {
    const response = await api.post(`${base}/${id}/deactivate`)
    return unwrap(response)
  },
})

const templateResource = resource('/timetable-templates')
const ruleResource = resource('/timetable-rules')
const roomResource = resource('/timetable-rooms')
const parallelGroupResource = resource('/parallel-groups')

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

  templates: templateResource,
  rules: ruleResource,
  rooms: roomResource,
  parallelGroups: parallelGroupResource,

  async duplicateTemplate(id, payload) {
    const response = await api.post(`/timetable-templates/${id}/duplicate`, payload)
    return unwrap(response)
  },

  async duplicateRule(id, payload) {
    const response = await api.post(`/timetable-rules/${id}/duplicate`, payload)
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
