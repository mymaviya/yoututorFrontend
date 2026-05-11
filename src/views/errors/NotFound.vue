<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <v-card class="pa-10 rounded-xl text-center" elevation="0" max-width="520">
      <v-avatar size="90" color="primary" variant="tonal" class="mb-5">
        <v-icon size="48">mdi-alert-circle-outline</v-icon>
      </v-avatar>

      <h1 class="text-h3 font-weight-bold mb-2">
        404
      </h1>

      <h2 class="text-h5 font-weight-bold mb-3">
        Page Not Found
      </h2>

      <p class="text-grey mb-6">
        The page you are looking for does not exist or has been moved.
      </p>

      <div class="d-flex justify-center ga-3">
        <v-btn color="primary" @click="router.push('/dashboard')">
          Go Dashboard
        </v-btn>

        <v-btn variant="outlined" @click="router.back()">
          Go Back
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>