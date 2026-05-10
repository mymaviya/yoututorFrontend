<script setup>
import { ref } from 'vue'

const email = ref('')
</script>

<template>
  <v-card width="440" class="pa-8 rounded-xl" elevation="10">
    <div class="text-center mb-6">
      <v-avatar color="primary" size="64" class="mb-3">
        <v-icon size="34">mdi-key</v-icon>
      </v-avatar>

      <h2 class="text-h5 font-weight-bold">
        Forgot Password?
      </h2>

      <p class="text-grey">
        Enter your email and we’ll send password reset instructions.
      </p>
    </div>

    <v-text-field
      v-model="email"
      label="Email Address"
      prepend-inner-icon="mdi-email"
      variant="outlined"
    />

    <v-btn
      color="primary"
      block
      size="large"
      class="rounded-lg"
    >
      Send Reset Link
    </v-btn>

    <div class="text-center mt-5">
      <router-link to="/login" class="text-primary">
        Back to Login
      </router-link>
    </div>
  </v-card>
</template>