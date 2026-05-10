<script setup>
import { ref } from 'vue'
import api from "../../plugins/api";
import { useRouter } from 'vue-router'
import { useUIStore } from '../../stores/snackBar'

const router = useRouter()
const ui = useUIStore()

const loading = ref(false)
const errors = ref({})

const form = ref({
  name: '',
  email: '',
  password: '',
  confirm_password: ''
})

const register = async () => {
    console.log("clicked")
  loading.value = true
  errors.value = {}

  try {
    await api.post('/register', form.value)

    ui.showSnackbar('Registration successful. Please login.')

    router.push('/login')
  } catch (err) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
    } else {
      ui.showSnackbar('Registration failed', 'error')
    }
  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <v-card width="500" class="pa-8 rounded-xl" elevation="10">
    <div class="text-center mb-6">
      <v-avatar color="primary" size="64" class="mb-3">
        <v-icon size="34">mdi-account-plus</v-icon>
      </v-avatar>

      <h2 class="text-h5 font-weight-bold">
        Create Account
      </h2>

      <p class="text-grey">
        Register to access the ERP system
      </p>
    </div>

    <v-text-field
      v-model="form.name"
      label="Full Name"
      prepend-inner-icon="mdi-account"
      variant="outlined"
      :error-messages="errors.name"
    />

    <v-text-field
      v-model="form.email"
      label="Email Address"
      prepend-inner-icon="mdi-email"
      variant="outlined"
      :error-messages="errors.email"
    />

    <v-text-field
      v-model="form.password"
      label="Password"
      prepend-inner-icon="mdi-lock"
      type="password"
      variant="outlined"
      :error-messages="errors.password"
    />

    <v-text-field
      v-model="form.confirm_password"
      label="Confirm Password"
      prepend-inner-icon="mdi-lock-check"
      type="password"
      variant="outlined"
      :error-messages="errors.confirm_password"
    />

    <v-btn
      color="primary"
      block
      size="large"
      class="rounded-lg"
      :loading="loading"
      @click="register"
    >
      Register
    </v-btn>

    <div class="text-center mt-5">
      <span class="text-grey">Already have an account?</span>

      <router-link to="/login" class="text-primary ml-1">
        Login
      </router-link>
    </div>
  </v-card>
</template>