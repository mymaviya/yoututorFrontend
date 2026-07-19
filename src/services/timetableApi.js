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

  async generationRunConflicts(id, params = {}) {
    const response = await api.get(`/timetable-generation-runs/${id}/conflicts`, { params })
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

  async preview(payload, optimized = true) {
    const endpoint = optimized ? '/timetable-optimizer/preview' : '/timetable-generator/preview'
    const response = await api.post(endpoint, payload)
    return unwrap(response)
  },

  async generate(payload, { optimized = true, async = false } = {}) {
    const endpoint = optimized ? '/timetable-optimizer/generate' : '/timetable-generator/generate'
    const response = await api.post(endpoint, { ...payload, ...(optimized ? {} : { async }) })
    return unwrap(response)
  },

  async queuePreview(payload) {
    const response = await api.post('/timetable-generator/preview', { ...payload, async: true })
    return unwrap(response)
  },

  async batchPreview(payload, async = true) {
    const response = await api.post('/timetable-batch-generator/preview', { ...payload, async })
    return unwrap(response)
  },

  async batchGenerate(payload, async = true) {
    const response = await api.post('/timetable-batch-generator/generate', { ...payload, async })
    return unwrap(response)
  },

  async grid(id) {
    const response = await api.get(`/weekly-timetables/${id}/grid`)
    return unwrap(response)
  },

  async createEntry(timetableId, payload) {
    const response = await api.post(`/weekly-timetables/${timetableId}/entries`, payload)
    return unwrap(response)
  },

  async updateEntry(timetableId, entryId, payload) {
    const response = await api.put(`/weekly-timetables/${timetableId}/entries/${entryId}`, payload)
    return unwrap(response)
  },

  async deleteEntry(timetableId, entryId, forceLocked = false) {
    const response = await api.delete(`/weekly-timetables/${timetableId}/entries/${entryId}`, {
      data: { force_locked: forceLocked },
    })
    return unwrap(response)
  },

  async replaceGrid(timetableId, entries, preserveLocked = true) {
    const response = await api.put(`/weekly-timetables/${timetableId}/grid`, {
      entries,
      preserve_locked: preserveLocked,
    })
    return unwrap(response)
  },

  async createVersion(id, name = null) {
    const response = await api.post(`/weekly-timetables/${id}/versions`, { name })
    return unwrap(response)
  },

  async classReport(id) {
    const response = await api.get(`/timetable-reports/classes/${id}`)
    return unwrap(response)
  },

  async teacherReport(id, params = {}) {
    const response = await api.get(`/timetable-reports/teachers/${id}`, { params })
    return unwrap(response)
  },

  async roomReport(id, params = {}) {
    const response = await api.get(`/timetable-reports/rooms/${id}`, { params })
    return unwrap(response)
  },

  async downloadReport(type, id, format, params = {}) {
    const response = await api.get(`/timetable-reports/${type}/${id}/${format}`, {
      params,
      responseType: 'blob',
    })
    return response
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
