<script setup>
import { ref, computed } from 'vue'
import api from '../plugins/api'
import { useAuthStore } from '../stores/auth'
import { useUIStore } from '../stores/snackBar'
import { useTheme } from 'vuetify'

const auth = useAuthStore()
const ui = useUIStore()
const theme = useTheme()

const loading = ref(false)
const passwordLoading = ref(false)
const errors = ref({})

const profile = ref({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  contact: auth.user?.contact || '',
  address: auth.user?.address || '',
  profile: null
})

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const initials = computed(() => {
  return profile.value.name
    ? profile.value.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'
})

const previewImage = computed(() => {
  if (profile.value.profile instanceof File) {
    return URL.createObjectURL(profile.value.profile)
  }

  return auth.user?.profile || null
})

const updateProfile = async () => {
  loading.value = true
  errors.value = {}

  const formData = new FormData()
  formData.append('name', profile.value.name)
  formData.append('email', profile.value.email)
  formData.append('contact', profile.value.contact || '')
  formData.append('address', profile.value.address || '')

  if (profile.value.profile instanceof File) {
    formData.append('profile', profile.value.profile)
  }

  try {
    const res = await api.post('/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    auth.user = res.data.user
    localStorage.setItem('user', JSON.stringify(res.data.user))

    ui.showSnackbar('Profile updated successfully')
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    } else {
      ui.showSnackbar('Profile update failed', 'error')
    }
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  passwordLoading.value = true
  errors.value = {}

  try {
    await api.post('/profile/change-password', passwordForm.value)

    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    }

    ui.showSnackbar('Password changed successfully')
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    } else {
      ui.showSnackbar('Password change failed', 'error')
    }
  } finally {
    passwordLoading.value = false
  }
}

const toggleTheme = () => {
  theme.global.name.value =
    theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<template>
  <div>
    <div class="profile-hero mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          My Profile
        </h1>

        <p class="text-grey">
          Manage your account, password and app preferences
        </p>
      </div>
    </div>

    <v-row>
      <!-- PROFILE CARD -->
      <v-col cols="12" md="4">
        <v-card class="profile-card rounded-xl pa-6" elevation="0">
          <div class="text-center">
            <v-avatar size="120" color="primary" class="mb-4">
              <v-img
                v-if="previewImage"
                :src="previewImage"
                cover
              />

              <span v-else class="text-h4 text-white font-weight-bold">
                {{ initials }}
              </span>
            </v-avatar>

            <h2 class="text-h6 font-weight-bold">
              {{ profile.name || 'User Name' }}
            </h2>

            <p class="text-grey mb-2">
              {{ profile.email }}
            </p>

            <v-chip color="primary" variant="tonal">
              {{ auth.user?.role || 'User' }}
            </v-chip>
          </div>

          <v-divider class="my-5" />

          <div class="setting-row">
            <div>
              <div class="font-weight-medium">
                App Theme
              </div>
              <div class="text-caption text-grey">
                Switch between light and dark mode
              </div>
            </div>

            <v-btn
              icon
              variant="tonal"
              color="primary"
              @click="toggleTheme"
            >
              <v-icon>
                {{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
              </v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- FORMS -->
      <v-col cols="12" md="8">
        <v-card class="rounded-xl pa-6 mb-6" elevation="0">
          <div class="d-flex align-center mb-5">
            <v-avatar color="primary" variant="tonal" class="mr-3">
              <v-icon>mdi-account-edit</v-icon>
            </v-avatar>

            <div>
              <h2 class="text-h6 font-weight-bold">
                Edit Profile
              </h2>
              <p class="text-caption text-grey">
                Update your basic information
              </p>
            </div>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.name"
                label="Full Name"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                :error-messages="errors.name"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                :error-messages="errors.email"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.contact"
                label="Contact"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                :error-messages="errors.contact"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-file-input
                v-model="profile.profile"
                label="Profile Photo"
                prepend-icon=""
                prepend-inner-icon="mdi-camera"
                variant="outlined"
                accept="image/*"
                :error-messages="errors.profile"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="profile.address"
                label="Address"
                prepend-inner-icon="mdi-map-marker"
                variant="outlined"
                rows="3"
                :error-messages="errors.address"
              />
            </v-col>
          </v-row>

          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-content-save"
            :loading="loading"
            @click="updateProfile"
          >
            Save Changes
          </v-btn>
        </v-card>

        <v-card class="rounded-xl pa-6" elevation="0">
          <div class="d-flex align-center mb-5">
            <v-avatar color="error" variant="tonal" class="mr-3">
              <v-icon>mdi-lock-reset</v-icon>
            </v-avatar>

            <div>
              <h2 class="text-h6 font-weight-bold">
                Reset Password
              </h2>
              <p class="text-caption text-grey">
                Use a strong password for account security
              </p>
            </div>
          </div>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="passwordForm.current_password"
                label="Current Password"
                type="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                :error-messages="errors.current_password"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="passwordForm.password"
                label="New Password"
                type="password"
                prepend-inner-icon="mdi-lock-plus"
                variant="outlined"
                :error-messages="errors.password"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="passwordForm.password_confirmation"
                label="Confirm Password"
                type="password"
                prepend-inner-icon="mdi-lock-check"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-btn
            color="error"
            variant="tonal"
            size="large"
            prepend-icon="mdi-shield-key"
            :loading="passwordLoading"
            @click="resetPassword"
          >
            Update Password
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.profile-hero {
  padding: 24px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(var(--v-theme-primary), .22), transparent 35%),
    rgba(var(--v-theme-surface), 1);
}

.profile-card {
  position: sticky;
  top: 90px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
</style>