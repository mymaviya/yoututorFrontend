<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../plugins/api'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('user')
const errors = ref({})
const errorMessage = ref('')

const loading = ref(false)
const error = ref('')

const register = async () => {
  loading.value = true
  errors.value = {}
  errorMessage.value = ''

  try {
    const res = await api.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })

    localStorage.setItem('token', res.data.token)

    router.push('/dashboard')

  } catch (err) {

    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
      errorMessage.value = err.response.data.message
    } else {
      errorMessage.value = 'Something went wrong'
    }

  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">

    <v-card width="420" elevation="10">
      
      <v-card-title class="text-h5">
        Create Account
      </v-card-title>

      <v-card-text>

        <v-text-field
          label="Full Name"
          v-model="name"
          :error-messages="errors.name"
          prepend-inner-icon="mdi-account"
        />

        <v-text-field
          label="Email"
          v-model="email"
          :error-messages="errors.email"
          prepend-inner-icon="mdi-email"
        />

        <v-text-field
          label="Password"
          type="password"
          v-model="password"
          :error-messages="errors.password"
          prepend-inner-icon="mdi-lock"
        />

        <v-select
          label="Role"
          v-model="role"
          :items="['admin','teacher','user']"
          :error-messages="errors.role"
          prepend-inner-icon="mdi-account-tag"  
        />

        

      </v-card-text>

      <v-card-actions>
        <v-btn
          block
          color="primary"
          :loading="loading"
          @click="register"
        >
          Register
        </v-btn>
      </v-card-actions>

    </v-card>

  </v-container>
</template>