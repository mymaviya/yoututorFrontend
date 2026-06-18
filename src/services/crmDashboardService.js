import api from '../plugins/api'

export default {
  getDashboard() {
    return api.get('/admin/crm/dashboard')
  },
}