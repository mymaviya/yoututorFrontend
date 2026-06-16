import { ref } from 'vue'
import api from '../plugins/api'

const settings = ref({
  site_logo: '/logo.png',
  site_favicon: '/favicon.ico',
  site_name: 'YouTutor ERP',
  site_tagline: 'Assessment Management Platform',
  company_name: 'Maviya IT Services',
  contact_email: 'mhmasti@gmail.com',
  contact_phone: '',
  business_address: 'Siddharth Nagar, Uttar Pradesh',
  support_text: 'Demo, Training & Support'
})

const loading = ref(false)
let loaded = false

export function useSettings() {
  const fetchSettings = async () => {
    if (loaded) return

    loading.value = true

    try {
      const response = await api.get('/public/settings')

      settings.value = {
        ...settings.value,
        ...(response.data.data || {})
      }

      loaded = true
    } catch (error) {
      console.error('Unable to load public settings:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    fetchSettings
  }
}