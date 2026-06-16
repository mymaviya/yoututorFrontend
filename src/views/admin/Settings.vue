<template>
  <v-container fluid>
    <v-card rounded="xl" elevation="3">
      <v-card-title class="d-flex flex-wrap align-center ga-3">
        <div>
          <h2 class="text-h5 font-weight-bold">Website Settings</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Manage public website, contact, business, social and payment settings.
          </p>
        </div>

        <v-spacer />

        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :loading="saving"
          @click="saveSettings"
        >
          Save Settings
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="general">General</v-tab>
          <v-tab value="contact">Contact</v-tab>
          <v-tab value="social">Social</v-tab>
          <v-tab value="business">Business</v-tab>
          <v-tab value="payment">Payment</v-tab>
          <v-tab value="branding">Branding</v-tab>
        </v-tabs>

        <v-divider class="mb-6" />

        <v-window v-model="activeTab">
          <!-- GENERAL -->
          <v-window-item value="general">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.site_name"
                  label="Site Name"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.site_name"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.site_tagline"
                  label="Site Tagline"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.site_tagline"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.company_name"
                  label="Company Name"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.company_name"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- CONTACT -->
          <v-window-item value="contact">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.contact_email"
                  label="Contact Email"
                  type="email"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.contact_email"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.contact_phone"
                  label="Contact Phone"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.contact_phone"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.business_address"
                  label="Business Address"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  :error-messages="formErrors.business_address"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.support_text"
                  label="Support Text"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.support_text"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- SOCIAL -->
          <v-window-item value="social">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.facebook_url"
                  label="Facebook URL"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-facebook"
                  :error-messages="formErrors.facebook_url"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.linkedin_url"
                  label="LinkedIn URL"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-linkedin"
                  :error-messages="formErrors.linkedin_url"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.youtube_url"
                  label="YouTube URL"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-youtube"
                  :error-messages="formErrors.youtube_url"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- BUSINESS -->
          <v-window-item value="business">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.gst_number"
                  label="GST Number"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.gst_number"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- PAYMENT -->
          <v-window-item value="payment">
            <v-alert
              type="warning"
              variant="tonal"
              class="mb-5"
              rounded="lg"
            >
              Keep Razorpay keys private. Do not expose Razorpay Secret on public APIs.
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.razorpay_key_id"
                  label="Razorpay Key ID"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.razorpay_key_id"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.razorpay_key_secret"
                  label="Razorpay Key Secret"
                  :type="showSecret ? 'text' : 'password'"
                  variant="outlined"
                  density="comfortable"
                  :append-inner-icon="showSecret ? 'mdi-eye-off' : 'mdi-eye'"
                  :error-messages="formErrors.razorpay_key_secret"
                  @click:append-inner="showSecret = !showSecret"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- BRANDING -->
          <v-window-item value="branding">
            <v-alert
              type="info"
              variant="tonal"
              class="mb-5"
              rounded="lg"
            >
              Upload API is not connected yet. For now, paste logo and favicon URLs.
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.site_logo"
                  label="Logo URL"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.site_logo"
                />

                <v-card
                  v-if="form.site_logo"
                  class="pa-4 mt-2"
                  rounded="lg"
                  variant="tonal"
                >
                  <div class="text-caption mb-2">Logo Preview</div>
                  <v-img
                    :src="form.site_logo"
                    max-height="90"
                    contain
                  />
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.site_favicon"
                  label="Favicon URL"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="formErrors.site_favicon"
                />

                <v-card
                  v-if="form.site_favicon"
                  class="pa-4 mt-2"
                  rounded="lg"
                  variant="tonal"
                >
                  <div class="text-caption mb-2">Favicon Preview</div>
                  <v-img
                    :src="form.site_favicon"
                    max-height="50"
                    contain
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn
          variant="outlined"
          color="secondary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="fetchSettings"
        >
          Reload
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :loading="saving"
          @click="saveSettings"
        >
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

  contact_email: '',
  contact_phone: '',
  business_address: '',
  support_text: '',

  facebook_url: '',
  linkedin_url: '',
  youtube_url: '',

  gst_number: '',

  razorpay_key_id: '',
  razorpay_key_secret: '',

  site_logo: '',
  site_favicon: ''
})

const formErrors = reactive({
  site_name: [],
  site_tagline: [],
  company_name: [],

  contact_email: [],
  contact_phone: [],
  business_address: [],
  support_text: [],

  facebook_url: [],
  linkedin_url: [],
  youtube_url: [],

  gst_number: [],

  razorpay_key_id: [],
  razorpay_key_secret: [],

  site_logo: [],
  site_favicon: []
})

const settingKeys = Object.keys(form)

const clearErrors = () => {
  Object.keys(formErrors).forEach((key) => {
    formErrors[key] = []
  })
}

const fetchSettings = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await api.get('/admin/settings')
    const data = response.data.data || {}

    settingKeys.forEach((key) => {
      form[key] = data[key] ?? ''
    })
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Unable to load settings.'
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  clearErrors()

  let valid = true

  if (!form.site_name) {
    formErrors.site_name = ['Site name is required']
    valid = false
  }

  if (!form.company_name) {
    formErrors.company_name = ['Company name is required']
    valid = false
  }

  if (!form.contact_email) {
    formErrors.contact_email = ['Contact email is required']
    valid = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.contact_email)) {
    formErrors.contact_email = ['Enter a valid email address']
    valid = false
  }

  if (form.facebook_url && !isValidUrl(form.facebook_url)) {
    formErrors.facebook_url = ['Enter a valid Facebook URL']
    valid = false
  }

  if (form.linkedin_url && !isValidUrl(form.linkedin_url)) {
    formErrors.linkedin_url = ['Enter a valid LinkedIn URL']
    valid = false
  }

  if (form.youtube_url && !isValidUrl(form.youtube_url)) {
    formErrors.youtube_url = ['Enter a valid YouTube URL']
    valid = false
  }

  if (form.site_logo && !isValidUrl(form.site_logo)) {
    formErrors.site_logo = ['Enter a valid logo URL']
    valid = false
  }

  if (form.site_favicon && !isValidUrl(form.site_favicon)) {
    formErrors.site_favicon = ['Enter a valid favicon URL']
    valid = false
  }

  return valid
}

const isValidUrl = (value) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const saveSettings = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) return

  saving.value = true

  try {
    const settings = settingKeys.map((key) => ({
      key,
      value: form[key] ?? ''
    }))

    const response = await api.put('/admin/settings', {
      settings
    })

    successMessage.value = response.data.message || 'Settings updated successfully.'
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.assign(formErrors, error.response.data.errors)
    }

    errorMessage.value = error.response?.data?.message || 'Unable to save settings.'
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>