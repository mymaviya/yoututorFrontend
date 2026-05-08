<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const router = useRouter()
const auth = useAuthStore()

const login = async () => {
  loading.value = true
  error.value = ''

  try {
    await auth.login({
      email: email.value,
      password: password.value
    })

    // Role-based redirect
    if (auth.role === 'admin') router.push('/dashboard')
    else if (auth.role === 'teacher') router.push('/teacher/dashboard')
    else router.push('/dashboard')

  } catch (err) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title>Login</v-card-title>

      <v-card-text>
        <v-text-field label="Email" v-model="email" prepend-inner-icon="mdi-email" />
        <v-text-field label="Password" type="password" v-model="password" prepend-inner-icon="mdi-lock" />

        <v-alert v-if="error" type="error" class="mt-2">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-btn :loading="loading" block color="primary" @click="login">
          Login
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>