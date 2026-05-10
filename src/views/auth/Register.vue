<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  contact: '',
  password: '',
  password_confirmation: ''
})
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
    />

    <v-text-field
      v-model="form.email"
      label="Email Address"
      prepend-inner-icon="mdi-email"
      variant="outlined"
    />

    <v-text-field
      v-model="form.contact"
      label="Contact Number"
      prepend-inner-icon="mdi-phone"
      variant="outlined"
    />

    <v-text-field
      v-model="form.password"
      label="Password"
      prepend-inner-icon="mdi-lock"
      type="password"
      variant="outlined"
    />

    <v-text-field
      v-model="form.password_confirmation"
      label="Confirm Password"
      prepend-inner-icon="mdi-lock-check"
      type="password"
      variant="outlined"
    />

    <v-btn
      color="primary"
      block
      size="large"
      class="rounded-lg"
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