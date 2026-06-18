import api from '../plugins/api'

export default {
  getInvoices(params = {}) {
    return api.get('/admin/invoices', { params })
  },

  getInvoice(id) {
    return api.get(`/admin/invoices/${id}`)
  },

  updateInvoice(id, payload) {
    return api.put(`/admin/invoices/${id}`, payload)
  },

  sendInvoice(id) {
    return api.put(`/admin/invoices/${id}/send`)
  },

  markPaid(id, payload) {
    return api.put(`/admin/invoices/${id}/mark-paid`, payload)
  },

  cancelInvoice(id) {
    return api.put(`/admin/invoices/${id}/cancel`)
  },

  pdfUrl(id) {
    return `${import.meta.env.VITE_API_BASE_URL}/admin/invoices/${id}/pdf`
  },

  downloadInvoicePdf(id) {
    return api.get(`/admin/invoices/${id}/pdf`, {
      responseType: 'blob',
    })
  },

}