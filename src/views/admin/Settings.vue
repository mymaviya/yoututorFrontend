<template>
  <v-container fluid>
    <v-card rounded="xl" elevation="3">
      <v-card-title class="d-flex flex-wrap align-center ga-3">
        <div>
          <h2 class="text-h5 font-weight-bold">System Settings</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage website, company, bank, invoice and payment settings.
          </p>
        </div>

        <v-spacer />

        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="saveSettings">
          Save Settings
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4" closable>
          {{ successMessage }}
        </v-alert>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable>
          {{ errorMessage }}
        </v-alert>

        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="general">General</v-tab>
          <v-tab value="contact">Contact</v-tab>
          <v-tab value="business">Business</v-tab>
          <v-tab value="bank">Bank Details</v-tab>
          <v-tab value="social">Social</v-tab>
          <v-tab value="payment">Payment Gateway</v-tab>
          <v-tab value="branding">Branding</v-tab>
        </v-tabs>

        <v-divider class="mb-6" />

        <v-window v-model="activeTab">
          <v-window-item value="general">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.site_name" label="Site Name" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.site_tagline" label="Site Tagline" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.company_name" label="Company Name" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.company_tagline" label="Company Tagline" variant="outlined" />
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="contact">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.contact_email" label="Contact Email" type="email" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.contact_phone" label="Contact Phone" variant="outlined" />
              </v-col>

              <v-col cols="12">
                <v-textarea v-model="form.business_address" label="Business Address" rows="3" auto-grow variant="outlined" />
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="form.support_text" label="Support Text" variant="outlined" />
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="business">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.company_address" label="Invoice Company Address" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.company_phone" label="Invoice Company Phone" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.company_email" label="Invoice Company Email" type="email" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.gst_number" label="GST Number" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.pan_no" label="PAN Number" variant="outlined" />
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="bank">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.bank_account_name" label="Account Name" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.bank_name" label="Bank Name" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.bank_account_no" label="Account Number" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.bank_ifsc" label="IFSC Code" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.upi_id" label="UPI ID" variant="outlined" />
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="social">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.facebook_url" label="Facebook URL" prepend-inner-icon="mdi-facebook" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.linkedin_url" label="LinkedIn URL" prepend-inner-icon="mdi-linkedin" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.youtube_url" label="YouTube URL" prepend-inner-icon="mdi-youtube" variant="outlined" />
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="payment">
            <v-alert type="warning" variant="tonal" class="mb-5">
              Keep Razorpay Secret private.
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.razorpay_key_id" label="Razorpay Key ID" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.razorpay_key_secret"
                  label="Razorpay Key Secret"
                  :type="showSecret ? 'text' : 'password'"
                  :append-inner-icon="showSecret ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  @click:append-inner="showSecret = !showSecret"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="branding">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.site_logo" label="Logo URL" variant="outlined" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.site_favicon" label="Favicon URL" variant="outlined" />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn variant="outlined" prepend-icon="mdi-refresh" :loading="loading" @click="fetchSettings">
          Reload
        </v-btn>

        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="saveSettings">
          Save Settings
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../../plugins/api'

const activeTab = ref('general')
const loading = ref(false)
const saving = ref(false)
const showSecret = ref(false)

const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  site_name: '',
  site_tagline: '',
  company_name: '',
  company_tagline: '',

  contact_email: '',
  contact_phone: '',
  business_address: '',
  support_text: '',

  company_address: '',
  company_phone: '',
  company_email: '',
  gst_number: '',
  pan_no: '',

  bank_account_name: '',
  bank_name: '',
  bank_account_no: '',
  bank_ifsc: '',
  upi_id: '',

  facebook_url: '',
  linkedin_url: '',
  youtube_url: '',

  razorpay_key_id: '',
  razorpay_key_secret: '',

  site_logo: '',
  site_favicon: '',
})

const settingKeys = Object.keys(form)

const flattenSettings = (groupedSettings) => {
  const flat = {}

  Object.values(groupedSettings || {}).forEach((groupItems) => {
    ;(groupItems || []).forEach((item) => {
      flat[item.key] = item.value ?? ''
    })
  })

  return flat
}

const fetchSettings = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await api.get('/admin/settings')
    const flatSettings = flattenSettings(response.data.data)

    settingKeys.forEach((key) => {
      form[key] = flatSettings[key] ?? ''
    })
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Unable to load settings.'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const settings = settingKeys.map((key) => ({
      key,
      value: form[key] ?? '',
    }))

    const response = await api.put('/admin/settings', {
      settings,
    })

    successMessage.value = response.data.message || 'Settings updated successfully.'
    await fetchSettings()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Unable to save settings.'
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>