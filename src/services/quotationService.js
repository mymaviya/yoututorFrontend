import api from '../plugins/api'

export default {
  getQuotations(params = {}) {
    return api.get('/admin/quotations', { params })
  },

  getQuotation(id) {
    return api.get(`/admin/quotations/${id}`)
  },

  updateQuotation(id, payload) {
    return api.put(`/admin/quotations/${id}`, payload)
  },

  sendQuotation(id) {
    return api.put(`/admin/quotations/${id}/send`)
  },

  acceptQuotation(id) {
    return api.put(`/admin/quotations/${id}/accept`)
  },

  rejectQuotation(id) {
    return api.put(`/admin/quotations/${id}/reject`)
  },

  convertToInvoice(id) {
    return api.post(`/admin/quotations/${id}/convert-to-invoice`)
  },

  pdfUrl(id) {
    return `${import.meta.env.VITE_API_BASE_URL}/admin/quotations/${id}/pdf`
  },

  downloadQuotationPdf(id) {
    return api.get(`/admin/quotations/${id}/pdf`, {
      responseType: 'blob',
    })
  },
}