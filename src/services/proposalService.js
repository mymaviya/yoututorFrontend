import api from '../plugins/api'

export default {
  getTemplates() {
    return api.get('/admin/proposal-templates')
  },

  getTemplate(id) {
    return api.get(`/admin/proposal-templates/${id}`)
  },

  getServiceCatalogs() {
    return api.get('/admin/service-catalogs')
  },

  getServiceCatalog(id) {
    return api.get(`/admin/service-catalogs/${id}`)
  },

  getProposals(params = {}) {
    return api.get('/admin/proposals', { params })
  },

  getProposal(id) {
    return api.get(`/admin/proposals/${id}`)
  },

  createProposal(payload) {
    return api.post('/admin/proposals', payload)
  },

  updateProposal(id, payload) {
    return api.put(`/admin/proposals/${id}`, payload)
  },

  updateSections(id, payload) {
    return api.put(`/admin/proposals/${id}/sections`, payload)
  },

  updateItems(id, payload) {
    return api.put(`/admin/proposals/${id}/items`, payload)
  },

  sendProposal(id) {
    return api.put(`/admin/proposals/${id}/send`)
  },

  approveProposal(id) {
    return api.put(`/admin/proposals/${id}/approve`)
  },

  rejectProposal(id, payload) {
    return api.put(`/admin/proposals/${id}/reject`, payload)
  },

  requestChanges(id, payload) {
    return api.put(`/admin/proposals/${id}/request-changes`, payload)
  },

  convertToQuotation(id) {
    return api.post(`/admin/proposals/${id}/convert-to-quotation`)
  },

  getVersions(id) {
    return api.get(`/admin/proposals/${id}/versions`)
  },

  downloadProposalPdf(id) {
    return api.get(`/admin/proposals/${id}/pdf`, {
      responseType: 'blob'
    })
  },

  deleteProposal(id) {
    return api.delete(`/admin/proposals/${id}`)
  },

  createTemplate(payload) {
    return api.post('/admin/proposal-templates', payload)
  },

  updateTemplate(id, payload) {
    return api.put(`/admin/proposal-templates/${id}`, payload)
  },

  deleteTemplate(id) {
    return api.delete(`/admin/proposal-templates/${id}`)
  },


}