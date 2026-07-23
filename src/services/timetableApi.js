import api from '../plugins/api'

const unwrap = (response) => response?.data?.data ?? response?.data ?? null

const detailedErrorMessage = (error, fallback) => {
  const data = error?.response?.data
  const errors = data?.errors

  if (!errors || typeof errors !== 'object') {
    return data?.message || fallback
  }

  const messages = Object.values(errors)
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .flatMap((value) => {
      if (Array.isArray(value)) return value
      if (value && typeof value === 'object') return Object.values(value).flat()
      return [value]
    })
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  const uniqueMessages = [...new Set(messages)]

  return uniqueMessages.length
    ? uniqueMessages.join('\n')
    : data?.message || fallback
}

const enrichError = (error, fallback) => {
  const message = detailedErrorMessage(error, fallback)

  if (error?.response?.data) {
    error.response.data.message = message
  }

  error.detailedMessage = message
  return error
}

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
  async dashboard(params = {}) {
    const response = await api.get('/academic-planning/dashboard', { params })
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

    try {
      const response = await api.post(endpoint, payload)
      return unwrap(response)
    } catch (error) {
      throw enrichError(error, 'Unable to create timetable preview.')
    }
  },

  async generate(payload, { optimized = true, async = false } = {}) {
    const endpoint = optimized ? '/timetable-optimizer/generate' : '/timetable-generator/generate'

    try {
      const response = await api.post(endpoint, { ...payload, ...(optimized ? {} : { async }) })
      return unwrap(response)
    } catch (error) {
      throw enrichError(error, 'Unable to generate timetable.')
    }
  },

  async queuePreview(payload) {
    try {
      const response = await api.post('/timetable-generator/preview', { ...payload, async: true })
      return unwrap(response)
    } catch (error) {
      throw enrichError(error, 'Unable to queue timetable preview.')
    }
  },

  async batchPreview(payload, async = true) {
    try {
      const response = await api.post('/timetable-batch-generator/preview', { ...payload, async })
      return unwrap(response)
    } catch (error) {
      throw enrichError(error, 'Unable to create batch timetable preview.')
    }
  },

  async batchGenerate(payload, async = true) {
    try {
      const response = await api.post('/timetable-batch-generator/generate', { ...payload, async })
      return unwrap(response)
    } catch (error) {
      throw enrichError(error, 'Unable to generate batch timetables.')
    }
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

  async classReport(id, params = {}) {
    const response = await api.get(`/timetable-reports/classes/${id}`, { params })
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